/**
 * M3 Overlap engine (India): ranks APs by marginal (net-new) study load on top of
 * the board syllabus the student is already sitting — not by raw difficulty.
 * Rule-based over the M8 graph; see /methodology for the formulas in plain language.
 */

import type { IndiaIntake, TargetCountry } from '../auth/types';
import {
  AP_COURSES,
  COVERAGE,
  boardSubjectsFor,
  isMapped,
  type ApCourse,
  type ApUnit,
  type BoardSubject,
} from '../data/overlapGraph';
import { DIFFICULTY_LABEL, HARD_AT, apInfo, type Difficulty } from '../data/apInfo';
import { countriesOf } from '../data/countries';
import type { Profile } from '../store/db';
import { committedHours, riasecFit, stretchCapsFor, workloadFactorFor } from './profile';

export type OverlapBand = 'High overlap' | 'Partial' | 'None';
export type Recommendation = 'recommend' | 'consider' | 'skip';

/** One reason behind a recommendation, shown as a chip in the "why" panel. */
export interface WhyFactor {
  label: string;
  detail: string;
  tone: 'plus' | 'neutral' | 'minus';
}

export interface ApPlanItem {
  course: ApCourse;
  totalHours: number;
  netNewHours: number;
  netNewPerWeek: number;
  coverage: number;
  band: OverlapBand;
  loadLabel: string;
  signal: number;
  difficulty: Difficulty;
  gapUnits: ApUnit[];
  rationale: string;
  recommendation: Recommendation;
  reason: string;
  factors: WhyFactor[];
}

export interface IndiaPlan {
  mapped: boolean;
  boardSubjects: BoardSubject[];
  weeks: number;
  budgetPerWeek: number;
  items: ApPlanItem[];
  recommended: ApPlanItem[];
  netNewPerWeek: number;
  /** Coaching + activities, hrs/week. */
  committedHours: number;
  /** Multiplier the existing workload applied to the budget. */
  workloadFactor: number;
  /** Most demanding APs this student's plan may carry. */
  maxHard: number;
  /** Why this many APs, in one or two sentences. */
  countReason: string;
  /** The hard / manageable balance, in one sentence. */
  mixNote: string;
  countries: TargetCountry[];
}

/** Only one of each group makes sense on one application. */
const EXCLUSIVE: string[][] = [
  ['calc-ab', 'calc-bc'],
  ['physics-1', 'physics-c-mech'],
];

/** APs normally taken only alongside / after another. */
const PREREQ: Record<string, string> = { 'physics-c-em': 'physics-c-mech' };

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
  if (netNewHours <= 60) return 'Low-mod load';
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
  const committed = committedHours(profile.career);
  const workloadFactor = workloadFactorFor(committed);
  const budgetPerWeek = Math.round(profile.career.extraHoursPerWeek * profile.loadFactor * workloadFactor * 10) / 10;
  const caps = stretchCapsFor(profile.ocean);
  const targetMajors = profile.career.targetMajors.length ? profile.career.targetMajors : intake.targetMajors;
  const major = targetMajors.find((m) => m !== 'Undecided');
  const applicant = major ? `${withArticle(major)} applicant` : 'your application';
  const countries = countriesOf(intake);

  const scored: ApPlanItem[] = AP_COURSES.map((course) => {
    const unitHours = course.units.reduce((s, u) => s + u.prepHours, 0);
    const totalHours = unitHours + course.examFormatHours;
    const netNewHours = Math.round(course.units.reduce((s, u) => s + unitNetNew(u, subjects), 0) + course.examFormatHours);
    const coverage = 1 - netNewHours / totalHours;
    const band = bandFor(coverage);
    const gapUnits = course.units.filter((u) => unitNetNew(u, subjects) / u.prepHours > 0.5);
    const majorFit = majorSignal(course, targetMajors);
    const interestFit = riasecFit(profile.riasec, course.riasec);
    const signal = 0.65 * majorFit + 0.35 * interestFit;
    const difficulty = apInfo(course.id)?.difficulty ?? 3;
    const netNewPerWeek = Math.round((netNewHours / weeks) * 10) / 10;
    return {
      course,
      totalHours,
      netNewHours,
      netNewPerWeek,
      coverage,
      band,
      loadLabel: loadLabelFor(netNewHours),
      signal,
      difficulty,
      gapUnits,
      rationale: rationaleFor(course, subjects, band, gapUnits),
      recommendation: 'consider' as Recommendation,
      reason: '',
      factors: [
        majorFit >= 1
          ? { label: 'Major', detail: `Relevant to ${major}`, tone: 'plus' as const }
          : majorFit >= 0.5
            ? { label: 'Major', detail: 'No major picked yet, so this is judged on cost and interests', tone: 'neutral' as const }
            : { label: 'Major', detail: `Not central to ${major}`, tone: 'minus' as const },
        {
          label: 'Your syllabus',
          detail: `~${Math.round(coverage * 100)}% already on your ${intake.board} syllabus`,
          tone: band === 'High overlap' ? ('plus' as const) : band === 'Partial' ? ('neutral' as const) : ('minus' as const),
        },
        {
          label: 'Interests',
          detail: interestFit >= 0.65 ? 'Matches what you said you enjoy' : interestFit >= 0.45 ? 'Neutral match with your interests' : 'Weaker match with your interests',
          tone: interestFit >= 0.65 ? ('plus' as const) : interestFit >= 0.45 ? ('neutral' as const) : ('minus' as const),
        },
        {
          label: 'Difficulty',
          detail: `${DIFFICULTY_LABEL[difficulty]} (${difficulty}/5)`,
          tone: difficulty >= HARD_AT ? ('minus' as const) : difficulty <= 2 ? ('plus' as const) : ('neutral' as const),
        },
        {
          label: 'Workload',
          detail: `~${netNewPerWeek} of your ${budgetPerWeek} hrs/week`,
          tone: netNewPerWeek <= budgetPerWeek / 2 ? ('plus' as const) : netNewPerWeek <= budgetPerWeek ? ('neutral' as const) : ('minus' as const),
        },
      ],
    };
  }).sort((a, b) => a.netNewHours - b.netNewHours);

  // Greedy: cheapest first, while it carries signal, fits the weekly budget, and keeps the
  // hard/manageable mix inside what this student's temperament can sustain.
  let used = 0;
  let hard = 0;
  const picked = new Set<string>();
  for (const item of scored) {
    const rival = EXCLUSIVE.find((g) => g.includes(item.course.id))?.find((id) => id !== item.course.id && picked.has(id));
    const isHard = item.difficulty >= HARD_AT;
    if (item.signal < 0.4) {
      item.recommendation = 'skip';
      item.reason = item.band === 'None' ? `Poor cost-to-signal for ${applicant}.` : `Low signal for ${applicant}.`;
    } else if (PREREQ[item.course.id] && !picked.has(PREREQ[item.course.id])) {
      item.reason = `Usually taken after ${AP_COURSES.find((c) => c.id === PREREQ[item.course.id])!.name}.`;
    } else if (item.band === 'None') {
      // The free planner never auto-picks an AP that is almost entirely new content.
      item.reason = `Mostly new content (~${item.netNewHours} hrs). Consider it only if it's central to your major.`;
    } else if (rival) {
      item.reason = `Alternative to ${AP_COURSES.find((c) => c.id === rival)!.name}; take one, not both.`;
    } else if (picked.size >= caps.maxTotal) {
      item.reason = `Worth it later, but ${caps.maxTotal} is enough for one cycle.`;
    } else if (used + item.netNewPerWeek > budgetPerWeek) {
      item.reason = 'Good signal, but it would push you past your weekly budget this cycle.';
    } else if (isHard && hard >= caps.maxHard) {
      item.reason = `You already have ${caps.maxHard === 1 ? 'one demanding AP' : `${caps.maxHard} demanding APs`}. Adding another makes the mix too heavy.`;
    } else {
      item.recommendation = 'recommend';
      used += item.netNewPerWeek;
      if (isHard) hard++;
      picked.add(item.course.id);
    }
  }

  const order: Record<Recommendation, number> = { recommend: 0, consider: 1, skip: 2 };
  const items = [...scored].sort((a, b) => order[a.recommendation] - order[b.recommendation] || a.netNewHours - b.netNewHours);
  const recommended = items.filter((i) => i.recommendation === 'recommend');
  for (const r of recommended) {
    r.reason = r.difficulty >= HARD_AT ? 'Your stretch AP: worth the extra effort for your profile.' : 'A manageable pick that adds signal for little extra time.';
  }

  const n = recommended.length;
  const hardCount = recommended.filter((r) => r.difficulty >= HARD_AT).length;
  const countReason = !mapped
    ? ''
    : n === 0
      ? `No AP fits inside your ${budgetPerWeek} hrs/week budget with enough relevance to ${applicant}. A mentor can help you weigh a stretch option.`
      : [
          `${n} AP${n === 1 ? '' : 's'} because ${n === 1 ? 'it fits' : 'they fit'} inside your ${budgetPerWeek} hrs/week budget (${Math.round(used * 10) / 10} hrs used).`,
          workloadFactor < 1 ? `Your ${committed} hrs/week of coaching and activities trimmed the budget by ${Math.round((1 - workloadFactor) * 100)}%.` : null,
          caps.why,
        ].filter(Boolean).join(' ');
  const mixNote = n === 0
    ? ''
    : hardCount === 0
      ? 'All manageable picks. Low risk to your board results.'
      : n === hardCount
        ? `${hardCount === 1 ? 'One demanding AP' : `${hardCount} demanding APs`} and nothing lighter. They fit your budget because your board already covers most of the content.`
        : `${hardCount} demanding and ${n - hardCount} manageable: ${hardCount === 1 ? 'one stretch' : 'two stretches'}, balanced by lighter picks.`;

  return {
    mapped,
    boardSubjects: subjects,
    weeks,
    budgetPerWeek,
    items,
    recommended,
    netNewPerWeek: Math.round(used * 10) / 10,
    committedHours: committed,
    workloadFactor,
    maxHard: caps.maxHard,
    countReason,
    mixNote,
    countries,
  };
}
