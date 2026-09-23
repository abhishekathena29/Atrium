import { useState } from 'react';
import { Link } from 'react-router-dom';
import { findUserById } from '../../auth/AuthContext';
import type { User } from '../../auth/types';
import { getStudentState } from '../../engine/studentState';
import {
  getMentorApplication,
  isVetted,
  listConsults,
  makeId,
  saveConsult,
  saveOutcome,
  type Consult,
} from '../../store/db';
import { IndiaPlanView } from '../../components/plan/IndiaPlanView';
import { LoadPlanView } from '../../components/plan/LoadPlanView';
import { ConsultStatusTag } from '../../components/ConsultStatusTag';
import { TextInput, btnPrimary, btnSmall } from '../../components/ui/Field';
import { Avatar, PageHeader, Panel, StatCard, Tag } from './widgets';

function StudentPlan({ studentId }: { studentId: string }) {
  const student = findUserById(studentId);
  if (!student) return null;
  const state = getStudentState(student);
  if (state.indiaPlan) return <IndiaPlanView user={student} plan={state.indiaPlan} audience="mentor" />;
  if (state.loadPlan) return <LoadPlanView user={student} plan={state.loadPlan} hollandCode={state.profile!.hollandCode} audience="mentor" />;
  return <p className="text-[12.5px] text-slate-500">This student has no plan yet.</p>;
}

export function MentorDashboard({ user }: { user: User }) {
  const firstName = user.name.split(' ')[0];
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);
  const [openPlan, setOpenPlan] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const app = getMentorApplication(user.id);
  const vetted = isVetted(app);
  const passed = Object.values(app.stages).filter((s) => s === 'passed').length;

  const mine = listConsults((c) => c.mentorId === user.id);
  // Phase 1: the team matches by hand; vetted mentors in the segment can pick up unmatched requests.
  const open = vetted
    ? listConsults((c) => c.mentorId === null && c.status === 'requested' && findUserById(c.studentId)?.segment === user.segment)
    : [];
  const requests = mine.filter((c) => c.status === 'requested');
  const active = mine.filter((c) => c.status === 'accepted');
  const completed = mine.filter((c) => c.status === 'completed');

  function set(c: Consult, patch: Partial<Consult>) {
    saveConsult({ ...c, ...patch });
    refresh();
  }

  function complete(c: Consult) {
    const note = notes[c.id]?.trim() ?? '';
    set(c, { status: 'completed', mentorNote: note || undefined });
    // Mentor-side outcome log feeds the loop (M6) alongside the student's own report.
    saveOutcome({
      id: makeId('o'),
      studentId: c.studentId,
      reporter: 'mentor',
      subject: c.topic,
      examSession: 'Consult',
      predictedHoursPerWeek: null,
      actualHoursPerWeek: 0,
      score: '',
      notes: note,
      consentToResearch: false,
      createdAt: new Date().toISOString(),
    });
  }

  if (!vetted) {
    return (
      <>
        <PageHeader
          eyebrow="Mentor workspace"
          title={`Welcome, ${firstName}`}
          subtitle="You'll receive student matches once vetting is complete."
        />
        <Panel title="Vetting progress">
          <p className="text-[14px] text-ink"><span className="font-semibold">{passed} of 4</span> stages passed</p>
          <div className="h-1.5 bg-line rounded-full mt-2 mb-4 overflow-hidden">
            <div className="h-full bg-bronze-500" style={{ width: `${(passed / 4) * 100}%` }} />
          </div>
          <p className="text-[13px] text-slate-600 mb-4">
            Application → subject screen → teaching demo → safeguarding checks. Every stage is required before any
            contact with a student.
          </p>
          <Link to="/mentor/application" className={btnPrimary}>Continue application</Link>
        </Panel>
      </>
    );
  }

  const renderConsult = (c: Consult, actions: React.ReactNode) => (
    <li key={c.id} className="border border-line-2 rounded-sm p-3">
      <div className="flex items-start gap-3">
        <Avatar name={c.studentName} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13.5px] font-medium text-ink">{c.studentName}</p>
            <Tag>{c.kind === 'free' ? 'Free 20-min' : 'Paid'}</Tag>
            <ConsultStatusTag status={c.status} />
          </div>
          <p className="text-[12.5px] text-slate-600 mt-0.5">{c.topic}</p>
          {c.preferredTimes && <p className="text-[11.5px] text-slate-500">Prefers: {c.preferredTimes}</p>}
          <button onClick={() => setOpenPlan(openPlan === c.id ? null : c.id)} className="text-[12px] text-bronze-600 mt-1">
            {openPlan === c.id ? 'Hide plan' : 'View student plan'}
          </button>
        </div>
      </div>
      {openPlan === c.id && <div className="mt-3"><StudentPlan studentId={c.studentId} /></div>}
      <div className="mt-3">{actions}</div>
    </li>
  );

  return (
    <>
      <PageHeader
        eyebrow="Mentor workspace"
        title={`Welcome back, ${firstName}`}
        subtitle="Consult requests matched from student plans. All sessions stay on-platform."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard value={String(requests.length + open.length)} label="Open requests" icon="inbox" />
        <StatCard value={String(active.length)} label="Accepted" icon="event_available" />
        <StatCard value={String(completed.length)} label="Consults delivered" icon="task_alt" />
        <StatCard value={user.athleteMentor ? 'Yes' : 'No'} label="Athlete-mentor" icon="sprint" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Panel title="Requests for you">
            {requests.length + open.length === 0 ? (
              <p className="text-[13px] text-slate-500">No requests right now. You'll see new matches here.</p>
            ) : (
              <ul className="space-y-3">
                {requests.map((c) =>
                  renderConsult(
                    c,
                    <div className="flex gap-2">
                      <button onClick={() => set(c, { status: 'accepted' })} className="text-[12px] font-medium text-paper bg-ink rounded-sm px-3 py-1.5">Accept</button>
                      <button onClick={() => set(c, { status: 'declined' })} className={btnSmall}>Decline</button>
                    </div>,
                  ),
                )}
                {open.map((c) =>
                  renderConsult(
                    c,
                    <button onClick={() => set(c, { mentorId: user.id, mentorName: user.name, status: 'accepted' })} className={btnSmall}>
                      Take this request (team-matched)
                    </button>,
                  ),
                )}
              </ul>
            )}
          </Panel>

          <Panel title="Accepted consults">
            {active.length === 0 ? (
              <p className="text-[13px] text-slate-500">Nothing scheduled.</p>
            ) : (
              <ul className="space-y-3">
                {active.map((c) =>
                  renderConsult(
                    c,
                    <div className="flex flex-wrap gap-2 items-center">
                      <div className="flex-1 min-w-[200px]">
                        <TextInput
                          placeholder="Session note / what you advised"
                          value={notes[c.id] ?? ''}
                          onChange={(e) => setNotes({ ...notes, [c.id]: e.target.value })}
                        />
                      </div>
                      <button onClick={() => complete(c)} className="text-[12px] font-medium text-paper bg-ink rounded-sm px-3 py-2">
                        Mark delivered &amp; log result
                      </button>
                    </div>,
                  ),
                )}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Subjects you mentor">
            <div className="flex flex-wrap gap-1.5">
              {(user.subjects.length ? user.subjects : ['Add subjects in your application']).map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </div>
          </Panel>
          <Panel title="Payouts">
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Proposed model: you set your own rate ($28–$45/hr) after onboarding, with a monthly stipend. Payouts
              aren't live in the prototype.
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}
