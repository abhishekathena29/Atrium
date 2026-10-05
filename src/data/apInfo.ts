/**
 * AP reference data shared by both segments: a plain-language explainer for students who have
 * never seen AP terminology, and a relative difficulty rating used to balance a plan.
 *
 * Difficulty is an Atrium editorial rating (v0, illustrative). It reflects breadth, depth and
 * how much maths each exam leans on. It is not taken from pass rates. Defined on /methodology.
 */

export const AP_INFO_VERSION = 'v0 · illustrative · Oct 2026';

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  1: 'Lighter',
  2: 'Manageable',
  3: 'Moderate',
  4: 'Demanding',
  5: 'Very demanding',
};

export interface ApInfo {
  id: string;
  name: string;
  difficulty: Difficulty;
  /** One sentence a Class 10 student can follow. */
  plain: string;
}

export const AP_INFO: ApInfo[] = [
  { id: 'calc-ab', name: 'AP Calculus AB', difficulty: 3, plain: 'First-year college calculus: limits, derivatives and integrals.' },
  { id: 'calc-bc', name: 'AP Calculus BC', difficulty: 4, plain: 'Everything in Calculus AB plus series, polar and parametric topics. Faster and wider.' },
  { id: 'stats', name: 'AP Statistics', difficulty: 2, plain: 'Collecting data, reading graphs, probability and drawing conclusions from samples.' },
  { id: 'physics-1', name: 'AP Physics 1', difficulty: 4, plain: 'Algebra-based mechanics: motion, forces, energy, rotation. Heavy on explaining your reasoning.' },
  { id: 'physics-c-mech', name: 'AP Physics C: Mechanics', difficulty: 4, plain: 'Mechanics done with calculus. Close to what engineering students take in year one.' },
  { id: 'physics-c-em', name: 'AP Physics C: E&M', difficulty: 5, plain: 'Electricity and magnetism with calculus. Usually taken after Physics C: Mechanics.' },
  { id: 'chem', name: 'AP Chemistry', difficulty: 5, plain: 'College general chemistry: bonding, reactions, equilibrium, thermodynamics, plus lab skills.' },
  { id: 'bio', name: 'AP Biology', difficulty: 4, plain: 'College intro biology: cells, genetics, evolution and ecology. A lot of content to cover.' },
  { id: 'csa', name: 'AP Computer Science A', difficulty: 2, plain: 'Programming in Java: writing classes, loops, arrays and simple algorithms.' },
  { id: 'macro', name: 'AP Macroeconomics', difficulty: 2, plain: 'How whole economies work: GDP, inflation, unemployment, money and trade.' },
  { id: 'micro', name: 'AP Microeconomics', difficulty: 2, plain: 'How people and firms make choices: supply and demand, markets, competition.' },
  { id: 'psych', name: 'AP Psychology', difficulty: 2, plain: 'An intro to how people think, learn, feel and behave. Lots of terms, little maths.' },
  { id: 'lang', name: 'AP English Language', difficulty: 3, plain: 'Reading arguments closely and writing your own: timed essays on rhetoric and evidence.' },
  { id: 'apush', name: 'AP US History', difficulty: 4, plain: 'US history from 1491 to today, with document-based essays. Lots of reading.' },
];

export function apInfo(id: string): ApInfo | undefined {
  return AP_INFO.find((a) => a.id === id);
}

/** A course counts as "hard" for balancing a plan at difficulty 4 or above. */
export const HARD_AT = 4;

/** Most hard APs one plan should carry in a single exam cycle. */
export const MAX_HARD = 2;

/**
 * Weekly self-study hours for an AP taken on top of a school system with no mapped overlap
 * (the SG/US add-on case). Illustrative, by difficulty.
 */
export const ADDON_HOURS: Record<Difficulty, number> = { 1: 2, 2: 2.5, 3: 3, 4: 3.5, 5: 4 };

/** US high-school AP class names (SG/US catalog) → AP ids, so US students get difficulty too. */
export const US_CLASS_TO_AP: Record<string, string> = {
  'Calculus BC': 'calc-bc',
  'Calculus AB': 'calc-ab',
  Statistics: 'stats',
  'Physics C': 'physics-c-mech',
  'Physics 1': 'physics-1',
  Chemistry: 'chem',
  Biology: 'bio',
  'Computer Science A': 'csa',
  Macroeconomics: 'macro',
  Microeconomics: 'micro',
  'US History': 'apush',
  'English Language': 'lang',
  Psychology: 'psych',
};
