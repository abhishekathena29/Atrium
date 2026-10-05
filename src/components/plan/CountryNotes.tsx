import type { TargetCountry } from '../../auth/types';
import { COUNTRY_LABEL } from '../../auth/types';
import { COUNTRY_GUIDE } from '../../data/countries';

/** One card per target country. US and UK guidance is kept separate on purpose. */
export function CountryNotes({ countries }: { countries: TargetCountry[] }) {
  return (
    <div>
      <p className="text-[12.5px] text-slate-500 mb-2">For the countries you're applying to</p>
      <div className={`grid gap-2.5 ${countries.length > 1 ? 'sm:grid-cols-2' : ''}`}>
        {countries.map((c) => (
          <div key={c} className="bg-canvas border border-line rounded-2xl p-4 lift">
            <p className="font-jakarta font-bold text-ink text-[14.5px] flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-[18px]">flag</span>
              {COUNTRY_LABEL[c]}
            </p>
            <p className="text-[12.5px] text-slate-600 mt-1.5 leading-relaxed">{COUNTRY_GUIDE[c].howApsAreRead}</p>
            <p className="text-[12px] text-slate-500 mt-2 leading-relaxed">
              <span className="font-semibold text-slate-600">Check next:</span> {COUNTRY_GUIDE[c].checkNext}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
