/**
 * Fictional sample students for the segment landing pages. Their plans are computed live by
 * the real engines, so the preview can never drift from what a signed-up student sees.
 * Always rendered with a "Sample · fictional student" label.
 */

import type { User } from '../auth/types';
import type { Profile } from '../store/db';

const now = '2026-09-01T00:00:00.000Z';

export const SAMPLE_INDIA_USER: User = {
  id: 'sample-india',
  name: 'Aarav (sample)',
  email: '',
  role: 'student',
  segment: 'india',
  headline: 'Class 11 · CBSE Science (PCM)',
  subjects: [],
  india: {
    board: 'CBSE',
    stream: 'Science (PCM)',
    grade: '11',
    elective: 'Computer Science',
    targetMajors: ['Computer Science', 'Engineering'],
    targetColleges: [],
  },
  createdAt: now,
};

export const SAMPLE_INDIA_PROFILE: Profile = {
  ocean: { O: 3.8, C: 3.5, E: 3.0, A: 3.5, N: 2.8 },
  riasec: { R: 3.7, I: 4.5, A: 2.3, S: 2.7, E: 2.7, C: 3.3 },
  hollandCode: 'IRC',
  career: { targetMajors: ['Computer Science', 'Engineering'], targetColleges: [], currentLoadHours: 6, extraHoursPerWeek: 6, weeksToExam: 30 },
  loadFactor: 1.05,
  pacingNote: '',
  completedAt: now,
};

export const SAMPLE_ATHLETE_USER: User = {
  id: 'sample-athlete',
  name: 'Mei (sample)',
  email: '',
  role: 'student',
  segment: 'sgus',
  headline: 'Grade 11 · IB · athlete',
  subjects: [],
  sgus: {
    curriculum: 'IB',
    grade: '11',
    courses: [
      { name: 'Economics', level: 'HL' },
      { name: 'Mathematics AA', level: 'HL' },
      { name: 'History', level: 'HL' },
      { name: 'Chemistry', level: 'HL' },
      { name: 'English A: Literature', level: 'SL' },
      { name: 'Language B', level: 'SL' },
    ],
    targetMajors: ['Economics'],
    targetColleges: [],
    isAthlete: true,
    sport: 'National swimmer',
    trainingHoursPerWeek: 18,
    peakSeasonMonths: [3, 4, 5],
  },
  createdAt: now,
};

export const SAMPLE_ATHLETE_PROFILE: Profile = {
  ocean: { O: 3.5, C: 4.0, E: 3.3, A: 3.3, N: 2.5 },
  riasec: { R: 3.0, I: 4.0, A: 2.0, S: 3.0, E: 4.3, C: 3.3 },
  hollandCode: 'EIC',
  career: { targetMajors: ['Economics'], targetColleges: [], currentLoadHours: 0, extraHoursPerWeek: 0, weeksToExam: 20 },
  loadFactor: 0.95,
  pacingNote: '',
  completedAt: now,
};
