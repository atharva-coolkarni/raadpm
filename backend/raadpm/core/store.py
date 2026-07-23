"""JSON-file backed store. No database, no ORM, no migrations.

Files are read once into memory at import time. Writes update memory and
persist back to disk so approvals survive a page refresh during the demo.
"""

from __future__ import annotations

import json
import threading
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
_LOCK = threading.Lock()
_CACHE: Dict[str, Any] = {}

FILES = {
    "emails": "emails.json",
    "tasks": "tasks.json",
    "runbooks": "runbooks.json",
    "audit": "audit.json",
    "analytics": "analytics.json",
}


def _path(name: str) -> Path:
    return DATA_DIR / FILES[name]


def load(name: str) -> Any:
    if name not in _CACHE:
        with _LOCK:
            if name not in _CACHE:
                path = _path(name)
                if not path.exists():
                    raise FileNotFoundError(
                        f"{path} is missing. Run `python generate_data.py` first."
                    )
                _CACHE[name] = json.loads(path.read_text(encoding="utf-8"))
    return _CACHE[name]


def save(name: str) -> None:
    with _LOCK:
        _path(name).write_text(json.dumps(_CACHE[name], indent=2), encoding="utf-8")


def emails() -> List[dict]:
    return load("emails")


def tasks() -> List[dict]:
    return load("tasks")


def runbooks() -> List[dict]:
    return load("runbooks")


def audit() -> List[dict]:
    return load("audit")


def analytics() -> dict:
    return load("analytics")


def find_email(email_id: str) -> dict | None:
    return next((e for e in emails() if e["id"] == email_id), None)


def find_runbook(runbook_id: str) -> dict | None:
    return next((r for r in runbooks() if r["id"] == runbook_id), None)


def find_task(task_id: str) -> dict | None:
    return next((t for t in tasks() if t["id"] == task_id), None)


def add_audit_entry(
    event: str,
    actor: str,
    entity_id: str,
    detail: str,
    outcome: str = "Success",
    confidence: int | None = None,
    entity_subject: str = "",
) -> dict:
    entries = audit()
    entry = {
        "id": f"AUD-{4000 + len(entries)}",
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "event": event,
        "actor": actor,
        "actor_type": "System" if actor == "System" else "Human",
        "entity_id": entity_id,
        "entity_subject": entity_subject,
        "detail": detail,
        "confidence": confidence,
        "outcome": outcome,
        "explainable": True,
    }
    entries.insert(0, entry)
    save("audit")
    return entry
