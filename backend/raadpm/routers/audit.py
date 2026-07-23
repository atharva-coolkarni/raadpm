from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Query

from raadpm.core import store

router = APIRouter(tags=["audit"])


@router.get("/audit")
def audit_logs(
    q: Optional[str] = Query(None),
    actor_type: Optional[str] = None,
    event: Optional[str] = None,
    limit: int = 200,
):
    items = list(store.audit())
    if q:
        needle = q.lower()
        items = [a for a in items if needle in a["event"].lower()
                 or needle in a["actor"].lower()
                 or needle in a["entity_id"].lower()
                 or needle in a["entity_subject"].lower()]
    if actor_type:
        items = [a for a in items if a["actor_type"].lower() == actor_type.lower()]
    if event:
        items = [a for a in items if a["event"].lower() == event.lower()]

    return {
        "items": items[:limit],
        "total": len(items),
        "events": sorted({a["event"] for a in store.audit()}),
        "summary": {
            "human_actions": sum(1 for a in store.audit() if a["actor_type"] == "Human"),
            "system_actions": sum(1 for a in store.audit() if a["actor_type"] == "System"),
            "explainable": sum(1 for a in store.audit() if a["explainable"]),
        },
    }
