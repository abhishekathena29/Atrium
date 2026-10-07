/**
 * M4 Course-load engine (Singapore · US track): builds a subject/level plan under a weekly
 * load ceiling, with interest fit from RIASEC. Athlete mode derives the ceiling from
 * self-reported training hours. IB / A-Level students can add AP exams on top; those are
 * optional, so they are the first thing dropped when the week is over the ceiling.
 * Rule-based; formulas are published on /methodology.
 */

import type { CourseChoice, CourseLevel, Curriculum, SgUsIntake, TargetCountry } from '../auth/types';
import { ADDON_HOURS, AP_INFO, DIFFICULTY_LABEL, HARD_AT, US_CLASS_TO_AP, apInfo, type Difficulty } from '../data/apInfo';
import { countriesOf } from '../data/countries';
import type { RiasecType } from '../data/questionnaire';
import type { Profile } from '../store/db';
import { committedHours, riasecFit, stretchCapsFor } from './profile';
import { withArticle, type WhyFactor } from './overlap';

type Area =
  | 'math' | 'further-math' | 'physics' | 'chemistry' | 'biology' | 'economics' | 'business'
  | 'history' | 'geography' | 'psychology' | 'cs' | 'english' | 'language' | 'arts' | 'statistics';

const AREA_RIASEC: Record<Area, RiasecType[]> = {
  math: ['I', 'C'], 'further-math': ['I', 'C'], physics: ['I', 'R'], chemistry: ['I', 'R'],
  biology: ['I', 'S'], economics: ['E', 'I'], business: ['E', 'C'], history: ['A', 'I'],
  geography: ['I', 'R'], psychology: ['S', 'I'], cs: ['I', 'R', 'C'], english: ['A', 'S'],
  language: ['A', 'S'], arts: ['A'], statistics: ['I', 'C'],
};

/** Per major: areas that are core to it, and areas admissions read as a rigor signal. */
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
  US: [
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

/** AP exams an IB / A-Level student can add on top (AP id → subject area). */
const ADDON_AREA: Record<string, Area> = {
  'calc-ab': 'math', 'calc-bc': 'math', stats: 'statistics', 'physics-1': 'physics',
  'physics-c-mech': 'physics', 'physics-c-em': 'physics', chem: 'chemistry', bio: 'biology',
  csa: 'cs', macro: 'economics', micro: 'economics', psych: 'psychology', lang: 'english', apush: 'history',
};

export const ADDON_OPTIONS = AP_INFO.filter((a) => ADDON_AREA[a.id]);

export const LEVELS: Record<Curriculum, CourseLevel[]> = {
  IB: ['HL', 'SL'],
  'A-Level': ['A-Level', 'AS'],
  US: ['AP', 'Honors', 'Standard'],
};

/** Weekly out-of-class study hours by level (illustrative, see /methodology). */
export const LEVEL_HOURS: Record<CourseLevel, number> = {
  HL: 5, SL: 3, 'A-Level': 7, AS: 4, AP: 4, Honors: 3, Standard: 2,
};

/** IB core (TOK, Extended Essay, CAS) is a fixed weekly cost. */
export const IB_CORE_HOURS = 3;

const DOWNGRADE: Partial<Record<CourseLevel, CourseLevel>> = { HL: 'SL', 'A-Level': 'AS', AP: 'Honors', Honors: 'Standard' };
const UPGRADE: Partial<Record<CourseLevel, CourseLevel>> = { SL: 'HL', AS: 'A-Level', Honors: 'AP', Standard: 'Honors' };

export type LoadAction = 'keep' | 'downgrade' | 'upgrade' | 'drop';
export type LoadTag = 'High fit' | 'Keep' | 'Rebalance' | 'Stretch' | 'Add-on' | 'Not this cycle';

export interface LoadPlanItem {
  name: string;
  /** School subject, or an AP exam added on top of IB / A-Level. */
  kind: 'school' | 'addon';
  from: CourseLevel;
  to: CourseLevel;
  action: LoadAction;
  tag: LoadTag;
  role: 'core' | 'rigor' | 'other';
  fit: number;
  /** AP classes and add-ons only. */
  difficulty: Difficulty | null;
  hours: number;
  reason: string;
  factors: WhyFactor[];
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
  countries: TargetCountry[];
  /** AP classes (US) or AP add-ons (IB / A-Level) the plan keeps. */
  apCount: number;
  /** How many APs and why, or null when no APs are in play. */
  apNote: string | null;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatMonths(months: number[]): string {
  if (!months.length) return '';
  const sorted = [...months].sort((a, b) => a - b);
  return sorted.length > 2 ? `${MONTHS[sorted[0] - 1]}-${MONTHS[sorted[sorted.length - 1] - 1]}` : sorted.map((m) => MONTHS[m - 1]).join(' & ');
}

/**
 * Weekly academic ceiling. Training and other fixed commitments come out of the same week,
 * so each committed hour removes ~2/3 of an hour of study capacity; temperament nudges it.
 */
export function ceilingFor(committed: number, loadFactor: number): number {
  const base = Math.min(35, 42 - 0.67 * committed);
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

/**
 * Rigor wording differs by target country. US and UK logic is never blended: each country the
 * student targets gets its own sentence.
 */
function rigorReason(countries: TargetCountry[], major: string): string {
  const parts: string[] = [];
  if (countries.includes('US')) parts.push(`US colleges read your whole course record, and this adds rigor in a subject related to ${major}.`);
  if (countries.includes('UK')) parts.push(`For UK ${major} courses it's a related subject; check each course's published subject requirements.`);
  return parts.length ? parts.join(' ') : `Adds academic rigor in a subject related to ${major}.`;
}

/** Most top-level subjects a programme normally carries (IB: 4 HL, A-Level: 4). */
function maxTopLevel(curriculum: Curriculum): number {
  return curriculum === 'US' ? Infinity : 4;
}

export function buildLoadPlan(intake: SgUsIntake, profile: Profile): LoadPlan {
  const training = intake.isAthlete ? intake.trainingHoursPerWeek : 0;
  // Tuition, jobs and activities come out of the same week as training does.
  const ceiling = ceilingFor(training + committedHours(profile.career), profile.loadFactor);
  const fixedHours = intake.curriculum === 'IB' ? IB_CORE_HOURS : 0;
  const majors = (profile.career.targetMajors.length ? profile.career.targetMajors : intake.targetMajors).filter((m) => m !== 'Undecided');
  const primaryMajor = majors[0] ?? 'your intended major';
  const needs = majors.map((m) => MAJOR_NEEDS[m]).filter(Boolean);
  const countries = countriesOf(intake);
  const caps = stretchCapsFor(profile.ocean);
  const roleOf = (area: Area | null) =>
    area && needs.some((n) => n.core.includes(area)) ? 'core' : area && needs.some((n) => n.rigor.includes(area)) ? 'rigor' : 'other';

  const items: LoadPlanItem[] = intake.courses.map((c: CourseChoice) => {
    const area = areaOf(intake.curriculum, c.name);
    const apId = intake.curriculum === 'US' ? US_CLASS_TO_AP[c.name] : undefined;
    return {
      name: c.name, kind: 'school', from: c.level, to: c.level, action: 'keep', tag: 'Keep',
      role: roleOf(area), fit: area ? riasecFit(profile.riasec, AREA_RIASEC[area]) : 0.5,
      difficulty: apId ? apInfo(apId)?.difficulty ?? null : null,
      hours: LEVEL_HOURS[c.level], reason: '', factors: [],
    };
  });

  if (intake.curriculum !== 'US') {
    for (const id of intake.apAddOns ?? []) {
      const info = apInfo(id);
      const area = ADDON_AREA[id];
      if (!info || !area) continue;
      items.push({
        name: info.name, kind: 'addon', from: 'AP', to: 'AP', action: 'keep', tag: 'Add-on',
        role: roleOf(area), fit: riasecFit(profile.riasec, AREA_RIASEC[area]),
        difficulty: info.difficulty, hours: ADDON_HOURS[info.difficulty], reason: '', factors: [],
      });
    }
  }

  const value = (i: LoadPlanItem) => (i.role === 'core' ? 3 : i.role === 'rigor' ? 2 : 0) + i.fit;
  const hoursOf = (i: LoadPlanItem) => (i.action === 'drop' ? 0 : i.kind === 'addon' ? i.hours : LEVEL_HOURS[i.to]);
  const total = () => fixedHours + items.reduce((s, i) => s + hoursOf(i), 0);
  const currentLoad = total();
  const top = topLevel(intake.curriculum);
  const isAp = (i: LoadPlanItem) => i.action !== 'drop' && (i.kind === 'addon' || i.to === 'AP');
  const hardAps = () => items.filter((i) => isAp(i) && (i.difficulty ?? 0) >= HARD_AT);

  // Why each change was made, recorded when it happens.
  const why = new Map<LoadPlanItem, 'full' | 'mix'>();
  const drop = (a: LoadPlanItem, reason: 'full' | 'mix') => {
    a.action = 'drop';
    a.tag = 'Not this cycle';
    why.set(a, reason);
  };
  const addonsBy = (pred: (i: LoadPlanItem) => boolean) =>
    items.filter((i) => i.kind === 'addon' && i.action !== 'drop' && pred(i)).sort((a, b) => value(a) - value(b));

  // Over the ceiling: optional add-ons unrelated to the major go first...
  for (const a of addonsBy((i) => i.role === 'other')) if (total() > ceiling) drop(a, 'full');

  // ...then the lowest-value school course moves down a level, respecting curriculum minimums...
  while (total() > ceiling) {
    const topCount = items.filter((i) => i.kind === 'school' && i.to === top).length;
    const candidate = items
      .filter((i) => i.kind === 'school' && DOWNGRADE[i.to] && !(i.to === top && topCount <= minTopLevel(intake.curriculum)))
      .sort((a, b) => value(a) - value(b))[0];
    if (!candidate || value(candidate) >= 2) break; // never cut core / rigor subjects automatically
    candidate.to = DOWNGRADE[candidate.to]!;
  }

  // ...then the remaining add-ons, lowest value first.
  for (const a of addonsBy(() => true)) if (total() > ceiling) drop(a, 'full');

  // Keep the number of demanding APs, and of APs overall, inside what this student's
  // temperament can sustain.
  for (const a of addonsBy((i) => (i.difficulty ?? 0) >= HARD_AT)) if (hardAps().length > caps.maxHard) drop(a, 'mix');
  for (const a of addonsBy(() => true)) if (items.filter(isAp).length > caps.maxTotal) drop(a, 'mix');
  if (intake.curriculum === 'US') {
    const heavy = items
      .filter((i) => i.kind === 'school' && i.to === 'AP' && (i.difficulty ?? 0) >= HARD_AT && i.role === 'other')
      .sort((a, b) => value(a) - value(b));
    for (const h of heavy) {
      if (hardAps().length <= caps.maxHard) break;
      h.to = 'Honors';
      why.set(h, 'mix');
    }
  }

  // The drops above go one at a time, so they can overshoot. Bring back the most valuable
  // add-ons dropped for space that now fit under the ceiling and the caps.
  const restorable = items
    .filter((i) => i.kind === 'addon' && i.action === 'drop' && why.get(i) === 'full')
    .sort((a, b) => value(b) - value(a));
  for (const a of restorable) {
    const hard = (a.difficulty ?? 0) >= HARD_AT;
    if (total() + a.hours > ceiling) continue;
    // It fits by hours now, so if it stays out, the reason is the stretch limit, not space.
    if ((hard && hardAps().length >= caps.maxHard) || items.filter(isAp).length >= caps.maxTotal) {
      why.set(a, 'mix');
      continue;
    }
    a.action = 'keep';
    a.tag = 'Add-on';
    why.delete(a);
  }

  // Comfortably under: suggest one stretch on the highest-value school course, without
  // breaking the stretch caps or the programme's usual number of top-level subjects.
  if (ceiling - total() >= 4) {
    const topCount = items.filter((i) => i.kind === 'school' && i.to === top).length;
    const stretch = items
      .filter((i) => {
        if (i.kind !== 'school' || !UPGRADE[i.to] || i.role === 'other') return false;
        const next = UPGRADE[i.to]!;
        if (next === top && topCount >= maxTopLevel(intake.curriculum)) return false;
        if (next === 'AP') {
          if (items.filter(isAp).length >= caps.maxTotal) return false;
          if ((i.difficulty ?? 0) >= HARD_AT && hardAps().length >= caps.maxHard) return false;
        }
        return true;
      })
      .sort((a, b) => value(b) - value(a))[0];
    if (stretch && total() - LEVEL_HOURS[stretch.to] + LEVEL_HOURS[UPGRADE[stretch.to]!] <= ceiling) {
      stretch.to = UPGRADE[stretch.to]!;
    }
  }

  const season = intake.isAthlete ? formatMonths(intake.peakSeasonMonths) : '';
  for (const i of items) {
    i.hours = i.kind === 'addon' ? i.hours : LEVEL_HOURS[i.to];
    // An AP difficulty only applies while the class is actually taken at AP level.
    if (i.kind === 'school' && i.to !== 'AP') i.difficulty = null;
    const fitWord = i.fit >= 0.7 ? 'Strong' : i.fit >= 0.5 ? 'Solid' : 'Weaker';
    if (i.action === 'drop') {
      i.reason = why.get(i) === 'mix'
        ? `Another demanding AP would make the mix too heavy for this cycle. Revisit next year.`
        : `Your week is already full. Skipping this frees ~${i.hours} hrs/week for your school subjects.`;
    } else if (why.get(i) === 'mix') {
      i.action = 'downgrade';
      i.tag = 'Rebalance';
      i.reason = `Keeping this at AP would mean more than ${caps.maxHard} demanding AP${caps.maxHard === 1 ? '' : 's'} at once. Honors keeps the subject with less pressure, and ${primaryMajor} isn't affected.`;
    } else if (i.kind === 'addon') {
      i.reason = i.role === 'core'
        ? `Fits ${primaryMajor} and fits in your week. Self-study it alongside ${intake.curriculum}.`
        : i.role === 'rigor'
          ? `Fits in your week. ${rigorReason(countries, primaryMajor)}`
          : `${fitWord} interest fit and fits in your week, but it isn't central to ${primaryMajor}.`;
    } else if (i.to !== i.from && LEVEL_HOURS[i.to] < LEVEL_HOURS[i.from]) {
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
      i.reason = `Core to ${primaryMajor}. ${fitWord} interest fit. Anchors your application.`;
    } else if (i.role === 'rigor') {
      i.reason = `${rigorReason(countries, primaryMajor)}${season ? ' Front-load it before peak season.' : ''}`;
    } else {
      i.reason = `${fitWord} interest fit. Not central to ${primaryMajor}, so it is the first lever if load gets tight.`;
    }
    i.factors = [
      i.role === 'core'
        ? { label: 'Major', detail: `Core to ${primaryMajor}`, tone: 'plus' }
        : i.role === 'rigor'
          ? { label: 'Major', detail: `Supports ${primaryMajor}`, tone: 'plus' }
          : { label: 'Major', detail: `Not central to ${primaryMajor}`, tone: 'neutral' },
      { label: 'Interests', detail: `${fitWord} match with what you enjoy`, tone: i.fit >= 0.65 ? 'plus' : i.fit >= 0.45 ? 'neutral' : 'minus' },
      { label: 'Workload', detail: i.action === 'drop' ? `Would add ~${i.hours} hrs/week` : `~${i.hours} hrs/week`, tone: i.hours <= 3 ? 'plus' : i.hours <= 5 ? 'neutral' : 'minus' },
      ...(i.difficulty ? [{ label: 'Difficulty', detail: `${DIFFICULTY_LABEL[i.difficulty]} (${i.difficulty}/5)`, tone: i.difficulty >= HARD_AT ? 'minus' : 'neutral' } as WhyFactor] : []),
    ];
  }

  const plannedLoad = total();
  const pct = Math.round((plannedLoad / ceiling) * 100);
  let meterNote = `At ${pct}% of ceiling.`;
  if (currentLoad > ceiling && plannedLoad <= ceiling) meterNote += ` Your current selection (${currentLoad} hrs) was over. The plan below rebalances it and keeps your core subjects.`;
  else if (plannedLoad > ceiling) meterNote += ' Still over after rebalancing, because the remaining courses are all core or rigor. Talk this through with a mentor.';
  else if (ceiling - plannedLoad < LEVEL_HOURS[top] - LEVEL_HOURS[LEVELS[intake.curriculum][1]]) meterNote += ` Adding another ${top} would push you over.`;

  let seasonNote: string | null = null;
  if (intake.isAthlete && season) {
    const heaviest = items.filter((i) => i.role !== 'other' && i.action !== 'drop').sort((a, b) => b.hours - a.hours)[0];
    seasonNote = `Peak season is ${season}. ${heaviest ? `Front-load ${heaviest.name} coursework in the months before, and ` : ''}plan lighter study weeks during competition. Keep internal-assessment deadlines out of those months where you can.`;
  }

  const kept = items.filter(isAp);
  const hard = kept.filter((i) => (i.difficulty ?? 0) >= HARD_AT).length;
  const offered = items.filter((i) => i.kind === 'addon' || i.from === 'AP').length;
  const apNote = !offered
    ? null
    : `${kept.length} AP${kept.length === 1 ? '' : 's'} (${hard} demanding, ${kept.length - hard} manageable) fit under your ${ceiling}-hr ceiling.` +
      (kept.length < offered
        ? intake.curriculum === 'US'
          ? ` ${offered - kept.length} moved to a lighter level.`
          : ` ${offered - kept.length} left for a later cycle.`
        : '') +
      (hard > caps.maxHard
        ? ` That's above your stretch limit of ${caps.maxHard} demanding AP${caps.maxHard === 1 ? '' : 's'}. The rest are core or rigor subjects for ${primaryMajor}, which the planner never cuts on its own, so it's worth checking with a mentor.`
        : caps.why ? ` ${caps.why}` : '');

  return { ceiling, currentLoad, plannedLoad, fixedHours, items, meterNote, seasonNote, primaryMajor, countries, apCount: kept.length, apNote };
}
