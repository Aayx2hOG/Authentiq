# Authentiq

Authentiq is an AI-authenticity project with:
- `frontend` (Next.js app)
- `ai-service` (FastAPI inference service)

## One-Command Local Startup

From repository root:

```bash
./scripts/dev.sh
```

This starts:
- Frontend: `http://localhost:3000`
- AI Service: `http://localhost:8000`

## Manual Startup

### 1. AI Service

```bash
cd ai-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn service:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend

```bash
cd frontend
bun install
bun dev
```

## Supported File Detector Inputs

- Images: `.jpg`, `.jpeg`, `.png`, `.webp`
- Text and docs: `.txt`, `.md`, `.csv`, `.json`, `.log`, `.xml`, `.html`, `.pdf`, `.docx`
