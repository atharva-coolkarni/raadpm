from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from raadpm.core import store
from raadpm.core.schemas import ApprovalRequest, StatusUpdate

router = APIRouter(prefix="/emails", tags=["emails"])


@router.get("")
def list_emails(
    q: Optional[str] = Query(None, description="Free text over subject, sender, body"),
    priority: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    owner: Optional[str] = None,
    folder: Optional[str] = Query(None, description="inbox|high-priority|actions|unread|flagged|sla-risk|overdue"),
    sort: str = Query("priority", pattern="^(priority|newest|oldest|risk|confidence)$"),
    page: int = 1,
    page_size: int = 20,
):
    items = list(store.emails())

    if q:
        needle = q.lower()
        items = [
            e for e in items
            if needle in e["subject"].lower()
            or needle in e["sender"].lower()
            or needle in e["body"].lower()
            or needle in e["category"].lower()
            or any(needle in tag for tag in e["tags"])
        ]
    if priority:
        wanted = {p.strip().upper() for p in priority.split(",")}
        items = [e for e in items if e["priority"] in wanted]
    if category:
        wanted_c = {c.strip().lower() for c in category.split(",")}
        items = [e for e in items if e["category"].lower() in wanted_c]
    if status:
        items = [e for e in items if e["status"].lower() == status.lower()]
    if owner:
        items = [e for e in items if e["owner"].lower() == owner.lower()]

    folder_filters = {
        "high-priority": lambda e: e["priority"] in ("P1", "P2"),
        "actions": lambda e: bool(e["actions"]),
        "unread": lambda e: e["unread"],
        "flagged": lambda e: e["flagged"],
        "sla-risk": lambda e: e["sla_at_risk"],
        "overdue": lambda e: e["sla_at_risk"] and e["status"] not in ("Resolved", "Closed"),
        "security": lambda e: e["category"] == "Security",
        "infrastructure": lambda e: e["category"] == "Infrastructure",
        "change-management": lambda e: e["category"] == "Change Management",
        "incidents": lambda e: e["category"] == "Incident Management",
        "audit-compliance": lambda e: e["category"] == "Audit & Compliance",
    }
    if folder and folder in folder_filters:
        items = [e for e in items if folder_filters[folder](e)]

    priority_rank = {"P1": 0, "P2": 1, "P3": 2, "P4": 3}
    sorters = {
        "priority": lambda e: (priority_rank[e["priority"]], e["timestamp"]),
        "newest": lambda e: e["timestamp"],
        "oldest": lambda e: e["timestamp"],
        "risk": lambda e: -e["risk_score"],
        "confidence": lambda e: -e["confidence"],
    }
    items.sort(key=sorters[sort], reverse=sort == "newest")

    total = len(items)
    start = max(0, (page - 1) * page_size)
    return {
        "items": items[start:start + page_size],
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": max(1, -(-total // page_size)),
    }


@router.get("/counts")
def folder_counts():
    items = store.emails()
    return {
        "inbox": len(items),
        "high-priority": sum(1 for e in items if e["priority"] in ("P1", "P2")),
        "actions": sum(len(e["actions"]) for e in items),
        "audit-compliance": sum(1 for e in items if e["category"] == "Audit & Compliance"),
        "security": sum(1 for e in items if e["category"] == "Security"),
        "infrastructure": sum(1 for e in items if e["category"] == "Infrastructure"),
        "change-management": sum(1 for e in items if e["category"] == "Change Management"),
        "incidents": sum(1 for e in items if e["category"] == "Incident Management"),
        "unread": sum(1 for e in items if e["unread"]),
        "flagged": sum(1 for e in items if e["flagged"]),
        "sla-risk": sum(1 for e in items if e["sla_at_risk"]),
        "overdue": sum(
            1 for e in items if e["sla_at_risk"] and e["status"] not in ("Resolved", "Closed")
        ),
    }


@router.get("/{email_id}")
def get_email(email_id: str):
    email = store.find_email(email_id)
    if not email:
        raise HTTPException(status_code=404, detail=f"Email {email_id} not found")

    runbook = store.find_runbook(email["runbook"])
    related = [
        {"id": e["id"], "subject": e["subject"], "priority": e["priority"],
         "timestamp": e["timestamp"], "status": e["status"]}
        for e in store.emails()
        if e["id"] != email_id and e["category"] == email["category"]
    ][:4]
    linked_tasks = [t for t in store.tasks() if t["email_id"] == email_id]

    if email["unread"]:
        email["unread"] = False
        store.save("emails")

    return {**email, "runbook_detail": runbook, "related_emails": related, "tasks": linked_tasks}


@router.patch("/{email_id}/status")
def update_status(email_id: str, payload: StatusUpdate):
    email = store.find_email(email_id)
    if not email:
        raise HTTPException(status_code=404, detail=f"Email {email_id} not found")
    previous = email["status"]
    email["status"] = payload.status
    store.save("emails")
    store.add_audit_entry(
        event="Status changed",
        actor=payload.actor,
        entity_id=email_id,
        entity_subject=email["subject"],
        detail=f"Status moved from {previous} to {payload.status}",
        confidence=email["confidence"],
    )
    return email


@router.post("/{email_id}/approval")
def record_approval(email_id: str, payload: ApprovalRequest):
    email = store.find_email(email_id)
    if not email:
        raise HTTPException(status_code=404, detail=f"Email {email_id} not found")

    if payload.draft_response:
        email["draft_response"] = payload.draft_response

    events = {
        "approve": ("Draft response approved", "Resolved",
                    "Human approved the AI-generated response before send"),
        "reject": ("Draft response rejected", "In Review",
                   "Human rejected the AI-generated response"),
        "edit": ("Draft response edited", "In Review",
                 "Human amended the AI draft prior to approval"),
    }
    event, new_status, detail = events[payload.decision]
    email["status"] = new_status
    email["approval"] = {
        "decision": payload.decision,
        "actor": payload.actor,
        "note": payload.note,
    }
    store.save("emails")

    entry = store.add_audit_entry(
        event=event,
        actor=payload.actor,
        entity_id=email_id,
        entity_subject=email["subject"],
        detail=f"{detail}. {payload.note}".strip(),
        confidence=email["confidence"],
    )
    return {"email": email, "audit_entry": entry}
