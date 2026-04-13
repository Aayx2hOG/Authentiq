"use client";

import React, { ChangeEvent, DragEvent, useMemo, useRef, useState } from "react";

type ApiSignal = {
    label: string;
    value: string;
};

type ApiResult = {
    verdict: string;
    verdict_class: string;
    ai_probability: number;
    confidence: string;
    signals: ApiSignal[];
};

const ALLOWED_EXT = [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "txt",
    "md",
    "csv",
    "json",
    "log",
    "xml",
    "html",
    "pdf",
    "docx",
];

export default function TruthLens() {
    const [activeTab, setActiveTab] = useState<"text" | "file">("text");

    const [textInput, setTextInput] = useState("");
    const [textLoading, setTextLoading] = useState(false);
    const [textError, setTextError] = useState<string | null>(null);
    const [textResult, setTextResult] = useState<ApiResult | null>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [fileLoading, setFileLoading] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const [fileResult, setFileResult] = useState<ApiResult | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectedExt = useMemo(() => {
        if (!selectedFile) return "";
        return (selectedFile.name.split(".").pop() || "").toLowerCase();
    }, [selectedFile]);

    const fileKind = useMemo(() => {
        if (!selectedFile) return "";
        if (selectedFile.type.startsWith("image/")) return "Image";
        if (["pdf", "docx"].includes(selectedExt)) return "Document";
        return "Text";
    }, [selectedFile, selectedExt]);

    const setFile = (file: File) => {
        const ext = (file.name.split(".").pop() || "").toLowerCase();
        if (!ALLOWED_EXT.includes(ext)) {
            setFileError(
                "Unsupported file type. Allowed: .jpg, .jpeg, .png, .webp, .txt, .md, .csv, .json, .log, .xml, .html, .pdf, .docx",
            );
            return;
        }

        if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
            setFilePreviewUrl(null);
        }

        setFileError(null);
        setFileResult(null);
        setSelectedFile(file);

        if (file.type.startsWith("image/")) {
            setFilePreviewUrl(URL.createObjectURL(file));
        }
    };

    const onFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) setFile(file);
    };

    const onDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragOver(false);
        const file = event.dataTransfer.files?.[0];
        if (file) setFile(file);
    };

    const analyzeText = async () => {
        const content = textInput.trim();
        setTextError(null);
        setTextResult(null);

        if (!content) {
            setTextError("Please add text before starting analysis.");
            return;
        }

        setTextLoading(true);
        try {
            const response = await fetch("/api/truthlens/text", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: content }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Text analysis failed.");
            }

            setTextResult(data);
        } catch (error) {
            setTextError(error instanceof Error ? error.message : "Text analysis failed.");
        } finally {
            setTextLoading(false);
        }
    };

    const analyzeFile = async () => {
        if (!selectedFile) {
            setFileError("Choose a file first.");
            return;
        }

        setFileError(null);
        setFileResult(null);
        setFileLoading(true);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile, selectedFile.name);

            const response = await fetch("/api/truthlens/file", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "File analysis failed.");
            }

            setFileResult(data);
        } catch (error) {
            setFileError(error instanceof Error ? error.message : "File analysis failed.");
        } finally {
            setFileLoading(false);
        }
    };

    const resetFileState = () => {
        if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
            setFilePreviewUrl(null);
        }
        setSelectedFile(null);
        setFileResult(null);
        setFileError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const renderResult = (data: ApiResult) => {
        return (
            <article className="result" aria-live="polite">
                <div className="result-top">
                    <p className="result-title">Detection result</p>
                    <span className={`badge ${data.verdict_class}`}>{data.verdict}</span>
                </div>

                <div className="prob-wrap">
                    <div className="prob-header">
                        <p className="prob-label">AI Probability</p>
                        <p className="prob-value">{data.ai_probability}%</p>
                    </div>
                    <div className="bar">
                        <div className="bar-fill" style={{ width: `${data.ai_probability}%` }}></div>
                    </div>
                </div>

                <div className="breakdown">
                    {data.signals?.map((item, idx) => (
                        <div className="score-row" key={`${item.label}-${idx}`}>
                            <span className="score-label">{item.label}</span>
                            <span className="score-value">{item.value}</span>
                        </div>
                    ))}
                </div>

                <div className="result-foot">
                    <span className="confidence">Confidence level: {data.confidence}</span>
                </div>

                <p className="disclaimer">Results are probabilistic. Not 100% conclusive.</p>
            </article>
        );
    };

    return (
        <>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
:root { --bg: #0b1020; --surface: #141a2e; --surface-muted: #11172a; --border: #2b3558; --primary: #4a7cff; --text: #e7ecff; --text-secondary: #a5b1d4; --danger: #ff7b69; --danger-bg: #30181a; --danger-text: #ffb4a7; --success-bg: #102a1f; --success-text: #7ce3ab; --soft-shadow: 0 8px 24px rgba(0, 0, 0, 0.35); --radius: 12px; }
* { box-sizing: border-box; }
.app { max-width: 980px; margin: 0 auto; padding: 36px 20px 56px; color: var(--text); }
body { background: radial-gradient(circle at top, #111938 0%, var(--bg) 45%); color: var(--text); }
.top-nav { display: flex; justify-content: flex-end; margin-bottom: 14px; }
.top-nav a { color: var(--text-secondary); text-decoration: none; font-size: 0.9rem; border: 1px solid var(--border); background: var(--surface); padding: 7px 12px; border-radius: 999px; }
.title { margin: 0; font-family: "Instrument Serif", serif; font-size: clamp(2.2rem, 5vw, 3.15rem); font-weight: 400; }
.subtitle { margin: 8px 0 0; font-size: 0.95rem; color: var(--text-secondary); max-width: 540px; line-height: 1.5; }
.tabs { display: flex; gap: 28px; border-bottom: 1px solid var(--border); margin-top: 28px; }
.tab { border: 0; border-bottom: 2px solid transparent; background: transparent; color: var(--text-secondary); padding: 0 0 12px; font-size: 1rem; font-weight: 500; cursor: pointer; }
.tab.active { color: var(--primary); border-bottom-color: var(--primary); }
.panel-shell { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--soft-shadow); margin-top: 16px; }
.panel { padding: 32px; }
.panel h2 { margin: 0 0 24px; font-family: "Instrument Serif", serif; font-weight: 400; font-size: clamp(1.7rem, 3vw, 2rem); }
.input-label { display: inline-block; margin-bottom: 10px; color: var(--text-secondary); }
textarea { width: 100%; min-height: 220px; border-radius: 10px; border: 1px solid var(--border); background: var(--surface-muted); color: var(--text); font-size: 1rem; line-height: 1.6; padding: 16px; resize: vertical; }
.meta-row { margin-top: 12px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.char-count, .hint { margin: 0; font-size: 0.9rem; color: var(--text-secondary); }
.btn { border: 1px solid transparent; border-radius: 8px; background: var(--primary); color: #f5f8ff; font-size: 0.98rem; font-weight: 600; padding: 12px 18px; cursor: pointer; }
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn.big { width: 100%; padding: 14px; }
.drop-zone { border: 1px dashed #3a4468; background: var(--surface-muted); border-radius: 10px; min-height: 190px; display: grid; place-items: center; text-align: center; padding: 20px; cursor: pointer; }
.drop-zone.dragover { border-color: var(--primary); background: #1a2340; }
.dz-sub { color: var(--text-secondary); line-height: 1.5; }
.browse { color: var(--primary); text-decoration: underline; cursor: pointer; }
.preview { margin-top: 16px; padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: #121a31; display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
.thumb { width: 84px; height: 84px; border-radius: 8px; border: 1px solid var(--border); object-fit: cover; background: #1a2340; display: grid; place-items: center; color: var(--text-secondary); font-size: 0.8rem; }
.file-name { margin: 0; font-weight: 600; word-break: break-word; }
.badges { margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap; }
.badge { display: inline-flex; align-items: center; border-radius: 999px; border: 1px solid #3a4468; background: #1a2340; color: #d4ddf9; font-size: 0.8rem; padding: 4px 10px; }
.loader { margin-top: 16px; border: 1px solid var(--border); border-radius: 10px; background: #121a31; padding: 12px 14px; display: flex; align-items: center; gap: 10px; }
.spinner { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #3a4468; border-top-color: var(--primary); animation: spin 0.8s linear infinite; }
.result { margin-top: 20px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); box-shadow: var(--soft-shadow); padding: 18px; }
.result-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
.result-title { margin: 0; color: var(--text-secondary); }
.badge.verdict-ai { background: var(--danger-bg); color: var(--danger-text); border-color: #f2d2ca; }
.badge.verdict-human { background: var(--success-bg); color: var(--success-text); border-color: #d5eadf; }
.prob-wrap { margin-bottom: 14px; }
.prob-header { margin-bottom: 8px; display: flex; justify-content: space-between; }
.prob-label { margin: 0; color: var(--text-secondary); }
.prob-value { margin: 0; font-size: 1.2rem; font-weight: 700; }
.bar { width: 100%; height: 10px; border-radius: 999px; background: #202949; overflow: hidden; }
.bar-fill { height: 100%; background: var(--danger); transition: width 700ms ease; }
.breakdown { border-top: 1px solid #2b3558; border-bottom: 1px solid #2b3558; }
.score-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #2b3558; }
.score-row:last-child { border-bottom: 0; }
.score-label { color: #b8c4e6; }
.score-value { font-weight: 600; color: #e7ecff; }
.result-foot { margin-top: 14px; display: flex; justify-content: space-between; }
.confidence { border-radius: 999px; border: 1px solid #3a4468; background: #1a2340; color: #c9d4f7; font-size: 0.82rem; padding: 5px 10px; }
.disclaimer { margin: 12px 0 0; font-size: 0.85rem; color: #96a4ca; font-style: italic; }
.error-msg { margin-top: 12px; color: #ff9a89; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 760px) { .app { padding: 24px 14px 34px; } .panel { padding: 24px 16px; } }
          `,
                }}
            />

            <main className="app">
                <div className="top-nav">
                    <a href="/">← Back to landing page</a>
                </div>

                <header className="hero">
                    <h1 className="title">Authentiq</h1>
                    <p className="subtitle">Unmask the Machine. Assess text and file authenticity with a clean forensic report workflow.</p>
                    <nav className="tabs" aria-label="Detector tabs">
                        <button className={`tab ${activeTab === "text" ? "active" : ""}`} onClick={() => setActiveTab("text")} type="button">Text Detector</button>
                        <button className={`tab ${activeTab === "file" ? "active" : ""}`} onClick={() => setActiveTab("file")} type="button">File Detector</button>
                    </nav>
                </header>

                <section className="panel-shell">
                    {activeTab === "text" ? (
                        <section className="panel" id="panel-text">
                            <h2>Text authenticity analysis</h2>
                            <label className="input-label" htmlFor="textInput">Text sample</label>
                            <textarea id="textInput" placeholder="Paste any text, article, essay, or message..." value={textInput} onChange={(e) => setTextInput(e.target.value)} aria-label="Text to analyze" />

                            <div className="meta-row">
                                <p className="char-count">{textInput.length} characters</p>
                                <p className="hint">Use at least a few sentences for a stronger signal.</p>
                            </div>

                            <button className="btn big" type="button" onClick={analyzeText} disabled={textLoading}>{textLoading ? "Analyzing..." : "Analyze Text"}</button>

                            {textLoading ? (
                                <div className="loader" aria-live="polite">
                                    <div className="spinner" aria-hidden="true"></div>
                                    <p>Analyzing writing patterns and semantic structure...</p>
                                </div>
                            ) : null}

                            {textError ? <p className="error-msg">{textError}</p> : null}
                            {textResult ? renderResult(textResult) : null}
                        </section>
                    ) : (
                        <section className="panel" id="panel-file">
                            <h2>File authenticity analysis</h2>

                            <div
                                className={`drop-zone ${dragOver ? "dragover" : ""}`}
                                tabIndex={0}
                                aria-label="Drag and drop zone"
                                onClick={() => fileInputRef.current?.click()}
                                onDragEnter={(e) => {
                                    e.preventDefault();
                                    setDragOver(true);
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragOver(true);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    setDragOver(false);
                                }}
                                onDrop={onDrop}
                            >
                                <input ref={fileInputRef} id="fileInput" type="file" accept=".jpg,.jpeg,.png,.webp,.txt,.md,.csv,.json,.log,.xml,.html,.pdf,.docx" hidden onChange={onFileInputChange} />
                                <div className="dz-inner">
                                    <p className="dz-title">Drop an image, text, PDF, or DOCX file</p>
                                    <p className="dz-sub">Drag and drop here, or <span className="browse">browse from your device</span><br />Supported formats: .jpg, .jpeg, .png, .webp, .txt, .md, .csv, .json, .log, .xml, .html, .pdf, .docx</p>
                                </div>
                            </div>

                            {selectedFile ? (
                                <div className="preview">
                                    {filePreviewUrl ? <img className="thumb" src={filePreviewUrl} alt="Selected file preview" /> : <div className="thumb">{fileKind}</div>}
                                    <div className="file-meta">
                                        <p className="file-name">{selectedFile.name}</p>
                                        <div className="badges">
                                            <span className="badge">{fileKind}</span>
                                            <span className="badge">{formatFileSize(selectedFile.size)}</span>
                                            <span className="badge">.{selectedExt}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            <div className="meta-row">
                                <p className="hint">We inspect visual artifacts for images and language signals for text/doc files.</p>
                            </div>

                            <button className="btn big" type="button" disabled={!selectedFile || fileLoading} onClick={analyzeFile}>{fileLoading ? "Scanning..." : "Scan File"}</button>

                            {fileLoading ? (
                                <div className="loader" aria-live="polite">
                                    <div className="spinner" aria-hidden="true"></div>
                                    <p>Reviewing file signals...</p>
                                </div>
                            ) : null}

                            {fileError ? <p className="error-msg">{fileError}</p> : null}
                            {fileResult ? (
                                <>
                                    {renderResult(fileResult)}
                                    <div className="result-foot" style={{ marginTop: 12 }}>
                                        <button className="btn" type="button" onClick={resetFileState}>Scan Another</button>
                                    </div>
                                </>
                            ) : null}
                        </section>
                    )}
                </section>
            </main>
        </>
    );
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
