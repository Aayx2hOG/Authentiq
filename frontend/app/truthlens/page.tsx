"use client";

import Image from "next/image";
import Link from "next/link";
import React, { ChangeEvent, DragEvent, useMemo, useRef, useState } from "react";
import "./truthlens.css";

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
        const bandClass = data.ai_probability >= 50 ? "bar-fill ai" : "bar-fill human";
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
                        <div className={bandClass} style={{ width: `${data.ai_probability}%` }}></div>
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
            <main className="app">
                <div className="top-nav">
                    <Link href="/">← Back to landing page</Link>
                </div>

                <header className="hero">
                    <h1 className="title">TruthLens by Authentiq</h1>
                    <p className="subtitle">Professional authenticity checks for editorial teams, classrooms, and trust workflows. Run text or file analysis and get an explainable verdict.</p>
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
                                <p className="hint">For best accuracy, provide 80+ words.</p>
                            </div>

                            <button className="btn big" type="button" onClick={analyzeText} disabled={textLoading}>{textLoading ? "Analyzing..." : "Analyze Text"}</button>

                            {textLoading ? (
                                <div className="loader" aria-live="polite">
                                    <div className="spinner" aria-hidden="true"></div>
                                    <p>Analyzing style consistency, lexical structure, and chunk-level signals...</p>
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
                                    {filePreviewUrl ? (
                                        <Image
                                            className="thumb"
                                            src={filePreviewUrl}
                                            alt="Selected file preview"
                                            width={84}
                                            height={84}
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="thumb">{fileKind}</div>
                                    )}
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
                                <p className="hint">Images use a vision classifier. Documents use calibrated text analysis.</p>
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
