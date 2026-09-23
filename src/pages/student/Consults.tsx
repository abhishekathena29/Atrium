import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getStudentState, planSubjects } from '../../engine/studentState';
import { matchMentors } from '../../engine/match';
import { listConsults, makeId, saveConsult, type Consult } from '../../store/db';
import { Checkbox, ErrorNote, Field, TextArea, TextInput, btnPrimary, btnSmall } from '../../components/ui/Field';
import { PageHeader, Panel, Tag } from '../dashboard/widgets';
import { ConsultStatusTag } from '../../components/ConsultStatusTag';
import { PRICE } from '../../data/pricing';

export function Consults() {
  const { user, updateUser } = useAuth();
  const [params, setParams] = useSearchParams();
  const kindParam = params.get('new');
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);

  const state = getStudentState(user!);
  const subjects = planSubjects(state);
  const matches = matchMentors(user!, subjects);
  const consults = listConsults((c) => c.studentId === user!.id);
  const hadFree = consults.some((c) => c.kind === 'free' && c.status !== 'cancelled' && c.status !== 'declined');

  const [kind, setKind] = useState<'free' | 'paid'>(kindParam === 'paid' ? 'paid' : 'free');
  const [mentorId, setMentorId] = useState<string>('');
  const [topic, setTopic] = useState(subjects.length ? `Validate my plan: ${subjects.slice(0, 3).join(', ')}` : 'Help me choose');
  const [times, setTimes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Safeguarding consent (M10a gates consults with minors)
  const [adult, setAdult] = useState(false);
  const [gName, setGName] = useState('');
  const [gEmail, setGEmail] = useState('');
  const [gAgree, setGAgree] = useState(false);
  const [policyAgree, setPolicyAgree] = useState(false);

  const consent = user!.guardianConsent;
  const isAdult = consent?.name === 'self (18+)';

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!consent) {
      if (!policyAgree) return setError('Please agree to the on-platform contact policy.');
      if (!adult && (!gName.trim() || !gEmail.trim() || !gAgree)) {
        return setError('Students under 18 need a parent or guardian to consent before any consult.');
      }
      updateUser({
        guardianConsent: adult
          ? { name: 'self (18+)', email: user!.email, at: new Date().toISOString() }
          : { name: gName.trim(), email: gEmail.trim(), at: new Date().toISOString() },
      });
    }
    const adultNow = consent ? isAdult : adult;
    const mentor = matches.find((m) => m.mentor.id === mentorId)?.mentor ?? null;
    const c: Consult = {
      id: makeId('c'),
      studentId: user!.id,
      studentName: user!.name,
      mentorId: mentor?.id ?? null,
      mentorName: mentor?.name ?? null,
      kind,
      topic: topic.trim(),
      preferredTimes: times.trim(),
      // The parent is the payer: paid consults for minors wait for their approval.
      status: kind === 'paid' && !adultNow ? 'awaiting_parent' : 'requested',
      createdAt: new Date().toISOString(),
    };
    saveConsult(c);
    setParams({});
    refresh();
  }

  function cancel(c: Consult) {
    saveConsult({ ...c, status: 'cancelled' });
    refresh();
  }

  return (
    <>
      <PageHeader
        eyebrow="Consults"
        title="Validate your plan with a mentor"
        subtitle="Start with a free 20-minute consult. Book a paid consult when you want a deeper plan."
        action={
          !kindParam && (
            <button onClick={() => setParams({ new: 'free' })} className={btnPrimary}>
              <span className="material-symbols-outlined text-[18px]">add</span>
              New request
            </button>
          )
        }
      />

      {kindParam && (
        <form onSubmit={submit} className="max-w-3xl space-y-6 mb-10">
          {error && <ErrorNote>{error}</ErrorNote>}

          <Panel title="Consult type">
            <div className="grid sm:grid-cols-2 gap-3">
              {(['free', 'paid'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={
                    'text-left rounded-md border p-4 ' +
                    (kind === k ? 'border-bronze-400 bg-accent-soft/60 ring-1 ring-bronze-300' : 'border-line-2 bg-canvas')
                  }
                >
                  <p className="font-serif text-ink text-[17px]">{k === 'free' ? 'Free 20-min consult' : 'Paid consult'}</p>
                  <p className="text-[12px] text-slate-500 mt-1">
                    {k === 'free'
                      ? hadFree ? 'You already have one. One free consult per student.' : 'Pressure-test the plan with a mentor.'
                      : `Deeper plan review. Proposed ${PRICE[user!.segment]}. A parent approves and pays.`}
                  </p>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Mentor">
            {matches.length ? (
              <div className="space-y-2">
                {matches.map((m) => (
                  <label key={m.mentor.id} className="flex items-start gap-3 border border-line-2 rounded-sm p-3 cursor-pointer">
                    <input type="radio" name="mentor" checked={mentorId === m.mentor.id} onChange={() => setMentorId(m.mentor.id)} className="mt-1" />
                    <div>
                      <p className="text-[14px] font-medium text-ink">{m.mentor.name} <span className="text-slate-500 font-normal">· {m.mentor.headline}</span></p>
                      <p className="text-[12px] text-slate-500">{m.reasons.join(' · ')}</p>
                    </div>
                  </label>
                ))}
                <label className="flex items-center gap-3 border border-line-2 rounded-sm p-3 cursor-pointer">
                  <input type="radio" name="mentor" checked={mentorId === ''} onChange={() => setMentorId('')} />
                  <span className="text-[13.5px] text-ink">Match me: let the Atrium team choose</span>
                </label>
              </div>
            ) : (
              <p className="text-[13px] text-slate-600 leading-relaxed">
                No vetted mentor matches your plan yet. We're onboarding founding mentors one by one. Send the
                request and the Atrium team will match you by hand, usually from your plan's subjects
                {user!.sgus?.isAthlete ? ' and with an athlete-mentor where possible' : ''}.
              </p>
            )}
          </Panel>

          <Panel title="Details">
            <div className="space-y-4">
              <Field label="What do you want to cover?">
                <TextArea value={topic} onChange={(e) => setTopic(e.target.value)} required />
              </Field>
              <Field label="Times that work for you" hint="e.g. Weekday evenings after 6pm IST">
                <TextInput value={times} onChange={(e) => setTimes(e.target.value)} />
              </Field>
            </div>
          </Panel>

          {!consent && (
            <Panel title="Safeguarding">
              <div className="space-y-4">
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  All sessions happen on Atrium. Mentors never ask for personal phone numbers, social handles, or
                  off-platform meetings. Sessions are monitored and you can{' '}
                  <Link to="/safeguarding" className="underline">report a concern</Link> at any time.
                </p>
                <Checkbox checked={policyAgree} onChange={setPolicyAgree}>
                  I've read and agree to the <Link to="/safeguarding" className="underline">on-platform contact policy</Link>.
                </Checkbox>
                <Checkbox checked={adult} onChange={setAdult}>I am 18 or older.</Checkbox>
                {!adult && (
                  <div className="border border-line rounded-sm p-4 space-y-3 bg-paper-2/40">
                    <p className="text-[12.5px] font-medium text-ink">Parent / guardian consent (required under 18)</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label="Guardian name"><TextInput value={gName} onChange={(e) => setGName(e.target.value)} /></Field>
                      <Field label="Guardian email"><TextInput type="email" value={gEmail} onChange={(e) => setGEmail(e.target.value)} /></Field>
                    </div>
                    <Checkbox checked={gAgree} onChange={setGAgree}>
                      My parent/guardian has agreed to me taking mentor consults on Atrium.
                    </Checkbox>
                  </div>
                )}
              </div>
            </Panel>
          )}

          <div className="flex items-center gap-4">
            <button type="submit" className={btnPrimary} disabled={kind === 'free' && hadFree}>
              {kind === 'paid' && !isAdult && !adult ? 'Send to parent for approval' : 'Send request'}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button type="button" onClick={() => setParams({})} className="text-[13.5px] text-slate-600 hover:text-ink">
              Cancel
            </button>
          </div>
          <p className="text-[11.5px] text-slate-500">Prototype: no payment is taken. Prices are a proposal.</p>
        </form>
      )}

      <Panel title="Your requests">
        {consults.length === 0 ? (
          <p className="text-[13px] text-slate-500">No consults yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {consults.map((c) => (
              <li key={c.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-medium text-ink">{c.kind === 'free' ? 'Free 20-min consult' : 'Paid consult'}</p>
                    <ConsultStatusTag status={c.status} />
                  </div>
                  <p className="text-[12.5px] text-slate-600 mt-0.5">{c.topic}</p>
                  <p className="text-[11.5px] text-slate-500 mt-0.5">
                    {c.mentorName ? `with ${c.mentorName}` : 'Awaiting match by the Atrium team'} · requested {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                  {c.status === 'awaiting_parent' && (
                    <p className="text-[12px] text-amber-800 mt-1">
                      Waiting for a parent to approve. Share invite code <span className="font-mono font-semibold">{user!.parentInviteCode}</span>.
                    </p>
                  )}
                  {c.mentorNote && <p className="text-[12px] text-slate-600 mt-1 italic">Mentor note: {c.mentorNote}</p>}
                </div>
                {c.status === 'completed' ? (
                  <Link to="/outcomes" className={btnSmall}>Report outcome</Link>
                ) : ['requested', 'awaiting_parent', 'accepted'].includes(c.status) ? (
                  <button onClick={() => cancel(c)} className={btnSmall}>Cancel</button>
                ) : (
                  <Tag>Closed</Tag>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
