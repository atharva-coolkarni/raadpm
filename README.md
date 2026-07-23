# RAADPM — Responsible AI Assisted Decision & Priority Manager

RAADPM is a hackathon prototype for triaging operational banking emails. It classifies incoming messages, identifies priority and risk, masks PII, extracts actions, recommends an owner and SLA, drafts a response, and records decisions in an audit trail.

The application is split into a React frontend and a FastAPI backend. It uses local JSON files for demo data—no database or Docker setup is required.

## Features

- Priority, category, owner, SLA, and risk recommendations
- Local PII masking before analysis
- Explainable rule-based triage that works without API keys
- Optional Groq, Gemini, or OpenRouter enrichment with a safe rule-engine fallback
- Human approval workflow and JSON-backed audit log
- Dashboard, inbox, AI analysis, tasks, analytics, audit logs, runbooks, and settings screens

## Project structure

```text
code-hack/
├── backend/
│   ├── app.py                 # FastAPI entrypoint
│   ├── generate_data.py       # Recreates the demo data set
│   ├── requirements.txt
│   ├── data/                  # JSON demo data
│   └── raadpm/
│       ├── core/              # Store and Pydantic schemas
│       ├── routers/           # API endpoints
│       └── services/          # Rules engine and optional LLM service
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Prerequisites

- Python 3.10+
- Node.js 18+

## Run locally

Start the backend in one terminal:

```powershell
cd backend
python -m pip install -r requirements.txt
uvicorn app:app --reload
```

The API will be available at <http://127.0.0.1:8000>. Interactive API documentation is available at <http://127.0.0.1:8000/docs>.

Start the frontend in a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite (normally <http://localhost:5173>). Do not open `frontend/index.html` directly.

## Optional LLM configuration

The default rule engine works fully offline. To enable an LLM provider, create `backend/.env` from the example:

```powershell
Copy-Item .env.example .env
```

Then set the provider and its matching key:

```env
RAADPM_AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key
```

Supported providers are `groq`, `gemini`, and `openrouter`. If no key is present, an API call fails, or a request times out, RAADPM falls back to the local rules engine. Never commit `.env` files.

## Demo data

The repository includes a seeded JSON corpus in `backend/data`. To replace it with a fresh copy of the same deterministic demo set:

```powershell
cd backend
python generate_data.py
```

Approvals and status changes are saved back to these JSON files. Regenerate the data to reset the demo.

## API overview

| Method | Route | Description |
| --- | --- | --- |
| GET | `/health` | Service and AI-provider status |
| GET | `/dashboard` | Dashboard KPIs and chart data |
| GET | `/emails` | Filterable email list |
| GET | `/emails/{id}` | Full email details and analysis |
| PATCH | `/emails/{id}/status` | Update an email status |
| POST | `/emails/{id}/approval` | Record an approval, rejection, or edit |
| POST | `/emails/{id}/reanalyze` | Re-run stored email triage |
| POST | `/analyze` | Analyze a new message |
| GET/PATCH | `/tasks`, `/tasks/{id}` | List or update extracted actions |
| GET | `/analytics`, `/audit`, `/runbooks` | Analytics, audit trail, and runbooks |

## Scripts

From `frontend/`:

```powershell
npm run dev     # Start Vite development server
npm run lint    # Type-check the frontend
npm run build   # Build the production frontend
```

## Responsible AI notes

- PII masking happens locally before analysis.
- P1, P2, and low-confidence messages require human approval before sending.
- Each analysis includes reasoning signals used to reach its result.
- This repository contains synthetic demo data only.

## Limitations

This is a demonstration project, not a production banking system. It has no authentication, persistent database, production secret management, or live mailbox integration.
