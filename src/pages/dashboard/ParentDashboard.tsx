import { useState } from 'react';
import { findUserById } from '../../auth/AuthContext';
import type { User } from '../../auth/types';
import { getStudentState } from '../../engine/studentState';
import { listConsults, listOutcomes, saveConsult, type Consult } from '../../store/db';
import { IndiaPlanView } from '../../components/plan/IndiaPlanView';
import { LoadPlanView } from '../../components/plan/LoadPlanView';
import { ConsultStatusTag } from '../../components/ConsultStatusTag';
import { PRICE } from '../../data/pricing';
import { btnSmall } from '../../components/ui/Field';
import { PageHeader, Panel } from './widgets';
import { computeGamification, fmtMinutes } from '../../engine/gamification';
import { AwardBadge } from '../../components/gamify/Gamify';

export function ParentDashboard({ user }: { user: User }) {
  const [, force] = useState(0);
  const student = user.linkedStudentId ? findUserById(user.linkedStudentId) : null;

  if (!student) {
    return (
      <PageHeader
        eyebrow="Parent workspace"
        title="No student linked"
        subtitle="Ask your child for the invite code shown on their Atrium dashboard, then sign up again with it."
      />
    );
  }

  const first = student.name.split(' ')[0];
  const state = getStudentState(student);
  const consults = listConsults((c) => c.studentId === student.id);
  const pending = consults.filter((c) => c.status === 'awaiting_parent');
  const outcomes = listOutcomes((o) => o.studentId === student.id);

  function approve(c: Consult) {
    saveConsult({ ...c, status: 'requested', parentApprovedAt: new Date().toISOString() });
    force((n) => n + 1);
  }

  function decline(c: Consult) {
    saveConsult({ ...c, status: 'declined' });
    force((n) => n + 1);
  }

  return (
    <>
      <PageHeader
        eyebrow="Parent workspace"
        title={`${first}'s plan`}
        subtitle="What we recommend, why, and anything waiting for your approval."
      />

      {pending.length > 0 && (
        <Panel title="Waiting for your approval">
          <ul className="space-y-3">
            {pending.map((c) => (
              <li key={c.id} className="border border-line-2 rounded-sm p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-medium text-ink">Paid consult · {c.mentorName ?? 'mentor matched by Atrium'}</p>
                    <p className="text-[12.5px] text-slate-600">{c.topic}</p>
                    <p className="text-[11.5px] text-slate-500 mt-1">Proposed price {PRICE[student.segment]}. Prototype, so no charge is taken.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => approve(c)} className="text-[12.5px] font-medium text-paper bg-ink rounded-sm px-4 py-2 hover:bg-ink-soft">
                      Approve &amp; pay
                    </button>
                    <button onClick={() => decline(c)} className={btnSmall}>Decline</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          {state.indiaPlan && <IndiaPlanView user={student} plan={state.indiaPlan} audience="parent" />}
          {state.loadPlan && <LoadPlanView user={student} plan={state.loadPlan} hollandCode={state.profile!.hollandCode} audience="parent" />}
          {!state.profile && (
            <Panel title="Plan not ready yet">
              <p className="text-[13px] text-slate-600">
                {first} hasn't finished {state.intakeDone ? 'the questionnaire' : 'onboarding'} yet. The plan appears here as soon as they do.
              </p>
            </Panel>
          )}
        </div>

        <div className="space-y-6">
          <Panel title="Consults">
            {consults.length === 0 ? (
              <p className="text-[13px] text-slate-500">No consults requested yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {consults.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2">
                    <span className="text-[13px] text-ink">{c.kind === 'free' ? 'Free 20-min' : 'Paid'} · {c.mentorName ?? 'matching'}</span>
                    <ConsultStatusTag status={c.status} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={`${first}'s progress`}>
            {(() => {
              const g = computeGamification(student, state);
              const earned = g.awards.filter((a) => a.earned);
              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-orange-50 py-2.5">
                      <p className="text-[18px] font-bold text-ink">{g.streak}</p>
                      <p className="text-[11px] text-slate-600">day streak</p>
                    </div>
                    <div className="rounded-xl bg-violet-50 py-2.5">
                      <p className="text-[18px] font-bold text-ink">L{g.level}</p>
                      <p className="text-[11px] text-slate-600">{g.levelName}</p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 py-2.5">
                      <p className="text-[18px] font-bold text-ink">{fmtMinutes(g.weekMinutes)}</p>
                      <p className="text-[11px] text-slate-600">this week</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {earned.length ? earned.map((a) => <AwardBadge key={a.id} a={a} size="sm" />) : <p className="text-[12.5px] text-slate-500">No awards yet.</p>}
                  </div>
                  <p className="text-[11.5px] text-slate-500">Based on study time {first} logs themselves.</p>
                </div>
              );
            })()}
          </Panel>

          <Panel title="Outcome summary">
            {outcomes.length === 0 ? (
              <p className="text-[13px] text-slate-500">Results appear here once {first} reports them after the exam.</p>
            ) : (
              <ul className="space-y-2">
                {outcomes.map((o) => (
                  <li key={o.id} className="text-[13px]">
                    <span className="text-ink font-medium">{o.subject}</span>
                    <span className="text-slate-500"> · {o.examSession}{o.score ? ` · ${o.score}` : ''}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Safeguarding">
            <p className="text-[13px] text-slate-600 leading-relaxed">
              {student.guardianConsent
                ? `Consent recorded on ${new Date(student.guardianConsent.at).toLocaleDateString()}.`
                : 'No consult consent recorded yet. It is asked for before the first consult.'}{' '}
              All sessions stay on-platform. <a href="/safeguarding" className="underline">Our policy</a>.
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}
