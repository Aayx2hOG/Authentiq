import Link from "next/link";
import "./landing.css";

export default function LandingPage() {
    return (
        <main className="landing">
            <header className="nav reveal">
                <div className="brand">
                    <span className="brand-dot" aria-hidden="true"></span>
                    <span>AUTHENTIQ</span>
                </div>
                <nav className="nav-links" aria-label="Primary">
                    <a href="#capabilities">Capabilities</a>
                    <a href="#workflow">Workflow</a>
                    <a href="#trust">Trust Layer</a>
                    <a href="/truthlens">TruthLens</a>
                </nav>
            </header>

            <section className="hero reveal reveal-delay-1">
                <div>
                    <span className="kicker">Authenticity Intelligence Platform</span>
                    <h1>Professional AI-content detection, designed for real decisions.</h1>
                    <p>
                        Authentiq helps teams verify text and images with explainable
                        confidence signals. Built for editorial integrity, academic policy,
                        compliance teams, and modern trust operations.
                    </p>
                    <div className="hero-actions">
                        <Link href="/truthlens" className="btn-primary">
                            Launch Detection Console
                        </Link>
                        <a href="#capabilities" className="btn-secondary">
                            Explore Capabilities
                        </a>
                    </div>
                </div>

                <aside className="hero-card" aria-label="Sample detection panel">
                    <h3>Live Snapshot</h3>
                    <div className="signal-row">
                        <span>Asset</span>
                        <strong>submission-1482.png</strong>
                    </div>
                    <div className="signal-row">
                        <span>Verdict</span>
                        <strong>Likely synthetic</strong>
                    </div>
                    <div className="signal-row">
                        <span>AI probability</span>
                        <strong>86%</strong>
                    </div>
                    <div className="progress" role="img" aria-label="AI probability 86 percent">
                        <span style={{ width: "86%" }}></span>
                    </div>
                    <div className="signal-row">
                        <span>Confidence</span>
                        <strong>High</strong>
                    </div>
                </aside>
            </section>

            <section id="trust" className="surface reveal reveal-delay-2">
                <div className="section-head">
                    <h2>Built for professional trust workflows</h2>
                    <p>Fast, explainable, and integration-friendly.</p>
                </div>
                <div className="stat-grid">
                    <article className="stat">
                        <strong>2 Analysis Modes</strong>
                        <span>Text and image detection in one workflow.</span>
                    </article>
                    <article className="stat">
                        <strong>Actionable Signals</strong>
                        <span>Verdict class, probability score, and confidence level.</span>
                    </article>
                    <article className="stat">
                        <strong>API Compatible</strong>
                        <span>Ready for moderation pipelines and internal systems.</span>
                    </article>
                    <article className="stat">
                        <strong>Shareable Reviews</strong>
                        <span>Consistent output teams can discuss and document.</span>
                    </article>
                </div>
            </section>

            <section id="capabilities" className="surface">
                <div className="section-head">
                    <h2>Capabilities</h2>
                    <p>Designed for teams that need clarity, not guesswork.</p>
                </div>
                <div className="grid-2">
                    <article className="card">
                        <h3>Text Authenticity Analysis</h3>
                        <p>
                            Evaluates lexical consistency and probabilistic signals to estimate
                            machine-generation risk for essays, reports, or long-form content.
                        </p>
                    </article>
                    <article className="card">
                        <h3>Image Authenticity Analysis</h3>
                        <p>
                            Reviews visual artifacts and learned forensic signals to estimate
                            whether uploaded images are likely synthetic.
                        </p>
                    </article>
                    <article className="card">
                        <h3>Explainable Scoring</h3>
                        <p>
                            Every result includes confidence and signal-level metrics so teams
                            can justify decisions with transparent evidence.
                        </p>
                    </article>
                    <article className="card">
                        <h3>Product-Ready API Layer</h3>
                        <p>
                            Integrate checks into classroom tools, newsroom workflows, or
                            moderation systems through straightforward endpoints.
                        </p>
                    </article>
                </div>
            </section>

            <section id="workflow" className="surface">
                <div className="section-head">
                    <h2>Workflow</h2>
                    <p>From submission to decision in three steps.</p>
                </div>
                <ol className="timeline">
                    <li>
                        <strong>1. Submit content</strong>
                        <span>Paste text or upload images directly in the TruthLens console.</span>
                    </li>
                    <li>
                        <strong>2. Run authenticity scan</strong>
                        <span>
                            Detection models process linguistic and visual signals in a unified
                            pipeline.
                        </span>
                    </li>
                    <li>
                        <strong>3. Review explainable result</strong>
                        <span>
                            Use probability, verdict class, and confidence level to inform
                            policy, editorial, or compliance actions.
                        </span>
                    </li>
                </ol>
            </section>

            <section className="cta">
                <h2>Ready to present with confidence?</h2>
                <p>
                    Use TruthLens to evaluate submissions with a professional, consistent,
                    and clean detection experience.
                </p>
                <Link href="/truthlens" className="btn-primary">
                    Try TruthLens
                </Link>
            </section>

            <footer className="footer">
                <span>Authentiq</span>
                <span>Content authenticity infrastructure for modern teams</span>
                <span>© 2026 Authentiq</span>
            </footer>
        </main>
    );
}
