/**
 * Thin Vite adapter for the AI layers in ./ai.ts. Adds two endpoints to both the dev server
 * and `vite preview`:
 *
 *   POST /api/ai/recommend   JSON { context } → JSON { advice, model, dropped }
 *   POST /api/ai/chat        JSON { context, messages } → text/plain stream of the reply
 *
 * Errors are JSON { error: code, message } with a status code. A chat stream that fails after
 * it started ends with STREAM_ERROR_MARKER + `code|message`; a refusal mid-stream sends
 * STREAM_REFUSAL_MARKER + the refusal text. Missing key → 503 { error: "not_configured" }.
 *
 * Requests must be `Content-Type: application/json` (415 otherwise), and a browser Origin
 * header, when present, must match this server's host (403 otherwise). Tools like curl that
 * send no Origin still work.
 *
 * To move to a real server, call `recommend` / `startChat` from an Express or serverless
 * handler the same way `handle` does below.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Connect, Plugin } from 'vite';
import { AiError, recommend, startChat, toAiError, type AiConfig } from './ai';

const MAX_BODY = 128 * 1024;
/** Past the limit, the rest of the body is read and discarded up to this size, so the 413 reaches the client. */
const MAX_DRAIN = 8 * MAX_BODY;

const tooLarge = () => new AiError('bad_request', 413, `Request body too large (max ${MAX_BODY / 1024} KB)`);

/**
 * Reads a JSON body. Settles exactly once: on end, on error, or if the client goes away.
 * An over-limit body (no Content-Length, e.g. chunked) is drained and discarded, then rejects
 * with 413; one that keeps going past MAX_DRAIN is cut off.
 */
function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0;
    let settled = false;
    const chunks: Buffer[] = [];
    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      req.off('data', onData);
      fn();
    };
    const onData = (c: Buffer) => {
      size += c.length;
      if (size > MAX_DRAIN) {
        settle(() => reject(tooLarge()));
        req.destroy();
        return;
      }
      if (size > MAX_BODY) chunks.length = 0;
      else chunks.push(c);
    };
    req.on('data', onData);
    req.on('end', () =>
      settle(() => {
        if (size > MAX_BODY) return reject(tooLarge());
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null'));
        } catch {
          reject(new AiError('bad_request', 400, 'Body must be JSON'));
        }
      }),
    );
    req.on('error', (err) => settle(() => reject(err)));
    req.on('aborted', () => settle(() => reject(new AiError('aborted', 499, 'Request aborted'))));
    req.on('close', () => settle(() => reject(new AiError('aborted', 499, 'Request closed'))));
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

function sendError(res: ServerResponse, err: unknown, signal?: AbortSignal) {
  const e = toAiError(err, signal);
  // The client is gone: nothing to send, nothing to log.
  if (e.code === 'aborted' || res.destroyed || res.writableEnded) return;
  if (e.status >= 500 && e.code !== 'not_configured') {
    console.error('[atrium-ai]', e.code, e.message, err instanceof AiError ? '' : err);
  }
  // A body was refused unread: don't keep this connection alive for another request.
  if (e.status === 413) res.setHeader('Connection', 'close');
  sendJson(res, e.status, { error: e.code, message: e.message });
}

/** Rejects cross-site and non-JSON requests before any work happens. */
function checkRequest(req: IncomingMessage) {
  const type = (req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
  if (type !== 'application/json') {
    throw new AiError('bad_request', 415, 'Content-Type must be application/json');
  }
  const origin = req.headers.origin;
  if (origin !== undefined) {
    let host: string | null = null;
    try {
      host = new URL(origin).host;
    } catch {
      // "null" or a malformed origin: treat as foreign.
    }
    if (!host || host !== req.headers.host) throw new AiError('bad_request', 403, 'Cross-origin requests are not allowed');
  }
  const declared = Number(req.headers['content-length']);
  if (Number.isFinite(declared) && declared > MAX_BODY) throw tooLarge();
}

function middleware(getConfig: () => AiConfig): Connect.NextHandleFunction {
  return (req, res, next) => {
    const path = req.url?.split('?')[0];
    if (path !== '/api/ai/recommend' && path !== '/api/ai/chat') return next();
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return sendJson(res, 405, { error: 'method_not_allowed', message: 'Use POST' });
    }
    void handle(path, req, res, getConfig());
  };
}

async function handle(path: string, req: IncomingMessage, res: ServerResponse, cfg: AiConfig) {
  const abort = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) abort.abort();
  });
  try {
    checkRequest(req);
    // Fail fast before reading the body when there's no key.
    if (!cfg.apiKey) throw new AiError('not_configured', 503, 'ANTHROPIC_API_KEY is not set on this server.');
    const body = await readJson(req);

    if (path === '/api/ai/recommend') {
      const result = await recommend(body, cfg, abort.signal);
      if (!abort.signal.aborted) sendJson(res, 200, result);
      return;
    }

    const chunks = await startChat(body, cfg, abort.signal);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    for await (const chunk of chunks) {
      if (abort.signal.aborted) break;
      if (chunk) res.write(chunk);
    }
    res.end();
  } catch (err) {
    if (res.headersSent) res.end();
    else sendError(res, err, abort.signal);
  }
}

/** Registers the AI endpoints. `apiKey` is read lazily so `.env.local` edits apply on restart. */
export function atriumAi(options: { apiKey?: string }): Plugin {
  const getConfig = () => ({ apiKey: options.apiKey });
  return {
    name: 'atrium-ai',
    configureServer(server) {
      server.middlewares.use(middleware(getConfig));
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware(getConfig));
    },
  };
}
