/**
 * M5 matching: questionnaire + plan driven, not subject-only. Only mentors who have passed
 * every vetting stage (incl. safeguarding, M10a) are ever matched with a student.
 */

import { listUsers } from '../auth/AuthContext';
import type { User } from '../auth/types';
import { getMentorApplication, isVetted } from '../store/db';

export interface MentorMatch {
  mentor: User;
  score: number;
  reasons: string[];
}

function normalise(s: string) {
  return s.toLowerCase().replace(/^ap\s+/, '').replace(/[^a-z0-9 ]/g, ' ').trim();
}

function subjectHit(mentorSubject: string, planSubject: string) {
  const a = normalise(mentorSubject);
  const b = normalise(planSubject);
  return a.length > 2 && (a.includes(b) || b.includes(a));
}

export function matchMentors(student: User, planSubjects: string[]): MentorMatch[] {
  const athlete = !!student.sgus?.isAthlete;
  return listUsers((u) => u.role === 'mentor' && u.segment === student.segment && isVetted(getMentorApplication(u.id)))
    .map((mentor) => {
      const hits = planSubjects.filter((p) => mentor.subjects.some((m) => subjectHit(m, p)));
      const reasons: string[] = [];
      let score = hits.length * 2;
      if (hits.length) reasons.push(`Covers ${hits.slice(0, 3).join(', ')}`);
      if (athlete && mentor.athleteMentor) {
        score += 3;
        reasons.push('Athlete-mentor: has balanced training with coursework');
      }
      return { mentor, score, reasons };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);
}
