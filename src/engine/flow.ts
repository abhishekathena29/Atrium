/**
 * First-run flow: where a user should land after signing up or signing in.
 * Students: welcome → about you (onboarding) → questionnaire → plan reveal → dashboard.
 * Mentors: welcome → application. Parents: welcome → dashboard.
 */

import type { User } from '../auth/types';
import { getMentorApplication } from '../store/db';
import { getStudentState } from './studentState';

export function nextPathFor(user: User): string {
  if (user.role === 'student') {
    const s = getStudentState(user);
    if (!user.welcomedAt && !s.intakeDone) return '/welcome';
    if (!s.intakeDone) return '/onboarding';
    if (!s.profile) return '/questionnaire';
    return '/dashboard';
  }
  if (!user.welcomedAt) return '/welcome';
  if (user.role === 'mentor' && getMentorApplication(user.id).stages.application === 'pending') return '/mentor/application';
  return '/dashboard';
}

/** Steps shown in the focused first-run header for students. */
export const STUDENT_STEPS = ['Welcome', 'About you', 'Questionnaire', 'Your plan'];
