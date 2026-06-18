// lib/sample.ts
import type { Annotation } from "./rubric";

export const SAMPLE: Annotation = {
  candidate_summary:
    "Diagnosing a Q2 churn spike from a raw export, then shaping it into a board narrative.",
  composite: "A-",
  headline: "Frames before prompting, and catches the model when it invents a number.",
  source: { provider: "chatgpt", verified: true, url: "https://chatgpt.com/share/example" },
  dimensions: [
    { key: "problem_framing", label: "Problem framing", score: 4, grade: "strong", note: "Listed four churn hypotheses and the exact data cut for each before touching numbers." },
    { key: "prompt_precision", label: "Prompt precision", score: 5, grade: "exemplary", note: "Pinned an n<30 low-confidence rule up front, pre-empting false precision." },
    { key: "tool_orchestration", label: "Tool orchestration", score: 3, grade: "proficient", note: "Fed each cut back in to chain the analysis, though never used files or retrieval." },
    { key: "verification", label: "Verification & error-catching", score: 5, grade: "exemplary", note: "Caught a fabricated 23% drop and forced a re-derivation from source rows." },
    { key: "insight", label: "Insight & ideas", score: 4, grade: "strong", note: "Reframed 'why did churn rise' into 'which segment moved, and is the sample real'." },
    { key: "creativity", label: "Creative range", score: 3, grade: "proficient", note: "Solid, conventional analytic path; few alternative angles explored." },
    { key: "output_shaping", label: "Output shaping", score: 4, grade: "strong", note: "Closed on a five-line board narrative with the caveat stated, not buried." },
    { key: "efficiency", label: "Efficiency", score: 4, grade: "strong", note: "Reached a defensible answer in six deliberate moves, little thrash." },
  ],
  moves: [
    { n: 1, phase: "Framing", prompt: "Before any analysis: list the 4 hypotheses that could explain a churn spike, and the exact cut of this schema that confirms or kills each. Don't touch numbers yet.", glyph: "!", marginalia: "Defined what 'done' looks like before prompting for output.", dimension: "problem_framing" },
    { n: 2, phase: "Precision", prompt: "Hard rule: any segment with n<30, label low-confidence and never rank it. Return a table, no prose.", glyph: "!", marginalia: "Constrained the model against false precision — the trap most people only catch after it's in the deck.", dimension: "prompt_precision" },
    { n: 4, phase: "The catch", prompt: "You reported a 23% drop in Pro. The raw count says 11%. Where did 23 come from? Re-derive it and show the arithmetic.", glyph: "!!", marginalia: "Caught a fabricated figure mid-analysis and forced a re-derivation. The move volume can never fake.", dimension: "verification" },
    { n: 5, phase: "Shaping", prompt: "Compress to a 5-line board narrative: the one real driver, the size, the low-n caveat, one recommendation. No hedging.", glyph: "!", marginalia: "Shipped a decision with the uncertainty surfaced, not a data dump.", dimension: "output_shaping" },
  ],
};
