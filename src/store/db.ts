/**
 * Prototype data layer: localStorage-backed collections, same caveats as auth.
 * Replace with a real backend before any real minor uses the platform (M10a).
 */

import type { OceanTrait, RiasecType } from '../data/questionnaire';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked — prototype only, fail quietly.
  }
}

export function makeId(prefix: string) {
  return prefix + '_' + Math.random().toString(36).slice(2, 10);
}

/* ------------------------------------------------------------------ */
/* M2 Questionnaire                                                    */
/* ------------------------------------------------------------------ */

export interface CareerLayer {
  targetMajors: string[];
  targetColleges: string[];
  /** Hours per week already committed outside school (coaching, tuition). */
  currentLoadHours: number;
  /** India: hours per week the student can add for AP self-study. */
  extraHoursPerWeek: number;
  /** Weeks until the AP exam session / decision window. */
  weeksToExam: number;
}

export interface QuestionnaireProgress {
  userId: string;
  answers: Record<string, number>;
  career: Partial<CareerLayer>;
  step: number;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Profile {
  ocean: Record<OceanTrait, number>;
  riasec: Record<RiasecType, number>;
  hollandCode: string;
  career: CareerLayer;
  /** Multiplier on recommended net-new load, from Conscientiousness & Neuroticism. */
  loadFactor: number;
  pacingNote: string;
  completedAt: string;
}

const Q_KEY = 'atrium.questionnaire';
const PROFILE_KEY = 'atrium.profiles';

export function getProgress(userId: string): QuestionnaireProgress | null {
  return read<Record<string, QuestionnaireProgress>>(Q_KEY, {})[userId] ?? null;
}

export function saveProgress(progress: QuestionnaireProgress) {
  const all = read<Record<string, QuestionnaireProgress>>(Q_KEY, {});
  all[progress.userId] = { ...progress, updatedAt: new Date().toISOString() };
  write(Q_KEY, all);
}

export function getProfile(userId: string): Profile | null {
  return read<Record<string, Profile>>(PROFILE_KEY, {})[userId] ?? null;
}

export function saveProfile(userId: string, profile: Profile) {
  const all = read<Record<string, Profile>>(PROFILE_KEY, {});
  all[userId] = profile;
  write(PROFILE_KEY, all);
}

/* ------------------------------------------------------------------ */
/* M5 Marketplace — consults                                           */
/* ------------------------------------------------------------------ */

export type ConsultStatus =
  | 'awaiting_parent'
  | 'requested'
  | 'accepted'
  | 'completed'
  | 'declined'
  | 'cancelled';

export interface Consult {
  id: string;
  studentId: string;
  studentName: string;
  /** null = routed to the Atrium team for manual matching (Phase 1). */
  mentorId: string | null;
  mentorName: string | null;
  kind: 'free' | 'paid';
  topic: string;
  preferredTimes: string;
  status: ConsultStatus;
  parentApprovedAt?: string;
  mentorNote?: string;
  createdAt: string;
}

const CONSULT_KEY = 'atrium.consults';

export function listConsults(filter: (c: Consult) => boolean = () => true): Consult[] {
  return read<Consult[]>(CONSULT_KEY, [])
    .filter(filter)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveConsult(consult: Consult) {
  const all = read<Consult[]>(CONSULT_KEY, []);
  const idx = all.findIndex((c) => c.id === consult.id);
  if (idx === -1) all.push(consult);
  else all[idx] = consult;
  write(CONSULT_KEY, all);
}

/* ------------------------------------------------------------------ */
/* M6 Outcome loop                                                     */
/* ------------------------------------------------------------------ */

export interface OutcomeReport {
  id: string;
  studentId: string;
  reporter: 'student' | 'mentor';
  subject: string;
  examSession: string;
  /** Net-new hrs/week the plan predicted, if the subject came from a plan. */
  predictedHoursPerWeek: number | null;
  actualHoursPerWeek: number;
  score: string;
  notes: string;
  /** Explicit consent to use the anonymised result to improve the overlap graph. */
  consentToResearch: boolean;
  createdAt: string;
}

const OUTCOME_KEY = 'atrium.outcomes';

export function listOutcomes(filter: (o: OutcomeReport) => boolean = () => true): OutcomeReport[] {
  return read<OutcomeReport[]>(OUTCOME_KEY, []).filter(filter);
}

export function saveOutcome(outcome: OutcomeReport) {
  write(OUTCOME_KEY, [...read<OutcomeReport[]>(OUTCOME_KEY, []), outcome]);
}

/* ------------------------------------------------------------------ */
/* Mentor vetting (M5 supply + M10a)                                   */
/* ------------------------------------------------------------------ */

export type VettingStage = 'application' | 'subjectScreen' | 'teachingDemo' | 'safeguarding';

export interface MentorApplication {
  mentorId: string;
  university: string;
  results: string;
  motivation: string;
  stages: Record<VettingStage, 'pending' | 'submitted' | 'passed'>;
  codeOfConductAt?: string;
  safeguardingTrainingAt?: string;
}

const MENTOR_APP_KEY = 'atrium.mentorApplications';

export function getMentorApplication(mentorId: string): MentorApplication {
  return (
    read<Record<string, MentorApplication>>(MENTOR_APP_KEY, {})[mentorId] ?? {
      mentorId,
      university: '',
      results: '',
      motivation: '',
      stages: { application: 'pending', subjectScreen: 'pending', teachingDemo: 'pending', safeguarding: 'pending' },
    }
  );
}

export function saveMentorApplication(app: MentorApplication) {
  const all = read<Record<string, MentorApplication>>(MENTOR_APP_KEY, {});
  all[app.mentorId] = app;
  write(MENTOR_APP_KEY, all);
}

export function isVetted(app: MentorApplication): boolean {
  return Object.values(app.stages).every((s) => s === 'passed');
}

/* ------------------------------------------------------------------ */
/* Safeguarding concerns (M10a)                                        */
/* ------------------------------------------------------------------ */

export interface Concern {
  id: string;
  reporterEmail: string;
  about: string;
  details: string;
  createdAt: string;
}

const CONCERN_KEY = 'atrium.concerns';

export function saveConcern(concern: Concern) {
  write(CONCERN_KEY, [...read<Concern[]>(CONCERN_KEY, []), concern]);
}

/* ------------------------------------------------------------------ */
/* Gamification: study log + unit check-offs                           */
/* ------------------------------------------------------------------ */

export interface StudyLog {
  id: string;
  userId: string;
  /** Local calendar day, YYYY-MM-DD. */
  date: string;
  minutes: number;
  subject: string;
  createdAt: string;
}

const STUDY_KEY = 'atrium.studyLogs';
const UNITS_KEY = 'atrium.unitProgress';

export function listStudyLogs(userId: string): StudyLog[] {
  return read<StudyLog[]>(STUDY_KEY, []).filter((l) => l.userId === userId);
}

export function saveStudyLog(log: StudyLog) {
  write(STUDY_KEY, [...read<StudyLog[]>(STUDY_KEY, []), log]);
}

export function deleteStudyLog(id: string) {
  write(STUDY_KEY, read<StudyLog[]>(STUDY_KEY, []).filter((l) => l.id !== id));
}

/** Plan units a student has ticked off, as `courseId::unitName` keys. */
export function getUnitProgress(userId: string): string[] {
  return read<Record<string, string[]>>(UNITS_KEY, {})[userId] ?? [];
}

export function toggleUnit(userId: string, key: string) {
  const all = read<Record<string, string[]>>(UNITS_KEY, {});
  const current = all[userId] ?? [];
  all[userId] = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
  write(UNITS_KEY, all);
}
