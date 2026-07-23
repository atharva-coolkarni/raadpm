from __future__ import annotations

from fastapi import APIRouter

from raadpm.core import store

router = APIRouter(tags=["analytics"])


@router.get("/analytics")
def analytics():
    data = store.analytics()
    emails = store.emails()
    tasks = store.tasks()

    resolved = [e for e in emails if e["status"] in ("Resolved", "Closed")]
    sla_met = round(
        sum(r["sla_met_pct"] for r in data["resolution_trend"]) / len(data["resolution_trend"])
    )
    avg_handle = round(
        sum(r["avg_minutes"] for r in data["resolution_trend"]) / len(data["resolution_trend"])
    )

    return {
        **data,
        "headline": [
            {"label": "Messages triaged", "value": len(emails), "unit": ""},
            {"label": "Auto-resolution rate",
             "value": round(len(resolved) / max(1, len(emails)) * 100), "unit": "%"},
            {"label": "SLA met", "value": sla_met, "unit": "%"},
            {"label": "Average handling time", "value": avg_handle, "unit": " min"},
            {"label": "Actions extracted", "value": sum(len(e["actions"]) for e in emails), "unit": ""},
            {"label": "Tasks closed", "value": sum(1 for t in tasks if t["status"] == "Done"), "unit": ""},
        ],
        "owner_load": [
            {"name": owner, "value": sum(1 for e in emails if e["owner"] == owner)}
            for owner in sorted({e["owner"] for e in emails})
        ],
    }
