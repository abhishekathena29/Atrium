import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { COUNTRY_LABEL, type TargetCountry, type User } from '../../auth/types';
import { buildAiContext, contextKey } from '../../engine/aiContext';
import type { StudentState } from '../../engine/studentState';
import { AI_SETUP_HINT, AiRequestError, aiErrorCopy, fetchAdvice, type AiErrorCode } from '../../lib/ai';
import { getAiAdvice, saveAiAdvice, type AiAdvice, type AiPick } from '../../store/db';
import { btnPrimary, btnSmall } from '../ui/Field';

const VERDICT: Record<AiPick['verdict'], { label: string; cls: string; icon: string }> = {
  take: { label: 'Take', cls: 'bg-leaf-50 text-leaf-700 border-leaf-200', icon: 'check_circle' },
  consider: { label: 'Consider', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'help' },
  skip: { label: 'Skip for now', cls: 'bg-slate-50 text-slate-600 border-line-2', icon: 'do_not_disturb_on' },
};

const isStr = (x: unknown): x is string => typeof x === 'string';
const isStrList = (x: unknown): x is string[] => Array.isArray(x) && x.every(isStr);
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null;

function isPick(x: unknown): x is AiPick {
  return isObj(x) && isStr(x.courseId) && isStr(x.course) && isStr(x.difficulty)
    && isStr(x.verdict) && Object.prototype.hasOwnProperty.call(VERDICT, x.verdict) && isStrList(x.why);
}

/**
 * Runtime check for advice from localStorage (or the server). Advice saved by an older build
 * can have a different shape; anything that doesn't match is discarded instead of crashing.
 */
function asAdvice(x: unknown): AiAdvice | null {
  if (!isObj(x)) return null;
  const ok = isStr(x.contextKey) && isStr(x.generatedAt) && isStr(x.summary)
    && typeof x.recommendedCount === 'number' && Number.isFinite(x.recommendedCount)
    && isStr(x.countReason) && isStr(x.balanceNote) && isStrList(x.watchOuts)
    && Array.isArray(x.picks) && x.picks.every(isPick)
    && Array.isArray(x.countryNotes) && x.countryNotes.every((n) => isObj(n) && isStr(n.country) && isStr(n.note));
  return ok ? (x as unknown as AiAdvice) : null;
}

function countryName(c: string): string {
  return COUNTRY_LABEL[c as TargetCountry] ?? c;
}

function AiLabel() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-0.5">
      <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
      AI-generated · guidance only · built on your Atrium plan
    </span>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Generating advice">
      <div className="shimmer h-4 rounded-full w-11/12" />
      <div className="shimmer h-4 rounded-full w-9/12" />
      <div className="grid sm:grid-cols-2 gap-3 pt-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border border-line rounded-2xl p-4 space-y-3">
            <div className="shimmer h-4 rounded-full w-1/2" />
            <div className="shimmer h-3 rounded-full w-full" />
            <div className="shimmer h-3 rounded-full w-4/5" />
          </div>
        ))}
      </div>
      <p className="text-[12.5px] text-slate-500 flex items-center gap-2">
        <span className="flex gap-1">
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-leaf-500" />
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-leaf-500" />
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-leaf-500" />
        </span>
        Reading your profile, workload and plan. This can take up to a minute.
      </p>
    </div>
  );
}

function PickCard({ pick }: { pick: AiPick }) {
  const v = VERDICT[pick.verdict];
  return (
    <article className="lift border border-line rounded-2xl p-4 bg-canvas">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-jakarta font-bold text-ink text-[15px] leading-snug">{pick.course}</h4>
          <p className="text-[12px] text-slate-500 mt-0.5">{pick.difficulty}</p>
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1 text-[11.5px] font-semibold border rounded-full px-2.5 py-0.5 ${v.cls}`}>
          <span className="material-symbols-outlined text-[14px]">{v.icon}</span>
          {v.label}
        </span>
      </div>
      {pick.why.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {pick.why.map((w, i) => (
            <li key={i} className="flex gap-2 text-[13px] text-slate-700 leading-snug">
              <span className="material-symbols-outlined text-[15px] text-leaf-600 mt-px">arrow_right</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function AdviceView({ advice, showCount }: { advice: AiAdvice; showCount: boolean }) {
  return (
    <div className="space-y-6 animate-fade-up">
      <p className="text-[14.5px] text-slate-700 leading-relaxed">{advice.summary}</p>

      <div className={`grid gap-4 items-start ${showCount ? 'sm:grid-cols-[auto,1fr]' : ''}`}>
        {showCount && (
          <div className="bg-leaf-50 border border-leaf-200 rounded-2xl px-5 py-4 text-center animate-pop">
            <p className="font-jakarta font-extrabold text-leaf-700 text-[30px] leading-none">{advice.recommendedCount}</p>
            <p className="text-[11.5px] text-slate-500 mt-1">AP{advice.recommendedCount === 1 ? '' : 's'} to take</p>
          </div>
        )}
        <div className="space-y-2">
          {advice.countReason && <p className="text-[13.5px] text-slate-700 leading-relaxed">{advice.countReason}</p>}
          {advice.balanceNote && (
            <p className="text-[13px] text-slate-500 flex gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-sky-600">balance</span>
              {advice.balanceNote}
            </p>
          )}
        </div>
      </div>

      {advice.picks.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3 stagger">
          {advice.picks.map((p) => <PickCard key={p.courseId} pick={p} />)}
        </div>
      )}

      {advice.countryNotes.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {advice.countryNotes.map((n) => (
            <div key={n.country} className="border border-line rounded-2xl p-4">
              <p className="text-[11.5px] font-bold uppercase tracking-wider text-sky-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">public</span>
                {countryName(n.country)}
              </p>
              <p className="text-[13px] text-slate-700 leading-relaxed mt-1.5">{n.note}</p>
            </div>
          ))}
        </div>
      )}

      {advice.watchOuts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-[12px] font-bold text-amber-700 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            Watch out for
          </p>
          <ul className="mt-2 space-y-1">
            {advice.watchOuts.map((w, i) => (
              <li key={i} className="text-[13px] text-slate-700 leading-snug">• {w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Layer 1: AI recommendations over the whole profile, grounded in the rule-based plan. */
export function AiAdvisor({ user, state }: { user: User; state: StudentState }) {
  const ctx = useMemo(() => buildAiContext(user, state), [user, state]);
  const key = contextKey(ctx);
  const [advice, setAdvice] = useState<AiAdvice | null>(() => asAdvice(getAiAdvice(user.id)));
  // Only show an "APs to take" count when the plan actually has APs the engine weighed
  // (e.g. an IB student with no AP add-ons has none).
  const hasApCandidates = ctx.candidates.some(
    (c) => c.engine !== null && (c.kind === 'ap' || c.level === 'AP' || c.name.startsWith('AP ')),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ code: AiErrorCode; message: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const ready = state.next === 'plan';
  const stale = !!advice && advice.contextKey !== key;

  async function generate() {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setError(null);
    try {
      const body = await fetchAdvice(ctx, ac.signal);
      const next = asAdvice({ ...body, contextKey: key, generatedAt: new Date().toISOString() });
      if (!next) throw new AiRequestError('upstream', 'The advice came back in an unexpected shape.');
      saveAiAdvice(user.id, next);
      setAdvice(next);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const e = err instanceof AiRequestError ? err : new AiRequestError('upstream', String(err));
      setError({ code: e.code, message: e.message });
    } finally {
      if (abortRef.current === ac) setLoading(false);
    }
  }

  const notSetUp = error && (error.code === 'not_configured' || error.code === 'bad_key');

  return (
    <section className="bg-canvas border border-line rounded-3xl overflow-hidden">
      <header className="flex flex-wrap items-start justify-between gap-3 px-6 pt-5">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
          </span>
          <div>
            <h2 className="font-jakarta font-bold text-ink text-[17px]">AI advisor</h2>
            <p className="text-[13px] text-slate-500 mt-0.5 max-w-xl">
              Reads your personality, interests, subjects, major, target countries and workload, then explains which APs fit and why.
            </p>
            <div className="mt-2"><AiLabel /></div>
          </div>
        </div>
        {advice && !loading && (
          <button type="button" onClick={generate} className={btnSmall} disabled={!ready}>
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Refresh
          </button>
        )}
      </header>

      <div className="px-6 pb-6 pt-5 space-y-5">
        {!ready && (
          <p className="text-[13px] text-slate-600 bg-slate-50 border border-line rounded-xl px-3.5 py-2.5">
            Finish your setup first so the advisor has a plan to build on.{' '}
            <Link to="/dashboard" className="text-leaf-700 font-semibold underline underline-offset-2">Continue setup</Link>
          </p>
        )}

        {stale && !loading && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 animate-fade-in">
            <p className="text-[13px] text-amber-700 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px]">update</span>
              Your profile or plan changed since this advice was written, so it may be out of date.
            </p>
            <button type="button" onClick={generate} className={btnSmall} disabled={!ready}>Refresh advice</button>
          </div>
        )}

        {error && !loading && (
          notSetUp ? (
            <div className="border border-line-2 rounded-2xl p-4 flex gap-3 animate-fade-in">
              <span className="material-symbols-outlined text-[22px] text-slate-500">settings</span>
              <div>
                <p className="text-[14px] font-semibold text-ink">{aiErrorCopy(error.code)}</p>
                <p className="text-[12.5px] text-slate-500 mt-1">
                  {error.code === 'bad_key' ? 'The API key was rejected. ' : ''}
                  <code className="text-[12px] text-slate-700 bg-slate-50 border border-line rounded px-1.5 py-0.5">{AI_SETUP_HINT}</code>
                </p>
                <p className="text-[12.5px] text-slate-500 mt-2">Your rule-based plan below works without it.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 animate-fade-in">
              <span>{aiErrorCopy(error.code)}</span>
              {ready && <button type="button" onClick={generate} className={btnSmall}>Try again</button>}
            </div>
          )
        )}

        {loading ? (
          <Skeleton />
        ) : advice ? (
          <AdviceView advice={advice} showCount={hasApCandidates} />
        ) : (
          !notSetUp && (
            <div className="text-center py-6">
              <p className="text-[14px] text-slate-600 max-w-md mx-auto">
                Get a second opinion on your plan, written for you, with the reasons behind every pick.
              </p>
              <button type="button" onClick={generate} className={btnPrimary + ' mt-4'} disabled={!ready}>
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                Get AI advice
              </button>
            </div>
          )
        )}

        {(advice || error) && !loading && (
          <footer className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-line">
            <p className="text-[11.5px] text-slate-500">
              {advice ? `Generated ${new Date(advice.generatedAt).toLocaleString()}. ` : ''}
              AI can make mistakes. Check each university’s published requirements.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link to="/coach" className={btnSmall}>
                <span className="material-symbols-outlined text-[16px]">chat</span>
                Ask a follow-up
              </Link>
              <Link
                to="/consults?new=paid"
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-violet-600 rounded-full px-3.5 py-1.5 hover:brightness-110 transition"
              >
                <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                Request a mentor consult
              </Link>
            </div>
          </footer>
        )}
      </div>
    </section>
  );
}
