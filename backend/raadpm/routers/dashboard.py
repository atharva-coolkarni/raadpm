from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter

from raadpm.core import store

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard")
def dashboard():
    emails = store.emails()
    tasks = store.tasks()
    analytics = store.analytics()

    open_states = ("New", "In Review", "Awaiting Approval", "In Progress")
    critical = [e for e in emails if e["priority"] == "P1"]
    high = [e for e in emails if e["priority"] in ("P1", "P2")]
    sla_risk = [e for e in emails if e["sla_at_risk"]]
    open_actions = [t for t in tasks if t["status"] != "Done"]
    auto_resolved = [e for e in emails if e["status"] in ("Resolved", "Closed")]

    avg_risk = round(sum(e["risk_score"] for e in emails) / max(1, len(emails)))
    avg_conf = round(sum(e["confidence"] for e in emails) / max(1, len(emails)))

    return {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "kpis": [
            {"key": "total_emails", "label": "Total emails", "value": len(emails),
             "delta": "+156 today", "trend": "up", "tone": "neutral"},
            {"key": "critical_emails", "label": "Critical emails", "value": len(critical),
             "delta": f"{round(len(critical) / max(1, len(emails)) * 100)}% of total",
             "trend": "up", "tone": "critical"},
            {"key": "open_actions", "label": "Open actions", "value": len(open_actions),
             "delta": f"+{sum(1 for t in open_actions if t['status'] == 'Open')} new",
             "trend": "up", "tone": "info"},
            {"key": "sla_at_risk", "label": "SLA at risk", "value": len(sla_risk),
             "delta": f"{round(len(sla_risk) / max(1, len(emails)) * 100)}% of volume",
             "trend": "down", "tone": "warning"},
            {"key": "risk_score", "label": "Today's risk score", "value": avg_risk,
             "delta": "vs 71 yesterday", "trend": "up", "tone": "critical"},
            {"key": "auto_resolved", "label": "Auto-resolved", "value": len(auto_resolved),
             "delta": "+8 today", "trend": "up", "tone": "success"},
        ],
        "charts": {
            "priority_distribution": analytics["priority_distribution"],
            "category_distribution": analytics["category_distribution"][:7],
            "daily_trend": analytics["daily_trend"],
            "resolution_trend": analytics["resolution_trend"],
        },
        "responsible_ai": [
            {"label": "PII masking", "status": "Active",
             "detail": f"{sum(1 for e in emails if e['pii_masked'])} messages masked before display"},
            {"label": "Human review", "status": "Enforced",
             "detail": f"{sum(1 for e in emails if e['human_approval_required'])} items require approval"},
            {"label": "Explainability", "status": "On",
             "detail": f"Average confidence {avg_conf}% with reasoning on every decision"},
            {"label": "Audit ready", "status": "Ready",
             "detail": f"{len(store.audit())} immutable events captured"},
        ],
        "queue": [
            {
                "id": e["id"], "subject": e["subject"], "priority": e["priority"],
                "category": e["category"], "owner": e["owner"], "sla": e["sla"],
                "risk_score": e["risk_score"], "confidence": e["confidence"],
                "timestamp": e["timestamp"], "status": e["status"],
            }
            for e in sorted(
                [e for e in emails if e["status"] in open_states],
                key=lambda e: ({"P1": 0, "P2": 1, "P3": 2, "P4": 3}[e["priority"]], -e["risk_score"]),
            )[:8]
        ],
        "workload": analytics["department_load"][:6],
    }
