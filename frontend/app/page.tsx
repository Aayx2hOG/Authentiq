
"use client";
import React from 'react';

export default function LandingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0b1020;
    --surface: #141a2e;
    --navy: #e7ecff;
    --accent: #4a7cff;
    --brick: #ff8f5a;
    --muted: #a5b1d4;
    --border: #2b3558;
    --green-bg: #102a1f;
    --green-text: #7ce3ab;
    --red-bg: #30181a;
    --red-text: #ff9a89;
    --serif: 'Instrument Serif', Georgia, serif;
    --sans: 'IBM Plex Sans', system-ui, sans-serif;
  }
  body { font-family: var(--sans); background: radial-gradient(circle at top, #111938 0%, var(--bg) 45%); color: var(--navy); line-height: 1.6; }
  a { text-decoration: none; color: inherit; }

  /* NAV */
  nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 60px;
    border-bottom: 1px solid var(--border);
    background: var(--bg);
    position: sticky; top: 0; z-index: 100;
  }
  .nav-logo { font-family: var(--serif); font-size: 22px; letter-spacing: -0.3px; }
  .nav-links { display: flex; gap: 32px; font-size: 14px; color: var(--muted); }
  .nav-links a:hover { color: var(--navy); }
  .nav-cta {
    background: var(--accent); color: #fff;
    padding: 9px 20px; border-radius: 7px;
    font-size: 14px; font-weight: 500;
    transition: opacity 0.15s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* HERO */
  .hero {
    max-width: 760px; margin: 0 auto;
    padding: 100px 40px 80px;
    text-align: center;
  }
  .hero-badge {
    display: inline-block;
    background: var(--red-bg); color: var(--red-text);
    font-size: 12px; font-weight: 500;
    padding: 5px 14px; border-radius: 20px;
    margin-bottom: 28px;
    letter-spacing: 0.02em;
  }
  .hero h1 {
    font-family: var(--serif); font-size: clamp(42px, 6vw, 68px);
    line-height: 1.1; letter-spacing: -1px;
    margin-bottom: 24px;
  }
  .hero h1 em { font-style: italic; color: var(--brick); }
  .hero p {
    font-size: 18px; color: var(--muted);
    max-width: 520px; margin: 0 auto 40px;
    line-height: 1.7;
  }
  .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--accent); color: #fff;
    padding: 13px 28px; border-radius: 8px;
    font-size: 15px; font-weight: 500;
    transition: opacity 0.15s;
  }
  .btn-primary:hover { opacity: 0.85; }
  .btn-secondary {
    background: transparent; color: var(--navy);
    padding: 12px 28px; border-radius: 8px;
    font-size: 15px; font-weight: 500;
    border: 1px solid var(--border);
    transition: border-color 0.15s;
  }
  .btn-secondary:hover { border-color: #aaa; }

  /* STATS BAR */
  .stats-bar {
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    display: flex; justify-content: center; gap: 0;
  }
  .stat-item {
    padding: 28px 52px;
    text-align: center;
    border-right: 1px solid var(--border);
  }
  .stat-item:last-child { border-right: none; }
  .stat-num {
    font-family: var(--serif); font-size: 36px;
    color: var(--navy); display: block;
  }
  .stat-label { font-size: 13px; color: var(--muted); margin-top: 2px; }

  /* SECTION WRAPPER */
  section { padding: 90px 40px; max-width: 1100px; margin: 0 auto; }
  .section-tag {
    font-size: 12px; font-weight: 500;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--brick); margin-bottom: 12px;
  }
  .section-title {
    font-family: var(--serif); font-size: clamp(30px, 4vw, 44px);
    line-height: 1.15; letter-spacing: -0.5px;
    margin-bottom: 16px;
  }
  .section-title em { font-style: italic; }
  .section-sub { font-size: 16px; color: var(--muted); max-width: 480px; line-height: 1.7; }

  /* HOW IT WORKS */
  .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-top: 52px; }
  .step {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 32px 28px;
    position: relative;
  }
  .step-num {
    font-family: var(--serif); font-size: 48px;
    color: var(--border); line-height: 1;
    margin-bottom: 16px;
  }
  .step h3 { font-size: 17px; font-weight: 500; margin-bottom: 10px; }
  .step p { font-size: 14px; color: var(--muted); line-height: 1.7; }

  /* FEATURES */
  .features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    margin-top: 52px;
  }
  .feature-cell {
    background: var(--surface);
    padding: 36px 32px;
  }
  .feature-icon {
    width: 36px; height: 36px;
    border-radius: 8px;
    background: #10182f;
    border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 18px;
    font-size: 16px;
  }
  .feature-cell h3 { font-size: 16px; font-weight: 500; margin-bottom: 8px; }
  .feature-cell p { font-size: 14px; color: var(--muted); line-height: 1.7; }

  /* RESULT PREVIEW */
  .result-preview {
    display: grid; grid-template-columns: 1fr 1fr; gap: 48px;
    align-items: center; margin-top: 52px;
  }
  .preview-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 28px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  }
  .preview-card-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px;
  }
  .preview-card-header span { font-size: 13px; color: var(--muted); }
  .verdict-badge {
    font-size: 11px; font-weight: 500; padding: 4px 10px;
    border-radius: 20px;
  }
  .verdict-ai { background: var(--red-bg); color: var(--red-text); }
  .verdict-human { background: var(--green-bg); color: var(--green-text); }
  .prob-label { font-size: 12px; color: var(--muted); margin-bottom: 8px; }
  .prob-track {
    background: #232c49; border-radius: 4px; height: 8px;
    overflow: hidden; margin-bottom: 20px;
  }
  .prob-fill {
    height: 100%; border-radius: 4px;
    background: var(--brick);
    transition: width 1s ease;
  }
  .sub-scores { border-top: 1px solid var(--border); padding-top: 16px; }
  .score-row {
    display: flex; justify-content: space-between;
    font-size: 13px; padding: 7px 0;
    border-bottom: 1px solid var(--border);
  }
  .score-row:last-child { border-bottom: none; }
  .score-row span:first-child { color: var(--muted); }
  .score-row span:last-child { font-weight: 500; }
  .preview-text h3 { font-family: var(--serif); font-size: 28px; margin-bottom: 14px; line-height: 1.2; }
  .preview-text p { font-size: 15px; color: var(--muted); line-height: 1.7; margin-bottom: 20px; }
  .check-item {
    display: flex; align-items: flex-start; gap: 10px;
    font-size: 14px; margin-bottom: 10px;
  }
  .check-dot {
    width: 18px; height: 18px; border-radius: 50%;
    background: var(--green-bg);
    color: var(--green-text);
    font-size: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 2px;
    font-weight: 700;
  }

  /* TESTIMONIALS */
  .testimonials { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 52px; }
  .testimonial {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 28px;
  }
  .testimonial p { font-size: 14px; color: var(--navy); line-height: 1.7; margin-bottom: 20px; }
  .testimonial p em { font-style: italic; font-family: var(--serif); }
  .testi-author { display: flex; align-items: center; gap: 10px; }
  .testi-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--bg); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 500; color: var(--muted);
    flex-shrink: 0;
  }
  .testi-name { font-size: 13px; font-weight: 500; }
  .testi-role { font-size: 12px; color: var(--muted); }

  /* CTA */
  .cta-section {
    text-align: center;
    padding: 100px 40px;
    border-top: 1px solid var(--border);
  }
  .cta-section h2 { font-family: var(--serif); font-size: clamp(32px, 5vw, 52px); margin-bottom: 16px; letter-spacing: -0.5px; }
  .cta-section h2 em { font-style: italic; color: var(--brick); }
  .cta-section p { font-size: 17px; color: var(--muted); margin-bottom: 36px; }

  /* FOOTER */
  footer {
    border-top: 1px solid var(--border);
    padding: 32px 60px;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 13px; color: var(--muted);
  }
  .footer-logo { font-family: var(--serif); font-size: 17px; color: var(--navy); }

  @media (max-width: 768px) {
    nav { padding: 16px 24px; }
    .nav-links { display: none; }
    .stats-bar { flex-wrap: wrap; }
    .stat-item { border-right: none; border-bottom: 1px solid var(--border); flex: 1 1 50%; }
    .steps, .features-grid, .result-preview, .testimonials { grid-template-columns: 1fr; }
    section { padding: 60px 24px; }
    footer { flex-direction: column; gap: 12px; text-align: center; padding: 24px; }
  }
`}} />


      <nav>
        <div className="nav-logo">Authentiq</div>
        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#">Pricing</a>
          <a href="#">Docs</a>
        </div>
        <a href="/truthlens" className="nav-cta">Try for free</a>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-badge">Production-ready text and image checks</div>
        <h1>Is it <em>real,</em><br />or was it made<br />by a machine?</h1>
        <p>Authentiq analyzes text and images to surface the forensic signals that indicate machine-generated content, with explainable results your team can review.</p>
        <div className="hero-actions">
          <a href="/truthlens" className="btn-primary">Start detecting free →</a>
          <a href="#features" className="btn-secondary">Explore features</a>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-num">Calibrated</span>
          <div className="stat-label">Confidence scoring</div>
        </div>
        <div className="stat-item">
          <span className="stat-num">~2s</span>
          <div className="stat-label">Average analysis time</div>
        </div>
        <div className="stat-item">
          <span className="stat-num">2 modes</span>
          <div className="stat-label">Text and file analysis</div>
        </div>
        <div className="stat-item">
          <span className="stat-num">API</span>
          <div className="stat-label">Ready for integration</div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="how-it-works">
        <div className="section-tag">How it works</div>
        <h2 className="section-title">Three steps.<br /><em>One verdict.</em></h2>
        <p className="section-sub">No setup, no training data required. Paste or upload, and our forensic pipeline does the rest.</p>
        <div className="steps">
          <div className="step">
            <div className="step-num">01</div>
            <h3>Submit your content</h3>
            <p>Paste text or upload an image/document sample. Authentiq supports common working formats for fast review.</p>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <h3>Forensic analysis runs</h3>
            <p>Our pipeline inspects writing style consistency, classifier confidence, and visual artifacts before producing a score.</p>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <h3>Read the report</h3>
            <p>Receive a clear verdict with confidence, sub-signal breakdowns, and language suitable for policy or editorial review.</p>
          </div>
        </div>
      </section>

      {/* RESULT PREVIEW */}
      <section style={{ paddingTop: "0" }}>
        <div className="result-preview">
          <div className="preview-card">
            <div className="preview-card-header">
              <span>essay_draft.txt · 1,204 chars</span>
              <span className="verdict-badge verdict-ai">Likely AI-generated</span>
            </div>
            <div className="prob-label">AI probability</div>
            <div className="prob-track"><div className="prob-fill" style={{ width: "88%" }}></div></div>
            <div className="sub-scores">
              <div className="score-row"><span>Perplexity score</span><span>12.4 — low</span></div>
              <div className="score-row"><span>Burstiness index</span><span>0.18 — flat</span></div>
              <div className="score-row"><span>Semantic consistency</span><span>96% — high</span></div>
              <div className="score-row"><span>Confidence level</span><span>High</span></div>
            </div>
          </div>
          <div className="preview-text">
            <h3>Forensic results you can explain to anyone</h3>
            <p>Every score is broken down into plain language. Share the report, export as PDF, or embed it in your workflow via API.</p>
            <div className="check-item"><div className="check-dot">✓</div><span>Signal breakdown for both text and image checks</span></div>
            <div className="check-item"><div className="check-dot">✓</div><span>Calibrated confidence levels with margin-aware scoring</span></div>
            <div className="check-item"><div className="check-dot">✓</div><span>One-click shareable report link</span></div>
            <div className="check-item"><div className="check-dot">✓</div><span>REST API for bulk or automated scanning</span></div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ paddingTop: "20px" }}>
        <div className="section-tag">Features</div>
        <h2 className="section-title">Built for journalists,<br /><em>educators, and teams</em></h2>
        <div className="features-grid">
          <div className="feature-cell">
            <div className="feature-icon">📝</div>
            <h3>Text analysis</h3>
            <p>Uses statistical language patterns, chunk voting, and calibrated confidence to estimate machine-generation risk.</p>
          </div>
          <div className="feature-cell">
            <div className="feature-icon">🖼</div>
            <h3>Image detection</h3>
            <p>Inspects learned visual artifacts and texture inconsistencies to estimate whether an image is synthetic.</p>
          </div>
          <div className="feature-cell">
            <div className="feature-icon">📄</div>
            <h3>Document support</h3>
            <p>Analyze .txt, .md, .pdf, and .docx uploads directly through the same review workflow used for pasted text.</p>
          </div>
          <div className="feature-cell">
            <div className="feature-icon">⚙️</div>
            <h3>API access</h3>
            <p>Integrate Authentiq into your CMS, grading system, or moderation pipeline with a simple REST endpoint.</p>
          </div>
        </div>
      </section>


      {/* CTA */}
      <div className="cta-section">
        <h2>Start scanning.<br /><em>Free forever</em> for 50 scans/month.</h2>
        <p>No credit card required. Works in your browser, right now.</p>
        <a href="/truthlens" className="btn-primary">Create a free account →</a>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">Authentiq</div>
        <div>© 2026 Authentiq. All rights reserved.</div>
        <div style={{ display: "flex", gap: "20px" }}>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Docs</a>
          <a href="#">Contact</a>
        </div>
      </footer>


    </>
  );
}
