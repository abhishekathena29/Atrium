import type { User } from '../auth/types';
import { getProfile, getProgress, type Profile, type QuestionnaireProgress } from '../store/db';
import { buildIndiaPlan, type IndiaPlan } from './overlap';
import { buildLoadPlan, type LoadPlan } from './courseLoad';

export type NextStep = 'intake' | 'questionnaire' | 'plan';

export interface StudentState {
  intakeDone: boolean;
  progress: QuestionnaireProgress | null;
  profile: Profile | null;
  indiaPlan: IndiaPlan | null;
  loadPlan: LoadPlan | null;
  next: NextStep;
}

/** Where a student is in the flow. M2 (questionnaire) gates both engines. */
export function getStudentState(user: User): StudentState {
  const intakeDone = user.segment === 'india' ? !!user.india : !!user.sgus;
  const progress = getProgress(user.id);
  const profile = progress?.completedAt ? getProfile(user.id) : null;
  const indiaPlan = profile && user.segment === 'india' && user.india ? buildIndiaPlan(user.india, profile) : null;
  const loadPlan = profile && user.segment === 'sgus' && user.sgus ? buildLoadPlan(user.sgus, profile) : null;
  const next: NextStep = !intakeDone ? 'intake' : !profile ? 'questionnaire' : 'plan';
  return { intakeDone, progress, profile, indiaPlan, loadPlan, next };
}

/** Subject names the plan puts in front of a mentor (feeds matching). */
export function planSubjects(state: StudentState): string[] {
  if (state.indiaPlan) return state.indiaPlan.recommended.map((i) => i.course.name);
  if (state.loadPlan) return state.loadPlan.items.map((i) => i.name);
  return [];
}
