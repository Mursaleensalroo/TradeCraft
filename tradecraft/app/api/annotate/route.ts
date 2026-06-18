// app/api/annotate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { annotate } from "@/lib/anthropic";
import { saveProfile } from "@/lib/supabase";
import { fetchSharedConversation } from "@/lib/fetchShared";
import type { Source } from "@/lib/rubric";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { mode, url, transcript, name, role } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "Server missing ANTHROPIC_API_KEY." }, { status: 500 });
    }

    let text = "";
    let source: Source;

    if (mode === "link") {
      if (!url) return NextResponse.json({ error: "Paste a share link." }, { status: 400 });
      const r = await fetchSharedConversation(url);
      if (!r.ok) return NextResponse.json({ error: r.reason }, { status: 400 });
      text = r.transcript!;
      source = r.source!;
    } else {
      if (!transcript || transcript.trim().length < 80) {
        return NextResponse.json(
          { error: "Paste a real session — at least a few exchanges." },
          { status: 400 }
        );
      }
      text = transcript;
      source = { provider: "pasted", verified: false };
    }

    const annotation = await annotate(text, name ?? "", role ?? "");
    annotation.source = source;

    const id = await saveProfile({ name: name ?? "", role: role ?? "", annotation });
    return NextResponse.json({ annotation, id });
  } catch (e: any) {
    console.error(e);
    const msg =
      e instanceof SyntaxError
        ? "The engine returned something we couldn't read. Try again."
        : e?.message ?? "Something went wrong.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
