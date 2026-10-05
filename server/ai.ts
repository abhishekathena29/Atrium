/**
 * Atrium AI layers, framework-agnostic. Plain async functions: give them the parsed JSON body
 * and an API key, get data (Layer 1) or an async iterable of text chunks (Layer 2) back.
 * The Vite plugin (aiPlugin.ts) is a thin adapter; the same functions drop into Express,
 * Fastify or a serverless handler unchanged.
 *
 * - Layer 1 `recommend`: structured output (output_config.format), effort medium, grounded in
 *   the candidate list the client sends. Picks outside it are dropped server-side, caps are
 *   enforced server-side, and risky wording is filtered out.
 * - Layer 2 `startChat`: streaming, effort low, grounded in KNOWLEDGE_BASE + the student context.
 * Both opt into server-side refusal fallbacks (`fallbacks: "default"`) and handle
 * `stop_reason === "refusal"`.
 */

import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';
import { KNOWLEDGE_BASE } from './knowledge';

export const MODEL = 'claude-opus-5-5';
/** Server-side refusal fallback, "default" mode (routes by refusal category). */
const BETAS = ['server-side-fallback-2026-07-01'];

export interface AiConfig {
  apiKey?: string;
}

export type AiErrorCode =
  | 'not_configured'
  | 'bad_request'
  | 'bad_key'
  | 'rate_limited'
  | 'refused'
  | 'upstream'
  /** The client went away; nothing to send or log. */
  | 'aborted';

export class AiError extends Error {
  readonly code: AiErrorCode;
  readonly status: number;
  constructor(code: AiErrorCode, status: number, message: string) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s.trim());

/* ------------------------------------------------------------------ */
/* Request validation (tolerant: oversize text is clipped, not rejected) */
/* ------------------------------------------------------------------ */

/** A string clipped to `n` characters. */
const text = (n: number) => z.string().transform((s) => clip(s, n));
/** A list of strings, clipped to `items` entries of `n` characters each. */
const textList = (items: number, n: number) =>
  z.array(z.string()).transform((a) => a.slice(0, items).map((s) => clip(s, n)).filter(Boolean));

const CandidateSchema = z.looseObject({
  id: z.string().min(1).max(120),
  name: text(120).pipe(z.string().min(1)),
  kind: z.enum(['ap', 'school']),
  difficulty: z.number().int().min(1).max(5).nullable(),
  difficultyLabel: text(60).nullable(),
  level: z.string().nullable().optional(),
  engine: z.looseObject({ verdict: text(60) }).nullable(),
});

/** The student context built by src/engine/aiContext.ts. Unknown fields pass through to the prompt. */
const ContextSchema = z.looseObject({
  v: z.number(),
  segment: z.enum(['india', 'sgus']),
  setupDone: z.boolean(),
  goals: z.looseObject({
    majors: textList(12, 80),
    colleges: textList(20, 120),
    countries: textList(6, 20),
  }),
  personality: z
    .looseObject({
      maxDemandingAps: z.number().int().min(0).max(5),
      maxTotalAps: z.number().int().min(0).max(8).optional(),
    })
    .nullable(),
  workload: z.looseObject({ sport: text(60).nullable().optional() }).nullable().optional(),
  candidates: z.array(CandidateSchema).transform((a) => a.slice(0, 80)),
});

export type StudentContext = z.infer<typeof ContextSchema>;

const RecommendBody = z.object({ context: ContextSchema });

/** Chat sends at most this many turns upstream; older ones are dropped before validation. */
const MAX_TURNS = 24;
const MAX_TURN_CHARS = 6000;

const ChatBody = z.object({
  context: ContextSchema.nullable(),
  messages: z.preprocess(
    (v) => (Array.isArray(v) ? v.slice(-MAX_TURNS) : v),
    z.array(z.object({ role: z.enum(['user', 'assistant']), text: text(MAX_TURN_CHARS) })).min(1),
  ),
});

function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const r = schema.safeParse(body);
  if (!r.success) throw new AiError('bad_request', 400, `Invalid request: ${r.error.issues[0]?.path.join('.') || 'body'} ${r.error.issues[0]?.message ?? ''}`.trim());
  return r.data;
}

/* ------------------------------------------------------------------ */
/* Client + error mapping                                              */
/* ------------------------------------------------------------------ */

const clients = new Map<string, Anthropic>();

function clientFor(cfg: AiConfig): Anthropic {
  if (!cfg.apiKey) throw new AiError('not_configured', 503, 'ANTHROPIC_API_KEY is not set on this server.');
  let c = clients.get(cfg.apiKey);
  if (!c) {
    c = new Anthropic({ apiKey: cfg.apiKey });
    clients.set(cfg.apiKey, c);
  }
  return c;
}

const ABORTED = () => new AiError('aborted', 499, 'Request cancelled by the client.');

/** Map SDK errors to a small, client-safe set (most specific first). */
export function toAiError(err: unknown, signal?: AbortSignal): AiError {
  if (err instanceof AiError) return err;
  if (signal?.aborted || err instanceof Anthropic.APIUserAbortError) return ABORTED();
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
    return new AiError('bad_key', 503, 'The server’s Anthropic API key was rejected.');
  }
  if (err instanceof Anthropic.RateLimitError) return new AiError('rate_limited', 429, 'The AI is busy right now. Try again in a minute.');
  if (err instanceof Anthropic.APIConnectionError) return new AiError('upstream', 502, 'Could not reach the AI service.');
  if (err instanceof Anthropic.APIError) return new AiError('upstream', 502, `AI service error (${err.status ?? 'unknown'}).`);
  if (err instanceof Anthropic.AnthropicError) return new AiError('upstream', 502, 'The AI returned an answer Atrium couldn’t read. Try again.');
  return new AiError('upstream', 500, 'Something went wrong while talking to the AI.');
}

/**
 * Knowledge base first (cached across both layers and all students), then the task, then the
 * optional student context. `cacheContext` adds a second breakpoint after the context, which is
 * stable within one chat conversation, so later turns reuse it.
 */
function systemFor(task: string, context?: string, cacheContext = false): Anthropic.Beta.BetaTextBlockParam[] {
  const blocks: Anthropic.Beta.BetaTextBlockParam[] = [
    { type: 'text', text: KNOWLEDGE_BASE, cache_control: { type: 'ephemeral' } },
    { type: 'text', text: task },
  ];
  if (context) blocks.push(cacheContext ? { type: 'text', text: context, cache_control: { type: 'ephemeral' } } : { type: 'text', text: context });
  return blocks;
}

/* ------------------------------------------------------------------ */
/* Wording safety net                                                  */
/* ------------------------------------------------------------------ */

/** "Requires" / "mandatory" style claims Atrium never makes about universities. */
const REQUIREMENT_WORDING = /\b(require[sd]?|requirement|mandatory|must (have|take))\b/i;

const COUNTRY_MENTION: Record<string, RegExp> = {
  US: /\b(US|USA|U\.S\.|United States|American|America)\b/,
  UK: /\b(UK|U\.K\.|United Kingdom|British|Britain|England)\b/,
  Canada: /\b(Canada|Canadian)\b/,
};

/** True when a country note for `country` talks about a different target country. */
function namesOtherCountry(country: string, note: string): boolean {
  return Object.entries(COUNTRY_MENTION).some(([c, re]) => c !== country && re.test(note));
}

const safe = (s: string) => !!s && !REQUIREMENT_WORDING.test(s);

/* ------------------------------------------------------------------ */
/* Layer 1: recommendations                                            */
/* ------------------------------------------------------------------ */

const RECOMMEND_TASK = `# Your task: AP / course recommendation
You receive one student's Atrium context as JSON: personality (OCEAN traits, RIASEC interests, load factor, caps on demanding APs), current curriculum and subjects, intended majors, target countries, workload (coaching, activities, sport, weekly budget or ceiling), and the rule-based engine's output for every candidate course.

Refine the engine's plan into advice for this student. Interpret the whole profile, then decide.
- Pick ONLY from the candidate list, by its exact "id" (the allowed ids are listed again after the context). Never suggest a course that is not a candidate.
- Start from the engine's verdicts. You may disagree, but say why in the student's terms.
- Give a verdict for every candidate that matters to this student: all engine-recommended or kept courses, plus any you would upgrade or flag. Leave out clearly irrelevant ones.
  - "verdict" is exactly one of "take", "consider", "skip".
  - "take": fits the major, the workload and the balance. Never put more "take" APs at difficulty 4-5 than personality.maxDemandingAps, and never more APs in total than personality.maxTotalAps. Keep the total inside the student's weekly budget or ceiling.
  - "consider": worth a look later, a swap, or only if the student has more time.
  - "skip": not worth it for this student now.
  - Candidates with "engine": null were not checked against the student's weekly ceiling. Use "consider" for them, not "take".
  - For "school" candidates (SG/US timetable subjects) the verdict is about keeping that subject at its level: "take" = keep as planned, "consider" = rebalance, "skip" = drop or move down a level. Follow the engine's rebalancing unless you explain otherwise.
- "why": 2-4 short bullets, each tied to this student's own data: their major, their weekly hours, their curriculum overlap (India: % already on the board syllabus and the gap units), their interests (Holland code), their personality, and the course's difficulty. Quote real numbers from the context and say they are estimates where relevant.
- "recommendedCount": how many APs you recommend taking this cycle (it must equal the number of APs you marked "take"). "countReason": one or two sentences on why that many (budget, temperament cap, balance).
- "balanceNote": one sentence on the demanding vs manageable mix.
- "countryNotes": exactly one per target country in goals.countries, with "country" set to that exact code. Each note talks about that country only. Never name or compare another country inside a note.
- "watchOuts": 1-3 practical cautions (e.g. board exams first, peak sports season, a prerequisite, checking published entry requirements).
- "summary": 2-3 plain sentences to the student ("you"), naming what drove the advice.
- Wording: never write that a university or course "requires" or "required" an AP, never call anything "mandatory", a "requirement", or something the student "must take" / "must have". Use "relevant to", "shows rigor in", "aligns with" and point to published entry requirements instead. Lines with that wording are removed before the student sees them.
If setupDone is false or the engine is null, give cautious general guidance and say the advice gets more personal once setup is done.`;

/**
 * The output shape. Ids, verdicts and countries are plain strings on purpose: the SDK strips
 * `enum` into the description for constrained decoding, so an enum would not restrict the
 * model and would make a single stray value fail the whole parse. Allowed values go in the
 * prompt; post-processing drops or coerces anything else.
 */
const AdviceSchema = z.object({
  summary: z.string(),
  recommendedCount: z.number().int(),
  countReason: z.string(),
  picks: z.array(
    z.object({
      courseId: z.string(),
      verdict: z.string(),
      why: z.array(z.string()),
    }),
  ),
  balanceNote: z.string(),
  countryNotes: z.array(z.object({ country: z.string(), note: z.string() })),
  watchOuts: z.array(z.string()),
});

const ADVICE_FORMAT = betaZodOutputFormat(AdviceSchema);

type Verdict = 'take' | 'consider' | 'skip';
const VERDICTS: readonly string[] = ['take', 'consider', 'skip'];

export interface AdviceResult {
  summary: string;
  recommendedCount: number;
  countReason: string;
  picks: { courseId: string; course: string; difficulty: string; verdict: Verdict; why: string[] }[];
  balanceNote: string;
  countryNotes: { country: string; note: string }[];
  watchOuts: string[];
}

export interface RecommendResult {
  advice: AdviceResult;
  model: string;
  /** Picks the model returned that failed grounding and were removed. */
  dropped: number;
}

type Candidate = StudentContext['candidates'][number];

/** An AP the student would sit: an add-on, or a US high-school class kept at AP level. */
function isApCandidate(c: Candidate): boolean {
  return c.kind === 'ap' || c.level === 'AP' || c.name.startsWith('AP ');
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

function countSentence(taken: number, hard: number, maxHard: number, maxTotal: number): string {
  if (taken === 0) {
    return 'Atrium isn’t suggesting any APs to take this cycle. The options below are worth a look if your week has room.';
  }
  return `Atrium suggests ${plural(taken, 'AP')} this cycle: ${hard} demanding (your cap is ${maxHard}) and ${taken - hard} more manageable, inside your limit of ${maxTotal} in total.`;
}

export async function recommend(body: unknown, cfg: AiConfig, signal?: AbortSignal): Promise<RecommendResult> {
  const { context } = parseBody(RecommendBody, body);
  const client = clientFor(cfg);
  if (!context.candidates.length) throw new AiError('bad_request', 400, 'Invalid request: context.candidates is empty');

  const ids = [...new Set(context.candidates.map((c) => c.id))];
  const countryList = context.goals.countries.length ? [...new Set(context.goals.countries)] : ['US'];

  // `create` (not `parse`) so stop_reason is checked before any JSON parsing happens.
  let response: Anthropic.Beta.BetaMessage;
  try {
    response = await client.beta.messages.create(
      {
        model: MODEL,
        max_tokens: 16000,
        betas: BETAS,
        fallbacks: 'default',
        output_config: { effort: 'medium', format: { type: 'json_schema', schema: ADVICE_FORMAT.schema } },
        system: systemFor(RECOMMEND_TASK),
        messages: [
          {
            role: 'user',
            content:
              `Student context (JSON, from Atrium's planner):\n${JSON.stringify(context)}\n\n` +
              `Allowed courseId values: ${JSON.stringify(ids)}\n` +
              `Allowed country values (one note each): ${JSON.stringify(countryList)}\n` +
              `Allowed verdict values: "take", "consider", "skip"\n\n` +
              `Write this student's recommendation.`,
          },
        ],
      },
      { signal },
    );
  } catch (err) {
    throw toAiError(err, signal);
  }

  if (response.stop_reason === 'refusal') {
    throw new AiError('refused', 422, 'The AI declined to answer this one. Your rule-based plan is still valid.');
  }
  if (response.stop_reason === 'max_tokens') {
    throw new AiError('upstream', 502, 'The AI’s answer was too long and got cut off. Try again.');
  }
  const raw = response.content.find((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')?.text;
  let parsed: z.infer<typeof AdviceSchema> | null = null;
  if (raw) {
    try {
      const r = AdviceSchema.safeParse(JSON.parse(raw));
      if (r.success) parsed = r.data;
    } catch {
      // Malformed JSON: handled below.
    }
  }
  if (!parsed) throw new AiError('upstream', 502, 'The AI returned an answer Atrium couldn’t read. Try again.');
  const out = parsed;

  // Grounding: keep only candidates, take names/difficulty from Atrium's data, enforce the caps.
  const byId = new Map(context.candidates.map((c) => [c.id, c]));
  const maxHard = context.personality?.maxDemandingAps ?? 2;
  const maxTotal = context.personality?.maxTotalAps ?? 4;
  const seen = new Set<string>();
  let hardTaken = 0;
  let totalTaken = 0;
  let dropped = 0;
  const picks: AdviceResult['picks'] = [];
  for (const p of out.picks) {
    const cand = byId.get(p.courseId);
    if (!cand || seen.has(p.courseId)) {
      dropped++;
      continue;
    }
    seen.add(p.courseId);
    let verdict: Verdict = VERDICTS.includes(p.verdict) ? (p.verdict as Verdict) : 'consider';
    const notes: string[] = [];
    const isAp = isApCandidate(cand);
    if (verdict === 'take' && cand.kind === 'ap' && cand.engine === null) {
      verdict = 'consider';
      notes.push('Not yet checked against your weekly ceiling, so treat it as an option, not a plan.');
    }
    if (verdict === 'take' && isAp && (cand.difficulty ?? 0) >= 4) {
      if (hardTaken >= maxHard) {
        verdict = 'consider';
        notes.push(`Moved to "consider": your plan keeps to ${plural(maxHard, 'demanding AP')} at a time.`);
      } else hardTaken++;
    }
    if (verdict === 'take' && isAp) {
      if (totalTaken >= maxTotal) {
        verdict = 'consider';
        notes.push(`Moved to "consider": your plan keeps to ${plural(maxTotal, 'AP')} in total this cycle.`);
        if ((cand.difficulty ?? 0) >= 4) hardTaken--;
      } else totalTaken++;
    }
    const modelWhy = p.why.map((w) => clip(w, 280)).filter(safe);
    picks.push({
      courseId: cand.id,
      course: cand.name,
      difficulty: cand.difficultyLabel ?? 'Not rated',
      verdict,
      why: [...modelWhy.slice(0, Math.max(0, 5 - notes.length)), ...notes].slice(0, 5),
    });
  }
  const order = { take: 0, consider: 1, skip: 2 } as const;
  picks.sort((a, b) => order[a.verdict] - order[b.verdict]);

  const notesSeen = new Set<string>();
  const countryNotes = out.countryNotes
    .map((n) => ({ country: n.country, note: clip(n.note, 600) }))
    .filter((n) => {
      if (!countryList.includes(n.country) || notesSeen.has(n.country)) return false;
      if (!safe(n.note) || namesOtherCountry(n.country, n.note)) return false;
      notesSeen.add(n.country);
      return true;
    });

  const taken = totalTaken;
  const countReason =
    taken !== out.recommendedCount || !safe(clip(out.countReason, 600))
      ? countSentence(taken, hardTaken, maxHard, maxTotal)
      : clip(out.countReason, 600);
  const summaryRaw = clip(out.summary, 900);
  const summary = safe(summaryRaw)
    ? summaryRaw
    : `Here is Atrium’s AI read of your plan: ${plural(taken, 'AP')} to take, with the reasons behind each pick below. Check each university’s published entry requirements before you decide.`;
  const balanceRaw = clip(out.balanceNote, 400);

  return {
    model: response.model,
    dropped,
    advice: {
      summary,
      recommendedCount: taken,
      countReason,
      picks,
      balanceNote: safe(balanceRaw) ? balanceRaw : '',
      countryNotes,
      watchOuts: out.watchOuts.map((w) => clip(w, 280)).filter(safe).slice(0, 4),
    },
  };
}

/* ------------------------------------------------------------------ */
/* Layer 2: chat                                                       */
/* ------------------------------------------------------------------ */

const CHAT_TASK = `# Your task: "Ask Atrium" chat
You answer a student's follow-up questions about their AP plan, course choices, study planning and university admissions.
- Ground every answer in Atrium's knowledge above and the student's context below. When the context has the answer (their engine verdicts, hours, overlap %, difficulty), use their real numbers and say where they come from ("your plan", "Atrium's illustrative estimate").
- If something isn't in Atrium's knowledge (a specific university's policy, exam dates, fees), say you don't have verified information and tell them where to check (the university's published entry requirements, College Board's official pages) or suggest a mentor consult.
- Hard wording rule, no exceptions: never say a university or course "requires" or "required" an AP, never call an AP "mandatory", a "requirement", or something the student "must take" / "must have". Atrium has not verified any university's requirements. Say "relevant to", "shows rigor in" or "aligns with", and tell them to check the published entry requirements.
- Keep each country's admissions logic separate: answer about one country at a time and never blend US, UK and Canada advice in one sentence.
- Keep answers short: usually 2-6 sentences or a few bullets. Use simple Markdown (bold, bullet lists) only when it helps. Explain any AP term the first time.
- Talk to the student as "you". Be encouraging and honest; never pressure them to take more.
- When the question needs deep personal help (essays, a college list, a week-by-week timetable, a hard trade-off), answer briefly, then suggest requesting a mentor consult at /consults. Atrium's founding mentors are still being vetted, so say the team will match them; never imply a mentor roster already exists.`;

function contextBlock(ctx: StudentContext | null): string {
  if (!ctx) return '# Student context\nNot available. Answer generally and invite them to finish setup for personal answers.';
  return `# Student context (JSON, from Atrium's planner)
${ctx.setupDone ? '' : 'Setup is not finished yet: answers can only be general. Mention once that they get more personal after setup.\n'}${JSON.stringify(ctx)}`;
}

const REFUSAL_TEXT =
  "I can't help with that one here. I'm best at AP choices, study plans and admissions questions. If something is worrying you, please talk to a trusted adult, or see /safeguarding.";

/**
 * Sentinel the client recognises when a stream fails part-way. Followed by `<code>|<message>`.
 * Must match src/lib/ai.ts.
 */
export const STREAM_ERROR_MARKER = '\n\u0000[[atrium:error]]';
/** Sentinel for a refusal: the client replaces the whole reply with the text that follows. */
export const STREAM_REFUSAL_MARKER = '\n\u0000[[atrium:refusal]]';

/**
 * Starts a streamed chat reply. Resolves once the upstream stream is open (so auth / rate-limit
 * errors throw here, before any response headers go out), then yields plain-text chunks.
 */
export async function startChat(body: unknown, cfg: AiConfig, signal?: AbortSignal): Promise<AsyncIterable<string>> {
  const { context, messages } = parseBody(ChatBody, body);
  const client = clientFor(cfg);

  // The API wants the conversation to start and end on a user turn.
  const turns = messages.filter((m) => m.text.trim());
  while (turns.length && turns[0].role !== 'user') turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== 'user') {
    throw new AiError('bad_request', 400, 'Invalid request: the last message must be from the user');
  }
  const params: Anthropic.Beta.BetaMessageParam[] = turns.map((t) => ({ role: t.role, content: t.text }));

  async function* run(): AsyncGenerator<string> {
    const stream = client.beta.messages.stream(
      {
        model: MODEL,
        max_tokens: 16000,
        betas: BETAS,
        fallbacks: 'default',
        output_config: { effort: 'low' },
        system: systemFor(CHAT_TASK, contextBlock(context), true),
        messages: params,
      },
      { signal },
    );
    for await (const event of stream) {
      if (event.type === 'message_start') yield '';
      else if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') yield event.delta.text;
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') {
      yield `${STREAM_REFUSAL_MARKER}${REFUSAL_TEXT}`;
    } else if (final.stop_reason === 'max_tokens') {
      yield '\n\n(That answer got cut off. Ask me to continue.)';
    }
  }

  const gen = run();
  let first: IteratorResult<string>;
  try {
    first = await gen.next();
  } catch (err) {
    throw toAiError(err, signal);
  }

  return (async function* () {
    if (!first.done) yield first.value;
    try {
      yield* gen;
    } catch (err) {
      const e = toAiError(err, signal);
      if (e.code === 'aborted') return;
      yield `${STREAM_ERROR_MARKER}${e.code}|${e.message}`;
    }
  })();
}
