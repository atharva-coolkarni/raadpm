from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from raadpm.core import store

router = APIRouter(tags=["knowledge"])


@router.get("/runbooks")
def list_runbooks(q: Optional[str] = Query(None), team: Optional[str] = None):
    items = list(store.runbooks())
    if q:
        needle = q.lower()
        items = [r for r in items if needle in r["title"].lower()
                 or needle in r["id"].lower()
                 or any(needle in s.lower() for s in r["steps"])]
    if team:
        items = [r for r in items if r["owner_team"].lower() == team.lower()]

    usage = {}
    for email in store.emails():
        usage[email["runbook"]] = usage.get(email["runbook"], 0) + 1

    return {
        "items": [{**r, "linked_emails": usage.get(r["id"], 0)} for r in items],
        "total": len(items),
        "teams": sorted({r["owner_team"] for r in store.runbooks()}),
    }


@router.get("/runbooks/{runbook_id}")
def get_runbook(runbook_id: str):
    runbook = store.find_runbook(runbook_id)
    if not runbook:
        raise HTTPException(status_code=404, detail=f"Runbook {runbook_id} not found")
    linked = [
        {"id": e["id"], "subject": e["subject"], "priority": e["priority"]}
        for e in store.emails() if e["runbook"] == runbook_id
    ][:10]
    return {**runbook, "linked_emails": linked}
