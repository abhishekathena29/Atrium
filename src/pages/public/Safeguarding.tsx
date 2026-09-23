import { useState, type FormEvent } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { makeId, saveConcern } from '../../store/db';
import { ErrorNote, Field, Select, TextArea, TextInput, btnPrimary } from '../../components/ui/Field';
import { PageIntro, PublicLayout } from './PublicLayout';

const POLICY = [
  {
    icon: 'verified_user',
    title: 'Vetting before contact',
    body: 'Every mentor passes an application review, a subject screen, a teaching demo, and safeguarding checks (code of conduct, training, background check) before being matched with any student.',
  },
  {
    icon: 'forum',
    title: 'On-platform contact only',
    body: 'Consults and messages happen on Atrium. Mentors must not ask for or share personal phone numbers, social media, or off-platform meetings. Doing so ends a mentor’s place on Atrium.',
  },
  {
    icon: 'visibility',
    title: 'Monitoring',
    body: 'Session records and messages can be reviewed by the Atrium safeguarding lead. Mentors log a note after every consult.',
  },
  {
    icon: 'family_restroom',
    title: 'Consent for under-18s',
    body: 'A parent or guardian must consent before a student under 18 takes any consult. Parents approve and pay for paid consults, and can see their child’s plan.',
  },
  {
    icon: 'report',
    title: 'Reporting & response',
    body: 'Anyone can report a concern below. v1 target: acknowledged within 24 hours, triaged and acted on within 72 hours. Urgent risks to a child are referred to the appropriate authorities.',
  },
];

export function Safeguarding() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? '');
  const [about, setAbout] = useState('A mentor');
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!details.trim()) return setError('Please describe what happened.');
    saveConcern({ id: makeId('sc'), reporterEmail: email.trim(), about, details: details.trim(), createdAt: new Date().toISOString() });
    setSent(true);
    setDetails('');
  }

  return (
    <PublicLayout>
      <PageIntro eyebrow="Safeguarding · policy v1" title="Most of our students are minors. We act like it.">
        Safeguarding is a precondition for Atrium. No consult with a minor happens until these measures are in
        place.
      </PageIntro>

      <section className="border-b border-line">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {POLICY.map((p) => (
            <div key={p.title} className="border-t border-line-2 pt-5">
              <span className="material-symbols-outlined text-bronze-600 text-[26px]">{p.icon}</span>
              <h3 className="font-serif text-ink text-[21px] mt-3 mb-2">{p.title}</h3>
              <p className="text-[14px] text-slate-600 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="report" className="bg-canvas border-b border-line">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 py-16">
          <h2 className="font-serif text-ink text-display-sm mb-2">Report a concern</h2>
          <p className="text-[14px] text-slate-600 mb-6">
            You can report anonymously. If a child is in immediate danger, contact local emergency services first.
          </p>
          <form onSubmit={submit} className="space-y-4">
            {error && <ErrorNote>{error}</ErrorNote>}
            {sent && (
              <p className="text-[13px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-sm px-3 py-2">
                Thank you. Your report has been logged for the safeguarding lead.
              </p>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Your email (optional)">
                <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field label="The concern is about">
                <Select value={about} onChange={(e) => setAbout(e.target.value)}>
                  {['A mentor', 'A student', 'A session or message', 'Something else'].map((o) => <option key={o}>{o}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="What happened?">
              <TextArea rows={5} value={details} onChange={(e) => setDetails(e.target.value)} />
            </Field>
            <button type="submit" className={btnPrimary}>Send report</button>
            <p className="text-[11.5px] text-slate-500">Prototype: reports are stored locally until the backend exists.</p>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}
