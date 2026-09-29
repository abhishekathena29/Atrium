import { Link } from 'react-router-dom';

export function Logo({ to = '/', dark = false }: { to?: string; dark?: boolean }) {
  return (
    <Link to={to} className="flex items-center gap-2 w-fit">
      <span className="w-8 h-8 rounded-xl bg-leaf-600 flex items-center justify-center">
        <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          school
        </span>
      </span>
      <span className={`font-jakarta font-extrabold text-[20px] tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>Atrium</span>
    </Link>
  );
}
