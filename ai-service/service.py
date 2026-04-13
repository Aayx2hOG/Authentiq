"""FastAPI inference service for TruthLens text and image detection."""

from __future__ import annotations

import os
import re
import tempfile
from pathlib import Path
from typing import Any

import joblib
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageStat
from pypdf import PdfReader
from docx import Document
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model.pkl"
VECTORIZER_PATH = BASE_DIR / "vectorizer.pkl"
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


def _confidence(probability: int) -> str:
	if probability >= 78 or probability <= 22:
		return "High"
	if probability >= 45 and probability <= 77:
		return "Medium"
	return "Low"


def _load_text_model() -> tuple[Any | None, Any | None]:
	if not MODEL_PATH.exists() or not VECTORIZER_PATH.exists():
		return None, None
	try:
		model = joblib.load(MODEL_PATH)
		vectorizer = joblib.load(VECTORIZER_PATH)
		return model, vectorizer
	except Exception:
		return None, None


TEXT_MODEL, TEXT_VECTORIZER = _load_text_model()


def _clean_text(text: str) -> str:
	cleaned = text.lower()
	cleaned = re.sub(r"[^a-z\s]", " ", cleaned)
	return re.sub(r"\s+", " ", cleaned).strip()


def _heuristic_probability(text: str) -> int:
	words = re.findall(r"\w+", text.lower())
	if not words:
		return 50

	unique_ratio = len(set(words)) / max(len(words), 1)
	avg_word_len = sum(len(w) for w in words) / len(words)
	punctuation_density = len(re.findall(r"[!?.:,;]", text)) / max(len(text), 1)

	score = (
		(1 - min(unique_ratio, 1.0)) * 45
		+ max(0.0, min(avg_word_len / 10, 1.0)) * 20
		+ max(0.0, min(punctuation_density * 12, 1.0)) * 35
	)
	return max(5, min(95, int(round(score))))


def _predict_text_probability(text: str) -> int:
	if TEXT_MODEL is None or TEXT_VECTORIZER is None:
		return _heuristic_probability(text)

	cleaned = _clean_text(text)
	vec = TEXT_VECTORIZER.transform([cleaned])

	if hasattr(TEXT_MODEL, "predict_proba"):
		probabilities = TEXT_MODEL.predict_proba(vec)[0]
		return int(round(float(probabilities[1]) * 100))

	prediction = TEXT_MODEL.predict(vec)[0]
	return 85 if int(prediction) == 1 else 15


@app.get("/health")
def health_check() -> dict[str, Any]:
	return {
		"status": "ok",
		"text_model_loaded": TEXT_MODEL is not None,
		"vectorizer_loaded": TEXT_VECTORIZER is not None,
		"image_model_present": IMAGE_MODEL_PATH.exists(),
	}


@app.post("/analyze/text", response_model=TextAnalyzeResponse)
def analyze_text(payload: TextAnalyzeRequest) -> TextAnalyzeResponse:
	ai_probability = _predict_text_probability(payload.text)
	verdict_ai = ai_probability >= 50

	word_count = len(re.findall(r"\w+", payload.text))
	sentence_count = max(1, len(re.findall(r"[.!?]+", payload.text)))
	avg_sentence_length = round(word_count / sentence_count, 1)

	signals = [
		TextSignal(label="Word Count", value=str(word_count)),
		TextSignal(label="Sentence Count", value=str(sentence_count)),
		TextSignal(label="Avg Sentence Length", value=f"{avg_sentence_length} words"),
		TextSignal(label="Classifier Source", value="Model" if TEXT_MODEL is not None else "Heuristic"),
	]

	return TextAnalyzeResponse(
		verdict="Likely AI-Generated" if verdict_ai else "Likely Human",
		verdict_class="verdict-ai" if verdict_ai else "verdict-human",
		ai_probability=ai_probability,
		confidence=_confidence(ai_probability),
		signals=signals,
	)


def _predict_image(upload: UploadFile) -> FileAnalyzeResponse:
	if not upload.content_type or not upload.content_type.startswith("image/"):
		raise HTTPException(status_code=400, detail="Only image uploads are supported for image analysis.")

	from image_detection.detect import Detector  # Lazy import keeps boot light.

	suffix = Path(upload.filename or "upload.jpg").suffix or ".jpg"
	with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
		tmp_path = Path(tmp.name)
		data = upload.file.read()
		tmp.write(data)

	try:
		if not IMAGE_MODEL_PATH.exists():
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
					FileSignal(label="Model File", value="Not found"),
				],
			)

		detector = Detector(model_path=str(IMAGE_MODEL_PATH))
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

	ai_probability = _predict_text_probability(text)
	verdict_ai = ai_probability >= 50
	word_count = len(re.findall(r"\w+", text))

	return FileAnalyzeResponse(
		verdict="Likely AI-Generated" if verdict_ai else "Likely Human",
		verdict_class="verdict-ai" if verdict_ai else "verdict-human",
		ai_probability=ai_probability,
		confidence=_confidence(ai_probability),
		signals=[
			FileSignal(label="File Name", value=upload.filename or "uploaded file"),
			FileSignal(label="Character Count", value=str(len(text))),
			FileSignal(label="Word Count", value=str(word_count)),
			FileSignal(label="Classifier Source", value="Model" if TEXT_MODEL is not None else "Heuristic"),
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
