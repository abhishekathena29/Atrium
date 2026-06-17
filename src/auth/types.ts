export type UserRole = 'student' | 'mentor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Student: current grade / year. Mentor: university + class year. */
  headline: string;
  /** Subjects a student wants help with, or a mentor offers. */
  subjects: string[];
  createdAt: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  headline: string;
  subjects: string[];
}
