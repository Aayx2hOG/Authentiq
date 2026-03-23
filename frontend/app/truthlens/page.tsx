
"use client";
import React from 'react';

export default function TruthLens() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
    :root {
      --bg: #f7f6f3;
      --surface: #ffffff;
      --surface-muted: #fafafa;
      --border: #e2e0db;
      --primary: #1a1a2e;
      --text: #1c1c1c;
      --text-secondary: #6b6b6b;
      --danger: #d4380d;
      --danger-bg: #fff1ee;
      --danger-text: #a8200d;
      --success-bg: #f0faf4;
      --success-text: #166534;
      --soft-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
      --radius: 12px;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      min-height: 100%;
      color: var(--text);
      background: var(--bg);
      font-family: "IBM Plex Sans", "Geist", sans-serif;
    }

    body {
      position: relative;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='%239b978f' fill-opacity='0.06'%3E%3Ccircle cx='8' cy='12' r='1'/%3E%3Ccircle cx='42' cy='28' r='0.9'/%3E%3Ccircle cx='78' cy='10' r='0.8'/%3E%3Ccircle cx='125' cy='36' r='1'/%3E%3Ccircle cx='148' cy='18' r='0.7'/%3E%3Ccircle cx='18' cy='66' r='0.8'/%3E%3Ccircle cx='56' cy='84' r='1'/%3E%3Ccircle cx='93' cy='58' r='0.75'/%3E%3Ccircle cx='138' cy='76' r='0.8'/%3E%3Ccircle cx='28' cy='126' r='1'/%3E%3Ccircle cx='76' cy='138' r='0.85'/%3E%3Ccircle cx='112' cy='120' r='0.7'/%3E%3Ccircle cx='150' cy='144' r='1'/%3E%3C/g%3E%3C/svg%3E");
    }

    .app {
      max-width: 980px;
      margin: 0 auto;
      padding: 36px 20px 56px;
    }

    .hero {
      margin-bottom: 26px;
    }

    .top-nav {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 14px;
    }

    .top-nav a {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.9rem;
      border: 1px solid var(--border);
      background: var(--surface);
      padding: 7px 12px;
      border-radius: 999px;
      transition: color 180ms ease, border-color 180ms ease;
    }

    .top-nav a:hover {
      color: var(--primary);
      border-color: #c6c2ba;
    }

    .title {
      margin: 0;
      font-family: "Instrument Serif", serif;
      font-size: clamp(2.2rem, 5vw, 3.15rem);
      font-weight: 400;
      line-height: 1.05;
    }

    .subtitle {
      margin: 8px 0 0;
      font-size: 0.95rem;
      color: var(--text-secondary);
      max-width: 540px;
      line-height: 1.5;
    }

    .tabs {
      display: flex;
      gap: 28px;
      border-bottom: 1px solid var(--border);
      margin-top: 28px;
      padding-bottom: 0;
    }

    .tab {
      border: 0;
      border-bottom: 2px solid transparent;
      background: transparent;
      color: var(--text-secondary);
      padding: 0 0 12px;
      margin: 0;
      font-size: 1rem;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: color 180ms ease, border-color 180ms ease, opacity 180ms ease;
      opacity: 0.9;
    }

    .tab:hover {
      opacity: 1;
      color: var(--text);
    }

    .tab.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
    }

    .panel-shell {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--soft-shadow);
      overflow: hidden;
      position: relative;
    }

    .panels {
      min-height: 530px;
      position: relative;
    }

    .panel {
      position: absolute;
      inset: 0;
      padding: 44px;
      opacity: 0;
      pointer-events: none;
      transform: translateY(8px);
      transition: opacity 220ms ease, transform 220ms ease;
    }

    .panel.active {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    .panel h2 {
      margin: 0 0 24px;
      font-family: "Instrument Serif", serif;
      font-weight: 400;
      font-size: clamp(1.7rem, 3vw, 2rem);
      line-height: 1.2;
    }

    .input-label {
      display: inline-block;
      margin-bottom: 10px;
      color: var(--text-secondary);
      font-size: 0.95rem;
    }

    textarea {
      width: 100%;
      min-height: 220px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--surface-muted);
      color: var(--text);
      font: inherit;
      font-size: 1rem;
      line-height: 1.6;
      padding: 16px;
      resize: vertical;
      outline: none;
      transition: border-color 150ms ease;
    }

    textarea:focus {
      border-color: var(--primary);
    }

    textarea::placeholder {
      color: #9a9a9a;
    }

    .meta-row {
      margin-top: 12px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .char-count,
    .hint {
      margin: 0;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .btn {
      border: 1px solid transparent;
      border-radius: 8px;
      background: var(--primary);
      color: #ffffff;
      font: inherit;
      font-size: 0.98rem;
      font-weight: 600;
      padding: 12px 18px;
      cursor: pointer;
      transition: background-color 180ms ease, opacity 180ms ease;
    }

    .btn:hover:not(:disabled) {
      background: #111124;
    }

    .btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .btn.big {
      width: 100%;
      padding: 14px;
      font-size: 1rem;
    }

    .drop-zone {
      border: 1px dashed #bfbcb6;
      background: var(--surface-muted);
      border-radius: 10px;
      min-height: 210px;
      display: grid;
      place-items: center;
      text-align: center;
      padding: 20px;
      transition: border-color 150ms ease, background-color 150ms ease;
      cursor: pointer;
    }

    .drop-zone.dragover {
      border-color: var(--primary);
      background: #f3f2ef;
    }

    .dz-inner {
      max-width: 420px;
    }

    .dz-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .dz-sub {
      margin: 10px 0 0;
      color: var(--text-secondary);
      line-height: 1.5;
      font-size: 0.92rem;
    }

    .browse {
      color: var(--primary);
      text-decoration: underline;
      cursor: pointer;
    }

    .preview {
      margin-top: 16px;
      padding: 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: #fcfcfb;
      display: none;
      gap: 14px;
      align-items: center;
      flex-wrap: wrap;
    }

    .preview.show {
      display: flex;
    }

    .thumb {
      width: 84px;
      height: 84px;
      border-radius: 8px;
      border: 1px solid var(--border);
      object-fit: cover;
      background: #f2f2f2;
    }

    .video-thumb {
      display: grid;
      place-items: center;
      font-size: 0.78rem;
      color: var(--text-secondary);
      font-weight: 600;
    }

    .file-meta {
      min-width: 0;
      flex: 1;
    }

    .file-name {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      word-break: break-word;
    }

    .badges {
      margin-top: 8px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      border: 1px solid #dad8d2;
      background: #f6f5f2;
      color: #4f4f4f;
      font-size: 0.8rem;
      padding: 4px 10px;
      line-height: 1.2;
    }

    .loader {
      margin-top: 16px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: #fcfcfb;
      padding: 12px 14px;
      display: none;
      align-items: center;
      gap: 10px;
    }

    .loader.show {
      display: flex;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid #d8d5cf;
      border-top-color: var(--primary);
      animation: spin 0.8s linear infinite;
      flex-shrink: 0;
    }

    .loader p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.92rem;
    }

    .result {
      margin-top: 20px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--surface);
      box-shadow: var(--soft-shadow);
      padding: 18px;
      display: none;
    }

    .result.show {
      display: block;
      animation: fadeIn 200ms ease;
    }

    .result-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 14px;
    }

    .result-title {
      margin: 0;
      font-size: 1rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .badge.verdict-ai {
      background: var(--danger-bg);
      color: var(--danger-text);
      border-color: #f2d2ca;
    }

    .badge.verdict-human {
      background: var(--success-bg);
      color: var(--success-text);
      border-color: #d5eadf;
    }

    .prob-wrap {
      margin-bottom: 14px;
    }

    .prob-header {
      margin-bottom: 8px;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .prob-label {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.92rem;
    }

    .prob-value {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text);
    }

    .bar {
      width: 100%;
      height: 10px;
      border-radius: 999px;
      background: #eceae6;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      width: 0;
      background: var(--danger);
      transition: width 700ms ease;
    }

    .breakdown {
      border-top: 1px solid #efede9;
      border-bottom: 1px solid #efede9;
    }

    .score-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid #efede9;
    }

    .score-row:last-child {
      border-bottom: 0;
    }

    .score-label {
      color: #4b4b4b;
      font-size: 0.94rem;
    }

    .score-value {
      font-weight: 600;
      font-size: 0.9rem;
      color: #2d2d2d;
    }

    .result-foot {
      margin-top: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .confidence {
      border-radius: 999px;
      border: 1px solid #dddad4;
      background: #f4f3f1;
      color: #575757;
      font-size: 0.82rem;
      padding: 5px 10px;
      display: inline-flex;
      align-items: center;
    }

    .btn.ghost {
      background: #ffffff;
      color: var(--primary);
      border-color: #d4d2cd;
      font-weight: 500;
    }

    .btn.ghost:hover {
      background: #f7f6f3;
    }

    .disclaimer {
      margin: 12px 0 0;
      font-size: 0.85rem;
      color: #7b7b7b;
      font-style: italic;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @media (max-width: 760px) {
      .app {
        padding: 24px 14px 34px;
      }

      .tabs {
        gap: 18px;
      }

      .panel {
        padding: 26px 18px;
      }

      .panels {
        min-height: 590px;
      }

      .meta-row {
        margin-bottom: 18px;
      }

      .result-foot {
        align-items: flex-start;
      }
    }
  `}} />
      
  <main className="app">
    <div className="top-nav">
      <a href="authentiq_landing_page.html">← Back to landing page</a>
    </div>

    <header className="hero">
      <h1 className="title">Authentiq</h1>
      <p className="subtitle">Unmask the Machine. Assess text and image authenticity with a clean forensic report workflow.</p>
      <nav className="tabs" aria-label="Detector tabs">
        <button className="tab active" data-tab="text" type="button">Text Detector</button>
        <button className="tab" data-tab="file" type="button">File Detector</button>
      </nav>
    </header>

    <section className="panel-shell">
      <div className="panels">
        <section className="panel active" id="panel-text">
          <h2>Text authenticity analysis</h2>
          <label className="input-label" htmlFor="textInput">Text sample</label>
          <textarea id="textInput" placeholder="Paste any text, article, essay, or message..." aria-label="Text to analyze"></textarea>

          <div className="meta-row">
            <p className="char-count" id="charCount">0 characters</p>
            <p className="hint">Use at least a few sentences for a stronger signal.</p>
          </div>

          <button className="btn big" id="analyzeTextBtn" type="button">Analyze Text</button>

          <div className="loader" id="textLoader" aria-live="polite">
            <div className="spinner" aria-hidden="true"></div>
            <p>Analyzing writing patterns and semantic structure...</p>
          </div>

          <article className="result" id="textResult" aria-live="polite"></article>
        </section>

        <section className="panel" id="panel-file">
          <h2>File authenticity analysis</h2>

          <div className="drop-zone" id="dropZone" tabIndex={0} aria-label="Drag and drop zone">
            <input id="fileInput" type="file" accept=".jpg,.jpeg,.png,.webp,.mp4,.mov" hidden />
            <div className="dz-inner">
              <p className="dz-title">Drop an image file</p>
              <p className="dz-sub">Drag and drop here, or <span className="browse" id="browseTrigger">browse from your device</span><br />Supported formats: .jpg, .jpeg, .png, .webp</p>
            </div>
          </div>

          <div className="preview" id="filePreview"></div>

          <div className="meta-row">
            <p className="hint">We inspect visual artifacts, texture patterns, and metadata anomalies.</p>
          </div>

          <button className="btn big" id="scanFileBtn" type="button" disabled>Scan File</button>

          <div className="loader" id="fileLoader" aria-live="polite">
            <div className="spinner" aria-hidden="true"></div>
            <p>Reviewing visual and metadata signatures...</p>
          </div>

          <article className="result" id="fileResult" aria-live="polite"></article>
        </section>
      </div>
    </section>
  </main>

  <script dangerouslySetInnerHTML={{ __html: `
    const tabs = document.querySelectorAll(".tab");
    const panelText = document.getElementById("panel-text");
    const panelFile = document.getElementById("panel-file");

    const textInput = document.getElementById("textInput");
    const charCount = document.getElementById("charCount");
    const analyzeTextBtn = document.getElementById("analyzeTextBtn");
    const textLoader = document.getElementById("textLoader");
    const textResult = document.getElementById("textResult");

    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const browseTrigger = document.getElementById("browseTrigger");
    const filePreview = document.getElementById("filePreview");
    const scanFileBtn = document.getElementById("scanFileBtn");
    const fileLoader = document.getElementById("fileLoader");
    const fileResult = document.getElementById("fileResult");

    const allowedExt = ["jpg", "jpeg", "png", "webp", "mp4", "mov"];
    let selectedFile = null;
    let scanIndex = 0;

    function setTab(mode) {
      tabs.forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.tab === mode);
      });

      panelText.classList.toggle("active", mode === "text");
      panelFile.classList.toggle("active", mode === "file");
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => setTab(tab.dataset.tab));
    });

    textInput.addEventListener("input", () => {
      charCount.textContent = \`\${textInput.value.length} characters\`;
    });

    analyzeTextBtn.addEventListener("click", () => {
      const content = textInput.value.trim();
      textResult.classList.remove("show");

      if (!content) {
        textResult.innerHTML = "<p className='disclaimer'>Please add text before starting analysis.</p>";
        textResult.classList.add("show");
        return;
      }

      analyzeTextBtn.disabled = true;
      textLoader.classList.add("show");

      setTimeout(() => {
        const result = makeResult("text");
        renderResult(textResult, result, () => {
          textInput.value = "";
          charCount.textContent = "0 characters";
        });

        textLoader.classList.remove("show");
        analyzeTextBtn.disabled = false;
      }, 2000);
    });

    browseTrigger.addEventListener("click", () => fileInput.click());
    dropZone.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", () => {
      if (fileInput.files && fileInput.files[0]) {
        handleFile(fileInput.files[0]);
      }
    });

    ["dragenter", "dragover"].forEach((name) => {
      dropZone.addEventListener(name, (event) => {
        event.preventDefault();
        dropZone.classList.add("dragover");
      });
    });

    ["dragleave", "drop"].forEach((name) => {
      dropZone.addEventListener(name, (event) => {
        event.preventDefault();
        dropZone.classList.remove("dragover");
      });
    });

    dropZone.addEventListener("drop", (event) => {
      const file = event.dataTransfer.files && event.dataTransfer.files[0];
      if (file) handleFile(file);
    });

    scanFileBtn.addEventListener("click", () => {
      if (!selectedFile) return;

      scanFileBtn.disabled = true;
      fileLoader.classList.add("show");
      fileResult.classList.remove("show");

      setTimeout(() => {
        const result = makeResult("file");
        renderResult(fileResult, result, () => resetFileState(true));
        fileLoader.classList.remove("show");
        scanFileBtn.disabled = false;
      }, 2500);
    });

    function handleFile(file) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!allowedExt.includes(ext)) {
        alert("Unsupported file type. Allowed: .jpg, .jpeg, .png, .webp, .mp4, .mov");
        return;
      }

      selectedFile = file;
      scanFileBtn.disabled = false;
      fileResult.classList.remove("show");

      const isImage = file.type.startsWith("image/");
      const sizeLabel = formatFileSize(file.size);
      const objectUrl = isImage ? URL.createObjectURL(file) : null;

      filePreview.innerHTML = \`
        \${isImage
          ? \`<img className="thumb" src="\${objectUrl}" alt="Selected file preview" />\`
          : \`<div className="thumb video-thumb">Video</div>\`}
        <div className="file-meta">
          <p className="file-name">\${file.name}</p>
          <div className="badges">
            <span className="badge">\${isImage ? "Image" : "Video"}</span>
            <span className="badge">\${sizeLabel}</span>
            <span className="badge">.\${ext}</span>
          </div>
        </div>
      \`;

      filePreview.classList.add("show");
    }

    function formatFileSize(bytes) {
      if (bytes < 1024) return \`\${bytes} B\`;
      if (bytes < 1024 * 1024) return \`\${(bytes / 1024).toFixed(1)} KB\`;
      return \`\${(bytes / (1024 * 1024)).toFixed(2)} MB\`;
    }

    function confidenceFromProbability(probability) {
      if (probability >= 78 || probability <= 22) return "High";
      if (probability >= 45 && probability <= 77) return "Medium";
      return "Low";
    }

    function makeResult(mode) {
      scanIndex += 1;
      const aiLeaning = scanIndex % 2 === 1;
      const probability = aiLeaning ? randomInRange(69, 96) : randomInRange(9, 41);
      const verdict = aiLeaning ? "Likely AI-Generated" : "Likely Human";
      const verdictClass = aiLeaning ? "verdict-ai" : "verdict-human";
      const confidence = confidenceFromProbability(probability);

      const breakdown = mode === "text"
        ? [
            ["Perplexity Score", \`\${randomInRange(52, 98)} / 100\`],
            ["Burstiness Index", \`\${randomInRange(18, 88)}%\`],
            ["Semantic Consistency", \`\${randomInRange(45, 99)}%\`],
            ["Lexical Uniformity", \`\${randomInRange(30, 90)}%\`]
          ]
        : [
            ["GAN Artifact Score", \`\${randomInRange(12, 97)}%\`],
            ["Texture Inconsistency", \`\${randomInRange(16, 93)}%\`],
            ["Metadata Anomaly", \`\${randomInRange(5, 88)}%\`],
            ["Compression Pattern Drift", \`\${randomInRange(22, 95)}%\`]
          ];

      return { probability, verdict, verdictClass, confidence, breakdown };
    }

    function renderResult(container, data, resetHandler) {
      const rows = data.breakdown
        .map(([label, value]) => \`<div className="score-row"><span className="score-label">\${label}</span><span className="score-value">\${value}</span></div>\`)
        .join("");

      container.innerHTML = \`
        <div className="result-top">
          <p className="result-title">Detection result</p>
          <span className="badge \${data.verdictClass}">\${data.verdict}</span>
        </div>

        <div className="prob-wrap">
          <div className="prob-header">
            <p className="prob-label">AI Probability</p>
            <p className="prob-value">\${data.probability}%</p>
          </div>
          <div className="bar"><div className="bar-fill" style={{width: "0%"}}></div></div>
        </div>

        <div className="breakdown">\${rows}</div>

        <div className="result-foot">
          <span className="confidence">Confidence level: \${data.confidence}</span>
          <button className="btn ghost" type="button">Scan Another</button>
        </div>

        <p className="disclaimer">Results are probabilistic. Not 100% conclusive.</p>
      \`;

      container.classList.add("show");

      requestAnimationFrame(() => {
        const fill = container.querySelector(".bar-fill");
        if (fill) fill.style.width = \`\${data.probability}%\`;
      });

      const resetButton = container.querySelector(".btn.ghost");
      resetButton.addEventListener("click", () => {
        container.classList.remove("show");
        container.innerHTML = "";
        resetHandler();
      });
    }

    function resetFileState(clearInput) {
      selectedFile = null;
      filePreview.classList.remove("show");
      filePreview.innerHTML = "";
      scanFileBtn.disabled = true;
      if (clearInput) fileInput.value = "";
    }

    function randomInRange(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  ` }} />

    </>
  );
}
