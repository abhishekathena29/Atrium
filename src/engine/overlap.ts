/**
 * M3 Overlap engine (India): ranks APs by marginal (net-new) study load on top of
 * the board syllabus the student is already sitting — not by raw difficulty.
 * Rule-based over the M8 graph; see /methodology for the formulas in plain language.
 */

import type { IndiaIntake } from '../auth/types';
import {
  AP_COURSES,
  COVERAGE,
  boardSubjectsFor,
  isMapped,
  type ApCourse,
  type ApUnit,
  type BoardSubject,
} from '../data/overlapGraph';
import type { Profile } from '../store/db';
import { riasecFit } from './profile';

export type OverlapBand = 'High overlap' | 'Partial' | 'None';
export type Recommendation = 'recommend' | 'consider' | 'skip';

export interface ApPlanItem {
  course: ApCourse;
  totalHours: number;
  netNewHours: number;
  netNewPerWeek: number;
  coverage: number;
  band: OverlapBand;
  loadLabel: string;
  signal: number;
  gapUnits: ApUnit[];
  rationale: string;
  recommendation: Recommendation;
  reason: string;
}

export interface IndiaPlan {
  mapped: boolean;
  boardSubjects: BoardSubject[];
  weeks: number;
  budgetPerWeek: number;
  items: ApPlanItem[];
  recommended: ApPlanItem[];
  netNewPerWeek: number;
}

/** Only one of each group makes sense on one application. */
const EXCLUSIVE: string[][] = [
  ['calc-ab', 'calc-bc'],
  ['physics-1', 'physics-c-mech'],
];

/** APs normally taken only alongside / after another. */
const PREREQ: Record<string, string> = { 'physics-c-em': 'physics-c-mech' };

const MAX_RECOMMENDED = 4;

export function withArticle(word: string) {
  return (/^[aeiou]/i.test(word) ? 'an ' : 'a ') + word;
}

function unitNetNew(unit: ApUnit, subjects: BoardSubject[]): number {
  const covered = unit.board && subjects.includes(unit.board) ? COVERAGE[unit.overlap] : 0;
  return unit.prepHours * (1 - covered);
}

function bandFor(coverage: number): OverlapBand {
  if (coverage >= 0.55) return 'High overlap';
  if (coverage >= 0.25) return 'Partial';
  return 'None';
}

export function loadLabelFor(netNewHours: number): string {
  if (netNewHours <= 45) return 'Low load';
  if (netNewHours <= 60) return 'Low–mod load';
  if (netNewHours <= 80) return 'Moderate load';
  if (netNewHours <= 110) return 'High load';
  return 'Very high load';
}

function majorSignal(course: ApCourse, targetMajors: string[]): number {
  const real = targetMajors.filter((m) => m !== 'Undecided');
  if (!real.length) return 0.5;
  return real.some((m) => course.majors.includes(m)) ? 1 : 0.15;
}

function rationaleFor(course: ApCourse, subjects: BoardSubject[], band: OverlapBand, gaps: ApUnit[]): string {
  const boards = [...new Set(course.units.map((u) => u.board).filter((b): b is BoardSubject => !!b && subjects.includes(b)))];
  const boardText = boards.length ? `board ${boards.join(' & ').toLowerCase()}` : 'your board subjects';
  if (band === 'High overlap') {
    return gaps.length
      ? `Large overlap with ${boardText}. Depth gap in ${gaps.length === 1 ? 'one unit' : `${gaps.length} units`} plus exam format.`
      : `Sits on ${boardText}. Mostly revision plus exam format.`;
  }
  if (band === 'Partial') {
    const names = gaps.slice(0, 2).map((g) => g.name.toLowerCase()).join('; ');
    return `Partly covered by ${boardText}. Gaps to close: ${names}${gaps.length > 2 ? '…' : ''}.`;
  }
  return 'Fully new content: none of it is on your board syllabus.';
}

export function buildIndiaPlan(intake: IndiaIntake, profile: Profile): IndiaPlan {
  const mapped = isMapped(intake);
  const subjects = boardSubjectsFor(intake);
  const weeks = Math.max(4, profile.career.weeksToExam || 20);
  const budgetPerWeek = Math.round(profile.career.extraHoursPerWeek * profile.loadFactor * 10) / 10;
  const targetMajors = profile.career.targetMajors.length ? profile.career.targetMajors : intake.targetMajors;
  const major = targetMajors.find((m) => m !== 'Undecided');
  const applicant = major ? `${withArticle(major)} applicant` : 'your application';

  const scored = AP_COURSES.map((course) => {
    const unitHours = course.units.reduce((s, u) => s + u.prepHours, 0);
    const totalHours = unitHours + course.examFormatHours;
    const netNewHours = Math.round(course.units.reduce((s, u) => s + unitNetNew(u, subjects), 0) + course.examFormatHours);
    const coverage = 1 - netNewHours / totalHours;
    const band = bandFor(coverage);
    const gapUnits = course.units.filter((u) => unitNetNew(u, subjects) / u.prepHours > 0.5);
    const signal = 0.65 * majorSignal(course, targetMajors) + 0.35 * riasecFit(profile.riasec, course.riasec);
    return {
      course,
      totalHours,
      netNewHours,
      netNewPerWeek: Math.round((netNewHours / weeks) * 10) / 10,
      coverage,
      band,
      loadLabel: loadLabelFor(netNewHours),
      signal,
      gapUnits,
      rationale: rationaleFor(course, subjects, band, gapUnits),
      recommendation: 'consider' as Recommendation,
      reason: '',
    };
  }).sort((a, b) => a.netNewHours - b.netNewHours);

  // Greedy: cheapest first, while it carries signal and fits the weekly budget.
  let used = 0;
  const picked = new Set<string>();
  for (const item of scored) {
    const rival = EXCLUSIVE.find((g) => g.includes(item.course.id))?.find((id) => id !== item.course.id && picked.has(id));
    if (item.signal < 0.4) {
      item.recommendation = 'skip';
      item.reason = item.band === 'None' ? `Poor cost-to-signal for ${applicant}.` : `Low signal for ${applicant}.`;
    } else if (PREREQ[item.course.id] && !picked.has(PREREQ[item.course.id])) {
      item.reason = `Usually taken after ${AP_COURSES.find((c) => c.id === PREREQ[item.course.id])!.name}.`;
    } else if (item.band === 'None') {
      // "Nearly free" plans never auto-pick an AP that is almost entirely new content.
      item.reason = `Mostly new content (~${item.netNewHours} hrs). Consider it only if it's central to your major.`;
    } else if (rival) {
      item.reason = `Alternative to ${AP_COURSES.find((c) => c.id === rival)!.name}; take one, not both.`;
    } else if (picked.size < MAX_RECOMMENDED && used + item.netNewPerWeek <= budgetPerWeek) {
      item.recommendation = 'recommend';
      used += item.netNewPerWeek;
      picked.add(item.course.id);
    } else {
      item.reason = picked.size >= MAX_RECOMMENDED ? 'Worth it later, but four is enough for one cycle.' : 'Good signal, but it would push you past your weekly budget this cycle.';
    }
  }

  const order: Record<Recommendation, number> = { recommend: 0, consider: 1, skip: 2 };
  const items = [...scored].sort((a, b) => order[a.recommendation] - order[b.recommendation] || a.netNewHours - b.netNewHours);
  const recommended = items.filter((i) => i.recommendation === 'recommend');

  return {
    mapped,
    boardSubjects: subjects,
    weeks,
    budgetPerWeek,
    items,
    recommended,
    netNewPerWeek: Math.round(used * 10) / 10,
  };
}
