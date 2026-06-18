// app/api/annotate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { annotate } from "@/lib/anthropic";
import { saveProfile } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { transcript, name, role } = await req.json();

    if (!transcript || transcript.trim().length < 80) {
      return NextResponse.json(
        { error: "Paste a real session — at least a few exchanges." },
        { status: 400 }
      );
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Server missing ANTHROPIC_API_KEY." },
        { status: 500 }
      );
    }

    const annotation = await annotate(transcript, name ?? "", role ?? "");
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
