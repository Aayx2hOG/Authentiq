# Authentiq AI Service (FastAPI)

This service exposes text and image authenticity APIs for the Next.js frontend.

## Endpoints

- `GET /health`
- `POST /analyze/text`
- `POST /analyze/file` (image only)

## Run Locally

```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn service:app --host 0.0.0.0 --port 8000 --reload
```

## Text Request

```bash
curl -X POST http://127.0.0.1:8000/analyze/text \
  -H "Content-Type: application/json" \
  -d '{"text":"This is a sample passage long enough for scoring."}'
```

## File Request

```bash
curl -X POST http://127.0.0.1:8000/analyze/file \
  -F "file=@/absolute/path/to/image.jpg"
```

## Notes

- If `model.pkl` and `vectorizer.pkl` are present in `ai-service/`, text analysis uses the trained model.
- If those files are missing, text analysis falls back to a heuristic score.
- Image analysis requires `ai-service/image_detection/model_best.pth`.
