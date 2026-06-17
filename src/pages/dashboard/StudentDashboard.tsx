import type { User } from '../../auth/types';
import { Avatar, PageHeader, Panel, StatCard, Tag } from './widgets';

const UPCOMING = [
  { mentor: 'Priya S.', subject: 'AP Calculus BC', when: 'Today · 4:30 PM', mode: 'Video' },
  { mentor: 'Daniel K.', subject: 'College essays', when: 'Thu · 6:00 PM', mode: 'Video' },
];

const MENTORS = [
  { name: 'Priya S.', headline: "MIT '26 · Mathematics", subjects: ['AP Calculus BC', 'Physics C'] },
  { name: 'Daniel K.', headline: "Stanford '25 · English", subjects: ['College essays', 'AP Lang'] },
];

const SUGGESTED = [
  { name: 'Aisha M.', headline: "Berkeley '26 · Chemistry", subjects: ['AP Chemistry', 'Organic'] },
  { name: 'Leo T.', headline: "Yale '25 · CS", subjects: ['AP CS A', 'Data structures'] },
];

export function StudentDashboard({ user }: { user: User }) {
  const firstName = user.name.split(' ')[0];

  return (
    <>
      <PageHeader
        eyebrow="Student workspace"
        title={`Welcome back, ${firstName}`}
        subtitle="Here’s what’s happening with your mentorship."
        action={
          <button className="inline-flex items-center gap-2 bg-ink text-paper text-[13px] font-medium px-4 py-2.5 rounded-sm hover:bg-ink-soft transition-colors">
            <span className="material-symbols-outlined text-[18px]">search</span>
            Find a mentor
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard value="2" label="Active mentors" icon="groups" />
        <StatCard value="14" label="Sessions completed" icon="task_alt" />
        <StatCard value="3" label="Subjects in progress" icon="menu_book" />
        <StatCard value="+0.4" label="GPA change this term" icon="trending_up" />
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
                  <Avatar name={s.mentor} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-ink">{s.subject}</p>
                    <p className="text-[12px] text-slate-500">with {s.mentor} · {s.when}</p>
                  </div>
                  <Tag>{s.mode}</Tag>
                  <button className="text-[12.5px] font-medium text-ink border border-line-2 rounded-sm px-3 py-1.5 hover:bg-line/50 transition-colors">
                    Join
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Your mentors">
            <ul className="space-y-4">
              {MENTORS.map((m) => (
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
          <Panel title="Your goals">
            <ul className="space-y-3">
              {(user.subjects.length ? user.subjects : ['Add subjects to your profile']).map((s) => (
                <li key={s} className="flex items-center gap-2.5 text-[13.5px] text-ink">
                  <span className="material-symbols-outlined text-bronze-500 text-[18px]">flag</span>
                  {s}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Suggested mentors">
            <ul className="space-y-4">
              {SUGGESTED.map((m) => (
                <li key={m.name} className="flex items-start gap-3">
                  <Avatar name={m.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-medium text-ink">{m.name}</p>
                    <p className="text-[11.5px] text-slate-500">{m.headline}</p>
                  </div>
                  <button className="text-[12px] font-medium text-paper bg-ink rounded-sm px-2.5 py-1 hover:bg-ink-soft transition-colors">
                    Connect
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
