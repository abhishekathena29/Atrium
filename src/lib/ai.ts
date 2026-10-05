/**
 * Client helpers for the AI endpoints served by server/aiPlugin.ts (dev + preview) or any
 * server that exposes the same contract.
 */

import type { AiContext } from '../engine/aiContext';
import type { AiAdvice, ChatTurn } from '../store/db';

/** Must match STREAM_ERROR_MARKER in server/ai.ts. Followed by `<code>|<message>`. */
const STREAM_ERROR_MARKER = '\n\u0000[[atrium:error]]';
/** Must match STREAM_REFUSAL_MARKER in server/ai.ts. The text after it replaces the reply. */
const STREAM_REFUSAL_MARKER = '\n\u0000[[atrium:refusal]]';

/** Only the most recent turns go to the server, each clipped, so a long chat never bricks. */
export const CHAT_MAX_TURNS = 24;
export const CHAT_MAX_TURN_CHARS = 6000;

export type AiErrorCode =
  | 'not_configured'
  | 'bad_request'
  | 'bad_key'
  | 'rate_limited'
  | 'refused'
  | 'upstream'
  | 'network';

const KNOWN_CODES: readonly string[] = ['not_configured', 'bad_request', 'bad_key', 'rate_limited', 'refused', 'upstream', 'network'];

export class AiRequestError extends Error {
  readonly code: AiErrorCode;
  /** Chat only: the reply text received before the stream failed. */
  readonly partial: string;
  constructor(code: AiErrorCode, message: string, partial = '') {
    super(message);
    this.code = code;
    this.partial = partial;
  }
}

/** Friendly copy for each failure, shared by the advisor panel and the chat. */
export function aiErrorCopy(code: AiErrorCode): string {
  switch (code) {
    case 'not_configured':
    case 'bad_key':
      return "AI isn't set up on this machine yet.";
    case 'rate_limited':
      return 'The AI is busy right now. Give it a minute and try again.';
    case 'refused':
      return "The AI couldn't answer this one. Your rule-based plan is still valid.";
    case 'network':
      return "Couldn't reach the server. Check that the dev server is running.";
    default:
      return 'Something went wrong. Try again in a moment.';
  }
}

export const AI_SETUP_HINT = 'Add ANTHROPIC_API_KEY to .env.local (see .env.example), then restart `npm run dev`.';

async function failure(res: Response): Promise<AiRequestError> {
  let code: AiErrorCode = 'upstream';
  let message = `Request failed (${res.status})`;
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    if (data.error && KNOWN_CODES.includes(data.error)) code = data.error as AiErrorCode;
    if (data.message) message = data.message;
  } catch {
    // Non-JSON error body: keep the defaults.
  }
  // A 404 means the endpoint isn't mounted (e.g. a static host without the AI server).
  if (res.status === 404) code = 'not_configured';
  return new AiRequestError(code, message);
}

async function post(path: string, body: unknown, signal?: AbortSignal): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new AiRequestError('network', 'Network error');
  }
  if (!res.ok) throw await failure(res);
  return res;
}

export type AdviceBody = Omit<AiAdvice, 'contextKey' | 'generatedAt'>;

/** Layer 1: AI recommendation over the student's context. */
export async function fetchAdvice(context: AiContext, signal?: AbortSignal): Promise<AdviceBody> {
  const res = await post('/api/ai/recommend', { context }, signal);
  const data = (await res.json()) as { advice: AdviceBody };
  return data.advice;
}

/** The last CHAT_MAX_TURNS turns, each clipped to CHAT_MAX_TURN_CHARS (head kept). */
export function chatPayload(turns: Pick<ChatTurn, 'role' | 'text'>[]): { role: ChatTurn['role']; text: string }[] {
  return turns.slice(-CHAT_MAX_TURNS).map((t) => ({
    role: t.role,
    text: t.text.length > CHAT_MAX_TURN_CHARS ? t.text.slice(0, CHAT_MAX_TURN_CHARS - 1) + '…' : t.text,
  }));
}

/** Text to show while streaming: never reveal a marker that has only partly arrived. */
function visible(text: string): string {
  const nul = text.indexOf('\u0000');
  return nul === -1 ? text : text.slice(0, nul).replace(/\n$/, '');
}

/**
 * Layer 2: streams a chat reply. `onText` gets the full reply so far after every chunk.
 * Resolves with the final text. A refusal replaces the partial reply with the refusal text.
 */
export async function streamChat(
  context: AiContext | null,
  turns: ChatTurn[],
  onText: (textSoFar: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const res = await post('/api/ai/chat', { context, messages: chatPayload(turns) }, signal);
  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  let text = '';
  for (;;) {
    let chunk: string;
    let done: boolean;
    if (reader) {
      const r = await reader.read();
      done = r.done;
      chunk = r.done ? decoder.decode() : decoder.decode(r.value, { stream: true });
    } else {
      chunk = await res.text();
      done = true;
    }
    text += chunk;

    const cut = text.indexOf(STREAM_ERROR_MARKER);
    if (cut !== -1) {
      // The server ends the stream right after the marker payload; wait for all of it.
      if (!done) continue;
      const partial = text.slice(0, cut);
      const payload = text.slice(cut + STREAM_ERROR_MARKER.length);
      const bar = payload.indexOf('|');
      const rawCode = bar === -1 ? '' : payload.slice(0, bar);
      const code = KNOWN_CODES.includes(rawCode) ? (rawCode as AiErrorCode) : 'upstream';
      onText(partial);
      throw new AiRequestError(code, (bar === -1 ? payload : payload.slice(bar + 1)) || 'Stream failed', partial);
    }
    const ref = text.indexOf(STREAM_REFUSAL_MARKER);
    if (ref !== -1) {
      if (!done) continue;
      const refusal = text.slice(ref + STREAM_REFUSAL_MARKER.length);
      onText(refusal);
      return refusal;
    }
    if (done) break;
    onText(visible(text));
  }
  onText(text);
  return text;
}
