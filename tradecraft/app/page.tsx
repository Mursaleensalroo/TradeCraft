"use client";
// app/page.tsx
import { useState } from "react";
import Profile from "@/components/Profile";
import type { Annotation } from "@/lib/rubric";
import { SAMPLE } from "@/lib/sample";

const LOADING_STEPS = [
  "Reading the session…",
  "Tracing the moves…",
  "Scoring eight dimensions…",
  "Writing the marginalia…",
];

export default function Home() {
  const [mode, setMode] = useState<"link" | "paste">("link");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Annotation | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  async function run() {
    setLoading(true);
    setError("");
    setResult(null);
    setShareId(null);
    setStep(0);
    const ticker = setInterval(() => setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 1600);
    try {
      const res = await fetch("/api/annotate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, url, transcript, name, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed.");
      setResult(data.annotation);
      setShareId(data.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      clearInterval(ticker);
      setLoading(false);
    }
  }

  const canRun = mode === "link" ? url.trim().length > 12 : transcript.trim().length >= 80;

  if (result) {
    const shareUrl =
      shareId && typeof window !== "undefined" ? `${window.location.origin}/p/${shareId}` : null;
    return (
      <>
        <Profile a={result} name={name} role={role} />
        <section className="section" style={{ borderBottom: "none" }}>
          {shareUrl ? (
            <div className="sharebar">
              <span className="mono" style={{ color: "var(--muted)" }}>Public link:</span>
              <span className="url">{shareUrl}</span>
              <button className="btn" onClick={() => navigator.clipboard.writeText(shareUrl)}>Copy</button>
            </div>
          ) : (
            <div className="flag">Saved locally only — add Supabase keys for shareable links (see README).</div>
          )}
          <div style={{ marginTop: 24 }}>
            <button className="btn ghost" onClick={() => setResult(null)}>Read another</button>
          </div>
        </section>
      </>
    );
  }

  return (
    <section className="section" style={{ borderBottom: "none", paddingTop: 56 }}>
      <h2 className="lead">AI fluency, <em>shown</em> — not counted.</h2>
      <p className="sub">
        Drop in a real session where you worked with an AI. Tradecraft reads how you actually
        work — framing, precision, original thinking, and whether you catch the model when it's
        wrong — and annotates it like a game.
      </p>

      <div className="modes">
        <button className={mode === "link" ? "mode on" : "mode"} onClick={() => setMode("link")}>
          Share link <span className="tag">verified</span>
        </button>
        <button className={mode === "paste" ? "mode on" : "mode"} onClick={() => setMode("paste")}>
          Paste transcript
        </button>
      </div>

      <div className="row">
        <div className="field"><label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aanya Rao" /></div>
        <div className="field"><label>Role</label>
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Product & Ops" /></div>
      </div>

      {mode === "link" ? (
        <div className="field">
          <label>ChatGPT or Claude share link</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://chatgpt.com/share/…  or  https://claude.ai/share/…"
          />
          <button className="linklike" onClick={() => setShowHelp((v) => !v)}>
            {showHelp ? "Hide" : "How do I get a share link?"}
          </button>
          {showHelp && (
            <div className="helper">
              <b>ChatGPT:</b> open the chat → Share button (top right) → Create link → copy.<br />
              <b>Claude:</b> open the chat → the share icon → Create public link → copy.<br />
              <span className="muted">A verified link lets a recruiter click through to the real conversation. Can't share it? Use Paste transcript — same read, marked unverified.</span>
            </div>
          )}
        </div>
      ) : (
        <div className="field">
          <label>Session transcript</label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={"Paste the conversation. Keep the You: / AI: turns if you can —\nthe engine reads your moves, not the AI's answers."}
          />
        </div>
      )}

      <div className="actions">
        <button className="btn" onClick={run} disabled={loading || !canRun}>
          {loading ? LOADING_STEPS[step] : "Read my session"}
        </button>
        <button className="btn ghost" onClick={() => { setResult(SAMPLE); setName("Aanya Rao"); setRole("Product & Ops"); }} disabled={loading}>
          See a sample read
        </button>
      </div>
      {error && <div className="err">{error}</div>}
    </section>
  );
}
