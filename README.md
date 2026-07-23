# RAADPM — Responsible AI Assisted Decision & Priority Manager

**MailOps AI for banking operations.** An operational mailbox receives hundreds of messages a day —
UPI failures, ATM outages, audit evidence requests, change approvals, vendor escalations. RAADPM
reads each one, classifies it, extracts the actions hiding inside it, suggests an owner and an SLA,
drafts a response, and records every decision so an auditor can reconstruct it later.

A human always approves before anything is sent.

---

## Run it

Two terminals. No database, no Docker, no API keys required.

### Backend

```bash
cd backend
pip install -r requirements.txt
python generate_data.py          # writes 100 emails, 40 tasks, 20 runbooks, 30 audit logs
uvicorn app:app --reload         # http://127.0.0.1:8000
```

Interactive API docs: <http://127.0.0.1:8000/docs>

### Frontend

```bash
cd frontend
npm install
npm run dev                      # http://localhost:5173
```

That is the whole setup. The rule engine runs entirely offline, so the demo works with no network.

---

## Architecture

```
raadpm/
├── backend/
│   ├── app.py                       # FastAPI entrypoint, CORS, router wiring, /health
│   ├── generate_data.py             # seeded corpus generator (fixed seed = identical demo)
│   ├── requirements.txt
│   ├── .env.example                 # optional free-tier LLM config
│   ├── data/                        # the "database": five JSON files
│   │   ├── emails.json  tasks.json  runbooks.json  audit.json  analytics.json
│   └── raadpm/
│       ├── core/
│       │   ├── store.py             # JSON load / cache / write-back, audit append
│       │   └── schemas.py           # pydantic request and response models
│       ├── routers/
│       │   ├── dashboard.py  emails.py  analyze.py
│       │   ├── tasks.py  analytics.py  audit.py  runbooks.py
│       └── services/
│           ├── rules_engine.py      # deterministic triage: priority, category, owner, PII, actions
│           └── ai_service.py        # the ONLY file that talks to an LLM, with rule fallback
└── frontend/
    └── src/
        ├── components/
        │   ├── ui/                  # shadcn-style primitives: button, card, badge, input, tabs…
        │   ├── layout/              # AppShell, Sidebar, Topbar, ResponsibleAIBar
        │   ├── common/              # PriorityBadge, StatusPill, ConfidenceMeter, EmptyState…
        │   ├── dashboard/           # KpiCard, Charts, TriageQueue, ResponsibleAIPanel
        │   ├── inbox/               # EmailListItem, InboxToolbar, Pagination
        │   └── email/               # AnalysisPanel, DraftResponseCard
        ├── pages/                   # the nine screens
        ├── hooks/queries.ts         # TanStack Query hooks
        ├── lib/                     # api.ts (axios), utils.ts, constants.ts
        └── types/index.ts           # shared domain types
```

**Stack.** React 18 · Vite · TypeScript · TailwindCSS · shadcn-style components · React Router ·
TanStack Query · Axios · Framer Motion · Lucide · Recharts · FastAPI · JSON storage.

---

## Screens

| Screen | What it does |
| --- | --- |
| **Dashboard** | Six KPI cards, priority donut, category bars, 14-day volume trend, resolution and SLA trend, live triage queue, Responsible AI status |
| **Inbox** | Two-pane command centre: filterable list on the left, full AI analysis rail on the right. Search, sort, priority and category filters, bulk selection, pagination |
| **Email detail** | Original vs masked view, linked actions, metadata, and the complete analysis panel |
| **AI analysis** | Paste any message and run the engine live — see priority, signals, masking, actions and the draft |
| **Actions** | Every extracted action with owner, team, due date and overdue state. Move tasks through their lifecycle |
| **Analytics** | Headline metrics plus eight charts: priority, category, volume, SLA, confidence bands, owner load, department load, action pipeline |
| **Audit logs** | Every AI decision and human override, filterable by actor and event, exportable to CSV |
| **Knowledge base** | 20 runbooks with steps, owning team, effort estimate and linked message count |
| **Settings** | Engine status, confidence threshold, Responsible AI guardrails (locked on), data source health |

Sidebar folders — High priority, Audit & compliance, Security, Infrastructure, Change management,
Incidents — plus quick filters for Unread, Flagged, SLA at risk and Overdue, all with live counts.

---

## How the triage works

Every message runs through `rules_engine.analyze()`:

1. **PII masking first.** Phone numbers, email addresses, card numbers, account numbers, IFSC codes
   and PAN are replaced before anything else happens — including before any model call.
2. **Priority** from severity keywords, matched on whole words so "severity" never triggers on
   `sev`. `outage`, `critical`, `data breach` → P1; `degraded`, `latency`, `mismatch` → P2.
3. **Category** by weighted scoring across 11 domains, with subject-line keywords counted double.
4. **Owner and team** from the standing ownership matrix for that category.
5. **Risk score and confidence** from signal density and body length.
6. **Runbook** matched from the library, **actions** extracted by intent patterns
   (provide / approve / review / restore / investigate / escalate / remediate / schedule).
7. **Reasoning** recorded — the exact signals that produced each field, shown in the UI.

### Optional LLM

`ai_service.py` is the single integration point. Set a free-tier provider in the backend
environment:

```bash
RAADPM_AI_PROVIDER=groq          # or gemini, or openrouter
GROQ_API_KEY=your_free_key
```

The model's judgement fields are merged over the rule baseline; masking and approval rules stay
local either way. **If the key is missing, the provider errors, or the call times out, triage falls
back to the rule engine silently** — the demo cannot break because of a network problem.

---

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/dashboard` | KPIs, charts, triage queue, Responsible AI status |
| GET | `/emails` | List with `q`, `priority`, `category`, `status`, `owner`, `folder`, `sort`, `page` |
| GET | `/emails/counts` | Live sidebar folder counts |
| GET | `/emails/{id}` | Full record with runbook, related messages and linked tasks |
| PATCH | `/emails/{id}/status` | Change status, writes an audit entry |
| POST | `/emails/{id}/approval` | Approve, reject or edit a draft — writes an audit entry |
| POST | `/emails/{id}/reanalyze` | Re-run triage and persist the refreshed result |
| POST | `/analyze` | Triage arbitrary subject and body |
| GET | `/tasks` · PATCH `/tasks/{id}` | Extracted actions and lifecycle |
| GET | `/analytics` | All chart series plus headline metrics |
| GET | `/audit` | Filterable decision trail |
| GET | `/runbooks` · `/runbooks/{id}` | Knowledge base |
| GET | `/health` · `/meta/filters` | Service status and filter options |

---

## Responsible AI

Not a badge — these are wired into the behaviour:

- **PII masked** locally before analysis, and the masked view is the default on every record
- **Human in the loop** — P1, P2 and anything below the confidence threshold cannot auto-send
- **Explainable** — every classification carries the signals that produced it
- **Audit ready** — approvals, edits, rejections, overrides and status changes all append to an
  immutable trail, exportable as CSV
- **Synthetic data only** — no customer information anywhere in the corpus

---

## Two-minute demo path

1. **Dashboard** — open on the KPI strip and the risk score, point at the triage queue.
2. **High priority** in the sidebar — the P1 queue, with SLA-at-risk flags.
3. Click a UPI or ATM message — the analysis rail fills in: summary, confidence, extracted actions,
   suggested owner, runbook, reasoning.
4. Toggle **Original / Masked** on the full record to show masking.
5. Edit the draft, then **Approve & send**.
6. **Audit logs** — the approval you just made is at the top of the trail, attributed to you.
7. **AI analysis** — paste a fresh message with a phone number in it and run the engine live.

---

## Notes

- The corpus is generated with a fixed seed, so every teammate and every judge sees the same data.
  Regenerate any time with `python generate_data.py`.
- Approvals and status changes are written back to the JSON files, so they survive a page refresh
  during the demo. Delete `backend/data/` and regenerate for a clean slate.
- This is a hackathon prototype, not a production banking system: no authentication, no encryption
  at rest, and no real mailbox connection.
