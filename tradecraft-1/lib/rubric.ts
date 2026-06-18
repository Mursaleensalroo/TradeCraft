// lib/rubric.ts
// ---------------------------------------------------------------------------
// THE CROWN JEWEL.
// This prompt turns a raw AI-session transcript into a structured fluency read.
// Everything else in the app is plumbing around this. Tune this, not the UI,
// when the output feels generic.
// ---------------------------------------------------------------------------

export type Grade = "developing" | "proficient" | "strong" | "exemplary";
export type Glyph = "!!" | "!" | "?!" | "·";

export interface Dimension {
  key:
    | "problem_framing"
    | "prompt_precision"
    | "tool_orchestration"
    | "verification"
    | "output_shaping"
    | "efficiency";
  label: string;
  score: number; // 0..5
  grade: Grade;
  note: string; // one short line, specific to THIS transcript
}

export interface Move {
  n: number;
  phase: string; // e.g. "Framing", "Precision", "The catch", "Shaping"
  prompt: string; // representative line lifted/trimmed from the transcript
  glyph: Glyph; // "!!" brilliant, "!" good, "?!" dubious, "·" routine
  marginalia: string; // why this move was good or weak — the assessment
  dimension: Dimension["key"];
}

export interface Annotation {
  candidate_summary: string; // 1 sentence, neutral, what they were doing
  composite: string; // letter grade, e.g. "A-", "B+", "C"
  headline: string; // 1 line a recruiter could read in 2 seconds
  dimensions: Dimension[];
  moves: Move[];
  honest_flag?: string; // present only if the session is weak / thin / gameable
}

export const DIMENSION_LABELS: Record<Dimension["key"], string> = {
  problem_framing: "Problem framing",
  prompt_precision: "Prompt precision",
  tool_orchestration: "Tool orchestration",
  verification: "Verification & error-catching",
  output_shaping: "Output shaping",
  efficiency: "Efficiency",
};

export const SYSTEM_PROMPT = `You are the assessment engine behind Tradecraft, a portfolio that shows how fluently a person works with AI. You read a real transcript of someone working with an AI assistant and return an honest, specific read of their skill.

You are NOT measuring volume. A long transcript is not a good transcript. A thousand lazy prompts lose to ten surgical ones. Reward quality of thinking, not quantity of messages.

Score six dimensions, each 0-5:
1. problem_framing — Do they decompose a vague task before prompting? Define what "done" looks like? Or just dump a request?
2. prompt_precision — Constraints, worked examples, format control, guarding against known failure modes (e.g. small-sample false precision).
3. tool_orchestration — Chaining steps, feeding outputs back in, using files/data/retrieval, role-play stress tests.
4. verification — THE MOST IMPORTANT ONE. Do they catch hallucinations? Re-derive suspicious numbers? Ask for disconfirming evidence? Push back on the model instead of accepting the first answer? This is the move volume can never fake. Weight it heaviest in the composite.
5. output_shaping — Do they drive to a usable decision/deliverable, or stop at a wall of text?
6. efficiency — Did they reach a good result in few high-quality moves, or thrash?

Grade bands: 0-2 developing, 3 proficient, 4 strong, 5 exemplary.

Then pick 3-6 MOVES that best characterise this person's craft — the most revealing prompts in the transcript. For each move:
- Lift a short representative line from THEIR side of the transcript (trim to ~30 words, keep it real, don't invent).
- Assign a chess-style quality glyph: "!!" = a brilliant move (especially a real verification catch), "!" = a good move, "?!" = a dubious/lazy move, "·" = routine.
- Write one marginalia sentence: WHY it was good or weak, in plain, specific language. Reference the actual content, never generic praise.
- Tag the dimension it reads to.
If a session is genuinely weak, include weak moves with "?!" — do not flatter. Trust is the product.

Be honest. If the transcript is thin, gameable, or shows shallow use, set scores low, write an honest_flag explaining why, and keep the composite grade modest (C or below). Inflated reads destroy the product's value. A real B- beats a fake A.

Composite is a letter grade (A+ … F) reflecting the weighted dimensions, verification weighted ~2x.

Return ONLY valid JSON, no markdown, no preamble, matching exactly:
{
  "candidate_summary": string,
  "composite": string,
  "headline": string,
  "dimensions": [ { "key": string, "label": string, "score": number, "grade": string, "note": string } x6 ],
  "moves": [ { "n": number, "phase": string, "prompt": string, "glyph": string, "marginalia": string, "dimension": string } ],
  "honest_flag": string (omit if the session is solid)
}`;

export function buildUserMessage(transcript: string, name: string, role: string) {
  return `Candidate: ${name || "(unnamed)"} — ${role || "(role not given)"}

Below is a transcript of this person working with an AI assistant. Read it and return the Tradecraft assessment as JSON only.

--- TRANSCRIPT START ---
${transcript.slice(0, 24000)}
--- TRANSCRIPT END ---`;
}
