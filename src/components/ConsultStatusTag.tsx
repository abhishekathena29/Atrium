import type { ConsultStatus } from '../store/db';

const LABEL: Record<ConsultStatus, [string, string]> = {
  awaiting_parent: ['Awaiting parent', 'bg-amber-50 text-amber-800 border-amber-200'],
  requested: ['Requested', 'bg-slate-100 text-slate-700 border-line-2'],
  accepted: ['Accepted', 'bg-emerald-50 text-emerald-800 border-emerald-200'],
  completed: ['Completed', 'bg-ink text-paper border-ink'],
  declined: ['Declined', 'bg-red-50 text-red-700 border-red-200'],
  cancelled: ['Cancelled', 'bg-slate-100 text-slate-500 border-line-2'],
};

export function ConsultStatusTag({ status }: { status: ConsultStatus }) {
  const [label, cls] = LABEL[status];
  return <span className={`text-[11px] font-medium border rounded-full px-2 py-0.5 ${cls}`}>{label}</span>;
}
