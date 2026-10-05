/**
 * M9 AI layer: the compact, JSON-serialisable picture of one student that both AI layers read.
 *
 * It carries the rule-based engine's own output (verdicts, reasons, hours, overlap) and a fixed
 * candidate list, so the AI refines a grounded plan instead of inventing one. The server only
 * accepts recommendations whose `courseId` is in `candidates`.
 *
 * No names, emails or contact details go in here: the AI never needs them.
 */

import type { User } from '../auth/types';
import { CURRICULUM_LABEL } from '../auth/types';
import { AP_INFO, DIFFICULTY_LABEL, HARD_AT, US_CLASS_TO_AP, apInfo, type Difficulty } from '../data/apInfo';
import { countriesOf } from '../data/countries';
import { OCEAN_LABEL, RIASEC_LABEL, type OceanTrait, type RiasecType } from '../data/questionnaire';
import { boardSubjectsFor } from '../data/overlapGraph';
import type { WhyFactor } from './overlap';
import { describeHolland, stretchCapsFor } from './profile';
import { formatMonths } from './courseLoad';
import { intakeOf, type StudentState } from './studentState';

export const AI_CONTEXT_VERSION = 1;

export interface AiCandidate {
  /** AP id from data/apInfo, or `school:<subject>` for an SG/US school subject. */
  id: string;
  name: string;
  /** 'ap' = an AP the student could add; 'school' = a subject in their school timetable. */
  kind: 'ap' | 'school';
  difficulty: Difficulty | null;
  difficultyLabel: string | null;
  /** Plain-language explainer for APs. */
  plain: string | null;
  /** Current school level (SG/US school subjects), e.g. HL, A-Level, AP. */
  level: string | null;
  /** What the rule-based engine decided, or null when the engine didn't evaluate this course. */
  engine: {
    verdict: string;
    reason: string;
    factors: string[];
    hoursPerWeek: number | null;
    /** India: share of the AP already on the board syllabus, 0-100. */
    overlapPct: number | null;
    overlapBand: string | null;
    /** India: units the board doesn't cover well. */
    gapUnits: string[];
  } | null;
}

export interface AiContext {
  v: number;
  segment: 'india' | 'sgus';
  /** False until the questionnaire and the academic intake are both done. */
  setupDone: boolean;
  grade: string | null;
  curriculum: {
    base: string | null;
    /** India: stream and elective. SG/US: null. */
    stream: string | null;
    elective: string | null;
    /** India: board subjects the student sits. SG/US: school subjects with level. */
    subjects: string[];
    /** SG/US IB / A-Level: AP exams the student is considering on top. */
    apAddOns: string[];
  };
  goals: {
    majors: string[];
    colleges: string[];
    countries: string[];
  };
  personality: {
    traits: string[];
    hollandCode: string;
    interests: string;
    /** Multiplier the engine applies to recommended load (0.8-1.15). */
    loadFactor: number;
    pacingNote: string;
    maxDemandingAps: number;
    maxTotalAps: number;
    capReason: string | null;
  } | null;
  workload: {
    coachingHoursPerWeek: number;
    activityHoursPerWeek: number;
    trainingHoursPerWeek: number;
    sport: string | null;
    peakSeason: string | null;
    /** India: hours/week the student said they can add for AP self-study. */
    extraHoursPerWeek: number | null;
    weeksToExam: number | null;
    /** India: the weekly AP budget after workload and temperament. SG/US: null. */
    budgetPerWeek: number | null;
    /** SG/US: weekly academic ceiling, current and planned load. */
    ceiling: number | null;
    currentLoad: number | null;
    plannedLoad: number | null;
  } | null;
  engine: {
    kind: 'india-overlap' | 'sgus-load';
    recommendedCount: number;
    countReason: string;
    mixNote: string;
    notes: string[];
  } | null;
  candidates: AiCandidate[];
}

/** Free-text fields are clipped to the server's limits so a long entry can't break a request. */
function clipText(s: string, n: number): string {
  const t = s.trim();
  return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t;
}

function clipList(list: readonly string[], items: number, n: number): string[] {
  return list.map((s) => clipText(s, n)).filter(Boolean).slice(0, items);
}

function diffLabel(d: Difficulty | null): string | null {
  return d ? `${DIFFICULTY_LABEL[d]} (${d}/5)` : null;
}

function factorText(f: WhyFactor[]): string[] {
  return f.map((x) => `${x.label}: ${x.detail}`);
}

function level(score: number): string {
  return score >= 3.8 ? 'high' : score <= 2.4 ? 'low' : 'medium';
}

const TRAIT_NAME: Record<OceanTrait, string> = {
  ...OCEAN_LABEL,
  // Framed kindly for students; the engine reads it as how much pressure gets to them.
  N: 'Stress sensitivity',
};

function apCandidate(id: string, engine: AiCandidate['engine'] = null): AiCandidate | null {
  const info = apInfo(id);
  if (!info) return null;
  return {
    id,
    name: info.name,
    kind: 'ap',
    difficulty: info.difficulty,
    difficultyLabel: diffLabel(info.difficulty),
    plain: info.plain,
    level: null,
    engine,
  };
}

export function buildAiContext(user: User, state: StudentState): AiContext {
  const intake = intakeOf(user);
  const profile = state.profile;
  const career = profile?.career;
  const caps = profile ? stretchCapsFor(profile.ocean) : null;

  const personality: AiContext['personality'] = profile && caps
    ? {
        traits: (Object.keys(profile.ocean) as OceanTrait[]).map(
          (t) => `${TRAIT_NAME[t]} ${profile.ocean[t]}/5 (${level(profile.ocean[t])})`,
        ),
        hollandCode: profile.hollandCode,
        interests: describeHolland(profile.hollandCode) +
          ' · scores ' + (Object.keys(profile.riasec) as RiasecType[]).map((r) => `${RIASEC_LABEL[r]} ${profile.riasec[r]}`).join(', '),
        loadFactor: profile.loadFactor,
        pacingNote: profile.pacingNote,
        maxDemandingAps: caps.maxHard,
        maxTotalAps: caps.maxTotal,
        capReason: caps.why,
      }
    : null;

  const candidates: AiCandidate[] = [];
  let curriculum: AiContext['curriculum'];
  let workload: AiContext['workload'] = null;
  let engine: AiContext['engine'] = null;

  if (user.segment === 'india') {
    const india = user.india;
    curriculum = {
      base: india?.board ?? null,
      stream: india?.stream ?? null,
      elective: india?.elective ?? null,
      subjects: india ? boardSubjectsFor(india) : [],
      apAddOns: [],
    };
    const plan = state.indiaPlan;
    if (plan) {
      for (const i of plan.items) {
        const c = apCandidate(i.course.id, {
          verdict: i.recommendation,
          reason: i.reason,
          factors: factorText(i.factors),
          hoursPerWeek: i.netNewPerWeek,
          overlapPct: Math.round(i.coverage * 100),
          overlapBand: plan.mapped ? i.band : null,
          gapUnits: i.gapUnits.slice(0, 4).map((u) => u.name),
        });
        if (c) candidates.push({ ...c, difficulty: i.difficulty, difficultyLabel: diffLabel(i.difficulty) });
      }
      engine = {
        kind: 'india-overlap',
        recommendedCount: plan.recommended.length,
        countReason: plan.countReason,
        mixNote: plan.mixNote,
        notes: [
          plan.mapped
            ? `Overlap is computed from Atrium's CBSE→AP graph (illustrative v0) for ${plan.boardSubjects.join(', ')}.`
            : `The overlap graph doesn't map ${india?.board ?? 'this board'} ${india?.stream ?? ''} yet, so overlap figures are rough.`,
          `${plan.netNewPerWeek} of ${plan.budgetPerWeek} hrs/week used by the recommended set over ${plan.weeks} weeks.`,
        ],
      };
    }
    if (career) {
      workload = {
        coachingHoursPerWeek: career.currentLoadHours || 0,
        activityHoursPerWeek: career.activityHours || 0,
        trainingHoursPerWeek: 0,
        sport: null,
        peakSeason: null,
        extraHoursPerWeek: career.extraHoursPerWeek,
        weeksToExam: career.weeksToExam,
        budgetPerWeek: plan?.budgetPerWeek ?? null,
        ceiling: null,
        currentLoad: null,
        plannedLoad: null,
      };
    }
  } else {
    const sgus = user.sgus;
    curriculum = {
      base: sgus ? CURRICULUM_LABEL[sgus.curriculum] : null,
      stream: null,
      elective: null,
      subjects: sgus?.courses.map((c) => `${c.name} (${c.level})`) ?? [],
      apAddOns: (sgus?.apAddOns ?? []).map((id) => apInfo(id)?.name ?? id),
    };
    const plan = state.loadPlan;
    const covered = new Set<string>();
    if (plan) {
      for (const i of plan.items) {
        const ev = {
          verdict: i.action === 'keep' ? (i.kind === 'addon' ? 'keep add-on' : 'keep') : i.action === 'drop' ? 'not this cycle' : `${i.action} ${i.from}→${i.to}`,
          reason: i.reason,
          factors: factorText(i.factors),
          hoursPerWeek: i.action === 'drop' ? 0 : i.hours,
          overlapPct: null,
          overlapBand: null,
          gapUnits: [],
        };
        if (i.kind === 'addon') {
          const id = AP_INFO.find((a) => a.name === i.name)?.id;
          const c = id ? apCandidate(id, ev) : null;
          if (c && id) {
            candidates.push(c);
            covered.add(id);
          }
        } else {
          const apId = sgus?.curriculum === 'US' && i.from === 'AP' ? US_CLASS_TO_AP[i.name] : undefined;
          if (apId) covered.add(apId);
          candidates.push({
            id: `school:${clipText(i.name, 100)}`,
            name: clipText(sgus?.curriculum === 'US' && i.from === 'AP' ? `AP ${i.name}` : i.name, 120),
            kind: 'school',
            difficulty: i.difficulty,
            difficultyLabel: diffLabel(i.difficulty),
            plain: apId ? apInfo(apId)?.plain ?? null : null,
            level: i.from,
            engine: ev,
          });
        }
      }
      const kept = plan.items.filter((i) => i.action !== 'drop' && (i.kind === 'addon' || i.to === 'AP'));
      engine = {
        kind: 'sgus-load',
        recommendedCount: plan.apCount,
        countReason: plan.apNote ?? '',
        mixNote: `${kept.filter((i) => (i.difficulty ?? 0) >= HARD_AT).length} demanding APs kept. ${plan.meterNote}`,
        notes: [plan.seasonNote].filter((n): n is string => !!n),
      };
    }
    // APs the engine didn't evaluate, so the AI can mention a sensible add-on (never auto-"take").
    for (const a of AP_INFO) {
      if (covered.has(a.id)) continue;
      const c = apCandidate(a.id);
      if (c) candidates.push(c);
    }
    if (career || sgus) {
      workload = {
        coachingHoursPerWeek: career?.currentLoadHours || 0,
        activityHoursPerWeek: career?.activityHours || 0,
        trainingHoursPerWeek: sgus?.isAthlete ? sgus.trainingHoursPerWeek : 0,
        sport: sgus?.isAthlete && sgus.sport ? clipText(sgus.sport, 60) || null : null,
        peakSeason: sgus?.isAthlete ? formatMonths(sgus.peakSeasonMonths) || null : null,
        extraHoursPerWeek: null,
        weeksToExam: career?.weeksToExam ?? null,
        budgetPerWeek: null,
        ceiling: plan?.ceiling ?? null,
        currentLoad: plan?.currentLoad ?? null,
        plannedLoad: plan?.plannedLoad ?? null,
      };
    }
  }

  // No plan yet (setup unfinished): still offer the AP list so chat can explain courses.
  if (!candidates.length) {
    for (const a of AP_INFO) {
      const c = apCandidate(a.id);
      if (c) candidates.push(c);
    }
  }

  const majors = career?.targetMajors.length ? career.targetMajors : intake?.targetMajors ?? [];
  const colleges = career?.targetColleges.length ? career.targetColleges : intake?.targetColleges ?? [];

  return {
    v: AI_CONTEXT_VERSION,
    segment: user.segment,
    setupDone: state.next === 'plan',
    grade: intake?.grade ?? null,
    curriculum,
    goals: { majors: clipList(majors, 12, 80), colleges: clipList(colleges, 20, 120), countries: countriesOf(intake).slice(0, 6) },
    personality,
    workload,
    engine,
    candidates,
  };
}

/** Short, stable hash of a context (FNV-1a over its JSON). Advice is stale when this changes. */
export function contextKey(ctx: AiContext): string {
  const s = JSON.stringify(ctx);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `v${ctx.v}-${(h >>> 0).toString(36)}`;
}
