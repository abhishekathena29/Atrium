import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { buildAiContext, type AiContext } from '../../engine/aiContext';
import { getStudentState } from '../../engine/studentState';
import { AI_SETUP_HINT, AiRequestError, aiErrorCopy, streamChat, type AiErrorCode } from '../../lib/ai';
import { getChat, saveChat, type ChatTurn } from '../../store/db';
import { Disclaimer, btnPrimary, btnSmall } from '../../components/ui/Field';
import { PageHeader, Panel } from '../dashboard/widgets';

/** Show the mentor nudge after this many student questions. */
const MENTOR_NUDGE_AFTER = 3;
/** Auto-scroll only when the reader is within this many px of the bottom of the log. */
const STICK_PX = 80;

/** Starter questions built from the student's own plan, so the first tap is already personal. */
function startersFor(ctx: AiContext): string[] {
  const out: string[] = [];
  const evaluated = ctx.candidates.filter((c) => c.engine);
  const demanding = evaluated.find((c) => (c.difficulty ?? 0) >= 4 && /recommend|keep/.test(c.engine!.verdict))
    ?? evaluated.find((c) => (c.difficulty ?? 0) >= 4);
  if (demanding) out.push(`Why is ${demanding.name} marked ${demanding.difficultyLabel?.split(' (')[0].toLowerCase() ?? 'demanding'} for me?`);
  const major = ctx.goals.majors.find((m) => m !== 'Undecided');
  if (ctx.goals.countries.includes('UK')) out.push('How do UK universities look at APs?');
  if (ctx.goals.countries.includes('US')) out.push(major ? `Which APs show rigor for ${major} in the US?` : 'How do US colleges read AP scores?');
  if (ctx.setupDone && ctx.engine) {
    const hrs = ctx.workload?.budgetPerWeek ?? ctx.workload?.ceiling;
    out.push(hrs ? `Could I handle one more AP with ${hrs} hrs/week?` : 'Could I handle one more AP?');
    out.push('How should I spread my study time before the May exams?');
  } else {
    out.push('What is an AP, and how is it different from my school exams?');
    out.push('How does Atrium decide how many APs to suggest?');
  }
  return out.slice(0, 4);
}

/* ---- Tiny, safe Markdown subset: **bold**, bullet lists, and in-app links. ---- */

const APP_LINKS = ['/consults', '/safeguarding', '/methodology', '/plan', '/progress'];

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\/(?:consults|safeguarding|methodology|plan|progress)\b)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4) return <strong key={i} className="font-semibold text-ink">{p.slice(2, -2)}</strong>;
    if (APP_LINKS.includes(p)) return <Link key={i} to={p} className="text-leaf-700 font-semibold underline underline-offset-2">{p}</Link>;
    return p;
  });
}

function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      blocks.push(
        <ul key={blocks.length} className="space-y-1 pl-1">
          {list.map((li, i) => (
            <li key={i} className="flex gap-2"><span className="text-leaf-600">•</span><span>{inline(li)}</span></li>
          ))}
        </ul>,
      );
      list = [];
    }
  };
  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)$/);
    if (bullet) list.push(bullet[1]);
    else {
      flush();
      if (line.trim()) blocks.push(<p key={blocks.length}>{inline(line.replace(/^#+\s*/, ''))}</p>);
    }
  }
  flush();
  return <div className="space-y-2">{blocks}</div>;
}

function Bubble({ turn }: { turn: Pick<ChatTurn, 'role' | 'text'> }) {
  const mine = turn.role === 'user';
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'} animate-fade-up`}>
      {!mine && (
        <span className="w-8 h-8 rounded-full bg-violet-50 text-violet-700 flex items-center justify-center shrink-0 mr-2 mt-0.5">
          <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
        </span>
      )}
      <div
        className={
          'max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ' +
          (mine ? 'bg-leaf-600 text-white rounded-br-md whitespace-pre-wrap' : 'bg-slate-50 border border-line text-slate-700 rounded-bl-md')
        }
      >
        {mine ? turn.text : <Markdown text={turn.text} />}
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <span className="w-8 h-8 rounded-full bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
      </span>
      <span className="flex gap-1 bg-slate-50 border border-line rounded-2xl rounded-bl-md px-4 py-3.5">
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-500" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-500" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-500" />
      </span>
    </div>
  );
}

/** Layer 2: "Ask Atrium", a chat grounded in Atrium's knowledge and the student's own plan. */
export function Coach() {
  const { user } = useAuth();
  const ctx = useMemo(() => buildAiContext(user!, getStudentState(user!)), [user]);
  const starters = useMemo(() => startersFor(ctx), [ctx]);

  const [turns, setTurns] = useState<ChatTurn[]>(() => getChat(user!.id));
  const [draft, setDraft] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [pending, setPending] = useState('');
  const [error, setError] = useState<{ code: AiErrorCode; message: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [status, setStatus] = useState('');
  const logRef = useRef<HTMLDivElement | null>(null);
  /** True while the reader is at (or near) the bottom of the log, so new text should follow. */
  const stickRef = useRef(true);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);
  // Scroll the log itself (never the window), and only if the reader hasn't scrolled up.
  // Assigning scrollTop jumps instantly, so there is no motion to reduce.
  useEffect(() => {
    const el = logRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [turns, pending, streaming, error]);

  function onLogScroll() {
    const el = logRef.current;
    if (el) stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight <= STICK_PX;
  }

  const asked = turns.filter((t) => t.role === 'user').length;

  function commit(next: ChatTurn[]) {
    setTurns(next);
    saveChat(user!.id, next);
  }

  async function send(text: string, base: ChatTurn[] = turns) {
    const q = text.trim();
    if (!q || streaming) return;
    setError(null);
    setDraft('');
    const history = [...base, { role: 'user' as const, text: q, at: new Date().toISOString() }];
    commit(history);
    setStreaming(true);
    setPending('');
    setStatus('Atrium is typing…');
    stickRef.current = true;
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const reply = await streamChat(ctx, history, setPending, ac.signal);
      commit([...history, { role: 'assistant', text: reply.trim() || "Sorry, I didn't get an answer back. Try asking again.", at: new Date().toISOString() }]);
      setStatus('Reply finished');
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setStatus('Reply failed');
      const e = err instanceof AiRequestError ? err : new AiRequestError('upstream', String(err));
      if (e.partial.trim()) commit([...history, { role: 'assistant', text: e.partial.trim(), at: new Date().toISOString() }]);
      setError({ code: e.code, message: e.message });
    } finally {
      if (abortRef.current === ac) {
        setStreaming(false);
        setPending('');
        inputRef.current?.focus();
      }
    }
  }

  function retryLast() {
    const lastUser = [...turns].reverse().find((t) => t.role === 'user');
    if (!lastUser) return;
    // Drop the unanswered question and ask it again.
    const idx = turns.lastIndexOf(lastUser);
    void send(lastUser.text, turns.slice(0, idx));
  }

  function clear() {
    abortRef.current?.abort();
    setStreaming(false);
    setPending('');
    setError(null);
    setStatus('');
    commit([]);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(draft);
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send(draft);
    }
  }

  const notSetUp = error && (error.code === 'not_configured' || error.code === 'bad_key');
  const lastIsUser = turns.length > 0 && turns[turns.length - 1].role === 'user';

  return (
    <>
      <PageHeader
        eyebrow="Ask Atrium"
        title="Ask about your plan"
        subtitle="Follow-up questions about your APs, workload and applications. Answers come from Atrium's own planner and course notes, not random websites."
        action={
          turns.length > 0 ? (
            <button type="button" onClick={clear} className={btnSmall}>
              <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
              Clear chat
            </button>
          ) : undefined
        }
      />

      {!ctx.setupDone && (
        <p className="text-[13px] text-slate-600 bg-slate-50 border border-line rounded-xl px-3.5 py-2.5 mb-5 animate-fade-in">
          You can ask anything now. Answers get more personal once your setup is done.{' '}
          <Link to="/dashboard" className="text-leaf-700 font-semibold underline underline-offset-2">Continue setup</Link>
        </p>
      )}

      <Panel
        title="Chat"
        action={
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-0.5">
            <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
            AI · guidance only
          </span>
        }
      >
        <p className="sr-only" role="status" aria-live="polite">{status}</p>
        <div
          ref={logRef}
          onScroll={onLogScroll}
          role="log"
          aria-label="Conversation"
          aria-busy={streaming}
          className="h-[52vh] min-h-[320px] overflow-y-auto pr-1 space-y-4"
        >
          {turns.length === 0 && !streaming && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-fade-up">
              <span className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center animate-float">
                <span className="material-symbols-outlined text-[30px]">auto_awesome</span>
              </span>
              <p className="font-jakarta font-bold text-ink text-[17px] mt-4">What would you like to know?</p>
              <p className="text-[13px] text-slate-500 mt-1 max-w-md">Tap a question to start, or type your own.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-5 max-w-2xl stagger">
                {starters.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="lift text-[13px] text-slate-700 bg-canvas border border-line-2 rounded-full px-3.5 py-2 hover:border-leaf-300"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {turns.map((t, i) => <Bubble key={i} turn={t} />)}
          {streaming && (pending ? <Bubble turn={{ role: 'assistant', text: pending }} /> : <Typing />)}

          {error && !streaming && (
            notSetUp ? (
              <div className="border border-line-2 rounded-2xl p-4 flex gap-3 animate-fade-in">
                <span className="material-symbols-outlined text-[22px] text-slate-500">settings</span>
                <div>
                  <p className="text-[14px] font-semibold text-ink">{aiErrorCopy(error.code)}</p>
                  <p className="text-[12.5px] text-slate-500 mt-1">
                    {error.code === 'bad_key' ? 'The API key was rejected. ' : ''}
                    <code className="text-[12px] text-slate-700 bg-slate-50 border border-line rounded px-1.5 py-0.5">{AI_SETUP_HINT}</code>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 animate-fade-in">
                <span>{aiErrorCopy(error.code)}</span>
                {lastIsUser && <button type="button" onClick={retryLast} className={btnSmall}>Try again</button>}
              </div>
            )
          )}

          {asked >= MENTOR_NUDGE_AFTER && !streaming && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3 animate-fade-up">
              <p className="text-[13px] text-slate-700">
                <span className="font-semibold text-ink">Want a plan built around you?</span> Atrium's founding mentors are being vetted; you can request a consult and the team will match you.
              </p>
              <Link
                to="/consults?new=paid"
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-violet-600 rounded-full px-3.5 py-1.5 hover:brightness-110 transition"
              >
                <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                Request a consult
              </Link>
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="mt-4 flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            rows={1}
            maxLength={2000}
            placeholder="Ask about your APs, workload or applications…"
            aria-label="Your question"
            className="flex-1 resize-none max-h-40 bg-canvas border border-line-2 rounded-2xl px-4 py-3 text-[14px] text-ink placeholder:text-slate-400 focus:border-leaf-400 focus:ring-1 focus:ring-leaf-300 outline-none transition-colors"
          />
          <button type="submit" className={btnPrimary + ' !px-4'} disabled={streaming || !draft.trim()} aria-label="Send">
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </form>
        <div className="mt-3">
          <Disclaimer>
            AI-generated guidance built on your Atrium plan. It can make mistakes and is not a score or admission guarantee.
            Check each university’s published requirements. Never share phone numbers, addresses or other contact details here.
            If something is worrying you, talk to a trusted adult or see <Link to="/safeguarding" className="underline">Safeguarding</Link>.
          </Disclaimer>
        </div>
      </Panel>
    </>
  );
}
