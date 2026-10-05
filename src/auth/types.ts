export type UserRole = 'student' | 'parent' | 'mentor';

/** Two market segments, one shared platform (blueprint §1). */
export type Segment = 'india' | 'sgus';

export const SEGMENT_LABEL: Record<Segment, string> = {
  india: 'India',
  sgus: 'Singapore · US track',
};

/**
 * Where a student wants to apply. US and UK admissions read courses differently, so plans and
 * copy branch on this and never mix the two.
 */
export type TargetCountry = 'US' | 'UK' | 'Canada' | 'Other';

export const COUNTRY_LABEL: Record<TargetCountry, string> = {
  US: 'United States',
  UK: 'United Kingdom',
  Canada: 'Canada',
  Other: 'Somewhere else / not sure',
};

/** India intake (board → AP overlap plan). */
export interface IndiaIntake {
  board: 'CBSE' | 'ICSE' | 'State board' | 'Other';
  stream: 'Science (PCM)' | 'Science (PCB)' | 'Science (PCMB)' | 'Commerce' | 'Humanities';
  grade: '9' | '10' | '11' | '12';
  /** CBSE fifth / elective subject — changes which APs overlap. */
  elective: BoardElective;
  targetMajors: string[];
  targetColleges: string[];
  /** Absent on accounts created before target countries were asked; read as ['US']. */
  targetCountries?: TargetCountry[];
}

export type BoardElective =
  | 'Computer Science'
  | 'Informatics Practices'
  | 'Economics'
  | 'Psychology'
  | 'Physical Education'
  | 'Other / none';

/**
 * SG/US base curriculum: the school system the student is enrolled in. AP is not a curriculum
 * here. A US high school offers AP classes inside it, and IB / A-Level students can add AP
 * exams on top (`SgUsIntake.apAddOns`). Stored accounts with the legacy value 'AP' read as 'US'.
 */
export type Curriculum = 'IB' | 'A-Level' | 'US';

export const CURRICULUM_LABEL: Record<Curriculum, string> = {
  IB: 'IB Diploma',
  'A-Level': 'A-Levels',
  US: 'US high school',
};

export type CourseLevel = 'HL' | 'SL' | 'A-Level' | 'AS' | 'AP' | 'Honors' | 'Standard';

export interface CourseChoice {
  name: string;
  level: CourseLevel;
}

/** SG/US intake (course-load plan). Athletes are the flagship cohort, not a separate segment. */
export interface SgUsIntake {
  curriculum: Curriculum;
  grade: '9' | '10' | '11' | '12';
  courses: CourseChoice[];
  targetMajors: string[];
  targetColleges: string[];
  targetCountries?: TargetCountry[];
  /** IB / A-Level students: AP exams they're considering on top of school (ids from data/apInfo). */
  apAddOns?: string[];
  isAthlete: boolean;
  sport: string;
  trainingHoursPerWeek: number;
  /** Months (1-12) the student's competition season peaks. */
  peakSeasonMonths: number[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  segment: Segment;
  /** Student: grade / year. Mentor: university + class year. Parent: relationship. */
  headline: string;
  /** Mentor: subjects offered. Student: legacy free-text subjects. */
  subjects: string[];
  /** Students fill this during onboarding; absent until then. */
  india?: IndiaIntake;
  sgus?: SgUsIntake;
  /** Mentor: true if they are also an athlete mentor (SG/US flagship). */
  athleteMentor?: boolean;
  /** Parent: the student id they are linked to via invite code. */
  linkedStudentId?: string;
  /** Student: the code a parent uses to link. */
  parentInviteCode?: string;
  /** Student: parent/guardian consent recorded for consults (safeguarding, M10a). */
  guardianConsent?: { name: string; email: string; at: string };
  /** Set once the user has seen their role's welcome screen (first-run flow). */
  welcomedAt?: string;
  createdAt: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  segment: Segment;
  headline: string;
  subjects: string[];
  athleteMentor?: boolean;
  parentInviteCode?: string;
}
