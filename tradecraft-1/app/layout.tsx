// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tradecraft — AI fluency, shown not counted",
  description: "A candidate-owned portfolio of real AI work.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="wrap">
          <div className="topbar">
            <a href="/" className="mark" style={{ textDecoration: "none", color: "inherit" }}>
              <span className="glyph">⌖</span>Tradecraft
            </a>
            <nav className="navlinks">
              <a href="/">New read</a>
              <a href="https://github.com" target="_blank" rel="noreferrer">About</a>
            </nav>
          </div>
          {children}
          <footer>
            <span>Tradecraft · prototype</span>
            <span className="mono">candidate-owned · consent-first · craft over count</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
