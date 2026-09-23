/**
 * M2 Questionnaire item bank — v1, pending expert vetting (blueprint §5.1).
 *
 * Layer 1 (temperament / load): Big Five short form in the style of the public-domain
 *   IPIP Mini-IPIP — 4 items per trait, half reverse-keyed.
 * Layer 2 (interest → direction): RIASEC / Holland activity preferences, 3 per type.
 * Layer 3 (target & constraints): captured as structured fields in the questionnaire page.
 *
 * Not MBTI. Scores are 1–5 means; see engine/profile.ts for how they are used.
 */

export type OceanTrait = 'O' | 'C' | 'E' | 'A' | 'N';
export type RiasecType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface OceanItem {
  id: string;
  text: string;
  trait: OceanTrait;
  reverse: boolean;
}

export interface RiasecItem {
  id: string;
  text: string;
  type: RiasecType;
}

export const OCEAN_LABEL: Record<OceanTrait, string> = {
  O: 'Openness',
  C: 'Conscientiousness',
  E: 'Extraversion',
  A: 'Agreeableness',
  N: 'Neuroticism',
};

export const RIASEC_LABEL: Record<RiasecType, string> = {
  R: 'Realistic',
  I: 'Investigative',
  A: 'Artistic',
  S: 'Social',
  E: 'Enterprising',
  C: 'Conventional',
};

export const OCEAN_ITEMS: OceanItem[] = [
  { id: 'e1', text: 'I am the life of the party.', trait: 'E', reverse: false },
  { id: 'a1', text: "I sympathise with others' feelings.", trait: 'A', reverse: false },
  { id: 'c1', text: 'I get chores done right away.', trait: 'C', reverse: false },
  { id: 'n1', text: 'I have frequent mood swings.', trait: 'N', reverse: false },
  { id: 'o1', text: 'I have a vivid imagination.', trait: 'O', reverse: false },
  { id: 'e2', text: "I don't talk a lot.", trait: 'E', reverse: true },
  { id: 'a2', text: "I am not interested in other people's problems.", trait: 'A', reverse: true },
  { id: 'c2', text: 'I often forget to put things back in their proper place.', trait: 'C', reverse: true },
  { id: 'n2', text: 'I am relaxed most of the time.', trait: 'N', reverse: true },
  { id: 'o2', text: 'I am not interested in abstract ideas.', trait: 'O', reverse: true },
  { id: 'e3', text: 'I talk to a lot of different people at gatherings.', trait: 'E', reverse: false },
  { id: 'a3', text: "I feel others' emotions.", trait: 'A', reverse: false },
  { id: 'c3', text: 'I like order.', trait: 'C', reverse: false },
  { id: 'n3', text: 'I get upset easily.', trait: 'N', reverse: false },
  { id: 'o3', text: 'I have difficulty understanding abstract ideas.', trait: 'O', reverse: true },
  { id: 'e4', text: 'I keep in the background.', trait: 'E', reverse: true },
  { id: 'a4', text: 'I am not really interested in others.', trait: 'A', reverse: true },
  { id: 'c4', text: 'I make a mess of things.', trait: 'C', reverse: true },
  { id: 'n4', text: 'I seldom feel blue.', trait: 'N', reverse: true },
  { id: 'o4', text: 'I do not have a good imagination.', trait: 'O', reverse: true },
];

export const RIASEC_ITEMS: RiasecItem[] = [
  { id: 'r1', text: 'Build or repair something with my hands', type: 'R' },
  { id: 'i1', text: 'Work out why an experiment gave an unexpected result', type: 'I' },
  { id: 'ar1', text: 'Write a story, compose music, or design a poster', type: 'A' },
  { id: 's1', text: 'Help a classmate understand something they are stuck on', type: 'S' },
  { id: 'en1', text: 'Pitch an idea and persuade people to back it', type: 'E' },
  { id: 'cv1', text: 'Organise data into a clean, accurate spreadsheet', type: 'C' },
  { id: 'r2', text: 'Assemble a robot, engine, or circuit', type: 'R' },
  { id: 'i2', text: 'Solve a hard maths or logic puzzle', type: 'I' },
  { id: 'ar2', text: 'Act, perform, or make a short film', type: 'A' },
  { id: 's2', text: 'Volunteer or coach younger students', type: 'S' },
  { id: 'en2', text: 'Lead a team or start a club', type: 'E' },
  { id: 'cv2', text: 'Keep careful records and follow a clear procedure', type: 'C' },
  { id: 'r3', text: 'Work outdoors or with tools and machines', type: 'R' },
  { id: 'i3', text: 'Read about how the brain, the economy, or the universe works', type: 'I' },
  { id: 'ar3', text: 'Explore art, literature, or design for fun', type: 'A' },
  { id: 's3', text: 'Listen to people and help them with a problem', type: 'S' },
  { id: 'en3', text: 'Negotiate, sell, or run a small business', type: 'E' },
  { id: 'cv3', text: 'Check work for errors and make budgets balance', type: 'C' },
];

export const LIKERT_AGREE = [
  'Very inaccurate',
  'Moderately inaccurate',
  'Neither',
  'Moderately accurate',
  'Very accurate',
];

export const LIKERT_LIKE = ['Strongly dislike', 'Dislike', 'Unsure', 'Like', 'Strongly like'];

/** Majors a student can target; each carries the Holland types it most aligns with. */
export const MAJORS: { name: string; riasec: RiasecType[] }[] = [
  { name: 'Computer Science', riasec: ['I', 'R', 'C'] },
  { name: 'Engineering', riasec: ['R', 'I'] },
  { name: 'Mathematics', riasec: ['I', 'C'] },
  { name: 'Physics', riasec: ['I', 'R'] },
  { name: 'Biology / Pre-med', riasec: ['I', 'S'] },
  { name: 'Chemistry', riasec: ['I', 'R'] },
  { name: 'Economics', riasec: ['E', 'I', 'C'] },
  { name: 'Business', riasec: ['E', 'C'] },
  { name: 'Psychology', riasec: ['S', 'I'] },
  { name: 'Political Science / PPE', riasec: ['E', 'S', 'I'] },
  { name: 'History', riasec: ['A', 'I'] },
  { name: 'English / Literature', riasec: ['A', 'S'] },
  { name: 'Design / Architecture', riasec: ['A', 'R'] },
  { name: 'Undecided', riasec: [] },
];
