import type { User } from '../../auth/types';
import { Avatar, PageHeader, Panel, StatCard, Tag } from './widgets';

const UPCOMING = [
  { mentee: 'Maya R.', subject: 'AP Calculus BC', when: 'Today · 4:30 PM', mode: 'Video' },
  { mentee: 'Jordan L.', subject: 'Physics C: Mechanics', when: 'Wed · 5:15 PM', mode: 'Video' },
];

const MENTEES = [
  { name: 'Maya R.', headline: '11th grade · IB Diploma', subjects: ['AP Calculus BC'] },
  { name: 'Jordan L.', headline: '12th grade · AP track', subjects: ['Physics C', 'Calculus'] },
  { name: 'Sana P.', headline: '10th grade', subjects: ['Pre-calculus'] },
];

const REQUESTS = [
  { name: 'Ethan W.', headline: '11th grade · AP track', subject: 'AP Calculus BC' },
  { name: 'Nora B.', headline: '12th grade', subject: 'College math placement' },
];

export function MentorDashboard({ user }: { user: User }) {
  const firstName = user.name.split(' ')[0];

  return (
    <>
      <PageHeader
        eyebrow="Mentor workspace"
        title={`Welcome back, ${firstName}`}
        subtitle="Your mentees and upcoming sessions at a glance."
        action={
          <button className="inline-flex items-center gap-2 bg-ink text-paper text-[13px] font-medium px-4 py-2.5 rounded-sm hover:bg-ink-soft transition-colors">
            <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
            Set availability
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard value="3" label="Active mentees" icon="groups" />
        <StatCard value="2" label="Pending requests" icon="inbox" />
        <StatCard value="58" label="Sessions delivered" icon="task_alt" />
        <StatCard value="4.9" label="Avg. rating" icon="star" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Panel
            title="Upcoming sessions"
            action={<a className="text-[12.5px] font-medium text-bronze-600 hover:text-bronze-700 cursor-pointer">View all</a>}
          >
            <ul className="divide-y divide-line">
              {UPCOMING.map((s) => (
                <li key={s.subject} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <Avatar name={s.mentee} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-ink">{s.subject}</p>
                    <p className="text-[12px] text-slate-500">with {s.mentee} · {s.when}</p>
                  </div>
                  <Tag>{s.mode}</Tag>
                  <button className="text-[12.5px] font-medium text-ink border border-line-2 rounded-sm px-3 py-1.5 hover:bg-line/50 transition-colors">
                    Start
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Your mentees">
            <ul className="space-y-4">
              {MENTEES.map((m) => (
                <li key={m.name} className="flex items-start gap-4">
                  <Avatar name={m.name} />
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-ink">{m.name}</p>
                    <p className="text-[12px] text-slate-500">{m.headline}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.subjects.map((s) => <Tag key={s}>{s}</Tag>)}
                    </div>
                  </div>
                  <button className="text-[12.5px] font-medium text-bronze-600 hover:text-bronze-700">
                    Message
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel
            title="Mentee requests"
            action={<span className="text-[11px] font-medium text-paper bg-bronze-500 rounded-full px-2 py-0.5">{REQUESTS.length} new</span>}
          >
            <ul className="space-y-4">
              {REQUESTS.map((r) => (
                <li key={r.name} className="border border-line-2 rounded-sm p-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={r.name} />
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium text-ink">{r.name}</p>
                      <p className="text-[11.5px] text-slate-500">{r.headline}</p>
                    </div>
                  </div>
                  <p className="text-[12px] text-slate-600 mt-2">Wants help with <span className="text-ink font-medium">{r.subject}</span></p>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 text-[12px] font-medium text-paper bg-ink rounded-sm py-1.5 hover:bg-ink-soft transition-colors">
                      Accept
                    </button>
                    <button className="flex-1 text-[12px] font-medium text-slate-600 border border-line-2 rounded-sm py-1.5 hover:bg-line/50 transition-colors">
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Subjects you mentor">
            <div className="flex flex-wrap gap-1.5">
              {(user.subjects.length ? user.subjects : ['Add subjects to your profile']).map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
