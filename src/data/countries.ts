/**
 * Country-specific framing for plans. US and UK admissions read courses differently, so each
 * country gets its own wording and the two are never blended into one sentence.
 *
 * Wording rule: never say a university "requires" an AP. Atrium has not verified any
 * university's requirements, so copy talks about relevance, rigor and alignment with the
 * major, and points students to each course's published entry requirements.
 */

import type { TargetCountry } from '../auth/types.ts';

export interface CountryGuide {
  country: TargetCountry;
  /** How APs tend to be read there, in one or two sentences. */
  howApsAreRead: string;
  /** What to check before committing. */
  checkNext: string;
}

export const COUNTRY_GUIDE: Record<TargetCountry, CountryGuide> = {
  US: {
    country: 'US',
    howApsAreRead:
      'US colleges read your full course record. APs in subjects close to your intended major are a common way to show academic rigor, alongside your school results.',
    checkNext: 'Check each college’s AP credit and placement policy. Credit rules vary a lot between colleges.',
  },
  UK: {
    country: 'UK',
    howApsAreRead:
      'UK universities mainly make offers on your school qualification (board exams, IB or A-Levels). Some courses also consider AP results, usually a set of several APs in subjects related to the course.',
    checkNext: 'Read the published entry requirements for each course you like. They differ by university and by course, and some ask for specific subjects.',
  },
  Canada: {
    country: 'Canada',
    howApsAreRead:
      'Canadian universities mostly admit on your school results. Many consider AP results, sometimes for first-year credit or placement.',
    checkNext: 'Check each university’s AP policy page for credit and placement rules.',
  },
  Other: {
    country: 'Other',
    howApsAreRead:
      'How APs count depends on the country and the university. They are widely recognised as evidence of college-level work in a subject.',
    checkNext: 'Once you have a shortlist, check how each university treats AP results. A mentor can help you find this.',
  },
};

export function countriesOf(intake: { targetCountries?: TargetCountry[] } | undefined): TargetCountry[] {
  return intake?.targetCountries?.length ? intake.targetCountries : ['US'];
}

/** Short phrase for headers: "US universities", "UK and US universities". */
export function countryPhrase(countries: TargetCountry[]): string {
  const named = countries.filter((c) => c !== 'Other');
  if (!named.length) return 'universities abroad';
  return `${named.join(' and ')} universities`;
}
