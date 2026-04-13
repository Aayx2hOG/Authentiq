"""FastAPI inference service for TruthLens text and image detection."""

from __future__ import annotations

import os
import tempfile
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageStat
from pypdf import PdfReader
from docx import Document
from pydantic import BaseModel, Field
from text_detection.detect import TextDetector


BASE_DIR = Path(__file__).resolve().parent
TEXT_MODEL_PATH = BASE_DIR / "text_detection" / "logistic_model.pkl"
TEXT_VECTORIZER_PATH = BASE_DIR / "text_detection" / "vectorizer.pkl"
IMAGE_MODEL_PATH = BASE_DIR / "image_detection" / "model_best.pth"
TEXT_FILE_EXTENSIONS = {".txt", ".md", ".csv", ".json", ".log", ".xml", ".html", ".pdf", ".docx"}


class TextAnalyzeRequest(BaseModel):
	text: str = Field(..., min_length=20, max_length=100_000)


class TextSignal(BaseModel):
	label: str
	value: str


class TextAnalyzeResponse(BaseModel):
	verdict: str
	verdict_class: str
	ai_probability: int
	confidence: str
	signals: list[TextSignal]


class FileSignal(BaseModel):
	label: str
	value: str


class FileAnalyzeResponse(BaseModel):
	verdict: str
	verdict_class: str
	ai_probability: int
	confidence: str
	signals: list[FileSignal]


app = FastAPI(title="Authentiq AI Service", version="1.0.0")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


def _confidence(probability: int, confidence_score: int | None = None) -> str:
	if confidence_score is not None:
		if confidence_score >= 72:
			return "High"
		if confidence_score >= 48:
			return "Medium"
		return "Low"

	distance = abs(probability - 50)
	if distance >= 26:
		return "High"
	if distance >= 14:
		return "Medium"
	return "Low"


TEXT_DETECTOR = TextDetector(model_path=TEXT_MODEL_PATH, vectorizer_path=TEXT_VECTORIZER_PATH)


def _resolve_image_model_path() -> Path | None:
	base = BASE_DIR / "image_detection"
	candidates = [
		IMAGE_MODEL_PATH,
		base / "model_best.pth.gz",
		base / "model_best.pth" / "model_best.pth",
		base / "model_best.pth" / "model_best.pth.gz",
		base / "model_final.pth",
	]
	for candidate in candidates:
		if candidate.is_file():
			return candidate
	return None


@app.get("/health")
def health_check() -> dict[str, Any]:
	return {
		"status": "ok",
		"text_model_loaded": TEXT_DETECTOR.model_loaded,
		"vectorizer_loaded": TEXT_DETECTOR.vectorizer_loaded,
		"image_model_present": _resolve_image_model_path() is not None,
	}


@app.post("/analyze/text", response_model=TextAnalyzeResponse)
def analyze_text(payload: TextAnalyzeRequest) -> TextAnalyzeResponse:
	analysis = TEXT_DETECTOR.analyze(payload.text)
	ai_probability = int(analysis["ai_probability"])
	margin = float(analysis.get("decision_margin", abs(ai_probability - 50)))
	threshold = 52 if margin < 8 else 50
	verdict_ai = ai_probability >= threshold
	confidence_score = int(analysis.get("confidence_score", max(1, min(99, int(margin * 1.8)))))

	signals = [
		TextSignal(label="Word Count", value=str(analysis["word_count"])),
		TextSignal(label="Sentence Count", value=str(analysis["sentence_count"])),
		TextSignal(label="Avg Sentence Length", value=f"{analysis['avg_sentence_length']} words"),
		TextSignal(label="Chunk Votes", value=str(analysis.get("chunk_count", 1))),
		TextSignal(label="Chunk Stability", value=f"{analysis.get('chunk_stability', 100)}%"),
		TextSignal(label="Confidence Score", value=f"{confidence_score}/100"),
		TextSignal(label="Classifier Source", value=str(analysis["classifier_source"])),
	]

	return TextAnalyzeResponse(
		verdict="Likely AI-Generated" if verdict_ai else "Likely Human",
		verdict_class="verdict-ai" if verdict_ai else "verdict-human",
		ai_probability=ai_probability,
		confidence=_confidence(ai_probability, confidence_score),
		signals=signals,
	)


def _predict_image(upload: UploadFile) -> FileAnalyzeResponse:
	if not upload.content_type or not upload.content_type.startswith("image/"):
		raise HTTPException(status_code=400, detail="Only image uploads are supported for image analysis.")

	from image_detection.detect import Detector  # Lazy import keeps boot light.
	resolved_image_model = _resolve_image_model_path()

	suffix = Path(upload.filename or "upload.jpg").suffix or ".jpg"
	with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
		tmp_path = Path(tmp.name)
		data = upload.file.read()
		tmp.write(data)

	try:
		if not resolved_image_model:
			image = Image.open(tmp_path).convert("RGB")
			stat = ImageStat.Stat(image)
			mean = sum(stat.mean) / max(len(stat.mean), 1)
			stddev = sum(stat.stddev) / max(len(stat.stddev), 1)
			# Heuristic fallback keeps API usable when no trained detector file is present.
			ai_probability = int(max(5, min(95, 50 + (mean - 128) * 0.2 - (stddev - 40) * 0.3)))
			verdict_ai = ai_probability >= 50

			return FileAnalyzeResponse(
				verdict="Likely AI-Generated" if verdict_ai else "Likely Real",
				verdict_class="verdict-ai" if verdict_ai else "verdict-human",
				ai_probability=ai_probability,
				confidence=_confidence(ai_probability),
				signals=[
					FileSignal(label="Analysis Source", value="Heuristic Fallback"),
					FileSignal(label="Mean Brightness", value=f"{mean:.1f}"),
					FileSignal(label="Texture Variance", value=f"{stddev:.1f}"),
					FileSignal(label="Model File", value="Not found or invalid"),
				],
			)

		detector = Detector(model_path=str(resolved_image_model))
		result = detector.predict(str(tmp_path))
		if not result:
			raise HTTPException(status_code=500, detail="Detection failed for the uploaded image.")

		ai_probability = int(round(float(result["ai_prob"])))
		verdict_ai = ai_probability >= 50

		return FileAnalyzeResponse(
			verdict="Likely AI-Generated" if verdict_ai else "Likely Real",
			verdict_class="verdict-ai" if verdict_ai else "verdict-human",
			ai_probability=ai_probability,
			confidence=_confidence(ai_probability),
			signals=[
				FileSignal(label="Real Probability", value=f"{result['real_prob']:.2f}%"),
				FileSignal(label="AI Probability", value=f"{result['ai_prob']:.2f}%"),
				FileSignal(label="AI Class Index", value=str(result.get("ai_class_index", 1))),
				FileSignal(label="Inference Time", value=f"{result['inference_time'] * 1000:.1f} ms"),
				FileSignal(label="Device", value=os.environ.get("TORCH_DEVICE", "auto")),
			],
		)
	finally:
		try:
			tmp_path.unlink(missing_ok=True)
		except Exception:
			pass


def _predict_text_file(upload: UploadFile) -> FileAnalyzeResponse:
	data = upload.file.read()
	if not data:
		raise HTTPException(status_code=400, detail="Uploaded text file is empty.")

	if len(data) > 2_000_000:
		raise HTTPException(status_code=400, detail="Text file is too large. Max size is 2MB.")

	file_ext = Path(upload.filename or "").suffix.lower()
	text = ""

	if file_ext == ".pdf":
		with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
			tmp_path = Path(tmp.name)
			tmp.write(data)
		try:
			reader = PdfReader(str(tmp_path))
			text = "\n".join((page.extract_text() or "") for page in reader.pages)
		finally:
			tmp_path.unlink(missing_ok=True)
	elif file_ext == ".docx":
		with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
			tmp_path = Path(tmp.name)
			tmp.write(data)
		try:
			doc = Document(str(tmp_path))
			text = "\n".join(p.text for p in doc.paragraphs)
		finally:
			tmp_path.unlink(missing_ok=True)
	else:
		try:
			text = data.decode("utf-8")
		except UnicodeDecodeError:
			text = data.decode("latin-1", errors="ignore")

	if len(text.strip()) < 20:
		raise HTTPException(status_code=400, detail="Text file content is too short for analysis.")

	analysis = TEXT_DETECTOR.analyze(text)
	ai_probability = int(analysis["ai_probability"])
	margin = float(analysis.get("decision_margin", abs(ai_probability - 50)))
	threshold = 52 if margin < 8 else 50
	verdict_ai = ai_probability >= threshold
	confidence_score = int(analysis.get("confidence_score", max(1, min(99, int(margin * 1.8)))))

	return FileAnalyzeResponse(
		verdict="Likely AI-Generated" if verdict_ai else "Likely Human",
		verdict_class="verdict-ai" if verdict_ai else "verdict-human",
		ai_probability=ai_probability,
		confidence=_confidence(ai_probability, confidence_score),
		signals=[
			FileSignal(label="File Name", value=upload.filename or "uploaded file"),
			FileSignal(label="Character Count", value=str(len(text))),
			FileSignal(label="Word Count", value=str(analysis["word_count"])),
			FileSignal(label="Chunk Votes", value=str(analysis.get("chunk_count", 1))),
			FileSignal(label="Chunk Stability", value=f"{analysis.get('chunk_stability', 100)}%"),
			FileSignal(label="Classifier Source", value=str(analysis["classifier_source"])),
		],
	)


@app.post("/analyze/file", response_model=FileAnalyzeResponse)
def analyze_file(file: UploadFile = File(...)) -> FileAnalyzeResponse:
	content_type = (file.content_type or "").lower()
	file_ext = Path(file.filename or "").suffix.lower()

	if content_type.startswith("image/"):
		return _predict_image(file)

	if content_type.startswith("text/") or file_ext in TEXT_FILE_EXTENSIONS:
		return _predict_text_file(file)

	raise HTTPException(
		status_code=400,
		detail="Unsupported file type. Use image files (.jpg, .jpeg, .png, .webp) or document/text files (.txt, .md, .csv, .json, .log, .xml, .html, .pdf, .docx).",
	)
