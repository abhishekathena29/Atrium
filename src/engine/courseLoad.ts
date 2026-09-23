/**
 * M4 Course-load engine (Singapore · US track): builds a subject/level plan under a weekly
 * load ceiling, with interest fit from RIASEC. Athlete mode derives the ceiling from
 * self-reported training hours. Rule-based; formulas are published on /methodology.
 */

import type { CourseChoice, CourseLevel, Curriculum, SgUsIntake } from '../auth/types';
import type { RiasecType } from '../data/questionnaire';
import type { Profile } from '../store/db';
import { riasecFit } from './profile';
import { withArticle } from './overlap';

type Area =
  | 'math' | 'further-math' | 'physics' | 'chemistry' | 'biology' | 'economics' | 'business'
  | 'history' | 'geography' | 'psychology' | 'cs' | 'english' | 'language' | 'arts' | 'statistics';

const AREA_RIASEC: Record<Area, RiasecType[]> = {
  math: ['I', 'C'], 'further-math': ['I', 'C'], physics: ['I', 'R'], chemistry: ['I', 'R'],
  biology: ['I', 'S'], economics: ['E', 'I'], business: ['E', 'C'], history: ['A', 'I'],
  geography: ['I', 'R'], psychology: ['S', 'I'], cs: ['I', 'R', 'C'], english: ['A', 'S'],
  language: ['A', 'S'], arts: ['A'], statistics: ['I', 'C'],
};

/** Per major: areas that are core to it, and areas US admissions read as a rigor signal. */
const MAJOR_NEEDS: Record<string, { core: Area[]; rigor: Area[] }> = {
  'Computer Science': { core: ['cs', 'math'], rigor: ['physics', 'further-math'] },
  Engineering: { core: ['math', 'physics'], rigor: ['chemistry', 'further-math'] },
  Mathematics: { core: ['math', 'further-math'], rigor: ['physics', 'statistics'] },
  Physics: { core: ['physics', 'math'], rigor: ['further-math', 'chemistry'] },
  'Biology / Pre-med': { core: ['biology', 'chemistry'], rigor: ['math', 'statistics'] },
  Chemistry: { core: ['chemistry'], rigor: ['math', 'physics'] },
  Economics: { core: ['economics'], rigor: ['math', 'statistics'] },
  Business: { core: ['business', 'economics'], rigor: ['math'] },
  Psychology: { core: ['psychology'], rigor: ['biology', 'statistics'] },
  'Political Science / PPE': { core: ['history', 'economics'], rigor: ['math', 'english'] },
  History: { core: ['history'], rigor: ['english', 'language'] },
  'English / Literature': { core: ['english'], rigor: ['history', 'language'] },
  'Design / Architecture': { core: ['arts'], rigor: ['math', 'physics'] },
};

export const CATALOG: Record<Curriculum, { name: string; area: Area }[]> = {
  IB: [
    { name: 'Mathematics AA', area: 'math' }, { name: 'Mathematics AI', area: 'statistics' },
    { name: 'Physics', area: 'physics' }, { name: 'Chemistry', area: 'chemistry' },
    { name: 'Biology', area: 'biology' }, { name: 'Economics', area: 'economics' },
    { name: 'Business Management', area: 'business' }, { name: 'History', area: 'history' },
    { name: 'Geography', area: 'geography' }, { name: 'Psychology', area: 'psychology' },
    { name: 'Computer Science', area: 'cs' }, { name: 'English A: Literature', area: 'english' },
    { name: 'Language B', area: 'language' }, { name: 'Visual Arts', area: 'arts' },
  ],
  'A-Level': [
    { name: 'Mathematics', area: 'math' }, { name: 'Further Mathematics', area: 'further-math' },
    { name: 'Physics', area: 'physics' }, { name: 'Chemistry', area: 'chemistry' },
    { name: 'Biology', area: 'biology' }, { name: 'Economics', area: 'economics' },
    { name: 'Business', area: 'business' }, { name: 'History', area: 'history' },
    { name: 'Geography', area: 'geography' }, { name: 'Psychology', area: 'psychology' },
    { name: 'Computer Science', area: 'cs' }, { name: 'English Literature', area: 'english' },
    { name: 'Art & Design', area: 'arts' },
  ],
  AP: [
    { name: 'Calculus BC', area: 'math' }, { name: 'Calculus AB', area: 'math' },
    { name: 'Statistics', area: 'statistics' }, { name: 'Physics C', area: 'physics' },
    { name: 'Physics 1', area: 'physics' }, { name: 'Chemistry', area: 'chemistry' },
    { name: 'Biology', area: 'biology' }, { name: 'Computer Science A', area: 'cs' },
    { name: 'Macroeconomics', area: 'economics' }, { name: 'Microeconomics', area: 'economics' },
    { name: 'US History', area: 'history' }, { name: 'World History', area: 'history' },
    { name: 'English Language', area: 'english' }, { name: 'English Literature', area: 'english' },
    { name: 'Psychology', area: 'psychology' }, { name: 'Spanish Language', area: 'language' },
  ],
};

export const LEVELS: Record<Curriculum, CourseLevel[]> = {
  IB: ['HL', 'SL'],
  'A-Level': ['A-Level', 'AS'],
  AP: ['AP', 'Honors', 'Standard'],
};

/** Weekly out-of-class study hours by level (illustrative, see /methodology). */
export const LEVEL_HOURS: Record<CourseLevel, number> = {
  HL: 5, SL: 3, 'A-Level': 7, AS: 4, AP: 4, Honors: 3, Standard: 2,
};

/** IB core (TOK, Extended Essay, CAS) is a fixed weekly cost. */
export const IB_CORE_HOURS = 3;

const DOWNGRADE: Partial<Record<CourseLevel, CourseLevel>> = { HL: 'SL', 'A-Level': 'AS', AP: 'Honors', Honors: 'Standard' };
const UPGRADE: Partial<Record<CourseLevel, CourseLevel>> = { SL: 'HL', AS: 'A-Level', Honors: 'AP', Standard: 'Honors' };

export type LoadAction = 'keep' | 'downgrade' | 'upgrade';
export type LoadTag = 'High fit' | 'Keep' | 'Rebalance' | 'Stretch';

export interface LoadPlanItem {
  name: string;
  from: CourseLevel;
  to: CourseLevel;
  action: LoadAction;
  tag: LoadTag;
  role: 'core' | 'rigor' | 'other';
  fit: number;
  hours: number;
  reason: string;
}

export interface LoadPlan {
  ceiling: number;
  currentLoad: number;
  plannedLoad: number;
  fixedHours: number;
  items: LoadPlanItem[];
  meterNote: string;
  seasonNote: string | null;
  primaryMajor: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatMonths(months: number[]): string {
  if (!months.length) return '';
  const sorted = [...months].sort((a, b) => a - b);
  return sorted.length > 2 ? `${MONTHS[sorted[0] - 1]}–${MONTHS[sorted[sorted.length - 1] - 1]}` : sorted.map((m) => MONTHS[m - 1]).join(' & ');
}

/**
 * Weekly academic ceiling. Training and other fixed commitments come out of the same week,
 * so each committed hour removes ~2/3 of an hour of study capacity; temperament nudges it.
 */
export function ceilingFor(committedHours: number, loadFactor: number): number {
  const base = Math.min(35, 42 - 0.67 * committedHours);
  return Math.max(12, Math.round(base * loadFactor));
}

function areaOf(curriculum: Curriculum, name: string): Area | null {
  return CATALOG[curriculum].find((c) => c.name === name)?.area ?? null;
}

function minTopLevel(curriculum: Curriculum): number {
  return curriculum === 'IB' ? 3 : curriculum === 'A-Level' ? 3 : 0;
}

function topLevel(curriculum: Curriculum): CourseLevel {
  return LEVELS[curriculum][0];
}

export function buildLoadPlan(intake: SgUsIntake, profile: Profile): LoadPlan {
  const training = intake.isAthlete ? intake.trainingHoursPerWeek : 0;
  // Other fixed commitments (tuition, jobs) come out of the same week as training does.
  const ceiling = ceilingFor(training + (profile.career.currentLoadHours || 0), profile.loadFactor);
  const fixedHours = intake.curriculum === 'IB' ? IB_CORE_HOURS : 0;
  const majors = (profile.career.targetMajors.length ? profile.career.targetMajors : intake.targetMajors).filter((m) => m !== 'Undecided');
  const primaryMajor = majors[0] ?? 'your intended major';
  const needs = majors.map((m) => MAJOR_NEEDS[m]).filter(Boolean);

  const items: LoadPlanItem[] = intake.courses.map((c: CourseChoice) => {
    const area = areaOf(intake.curriculum, c.name);
    const role = area && needs.some((n) => n.core.includes(area)) ? 'core' : area && needs.some((n) => n.rigor.includes(area)) ? 'rigor' : 'other';
    const fit = area ? riasecFit(profile.riasec, AREA_RIASEC[area]) : 0.5;
    return { name: c.name, from: c.level, to: c.level, action: 'keep', tag: 'Keep', role, fit, hours: LEVEL_HOURS[c.level], reason: '' };
  });

  const value = (i: LoadPlanItem) => (i.role === 'core' ? 3 : i.role === 'rigor' ? 2 : 0) + i.fit;
  const total = () => fixedHours + items.reduce((s, i) => s + LEVEL_HOURS[i.to], 0);
  const currentLoad = total();
  const top = topLevel(intake.curriculum);

  // Over the ceiling: downgrade the lowest-value course first, respecting curriculum minimums.
  while (total() > ceiling) {
    const topCount = items.filter((i) => i.to === top).length;
    const candidate = items
      .filter((i) => DOWNGRADE[i.to] && !(i.to === top && topCount <= minTopLevel(intake.curriculum)))
      .sort((a, b) => value(a) - value(b))[0];
    if (!candidate || value(candidate) >= 2) break; // never cut core / rigor subjects automatically
    candidate.to = DOWNGRADE[candidate.to]!;
  }

  // Comfortably under: suggest one stretch on the highest-value course.
  if (ceiling - total() >= 4) {
    const stretch = items
      .filter((i) => UPGRADE[i.to] && i.role !== 'other')
      .sort((a, b) => value(b) - value(a))[0];
    if (stretch && total() - LEVEL_HOURS[stretch.to] + LEVEL_HOURS[UPGRADE[stretch.to]!] <= ceiling) {
      stretch.to = UPGRADE[stretch.to]!;
    }
  }

  const season = intake.isAthlete ? formatMonths(intake.peakSeasonMonths) : '';
  for (const i of items) {
    i.hours = LEVEL_HOURS[i.to];
    const fitWord = i.fit >= 0.7 ? 'Strong' : i.fit >= 0.5 ? 'Solid' : 'Weaker';
    if (i.to !== i.from && LEVEL_HOURS[i.to] < LEVEL_HOURS[i.from]) {
      i.action = 'downgrade';
      i.tag = 'Rebalance';
      const saved = LEVEL_HOURS[i.from] - LEVEL_HOURS[i.to];
      i.reason = `Frees ~${saved} hrs/week${season ? ` in your competition months (${season})` : ''}. Minimal cost to ${withArticle(primaryMajor)} profile.`;
    } else if (i.to !== i.from) {
      i.action = 'upgrade';
      i.tag = 'Stretch';
      i.reason = `You have headroom under your ceiling. The higher level strengthens ${withArticle(primaryMajor)} application.`;
    } else if (i.role === 'core') {
      i.tag = 'High fit';
      i.reason = `Core to ${primaryMajor}. ${fitWord} RIASEC fit. Anchors the application.`;
    } else if (i.role === 'rigor') {
      i.reason = `Rigor signal US colleges read for ${primaryMajor}.${season ? ' Front-load it before peak season.' : ''}`;
    } else {
      i.reason = `${fitWord} interest fit. Not central to ${primaryMajor}, so it is the first lever if load gets tight.`;
    }
  }

  const plannedLoad = total();
  const pct = Math.round((plannedLoad / ceiling) * 100);
  let meterNote = `At ${pct}% of ceiling.`;
  if (currentLoad > ceiling && plannedLoad <= ceiling) meterNote += ` Your current selection (${currentLoad} hrs) was over. The plan below rebalances it and keeps your core subjects.`;
  else if (plannedLoad > ceiling) meterNote += ' Still over after rebalancing, because the remaining courses are all core or rigor. Talk this through with a mentor.';
  else if (ceiling - plannedLoad < LEVEL_HOURS[top] - LEVEL_HOURS[LEVELS[intake.curriculum][1]]) meterNote += ` Adding another ${top} would push you over.`;

  let seasonNote: string | null = null;
  if (intake.isAthlete && season) {
    const heaviest = items.filter((i) => i.role !== 'other').sort((a, b) => b.hours - a.hours)[0];
    seasonNote = `Peak season is ${season}. ${heaviest ? `Front-load ${heaviest.name} coursework in the months before, and ` : ''}plan lighter study weeks during competition. Keep internal-assessment deadlines out of those months where you can.`;
  }

  return { ceiling, currentLoad, plannedLoad, fixedHours, items, meterNote, seasonNote, primaryMajor };
}
