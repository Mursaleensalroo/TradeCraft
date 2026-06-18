// lib/anthropic.ts
import Anthropic from "@anthropic-ai/sdk";
import {
  SYSTEM_PROMPT,
  buildUserMessage,
  DIMENSION_LABELS,
  type Annotation,
} from "./rubric";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Sonnet 4.6 is the right cost/quality point for annotation. Bump to
// claude-opus-4-8 if you want sharper marginalia and don't mind the cost.
const MODEL = "claude-sonnet-4-6";

export async function annotate(
  transcript: string,
  name: string,
  role: string
): Promise<Annotation> {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    // Prompt caching: the rubric never changes, so cache it. Harmless now
    // (idle until you have requests within ~5 min of each other); a real
    // saving once Tradecraft has steady traffic.
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: buildUserMessage(transcript, name, role) }],
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  // The model is told to return raw JSON; strip any stray fences just in case.
  const clean = text.replace(/```json|```/g, "").trim();
  const data = JSON.parse(clean) as Annotation;

  // Backfill labels so the UI never depends on the model getting them right.
  data.dimensions = data.dimensions.map((d) => ({
    ...d,
    label: DIMENSION_LABELS[d.key] ?? d.label,
  }));

  return data;
}
