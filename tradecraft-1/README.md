# Tradecraft

AI fluency, shown — not counted. Paste a real AI session, get an honest, annotated read of how someone actually works with AI: framing, precision, and whether they catch the model when it's wrong.

The whole product is one idea: an engine that reads a transcript and annotates it against a six-dimension rubric. That engine lives in `lib/rubric.ts` — it's the part worth tuning. Everything else is plumbing.

## What's here

```
lib/rubric.ts        ← the prompt + schema (the crown jewel — edit this first)
lib/anthropic.ts     ← calls Claude, parses the JSON
lib/supabase.ts      ← stores profiles for share links (optional)
app/api/annotate     ← the endpoint: transcript in → annotation out
app/page.tsx         ← paste box + inline result + share link
app/p/[id]           ← public shareable profile
components/Profile.tsx← the rendered read (scores + annotated moves)
```

## Run it locally (5 minutes)

1. `npm install`
2. Copy the env file: `cp .env.local.example .env.local`
3. Put your Anthropic key in `.env.local` (`ANTHROPIC_API_KEY=sk-ant-...`). You can leave the Supabase lines blank for now — annotation works without them, you just won't get share links.
4. `npm run dev` → open http://localhost:3000, paste a session, hit **Read my session**.

That's the magic moment. Get this feeling right before anything else.

## Add share links (Supabase — optional, ~10 min)

Share links are the thing a recruiter actually opens, so you'll want this before showing anyone.

1. Create a free project at supabase.com.
2. **SQL Editor** → paste the contents of `supabase.sql` → Run. (Creates the `profiles` table + a public-read policy.)
3. **Project Settings → API** → copy the **Project URL** and the **service_role** key.
4. Put them in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL=` the Project URL
   - `SUPABASE_SERVICE_KEY=` the service_role key (server-side only — never expose this client-side)
5. Restart `npm run dev`. Now every read produces a `/p/<id>` link you can copy and send.

## Deploy to Vercel (~10 min)

1. Push this folder to a GitHub repo.
2. vercel.com → **Add New → Project** → import the repo. Framework auto-detects as Next.js.
3. **Environment Variables** — add the same three keys from `.env.local`:
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
4. **Deploy.** You get a live `tradecraft.vercel.app` URL. That's the link for the Shikhar email.

## The rubric (what it scores)

Six dimensions, 0–5 each. **Verification & error-catching is weighted ~2x** — it's the one volume can never fake, and the one a recruiter most wants to see. The engine is told to be honest: thin or gameable sessions get low scores and an `honest_flag`, because an inflated read kills the product's only asset, trust.

## Model & cost

Uses `claude-sonnet-4-6` (good cost/quality for annotation). Swap to `claude-opus-4-8` in `lib/anthropic.ts` for sharper marginalia. One read ≈ a few thousand tokens — cheap. Add rate limiting before you make the paste box public.

## Honest limits of this MVP

- Input is paste-only. Parsing ChatGPT/Claude share links and full data-export uploads comes later.
- No auth yet — anyone can create a profile. Fine for a demo, not for production.
- "Consent-imported" is currently a claim, not enforced. The real version verifies provenance.
