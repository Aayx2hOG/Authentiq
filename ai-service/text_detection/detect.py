"""Text authenticity detector for AI-vs-human classification."""

from __future__ import annotations

import re
from statistics import pstdev
from pathlib import Path
from typing import Any

import joblib


class TextDetector:
    """Loads a trained text model and provides prediction helpers."""

    def __init__(self, model_path: str | Path, vectorizer_path: str | Path) -> None:
        self.model_path = Path(model_path)
        self.vectorizer_path = Path(vectorizer_path)
        self.model: Any | None = None
        self.vectorizer: Any | None = None
        self._load()

    @property
    def model_loaded(self) -> bool:
        return self.model is not None

    @property
    def vectorizer_loaded(self) -> bool:
        return self.vectorizer is not None

    @property
    def source(self) -> str:
        return "Model" if self.model_loaded and self.vectorizer_loaded else "Heuristic"

    def _load(self) -> None:
        if not self.model_path.exists() or not self.vectorizer_path.exists():
            return

        try:
            self.model = joblib.load(self.model_path)
            self.vectorizer = joblib.load(self.vectorizer_path)
        except Exception:
            self.model = None
            self.vectorizer = None

    @staticmethod
    def _clean_text(text: str) -> str:
        cleaned = text.lower()
        # Keep sentence punctuation as it carries style signal in both model and heuristics.
        cleaned = re.sub(r"[^a-z\s.,!?;:'\"-]", " ", cleaned)
        return re.sub(r"\s+", " ", cleaned).strip()

    @staticmethod
    def _split_into_chunks(text: str, chunk_words: int = 180, stride_words: int = 120) -> list[str]:
        words = text.split()
        if not words:
            return []
        if len(words) <= chunk_words:
            return [" ".join(words)]

        chunks: list[str] = []
        for start in range(0, len(words), stride_words):
            end = start + chunk_words
            chunks.append(" ".join(words[start:end]))
            if end >= len(words):
                break
        return chunks

    @staticmethod
    def _heuristic_probability(text: str) -> int:
        words = re.findall(r"\w+", text.lower())
        if not words:
            return 50

        unique_ratio = len(set(words)) / len(words)
        avg_word_len = sum(len(w) for w in words) / len(words)
        sentence_endings = re.findall(r"[.!?]+", text)
        sentence_count = max(1, len(sentence_endings))
        avg_sentence_len = len(words) / sentence_count
        punctuation_density = len(re.findall(r"[!?.:,;]", text)) / max(len(text), 1)
        comma_rate = len(re.findall(r",", text)) / max(sentence_count, 1)

        long_words = sum(1 for w in words if len(w) >= 8) / len(words)
        repeated_trigrams = len(re.findall(r"\b(\w+\s+\w+\s+\w+)\b(?=.*\1)", " ".join(words[:700])))
        repetition_ratio = min(1.0, repeated_trigrams / 12)

        # Human writing tends to have broader lexical variation and sentence-length bursts.
        sentence_lengths = [len(s.split()) for s in re.split(r"[.!?]+", text) if s.strip()]
        sent_len_std = pstdev(sentence_lengths) if len(sentence_lengths) >= 2 else 0.0
        burstiness = min(1.0, sent_len_std / 18)

        score = 50.0
        score += (0.22 - unique_ratio) * 110
        score += (avg_word_len - 4.9) * 6
        score += (16 - min(avg_sentence_len, 35)) * 0.9
        score += (0.045 - min(punctuation_density, 0.09)) * 260
        score += (0.35 - min(comma_rate, 1.2)) * 15
        score += repetition_ratio * 14
        score += long_words * 8
        score -= burstiness * 18

        return max(3, min(97, int(round(score))))

    def _model_probability(self, cleaned_text: str) -> tuple[int, list[float]]:
        vec = self.vectorizer.transform([cleaned_text])
        if hasattr(self.model, "predict_proba"):
            probability = float(self.model.predict_proba(vec)[0][1]) * 100
            return int(round(probability)), [probability]

        prediction = self.model.predict(vec)[0]
        fallback = 85.0 if int(prediction) == 1 else 15.0
        return int(round(fallback)), [fallback]

    def _chunked_model_probability(self, text: str) -> tuple[int, list[float]]:
        cleaned = self._clean_text(text)
        chunks = self._split_into_chunks(cleaned)
        if not chunks:
            return 50, [50.0]

        chunk_probs: list[float] = []
        for chunk in chunks:
            vec = self.vectorizer.transform([chunk])
            if hasattr(self.model, "predict_proba"):
                chunk_probs.append(float(self.model.predict_proba(vec)[0][1]) * 100)
            else:
                prediction = self.model.predict(vec)[0]
                chunk_probs.append(85.0 if int(prediction) == 1 else 15.0)

        # Use a trimmed mean to reduce impact of one noisy chunk.
        ordered = sorted(chunk_probs)
        if len(ordered) >= 5:
            ordered = ordered[1:-1]
        mean_score = sum(ordered) / len(ordered)
        return int(round(mean_score)), chunk_probs

    def predict_probability(self, text: str) -> int:
        if not self.model_loaded or not self.vectorizer_loaded:
            return self._heuristic_probability(text)

        model_prob, _ = self._chunked_model_probability(text)
        heuristic_prob = self._heuristic_probability(text)
        blended = model_prob * 0.82 + heuristic_prob * 0.18
        return int(round(max(1, min(99, blended))))

    def analyze(self, text: str) -> dict[str, int | float | str]:
        word_count = len(re.findall(r"\w+", text))
        sentence_count = max(1, len(re.findall(r"[.!?]+", text)))
        avg_sentence_length = round(word_count / sentence_count, 1)

        heuristic_prob = self._heuristic_probability(text)
        chunk_count = 1
        chunk_stability = 100.0

        if self.model_loaded and self.vectorizer_loaded:
            model_prob, chunk_probs = self._chunked_model_probability(text)
            chunk_count = len(chunk_probs)
            chunk_stability = max(0.0, 100 - min(100.0, pstdev(chunk_probs) * 2.6 if len(chunk_probs) > 1 else 0.0))
            ai_probability = int(round(max(1, min(99, model_prob * 0.82 + heuristic_prob * 0.18))))
        else:
            ai_probability = heuristic_prob

        margin = abs(ai_probability - 50)
        confidence_score = int(round(max(1, min(99, margin * 1.7 + (word_count / 45) + (chunk_stability * 0.16)))))

        return {
            "ai_probability": ai_probability,
            "word_count": word_count,
            "sentence_count": sentence_count,
            "avg_sentence_length": avg_sentence_length,
            "classifier_source": self.source,
            "chunk_count": chunk_count,
            "chunk_stability": round(chunk_stability, 1),
            "confidence_score": confidence_score,
            "decision_margin": margin,
            "heuristic_probability": heuristic_prob,
        }
