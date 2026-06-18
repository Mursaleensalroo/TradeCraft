// lib/fetchShared.ts
// Validates and fetches a public ChatGPT / Claude share link.
//
// Both providers render the conversation with JavaScript (ChatGPT via React
// Router loader data, Claude via Next.js flight chunks), so a plain server
// fetch gets an empty shell. To read either reliably we route through a hosted
// JS-rendering proxy (ScrapingBee) that runs a real browser and returns the
// finished HTML — then our text extraction works for both.
//
// Set SCRAPINGBEE_API_KEY to enable verified links. Without it, the code tries
// a direct fetch (works only for already-server-rendered pages) and otherwise
// returns an honest failure pointing the user to paste mode. It never fabricates.

import type { Source } from "./rubric";

const PATTERNS: { provider: "chatgpt" | "claude"; re: RegExp }[] = [
  { provider: "chatgpt", re: /^https:\/\/(chatgpt\.com|chat\.openai\.com)\/share\/[A-Za-z0-9-]{6,}/i },
  { provider: "claude", re: /^https:\/\/claude\.ai\/share\/[A-Za-z0-9-]{6,}/i },
];

export function classifyShareUrl(url: string): { provider: "chatgpt" | "claude" } | null {
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
    .replace(/&#39;/g, "'")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
};

// Build the proxy URL that renders the page's JS before returning HTML.
function renderedUrl(target: string): string | null {
  const key = process.env.SCRAPINGBEE_API_KEY;
  if (!key) return null;
  const params = new URLSearchParams({
    api_key: key,
    url: target,
    render_js: "true",
    wait: "4000", // give the conversation time to render
  });
  return `https://app.scrapingbee.com/api/v1/?${params.toString()}`;
}

async function getHtml(target: string): Promise<{ html: string; rendered: boolean } | null> {
  const proxied = renderedUrl(target);
  try {
    if (proxied) {
      const r = await fetch(proxied, { headers: BROWSER_HEADERS });
      if (r.ok) return { html: await r.text(), rendered: true };
      // fall through to direct attempt if the proxy errors
    }
    const r = await fetch(target, { headers: BROWSER_HEADERS, redirect: "follow" });
    if (r.status === 404) return null;
    if (!r.ok) return null;
    return { html: await r.text(), rendered: false };
  } catch {
    return null;
  }
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

  const got = await getHtml(url.trim());
  if (!got) {
    return { ok: false, reason: "Couldn't reach that link. Check it's public, or paste the transcript." };
  }

  const text = htmlToText(got.html);
  const looksEmpty =
    text.length < 400 || /enable JavaScript|just a moment|verify you are human/i.test(text);

  if (looksEmpty) {
    const reason = got.rendered
      ? "The page rendered but no conversation was found — the link may be private or expired. Paste the transcript instead."
      : "This link needs JavaScript to read (both ChatGPT and Claude render conversations client-side). Verified links require the render proxy to be configured (set SCRAPINGBEE_API_KEY) — until then, use Paste transcript for a full, unverified read.";
    return { ok: false, reason };
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
