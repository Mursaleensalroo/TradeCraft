// lib/fetchShared.ts
// Validates and fetches a public ChatGPT / Claude share link, extracts the
// conversation text, and returns provenance. Honest about its limits: it proves
// the conversation was hosted on the provider's domain and contains real
// content — not that the submitter authored it. Degrades to a clear failure
// (never fabricates) when a page can't be read.

import type { Source } from "./rubric";

const PATTERNS: { provider: "chatgpt" | "claude"; re: RegExp }[] = [
  { provider: "chatgpt", re: /^https:\/\/(chatgpt\.com|chat\.openai\.com)\/share\/[A-Za-z0-9-]{6,}/i },
  { provider: "claude", re: /^https:\/\/claude\.ai\/share\/[A-Za-z0-9-]{6,}/i },
];

export function classifyShareUrl(
  url: string
): { provider: "chatgpt" | "claude" } | null {
  const u = url.trim();
  for (const p of PATTERNS) if (p.re.test(u)) return { provider: p.provider };
  return null;
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export interface FetchResult {
  ok: boolean;
  transcript?: string;
  source?: Source;
  reason?: string;
}

export async function fetchSharedConversation(url: string): Promise<FetchResult> {
  const cls = classifyShareUrl(url);
  if (!cls) {
    return {
      ok: false,
      reason:
        "That isn't a recognised share link. Paste a chatgpt.com/share/… or claude.ai/share/… URL, or switch to transcript mode.",
    };
  }

  let res: Response;
  try {
    res = await fetch(url.trim(), {
      headers: {
        // Browser-like headers; some providers reject bare bot requests.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });
  } catch {
    return { ok: false, reason: "Couldn't reach that link. Check it's public, or paste the transcript." };
  }

  if (res.status === 404) {
    return { ok: false, reason: "That share link doesn't resolve (404). It may be private or deleted." };
  }
  if (!res.ok) {
    return {
      ok: false,
      reason: `The provider blocked the read (HTTP ${res.status}). Paste the transcript instead — same result.`,
    };
  }

  const html = await res.text();
  const text = htmlToText(html);

  // A JS app shell or a blocked page yields almost no real conversation text.
  const looksEmpty =
    text.length < 400 || /enable JavaScript|just a moment|verify you are human/i.test(text);
  if (looksEmpty) {
    return {
      ok: false,
      reason:
        "The link loaded but the conversation couldn't be read from it (the page renders client-side). Paste the transcript instead — it still gets a full read, just marked unverified.",
    };
  }

  return {
    ok: true,
    transcript: text.slice(0, 24000),
    source: {
      provider: cls.provider,
      url: url.trim(),
      verified: true,
      fetched_at: new Date().toISOString(),
    },
  };
}
