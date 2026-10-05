import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const inputClass =
  'w-full bg-canvas border border-line-2 rounded-xl px-3.5 py-2.5 text-[14px] text-ink ' +
  'placeholder:text-slate-400 focus:border-leaf-400 focus:ring-1 focus:ring-leaf-300 ' +
  'outline-none transition-colors';

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 bg-leaf-600 text-white text-[14px] font-semibold px-6 py-3 rounded-full hover:brightness-110 hover:shadow-glow transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

export const btnSecondary =
  'inline-flex items-center justify-center gap-2 border-2 border-leaf-600 text-leaf-700 text-[14px] font-semibold px-6 py-3 rounded-full hover:bg-leaf-50 transition-colors disabled:opacity-50';

export const btnSmall =
  'inline-flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-ink border border-line-2 rounded-full px-3.5 py-1.5 hover:bg-slate-50 transition-colors disabled:opacity-50';

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

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={inputClass} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={inputClass + ' pr-8'} />;
}

export function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex items-start gap-2.5 text-[13px] text-slate-700 leading-snug cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 rounded border-line-2 text-leaf-600 focus:ring-leaf-300"
      />
      <span>{children}</span>
    </label>
  );
}

/** Toggle chips for multi-select lists (majors, months, subjects). */
export function ChipSelect({
  options,
  value,
  onChange,
  max,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  max?: number;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => {
              if (on) onChange(value.filter((v) => v !== o));
              else if (!max || value.length < max) onChange([...value, o]);
            }}
            className={
              'text-[12.5px] px-3 py-1.5 rounded-full border transition-colors ' +
              (on ? 'bg-leaf-600 text-white border-leaf-600' : 'bg-canvas text-slate-700 border-line-2 hover:border-leaf-300')
            }
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
      {children}
    </div>
  );
}

/** Small-print disclaimer every plan screen carries (claim integrity, M10b). */
export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11.5px] text-slate-500 leading-relaxed flex gap-1.5">
      <span className="material-symbols-outlined text-[14px] mt-px">info</span>
      <span>{children}</span>
    </p>
  );
}
