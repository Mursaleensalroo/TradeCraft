// components/Profile.tsx
import type { Annotation, Move } from "@/lib/rubric";

function Pips({ score }: { score: number }) {
  return (
    <div className="pips">
      {[0, 1, 2, 3, 4].map((i) => (
        <i key={i} className={i < score ? "pip on" : "pip"} />
      ))}
    </div>
  );
}

function MoveRow({ m }: { m: Move }) {
  const star = m.glyph === "!!";
  return (
    <div className={star ? "move star" : "move"}>
      <div className="move-body">
        <div className="move-head">
          <span className="move-no">{String(m.n).padStart(2, "0")}</span>
          <span className="move-phase">{m.phase}</span>
          <span className={m.glyph === "?!" ? "qual dub" : "qual"}>{m.glyph}</span>
        </div>
        <div className="prompt">{m.prompt}</div>
      </div>
      <div className="margin">
        <p>{m.marginalia}</p>
        <span className="dimref">
          reads to · <b>{labelFor(m.dimension)}</b>
        </span>
      </div>
    </div>
  );
}

const LABELS: Record<string, string> = {
  problem_framing: "Problem framing",
  prompt_precision: "Prompt precision",
  tool_orchestration: "Tool orchestration",
  verification: "Verification & error-catching",
  output_shaping: "Output shaping",
  efficiency: "Efficiency",
};
function labelFor(k: string) {
  return LABELS[k] ?? k;
}

export default function Profile({
  a,
  name,
  role,
}: {
  a: Annotation;
  name: string;
  role: string;
}) {
  return (
    <>
      <section className="hero">
        <div className="hero-grid">
          <div>
            <div className="eyebrow">Tradecraft read</div>
            <h1>{name || "Candidate"}</h1>
            <div className="subline">{role || a.candidate_summary}</div>
            <div className="thesis">{a.headline}</div>
            <div className="provenance">
              {a.source?.verified ? (
                <a
                  className="chip ok"
                  href={a.source.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none", color: "inherit" }}
                  title="Open the original shared conversation"
                >
                  Verified · {a.source.provider === "chatgpt" ? "ChatGPT" : "Claude"} share ↗
                </a>
              ) : (
                <span className="chip warn">Unverified · pasted</span>
              )}
              <span className="chip ok">{a.moves.length} moves read</span>
              <span className="chip ok">{a.dimensions.length} dimensions</span>
            </div>
          </div>
          <div className="seal">
            <div className="seal-ring">
              <div className="seal-val">{a.composite}</div>
              <div className="seal-label">Fluency read</div>
            </div>
            <div className="seal-cap">
              Weighted across six dimensions.
              <br />
              <b>Not</b> a usage count.
            </div>
          </div>
        </div>
      </section>

      {a.honest_flag && (
        <section className="section">
          <div className="flag">
            <b>Honest note · </b>
            {a.honest_flag}
          </div>
        </section>
      )}

      <section className="section">
        <div className="sec-head">
          <span className="sec-no">01</span>
          <span className="sec-title">The read</span>
          <span className="sec-note">
            Volume can fake five of these. It can never fake verification.
          </span>
        </div>
        <div className="rubric">
          {a.dimensions.map((d) => (
            <div key={d.key} className={d.key === "verification" ? "dim keyed" : "dim"}>
              <div className="dim-name">
                {d.key === "verification" ? <b>{d.label}</b> : d.label}
                <small>{d.note}</small>
              </div>
              <Pips score={d.score} />
              <div className="grade">{d.grade}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="sec-head">
          <span className="sec-no">02</span>
          <span className="sec-title">Annotated work</span>
          <span className="sec-note">
            Read it like an annotated game. The moves are real; the margin is the assessment.
          </span>
        </div>
        <div className="case-meta">
          <span className="case-tag">SESSION</span>
          <span className="case-title">{a.candidate_summary}</span>
        </div>
        <div style={{ marginTop: 8 }}>
          {a.moves.map((m) => (
            <MoveRow key={m.n} m={m} />
          ))}
        </div>
      </section>
    </>
  );
}
