from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from raadpm.core import store
from raadpm.core.schemas import TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("")
def list_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    owner: Optional[str] = None,
    q: Optional[str] = Query(None),
):
    items = list(store.tasks())
    if status:
        items = [t for t in items if t["status"].lower() == status.lower()]
    if priority:
        items = [t for t in items if t["priority"].upper() == priority.upper()]
    if owner:
        items = [t for t in items if t["owner"].lower() == owner.lower()]
    if q:
        needle = q.lower()
        items = [t for t in items if needle in t["title"].lower()
                 or needle in t["email_subject"].lower()]

    rank = {"P1": 0, "P2": 1, "P3": 2, "P4": 3}
    items.sort(key=lambda t: (rank[t["priority"]], t["due"]))
    return {
        "items": items,
        "total": len(items),
        "summary": {
            "open": sum(1 for t in items if t["status"] == "Open"),
            "in_progress": sum(1 for t in items if t["status"] == "In Progress"),
            "blocked": sum(1 for t in items if t["status"] == "Blocked"),
            "awaiting_approval": sum(1 for t in items if t["status"] == "Awaiting Approval"),
            "done": sum(1 for t in items if t["status"] == "Done"),
            "overdue": sum(1 for t in items if t["overdue"]),
        },
    }


@router.patch("/{task_id}")
def update_task(task_id: str, payload: TaskUpdate):
    task = store.find_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    previous = task["status"]
    task["status"] = payload.status
    if payload.status == "Done":
        task["overdue"] = False
        task["approved_by"] = payload.actor
    store.save("tasks")
    store.add_audit_entry(
        event="Task updated",
        actor=payload.actor,
        entity_id=task_id,
        entity_subject=task["title"],
        detail=f"Task moved from {previous} to {payload.status}",
    )
    return task
