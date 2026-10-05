/**
 * Gamification: streaks, XP, levels and awards. Everything is DERIVED from the student's real
 * activity (intake, questionnaire, study log, unit check-offs, consults, outcomes). Nothing is
 * stored as a score, so it can never drift from what actually happened. Rules are published on
 * /methodology.
 */

import { listUsers } from '../auth/AuthContext';
import type { User } from '../auth/types';
import { OCEAN_ITEMS, RIASEC_ITEMS } from '../data/questionnaire';
import {
  getUnitProgress,
  listConsults,
  listOutcomes,
  listStudyLogs,
  type StudyLog,
} from '../store/db';
import { intakeOf, type StudentState } from './studentState';

/** Setup sections, in flow order. Each earns XP once, the moment it's complete. */
export const SETUP_XP = {
  personality: 40,
  interests: 40,
  studies: 25,
  goals: 25,
  week: 20,
  complete: 50,
} as const;

export type SetupSection = keyof typeof SETUP_XP;

export const XP_RULES = [
  { action: 'Personality questions done', xp: SETUP_XP.personality },
  { action: 'Interest questions done', xp: SETUP_XP.interests },
  { action: 'Your studies filled in', xp: SETUP_XP.studies },
  { action: 'Goals set (majors + countries)', xp: SETUP_XP.goals },
  { action: 'Your week filled in', xp: SETUP_XP.week },
  { action: 'Profile 100% complete', xp: SETUP_XP.complete },
  { action: 'Study time logged', xp: 1, per: 'per 3 minutes' },
  { action: 'Plan unit ticked off', xp: 15, per: 'per unit' },
  { action: 'Consult requested', xp: 40, per: 'per consult' },
  { action: 'Consult completed', xp: 100, per: 'per consult' },
  { action: 'Outcome reported', xp: 150, per: 'per report' },
  { action: 'Parent linked', xp: 30 },
  { action: 'Award earned', xp: 25, per: 'per award' },
] as const;

export const LEVELS = [
  { min: 0, name: 'Newcomer' },
  { min: 150, name: 'Explorer' },
  { min: 400, name: 'Planner' },
  { min: 750, name: 'Scholar' },
  { min: 1200, name: 'Strategist' },
  { min: 1800, name: 'Achiever' },
  { min: 2600, name: 'Trailblazer' },
  { min: 3600, name: 'Luminary' },
];

export interface Award {
  id: string;
  title: string;
  description: string;
  icon: string;
  tone: 'amber' | 'emerald' | 'sky' | 'violet' | 'rose' | 'orange';
  earned: boolean;
  /** e.g. "4 / 7 days" while locked. */
  progress?: string;
}

export interface DayCell {
  date: string;
  minutes: number;
  future: boolean;
}

export interface Gamification {
  xp: number;
  level: number;
  levelName: string;
  levelFloor: number;
  nextLevelAt: number | null;
  streak: number;
  longestStreak: number;
  studiedToday: boolean;
  totalMinutes: number;
  weekMinutes: number;
  weeklyGoalMinutes: number;
  awards: Award[];
  /** 12 weeks × 7 days, Monday-first, oldest week first. */
  heatmap: DayCell[][];
}

export interface CompletionItem {
  id: string;
  label: string;
  done: boolean;
  /** Where to go to complete it. */
  to: string;
}

/** Which setup sections are complete, read from what the student actually saved. */
export function setupSections(user: User, state: StudentState): Record<SetupSection, boolean> {
  const answers = state.progress?.answers ?? {};
  const career = state.progress?.career ?? {};
  const intake = intakeOf(user);
  const draft = state.progress?.draft;
  const reached = draft?.segment === user.segment ? draft.reached : 0;
  const personality = OCEAN_ITEMS.every((i) => answers[i.id]);
  const interests = RIASEC_ITEMS.every((i) => answers[i.id]);
  // A section counts once it's saved: in the finished intake, or in the onboarding draft.
  const studies = state.intakeDone || reached >= 2;
  const goals = (!!intake?.targetMajors.length && !!intake?.targetCountries?.length) ||
    (reached >= 4 && !!career.targetMajors?.length && !!draft?.countries.length);
  const week = career.currentLoadHours !== undefined && (user.segment === 'sgus' || career.extraHoursPerWeek !== undefined);
  return { personality, interests, studies, goals, week, complete: personality && interests && studies && goals && week };
}

/**
 * Profile completion checklist (dashboard meter). The % covers the five setup sections only, so
 * 100% means the same thing as the "Profile complete" XP and the Mapmaker award. The optional
 * extras are listed but not counted.
 */
export function profileCompletion(user: User, state: StudentState): { pct: number; items: CompletionItem[] } {
  const s = setupSections(user, state);
  const intake = intakeOf(user);
  const parentLinked = listUsers((u) => u.role === 'parent' && u.linkedStudentId === user.id).length > 0;
  const items: CompletionItem[] = [
    { id: 'personality', label: 'How you work (personality)', done: s.personality, to: '/questionnaire' },
    { id: 'interests', label: 'What you enjoy (interests)', done: s.interests, to: '/questionnaire' },
    { id: 'studies', label: user.segment === 'india' ? 'Board, stream and class' : 'School system and subjects', done: s.studies, to: '/onboarding' },
    { id: 'goals', label: 'Majors and target countries', done: s.goals, to: '/onboarding' },
    { id: 'week', label: 'How busy your week is', done: s.week, to: '/onboarding' },
    { id: 'colleges', label: 'Dream universities (optional)', done: !!intake?.targetColleges.length, to: '/onboarding' },
    { id: 'parent', label: 'Parent linked (optional)', done: parentLinked, to: '/dashboard' },
  ];
  const required = items.filter((i) => !i.label.includes('optional'));
  return { pct: Math.round((required.filter((i) => i.done).length / required.length) * 100), items };
}

export function setupXp(sections: Record<SetupSection, boolean>): number {
  return (Object.keys(SETUP_XP) as SetupSection[]).reduce((sum, k) => sum + (sections[k] ? SETUP_XP[k] : 0), 0);
}

export function fmtMinutes(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function mondayOf(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return addDays(x, -((x.getDay() + 6) % 7));
}

function minutesByDay(logs: StudyLog[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const l of logs) m.set(l.date, (m.get(l.date) ?? 0) + l.minutes);
  return m;
}

/** Current streak counts back from today, or from yesterday if today isn't logged yet. */
function streaks(days: Map<string, number>, today: Date) {
  let cursor = days.has(dayKey(today)) ? today : addDays(today, -1);
  let current = 0;
  while (days.has(dayKey(cursor))) {
    current++;
    cursor = addDays(cursor, -1);
  }
  const sorted = [...days.keys()].sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const k of sorted) {
    run = prev && dayKey(addDays(new Date(prev + 'T00:00:00'), 1)) === k ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = k;
  }
  return { current, longest: Math.max(longest, current) };
}

/** Keys for the units a plan asks the student to work on (India: recommended APs' gap units). */
export function planUnitKeys(state: StudentState): { courseId: string; course: string; units: string[] }[] {
  if (!state.indiaPlan) return [];
  return state.indiaPlan.recommended.map((i) => ({
    courseId: i.course.id,
    course: i.course.name,
    units: [...(i.gapUnits.length ? i.gapUnits : i.course.units).map((u) => u.name), 'Exam format practice'],
  }));
}

export function unitKey(courseId: string, unit: string) {
  return `${courseId}::${unit}`;
}

export function weeklyGoalMinutes(state: StudentState): number {
  if (state.indiaPlan?.mapped && state.indiaPlan.netNewPerWeek > 0) return Math.round(state.indiaPlan.netNewPerWeek * 60);
  if (state.loadPlan) return state.loadPlan.plannedLoad * 60;
  return 180; // default until there's a plan: 3 hrs/week
}

export function computeGamification(user: User, state: StudentState, now = new Date()): Gamification {
  const logs = listStudyLogs(user.id);
  const days = minutesByDay(logs);
  const { current, longest } = streaks(days, now);
  const totalMinutes = logs.reduce((s, l) => s + l.minutes, 0);

  const monday = mondayOf(now);
  let weekMinutes = 0;
  for (let i = 0; i < 7; i++) weekMinutes += days.get(dayKey(addDays(monday, i))) ?? 0;
  const goal = weeklyGoalMinutes(state);

  // Best week ever, for the "goal met" award.
  const weekTotals = new Map<string, number>();
  for (const [k, m] of days) {
    const wk = dayKey(mondayOf(new Date(k + 'T00:00:00')));
    weekTotals.set(wk, (weekTotals.get(wk) ?? 0) + m);
  }
  const bestWeek = Math.max(0, ...weekTotals.values());

  const consults = listConsults((c) => c.studentId === user.id);
  const requested = consults.filter((c) => !['cancelled', 'declined'].includes(c.status)).length;
  const completed = consults.filter((c) => c.status === 'completed').length;
  const outcomes = listOutcomes((o) => o.studentId === user.id && o.reporter === 'student').length;
  const parentLinked = listUsers((u) => u.role === 'parent' && u.linkedStudentId === user.id).length > 0;

  const ticked = new Set(getUnitProgress(user.id));
  const planUnits = planUnitKeys(state);
  const unitsDone = planUnits.reduce((s, c) => s + c.units.filter((u) => ticked.has(unitKey(c.courseId, u))).length, 0);
  const fullCourse = planUnits.some((c) => c.units.every((u) => ticked.has(unitKey(c.courseId, u))));
  const subjectsThisWeek = new Set(
    logs.filter((l) => l.date >= dayKey(monday)).map((l) => l.subject),
  ).size;

  const sections = setupSections(user, state);
  const awards: Award[] = [
    { id: 'know-yourself', title: 'Know yourself', description: 'Answer the personality questions', icon: 'psychology', tone: 'violet', earned: sections.personality },
    { id: 'curious-mind', title: 'Curious mind', description: 'Answer the interest questions', icon: 'explore', tone: 'sky', earned: sections.interests },
    { id: 'first-step', title: 'First step', description: 'Tell us what you study', icon: 'footprint', tone: 'emerald', earned: state.intakeDone },
    { id: 'mapmaker', title: 'Mapmaker', description: 'Complete your whole profile', icon: 'map', tone: 'amber', earned: sections.complete },
    { id: 'first-session', title: 'Warm-up', description: 'Log your first study session', icon: 'timer', tone: 'emerald', earned: logs.length > 0 },
    { id: 'streak-3', title: 'On a roll', description: '3-day study streak', icon: 'local_fire_department', tone: 'orange', earned: longest >= 3, progress: `${Math.min(longest, 3)} / 3 days` },
    { id: 'streak-7', title: 'Week warrior', description: '7-day study streak', icon: 'local_fire_department', tone: 'orange', earned: longest >= 7, progress: `${Math.min(longest, 7)} / 7 days` },
    { id: 'streak-30', title: 'Unstoppable', description: '30-day study streak', icon: 'whatshot', tone: 'rose', earned: longest >= 30, progress: `${Math.min(longest, 30)} / 30 days` },
    { id: 'goal-met', title: 'Goal getter', description: 'Hit your weekly study goal', icon: 'flag', tone: 'emerald', earned: bestWeek >= goal, progress: `${Math.round((Math.min(bestWeek, goal) / goal) * 100)}% best week` },
    { id: 'ten-hours', title: 'Ten-hour club', description: 'Log 10 hours in total', icon: 'hourglass_top', tone: 'amber', earned: totalMinutes >= 600, progress: `${Math.floor(totalMinutes / 60)} / 10 hrs` },
    { id: 'fifty-hours', title: 'Deep work', description: 'Log 50 hours in total', icon: 'military_tech', tone: 'amber', earned: totalMinutes >= 3000, progress: `${Math.floor(totalMinutes / 60)} / 50 hrs` },
    state.indiaPlan
      ? { id: 'gap-closer', title: 'Gap closer', description: 'Tick off every unit for one AP', icon: 'task_alt', tone: 'emerald', earned: fullCourse, progress: `${unitsDone} units done` }
      : { id: 'all-rounder', title: 'All-rounder', description: 'Study 3+ subjects in one week', icon: 'diversity_3', tone: 'emerald', earned: subjectsThisWeek >= 3, progress: `${subjectsThisWeek} / 3 this week` },
    { id: 'second-opinion', title: 'Second opinion', description: 'Request a mentor consult', icon: 'forum', tone: 'sky', earned: requested > 0 },
    { id: 'mentor-met', title: 'Mentored', description: 'Complete a consult', icon: 'handshake', tone: 'violet', earned: completed > 0 },
    { id: 'family', title: 'Family in the loop', description: 'Link a parent account', icon: 'family_restroom', tone: 'sky', earned: parentLinked },
    { id: 'loop-closer', title: 'Loop closer', description: 'Report a real outcome', icon: 'verified', tone: 'rose', earned: outcomes > 0 },
  ];

  const earnedCount = awards.filter((a) => a.earned).length;
  const xp =
    setupXp(sections) +
    Math.floor(totalMinutes / 3) +
    unitsDone * 15 +
    requested * 40 +
    completed * 100 +
    outcomes * 150 +
    (parentLinked ? 30 : 0) +
    earnedCount * 25;

  const levelIdx = LEVELS.reduce((idx, l, i) => (xp >= l.min ? i : idx), 0);

  const heatmap: DayCell[][] = [];
  const start = addDays(monday, -7 * 11);
  for (let w = 0; w < 12; w++) {
    const week: DayCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(start, w * 7 + d);
      week.push({ date: dayKey(date), minutes: days.get(dayKey(date)) ?? 0, future: date > now });
    }
    heatmap.push(week);
  }

  return {
    xp,
    level: levelIdx + 1,
    levelName: LEVELS[levelIdx].name,
    levelFloor: LEVELS[levelIdx].min,
    nextLevelAt: LEVELS[levelIdx + 1]?.min ?? null,
    streak: current,
    longestStreak: longest,
    studiedToday: days.has(dayKey(now)),
    totalMinutes,
    weekMinutes,
    weeklyGoalMinutes: goal,
    awards,
    heatmap,
  };
}
