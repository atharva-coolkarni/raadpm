"""RAADPM API - Responsible AI Assisted Decision & Priority Manager.

Run with: uvicorn app:app --reload
"""

from __future__ import annotations

import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(Path(__file__).with_name(".env"))

from raadpm.core import store
from raadpm.routers import analytics, analyze, audit, dashboard, emails, runbooks, tasks

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")

app = FastAPI(
    title="RAADPM API",
    description="Responsible AI Assisted Decision & Priority Manager - hackathon prototype.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (dashboard.router, emails.router, analyze.router, tasks.router,
               analytics.router, audit.router, runbooks.router):
    app.include_router(router)


@app.get("/health", tags=["meta"])
def health():
    return {
        "status": "ok",
        "service": "raadpm-api",
        "ai_provider": os.getenv("RAADPM_AI_PROVIDER", "none"),
        "ai_mode": "llm" if os.getenv("RAADPM_AI_PROVIDER", "none") != "none" else "rules",
        "records": {
            "emails": len(store.emails()),
            "tasks": len(store.tasks()),
            "runbooks": len(store.runbooks()),
            "audit": len(store.audit()),
        },
    }


@app.get("/meta/filters", tags=["meta"])
def filters():
    items = store.emails()
    return {
        "priorities": ["P1", "P2", "P3", "P4"],
        "categories": sorted({e["category"] for e in items}),
        "statuses": sorted({e["status"] for e in items}),
        "owners": sorted({e["owner"] for e in items}),
        "departments": sorted({e["department"] for e in items}),
    }
