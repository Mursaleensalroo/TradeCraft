"use client";
// app/page.tsx
import { useState } from "react";
import Profile from "@/components/Profile";
import type { Annotation } from "@/lib/rubric";

export default function Home() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Annotation | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError("");
    setResult(null);
    setShareId(null);
    try {
      const res = await fetch("/api/annotate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, transcript }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed.");
      setResult(data.annotation);
      setShareId(data.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    const shareUrl =
      shareId && typeof window !== "undefined"
        ? `${window.location.origin}/p/${shareId}`
        : null;
    return (
      <>
        <Profile a={result} name={name} role={role} />
        <section className="section" style={{ borderBottom: "none" }}>
          {shareUrl ? (
            <div className="sharebar">
              <span className="mono" style={{ color: "var(--muted)" }}>
                Public link:
              </span>
              <span className="url">{shareUrl}</span>
              <button
                className="btn"
                onClick={() => navigator.clipboard.writeText(shareUrl)}
              >
                Copy
              </button>
            </div>
          ) : (
            <div className="flag">
              Saved locally only — add Supabase keys to generate shareable public
              links (see README).
            </div>
          )}
          <div style={{ marginTop: 24 }}>
            <button className="btn" onClick={() => setResult(null)}>
              Read another
            </button>
          </div>
        </section>
      </>
    );
  }

  return (
    <section className="section" style={{ borderBottom: "none", paddingTop: 64 }}>
      <h2 className="lead">
        AI fluency, <em>shown</em> — not counted.
      </h2>
      <p className="sub">
        Paste a real session where you worked with an AI. Tradecraft reads how you
        actually work — framing, precision, and whether you catch the model when
        it's wrong — and annotates it like a game.
      </p>

      <div className="row">
        <div className="field">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aanya Rao" />
        </div>
        <div className="field">
          <label>Role</label>
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Product & Ops" />
        </div>
      </div>
      <div className="field">
        <label>Session transcript</label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={"Paste the conversation. Keep the You: / AI: turns if you can —\nthe engine reads your moves, not the AI's answers."}
        />
      </div>
      <button className="btn" onClick={run} disabled={loading || transcript.trim().length < 80}>
        {loading ? "Reading the session…" : "Read my session"}
      </button>
      {error && <div className="err">{error}</div>}
    </section>
  );
}
