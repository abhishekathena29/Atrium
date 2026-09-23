/**
 * M8 Overlap graph (the moat): board syllabus ↔ AP units, one edge per AP unit.
 *
 * v0 coverage: CBSE Science streams (PCM / PCB / PCMB) + common electives → AP.
 * ALL VALUES ARE ILLUSTRATIVE and pending a manual syllabus-mapping pass (blueprint §6,
 * Phase 1). `prepHours` is an estimate of self-study hours to learn the unit from scratch;
 * `overlap` says how much of it the board syllabus already teaches. Mentor annotations and
 * the outcome loop (M6) are meant to sharpen these numbers over time.
 */

import type { RiasecType } from './questionnaire';
import type { IndiaIntake } from '../auth/types';

export const GRAPH_VERSION = 'v0 · illustrative · Sep 2026';

export type BoardSubject =
  | 'Physics'
  | 'Chemistry'
  | 'Mathematics'
  | 'Biology'
  | 'English'
  | 'Computer Science'
  | 'Economics'
  | 'Psychology';

export type OverlapLevel = 'full' | 'partial' | 'none';

export interface ApUnit {
  name: string;
  prepHours: number;
  /** Board subject that teaches this content; null = nothing on the board covers it. */
  board: BoardSubject | null;
  overlap: OverlapLevel;
  /** Where on the board syllabus it sits (chapter names, rationalised CBSE syllabus). */
  boardRef: string;
}

export interface ApCourse {
  id: string;
  name: string;
  /** Hours for exam format, FRQ style, and timing — never covered by a board. */
  examFormatHours: number;
  examFormatNote: string;
  majors: string[];
  riasec: RiasecType[];
  units: ApUnit[];
}

/** Share of a unit's prep hours the board already covers, by overlap level. */
export const COVERAGE: Record<OverlapLevel, number> = { full: 0.85, partial: 0.45, none: 0 };

const STEM = ['Computer Science', 'Engineering', 'Mathematics', 'Physics'];

const calcAbUnits: ApUnit[] = [
  { name: 'Limits & continuity', prepHours: 12, board: 'Mathematics', overlap: 'full', boardRef: 'XI Limits & Derivatives; XII Continuity & Differentiability' },
  { name: 'Differentiation: definition & rules', prepHours: 14, board: 'Mathematics', overlap: 'full', boardRef: 'XI Limits & Derivatives' },
  { name: 'Composite, implicit & inverse functions', prepHours: 12, board: 'Mathematics', overlap: 'full', boardRef: 'XII Continuity & Differentiability' },
  { name: "Contextual applications (related rates, L'Hôpital)", prepHours: 12, board: 'Mathematics', overlap: 'partial', boardRef: "XII Application of Derivatives — L'Hôpital not taught" },
  { name: 'Analytical applications (MVT, extrema)', prepHours: 14, board: 'Mathematics', overlap: 'full', boardRef: 'XII Application of Derivatives' },
  { name: 'Integration & accumulation of change', prepHours: 18, board: 'Mathematics', overlap: 'full', boardRef: 'XII Integrals' },
  { name: 'Differential equations & slope fields', prepHours: 10, board: 'Mathematics', overlap: 'partial', boardRef: 'XII Differential Equations — slope fields not taught' },
  { name: 'Applications of integration (area, volume)', prepHours: 12, board: 'Mathematics', overlap: 'partial', boardRef: 'XII Application of Integrals — volumes not taught' },
];

export const AP_COURSES: ApCourse[] = [
  {
    id: 'calc-ab',
    name: 'AP Calculus AB',
    examFormatHours: 14,
    examFormatNote: 'Calculator / no-calculator sections and FRQ justification style',
    majors: [...STEM, 'Economics', 'Chemistry', 'Business'],
    riasec: ['I', 'C'],
    units: calcAbUnits,
  },
  {
    id: 'calc-bc',
    name: 'AP Calculus BC',
    examFormatHours: 16,
    examFormatNote: 'Calculator / no-calculator sections and FRQ justification style',
    majors: [...STEM, 'Economics'],
    riasec: ['I', 'C'],
    units: [
      ...calcAbUnits,
      { name: 'Parametric, polar & vector functions', prepHours: 14, board: 'Mathematics', overlap: 'partial', boardRef: 'XII parametric derivatives only; polar not taught' },
      { name: 'Infinite sequences & series', prepHours: 22, board: null, overlap: 'none', boardRef: 'Not on the CBSE syllabus' },
    ],
  },
  {
    id: 'physics-1',
    name: 'AP Physics 1',
    examFormatHours: 14,
    examFormatNote: 'Experimental-design and qualitative/quantitative translation FRQs',
    majors: ['Engineering', 'Physics', 'Computer Science', 'Biology / Pre-med'],
    riasec: ['I', 'R'],
    units: [
      { name: 'Kinematics', prepHours: 10, board: 'Physics', overlap: 'full', boardRef: 'XI Motion in a Straight Line; Motion in a Plane' },
      { name: 'Force & translational dynamics', prepHours: 14, board: 'Physics', overlap: 'full', boardRef: 'XI Laws of Motion' },
      { name: 'Work, energy & power', prepHours: 10, board: 'Physics', overlap: 'full', boardRef: 'XI Work, Energy and Power' },
      { name: 'Linear momentum', prepHours: 10, board: 'Physics', overlap: 'full', boardRef: 'XI Laws of Motion; System of Particles' },
      { name: 'Torque & rotational dynamics', prepHours: 12, board: 'Physics', overlap: 'full', boardRef: 'XI System of Particles & Rotational Motion' },
      { name: 'Energy & momentum of rotating systems', prepHours: 10, board: 'Physics', overlap: 'partial', boardRef: 'XI System of Particles & Rotational Motion' },
      { name: 'Oscillations', prepHours: 8, board: 'Physics', overlap: 'full', boardRef: 'XI Oscillations' },
      { name: 'Fluids', prepHours: 8, board: 'Physics', overlap: 'full', boardRef: 'XI Mechanical Properties of Fluids' },
    ],
  },
  {
    id: 'physics-c-mech',
    name: 'AP Physics C: Mechanics',
    examFormatHours: 12,
    examFormatNote: 'Calculus-based derivation FRQs',
    majors: ['Engineering', 'Physics', 'Computer Science', 'Mathematics'],
    riasec: ['I', 'R'],
    units: [
      { name: 'Kinematics (calculus-based)', prepHours: 10, board: 'Physics', overlap: 'partial', boardRef: 'XI Motion — algebra-based treatment' },
      { name: 'Force, drag & variable forces', prepHours: 14, board: 'Physics', overlap: 'partial', boardRef: 'XI Laws of Motion' },
      { name: 'Work & energy (line integrals)', prepHours: 10, board: 'Physics', overlap: 'partial', boardRef: 'XI Work, Energy and Power' },
      { name: 'Systems of particles & momentum', prepHours: 10, board: 'Physics', overlap: 'partial', boardRef: 'XI System of Particles' },
      { name: 'Rotation (moment of inertia by integration)', prepHours: 14, board: 'Physics', overlap: 'partial', boardRef: 'XI Rotational Motion' },
      { name: 'Oscillations & gravitation', prepHours: 10, board: 'Physics', overlap: 'partial', boardRef: 'XI Oscillations; Gravitation' },
      { name: 'Calculus-based problem solving', prepHours: 12, board: null, overlap: 'none', boardRef: 'Board physics is algebra-based: the one clear gap to close' },
    ],
  },
  {
    id: 'physics-c-em',
    name: 'AP Physics C: E&M',
    examFormatHours: 12,
    examFormatNote: 'Calculus-based derivation FRQs',
    majors: ['Engineering', 'Physics'],
    riasec: ['I', 'R'],
    units: [
      { name: 'Electrostatics & Gauss’s law', prepHours: 14, board: 'Physics', overlap: 'partial', boardRef: 'XII Electric Charges and Fields' },
      { name: 'Conductors & capacitors', prepHours: 10, board: 'Physics', overlap: 'full', boardRef: 'XII Electrostatic Potential and Capacitance' },
      { name: 'Circuits incl. RC transients', prepHours: 12, board: 'Physics', overlap: 'partial', boardRef: 'XII Current Electricity — RC transients not taught' },
      { name: 'Magnetic fields & Ampère’s law', prepHours: 12, board: 'Physics', overlap: 'partial', boardRef: 'XII Moving Charges and Magnetism' },
      { name: 'Induction & LR circuits', prepHours: 14, board: 'Physics', overlap: 'partial', boardRef: 'XII Electromagnetic Induction' },
      { name: 'Calculus-based field problems', prepHours: 12, board: null, overlap: 'none', boardRef: 'Not taught with calculus on the board' },
    ],
  },
  {
    id: 'chem',
    name: 'AP Chemistry',
    examFormatHours: 16,
    examFormatNote: 'Lab-based FRQs and experimental data analysis',
    majors: ['Chemistry', 'Biology / Pre-med', 'Engineering'],
    riasec: ['I', 'R'],
    units: [
      { name: 'Atomic structure & properties', prepHours: 12, board: 'Chemistry', overlap: 'full', boardRef: 'XI Structure of Atom; Classification of Elements' },
      { name: 'Molecular & ionic bonding', prepHours: 12, board: 'Chemistry', overlap: 'full', boardRef: 'XI Chemical Bonding and Molecular Structure' },
      { name: 'Intermolecular forces & properties', prepHours: 14, board: 'Chemistry', overlap: 'partial', boardRef: 'XII Solutions — gases/IMF depth gap' },
      { name: 'Chemical reactions & stoichiometry', prepHours: 12, board: 'Chemistry', overlap: 'full', boardRef: 'XI Some Basic Concepts; Redox Reactions' },
      { name: 'Kinetics', prepHours: 12, board: 'Chemistry', overlap: 'full', boardRef: 'XII Chemical Kinetics' },
      { name: 'Thermodynamics', prepHours: 12, board: 'Chemistry', overlap: 'full', boardRef: 'XI Thermodynamics' },
      { name: 'Equilibrium', prepHours: 14, board: 'Chemistry', overlap: 'full', boardRef: 'XI Equilibrium' },
      { name: 'Acids, bases & buffers', prepHours: 14, board: 'Chemistry', overlap: 'partial', boardRef: 'XI Equilibrium — titration curves in less depth' },
      { name: 'Entropy, Gibbs & electrochemistry', prepHours: 12, board: 'Chemistry', overlap: 'full', boardRef: 'XI Thermodynamics; XII Electrochemistry' },
    ],
  },
  {
    id: 'bio',
    name: 'AP Biology',
    examFormatHours: 16,
    examFormatNote: 'Experimental design and data-analysis FRQs',
    majors: ['Biology / Pre-med', 'Psychology', 'Chemistry'],
    riasec: ['I', 'S'],
    units: [
      { name: 'Chemistry of life', prepHours: 8, board: 'Biology', overlap: 'partial', boardRef: 'XI Biomolecules' },
      { name: 'Cell structure & function', prepHours: 12, board: 'Biology', overlap: 'full', boardRef: 'XI Cell: The Unit of Life' },
      { name: 'Cellular energetics', prepHours: 14, board: 'Biology', overlap: 'full', boardRef: 'XI Photosynthesis; Respiration in Plants' },
      { name: 'Cell communication & cell cycle', prepHours: 12, board: 'Biology', overlap: 'partial', boardRef: 'XI Cell Cycle — signalling not taught' },
      { name: 'Heredity', prepHours: 12, board: 'Biology', overlap: 'full', boardRef: 'XII Principles of Inheritance and Variation' },
      { name: 'Gene expression & regulation', prepHours: 14, board: 'Biology', overlap: 'full', boardRef: 'XII Molecular Basis of Inheritance' },
      { name: 'Natural selection', prepHours: 12, board: 'Biology', overlap: 'full', boardRef: 'XII Evolution' },
      { name: 'Ecology', prepHours: 12, board: 'Biology', overlap: 'partial', boardRef: 'XII Organisms and Populations; Ecosystem' },
    ],
  },
  {
    id: 'stats',
    name: 'AP Statistics',
    examFormatHours: 12,
    examFormatNote: 'Investigative task and written interpretation of results',
    majors: ['Economics', 'Psychology', 'Biology / Pre-med', 'Business', 'Mathematics', 'Political Science / PPE'],
    riasec: ['I', 'C'],
    units: [
      { name: 'Exploring one-variable data', prepHours: 10, board: 'Mathematics', overlap: 'partial', boardRef: 'XI Statistics' },
      { name: 'Exploring two-variable data', prepHours: 10, board: null, overlap: 'none', boardRef: 'Regression not on the syllabus' },
      { name: 'Collecting data & study design', prepHours: 10, board: null, overlap: 'none', boardRef: 'Not on the syllabus' },
      { name: 'Probability & random variables', prepHours: 16, board: 'Mathematics', overlap: 'full', boardRef: 'XI & XII Probability' },
      { name: 'Sampling distributions', prepHours: 12, board: null, overlap: 'none', boardRef: 'Not on the syllabus' },
      { name: 'Inference (intervals & tests)', prepHours: 28, board: null, overlap: 'none', boardRef: 'Not on the syllabus' },
    ],
  },
  {
    id: 'csa',
    name: 'AP Computer Science A',
    examFormatHours: 12,
    examFormatNote: 'Hand-written Java FRQs',
    majors: ['Computer Science', 'Engineering', 'Mathematics'],
    riasec: ['I', 'R', 'C'],
    units: [
      { name: 'Primitive types, objects & methods', prepHours: 14, board: 'Computer Science', overlap: 'partial', boardRef: 'CBSE CS uses Python — concepts carry, Java syntax is new' },
      { name: 'Booleans, conditionals & iteration', prepHours: 14, board: 'Computer Science', overlap: 'full', boardRef: 'XI Flow of Control' },
      { name: 'Writing classes', prepHours: 18, board: null, overlap: 'none', boardRef: 'OOP class design not on the syllabus' },
      { name: 'Arrays, ArrayList & 2D arrays', prepHours: 20, board: 'Computer Science', overlap: 'partial', boardRef: 'XI Lists; XII Stacks' },
      { name: 'Inheritance & recursion', prepHours: 14, board: null, overlap: 'none', boardRef: 'Not on the syllabus' },
    ],
  },
  {
    id: 'macro',
    name: 'AP Macroeconomics',
    examFormatHours: 10,
    examFormatNote: 'Graph-drawing FRQs',
    majors: ['Economics', 'Business', 'Political Science / PPE'],
    riasec: ['E', 'I', 'C'],
    units: [
      { name: 'Basic economic concepts', prepHours: 8, board: 'Economics', overlap: 'full', boardRef: 'XII Introductory Microeconomics' },
      { name: 'Economic indicators & business cycle', prepHours: 12, board: 'Economics', overlap: 'partial', boardRef: 'XII National Income Accounting' },
      { name: 'National income & price determination', prepHours: 14, board: 'Economics', overlap: 'full', boardRef: 'XII Determination of Income and Employment' },
      { name: 'Financial sector', prepHours: 14, board: 'Economics', overlap: 'partial', boardRef: 'XII Money and Banking' },
      { name: 'Stabilisation policies', prepHours: 14, board: 'Economics', overlap: 'partial', boardRef: 'XII Government Budget and the Economy' },
      { name: 'Open economy', prepHours: 10, board: 'Economics', overlap: 'partial', boardRef: 'XII Balance of Payments' },
    ],
  },
  {
    id: 'micro',
    name: 'AP Microeconomics',
    examFormatHours: 10,
    examFormatNote: 'Graph-drawing FRQs',
    majors: ['Economics', 'Business', 'Political Science / PPE'],
    riasec: ['E', 'I', 'C'],
    units: [
      { name: 'Basic economic concepts', prepHours: 8, board: 'Economics', overlap: 'full', boardRef: 'XII Introductory Microeconomics' },
      { name: 'Supply & demand', prepHours: 14, board: 'Economics', overlap: 'full', boardRef: 'XII Theory of Consumer Behaviour' },
      { name: 'Production, cost & perfect competition', prepHours: 16, board: 'Economics', overlap: 'full', boardRef: 'XII Production and Costs; Perfect Competition' },
      { name: 'Imperfect competition', prepHours: 14, board: 'Economics', overlap: 'partial', boardRef: 'XII Non-competitive Markets (reduced)' },
      { name: 'Factor markets', prepHours: 10, board: null, overlap: 'none', boardRef: 'Not on the syllabus' },
      { name: 'Market failure & government', prepHours: 12, board: null, overlap: 'none', boardRef: 'Not on the syllabus' },
    ],
  },
  {
    id: 'psych',
    name: 'AP Psychology',
    examFormatHours: 10,
    examFormatNote: 'Article-analysis and evidence-based FRQs',
    majors: ['Psychology', 'Biology / Pre-med'],
    riasec: ['S', 'I'],
    units: [
      { name: 'Biological bases of behaviour', prepHours: 14, board: 'Psychology', overlap: 'partial', boardRef: 'XI Bases of Human Behaviour' },
      { name: 'Cognition', prepHours: 16, board: 'Psychology', overlap: 'partial', boardRef: 'XI Learning; Human Memory; Thinking' },
      { name: 'Development & learning', prepHours: 14, board: 'Psychology', overlap: 'partial', boardRef: 'XI Human Development' },
      { name: 'Social psychology & personality', prepHours: 14, board: 'Psychology', overlap: 'full', boardRef: 'XII Self and Personality; Social Influence' },
      { name: 'Mental & physical health', prepHours: 12, board: 'Psychology', overlap: 'full', boardRef: 'XII Psychological Disorders; Therapeutic Approaches' },
    ],
  },
  {
    id: 'lang',
    name: 'AP English Language',
    examFormatHours: 14,
    examFormatNote: 'Timed synthesis, rhetorical-analysis and argument essays',
    majors: ['English / Literature', 'Political Science / PPE', 'History', 'Business'],
    riasec: ['A', 'S', 'E'],
    units: [
      { name: 'Rhetorical analysis', prepHours: 20, board: 'English', overlap: 'partial', boardRef: 'English Core — reading comprehension' },
      { name: 'Argument writing', prepHours: 22, board: null, overlap: 'none', boardRef: 'Board writing tasks are format-based, not argument essays' },
      { name: 'Synthesis from sources', prepHours: 18, board: null, overlap: 'none', boardRef: 'Not on the syllabus' },
    ],
  },
  {
    id: 'apush',
    name: 'AP US History',
    examFormatHours: 20,
    examFormatNote: 'DBQ and LEQ writing',
    majors: ['History', 'Political Science / PPE', 'English / Literature'],
    riasec: ['A', 'I', 'S'],
    units: [
      { name: '1491–1754: colonial America', prepHours: 25, board: null, overlap: 'none', boardRef: 'Not on the syllabus' },
      { name: '1754–1877: revolution to reconstruction', prepHours: 45, board: null, overlap: 'none', boardRef: 'Not on the syllabus' },
      { name: '1877–1945: industrialisation to WWII', prepHours: 45, board: null, overlap: 'none', boardRef: 'Not on the syllabus' },
      { name: '1945–present', prepHours: 35, board: null, overlap: 'none', boardRef: 'Not on the syllabus' },
    ],
  },
];

/** Streams + boards the graph has mapped (M8 gates M3). */
export function isMapped(intake: Pick<IndiaIntake, 'board' | 'stream'>): boolean {
  return intake.board === 'CBSE' && intake.stream.startsWith('Science');
}

export const MAPPED_COVERAGE = [
  { board: 'CBSE', stream: 'Science (PCM / PCB / PCMB)', status: 'Mapped v0 (illustrative)' },
  { board: 'CBSE', stream: 'Commerce, Humanities', status: 'Phase 2' },
  { board: 'ICSE', stream: 'All', status: 'Phase 2' },
  { board: 'State boards, A-Levels', stream: 'All', status: 'Phase 3' },
];

/** Board subjects a student is actually sitting, from stream + elective. */
export function boardSubjectsFor(intake: Pick<IndiaIntake, 'stream' | 'elective'>): BoardSubject[] {
  const subjects: BoardSubject[] = ['English'];
  if (intake.stream === 'Science (PCM)') subjects.push('Physics', 'Chemistry', 'Mathematics');
  if (intake.stream === 'Science (PCB)') subjects.push('Physics', 'Chemistry', 'Biology');
  if (intake.stream === 'Science (PCMB)') subjects.push('Physics', 'Chemistry', 'Mathematics', 'Biology');
  if (intake.elective === 'Computer Science' || intake.elective === 'Informatics Practices') subjects.push('Computer Science');
  if (intake.elective === 'Economics') subjects.push('Economics');
  if (intake.elective === 'Psychology') subjects.push('Psychology');
  return subjects;
}
