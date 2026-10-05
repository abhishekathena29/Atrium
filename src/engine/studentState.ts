import type { IndiaIntake, SgUsIntake, User } from '../auth/types';
import {
  getProfile,
  getProgress,
  saveProfile,
  type CareerLayer,
  type Profile,
  type QuestionnaireProgress,
} from '../store/db';
import { buildIndiaPlan, type IndiaPlan } from './overlap';
import { buildLoadPlan, type LoadPlan } from './courseLoad';
import { buildProfile } from './profile';

/** Order of the first-run flow: light personality questions first, then academics, then the plan. */
export type NextStep = 'questionnaire' | 'intake' | 'plan';

export interface StudentState {
  quizDone: boolean;
  intakeDone: boolean;
  progress: QuestionnaireProgress | null;
  profile: Profile | null;
  indiaPlan: IndiaPlan | null;
  loadPlan: LoadPlan | null;
  next: NextStep;
}

const WEEK = 7 * 864e5;

/** The intake for the student's current track. Never read `india ?? sgus`: a stale one may linger. */
export function intakeOf(user: User): IndiaIntake | SgUsIntake | undefined {
  return user.segment === 'india' ? user.india : user.sgus;
}

/** The AP session (5 May) `yearsAhead` sessions from now; the coming one if it's 4+ weeks away. */
export function mayExamDate(yearsAhead = 0, now = new Date()): Date {
  let may = new Date(now.getFullYear(), 4, 5);
  if (may.getTime() - now.getTime() < 4 * WEEK) may = new Date(now.getFullYear() + 1, 4, 5);
  return new Date(may.getFullYear() + yearsAhead, 4, 5);
}

/** Weeks from today to the first Monday of May (AP exam season). */
export function weeksToNextMay(now = new Date()) {
  return Math.round((mayExamDate(0, now).getTime() - now.getTime()) / WEEK);
}

/**
 * Weeks left until the student's exam session, recomputed every time so countdowns and weekly
 * hours move as the date approaches. Older profiles only stored a week count, so their target
 * date is reconstructed from when it was saved. A session already past rolls to the next May.
 */
export function liveWeeksToExam(career: Partial<CareerLayer>, savedAt?: string, now = new Date()): number {
  let target = career.examDate ? new Date(career.examDate) : null;
  if (!target && career.weeksToExam && savedAt) target = new Date(new Date(savedAt).getTime() + career.weeksToExam * WEEK);
  if (!target || target.getTime() < now.getTime()) return weeksToNextMay(now);
  return Math.max(1, Math.round((target.getTime() - now.getTime()) / WEEK));
}

/** The targets + workload layer, from what onboarding saved, with sensible defaults. */
export function careerFor(user: User, progress: QuestionnaireProgress | null): CareerLayer {
  const intake = intakeOf(user);
  const c = progress?.career ?? {};
  return {
    targetMajors: c.targetMajors ?? intake?.targetMajors ?? [],
    targetColleges: c.targetColleges ?? intake?.targetColleges ?? [],
    currentLoadHours: c.currentLoadHours ?? 0,
    activityHours: c.activityHours ?? 0,
    extraHoursPerWeek: c.extraHoursPerWeek ?? 6,
    weeksToExam: liveWeeksToExam(c, progress?.updatedAt),
    examDate: c.examDate,
  };
}

/** Rebuild and save the profile once both the quiz and the intake are done. */
export function refreshProfile(user: User): Profile | null {
  const progress = getProgress(user.id);
  const intakeDone = user.segment === 'india' ? !!user.india : !!user.sgus;
  if (!progress?.completedAt || !intakeDone) return null;
  const profile = buildProfile(progress.answers, careerFor(user, progress));
  saveProfile(user.id, profile);
  return profile;
}

/** Where a student is in the flow. Both the quiz and the intake gate the engines. */
export function getStudentState(user: User): StudentState {
  const intakeDone = user.segment === 'india' ? !!user.india : !!user.sgus;
  const progress = getProgress(user.id);
  const quizDone = !!progress?.completedAt;
  let profile: Profile | null = null;
  if (quizDone && intakeDone) {
    const saved = getProfile(user.id);
    // A retaken quiz finishes after the saved profile was built: rebuild from the new answers.
    profile = !saved || saved.completedAt < progress!.completedAt! ? refreshProfile(user) : saved;
    if (profile) {
      const weeks = liveWeeksToExam(profile.career, profile.completedAt);
      profile = { ...profile, career: { ...profile.career, weeksToExam: weeks } };
    }
  }
  const indiaPlan = profile && user.segment === 'india' && user.india ? buildIndiaPlan(user.india, profile) : null;
  const loadPlan = profile && user.segment === 'sgus' && user.sgus ? buildLoadPlan(user.sgus, profile) : null;
  const next: NextStep = !quizDone ? 'questionnaire' : !intakeDone ? 'intake' : 'plan';
  return { quizDone, intakeDone, progress, profile, indiaPlan, loadPlan, next };
}

/** Subject names the plan puts in front of a mentor (feeds matching). */
export function planSubjects(state: StudentState): string[] {
  if (state.indiaPlan) return state.indiaPlan.recommended.map((i) => i.course.name);
  if (state.loadPlan) return state.loadPlan.items.filter((i) => i.action !== 'drop').map((i) => i.name);
  return [];
}

/** True when the student's plan involves APs at all (India always; SG/US only with AP classes or add-ons). */
export function planHasAps(state: StudentState): boolean {
  if (state.indiaPlan) return state.indiaPlan.mapped;
  return !!state.loadPlan?.apNote;
}
