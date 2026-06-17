import type { InputHTMLAttributes, ReactNode } from 'react';

const inputClass =
  'w-full bg-canvas border border-line-2 rounded-sm px-3.5 py-2.5 text-[14px] text-ink ' +
  'placeholder:text-slate-400 focus:border-bronze-400 focus:ring-1 focus:ring-bronze-300 ' +
  'outline-none transition-colors';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] font-medium text-slate-700 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-slate-400 mt-1">{hint}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClass} />;
}
