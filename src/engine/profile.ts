/**
 * M2 output: turns questionnaire answers into one combined profile that drives both
 * engines (M3 India, M4 SG/US) and the mentor-match signal.
 */

import {
  OCEAN_ITEMS,
  RIASEC_ITEMS,
  RIASEC_LABEL,
  type OceanTrait,
  type RiasecType,
} from '../data/questionnaire';
import type { CareerLayer, Profile } from '../store/db';

export const TOTAL_ITEMS = OCEAN_ITEMS.length + RIASEC_ITEMS.length;

function mean(values: number[]) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 3;
}

export function scoreOcean(answers: Record<string, number>): Record<OceanTrait, number> {
  const out = {} as Record<OceanTrait, number>;
  for (const trait of ['O', 'C', 'E', 'A', 'N'] as OceanTrait[]) {
    const vals = OCEAN_ITEMS.filter((i) => i.trait === trait && answers[i.id])
      .map((i) => (i.reverse ? 6 - answers[i.id] : answers[i.id]));
    out[trait] = Math.round(mean(vals) * 10) / 10;
  }
  return out;
}

export function scoreRiasec(answers: Record<string, number>): Record<RiasecType, number> {
  const out = {} as Record<RiasecType, number>;
  for (const type of ['R', 'I', 'A', 'S', 'E', 'C'] as RiasecType[]) {
    const vals = RIASEC_ITEMS.filter((i) => i.type === type && answers[i.id]).map((i) => answers[i.id]);
    out[type] = Math.round(mean(vals) * 10) / 10;
  }
  return out;
}

export function hollandCode(riasec: Record<RiasecType, number>): string {
  return (Object.keys(riasec) as RiasecType[])
    .sort((a, b) => riasec[b] - riasec[a])
    .slice(0, 3)
    .join('');
}

export function describeHolland(code: string): string {
  return code
    .split('')
    .map((c) => RIASEC_LABEL[c as RiasecType])
    .join(' / ');
}

/**
 * Conscientiousness raises and Neuroticism lowers how much net-new load we recommend
 * (blueprint §5.1). Bounded so temperament nudges the plan and never dominates it.
 */
export function loadFactorFor(ocean: Record<OceanTrait, number>): number {
  const raw = 1 + 0.08 * (ocean.C - 3) - 0.06 * (ocean.N - 3);
  return Math.round(Math.min(1.15, Math.max(0.8, raw)) * 100) / 100;
}

export function pacingNoteFor(ocean: Record<OceanTrait, number>): string {
  if (ocean.N >= 3.5 && ocean.C < 3) return 'Keep the load light and steady, with short scheduled blocks and frequent check-ins. Avoid last-month cramming.';
  if (ocean.N >= 3.5) return 'Spread prep evenly across the weeks rather than cramming near the exam. Steady beats intense for you.';
  if (ocean.C < 3) return 'Short, fixed weekly study blocks with a mentor check-in work better than a long self-directed plan.';
  if (ocean.C >= 4) return 'You can sustain a structured self-study plan. Front-load the gap units early.';
  return 'A steady weekly rhythm with one review checkpoint per month.';
}

/** Selected Holland-type fit (0–1) for a set of target types. */
export function riasecFit(riasec: Record<RiasecType, number>, types: RiasecType[]): number {
  if (!types.length) return 0.5;
  return mean(types.map((t) => (riasec[t] - 1) / 4));
}

export function buildProfile(answers: Record<string, number>, career: CareerLayer): Profile {
  const ocean = scoreOcean(answers);
  const riasec = scoreRiasec(answers);
  return {
    ocean,
    riasec,
    hollandCode: hollandCode(riasec),
    career,
    loadFactor: loadFactorFor(ocean),
    pacingNote: pacingNoteFor(ocean),
    completedAt: new Date().toISOString(),
  };
}
