from __future__ import annotations

from fastapi import APIRouter, HTTPException

from raadpm.core import store
from raadpm.core.schemas import AnalyzeRequest, AnalyzeResponse
from raadpm.services import ai_service

router = APIRouter(tags=["ai"])


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest):
    """Triage arbitrary text. Used by the live analyser on the AI Analysis page."""
    result = ai_service.analyze_email(payload.subject, payload.body, payload.sender)
    store.add_audit_entry(
        event="AI analysis executed",
        actor="System",
        entity_id="AD-HOC",
        entity_subject=payload.subject,
        detail=f"{result['engine']} engine classified message as {result['priority']}",
        confidence=result["confidence"],
    )
    return result


@router.post("/emails/{email_id}/reanalyze", response_model=AnalyzeResponse)
def reanalyze(email_id: str):
    """Re-run triage on a stored message and persist the refreshed result."""
    email = store.find_email(email_id)
    if not email:
        raise HTTPException(status_code=404, detail=f"Email {email_id} not found")

    result = ai_service.analyze_email(email["subject"], email["body"], email["sender_email"])
    email.update(
        {
            "priority": result["priority"],
            "category": result["category"],
            "risk": result["risk_level"],
            "risk_score": result["risk_score"],
            "confidence": result["confidence"],
            "owner": result["owner"],
            "recommended_team": result["recommended_team"],
            "sla": result["sla"],
            "runbook": result["runbook"],
            "actions": result["actions"],
            "reasoning": result["reasoning"],
            "intent": result["intent"],
        }
    )
    store.save("emails")
    store.add_audit_entry(
        event="AI analysis executed",
        actor="System",
        entity_id=email_id,
        entity_subject=email["subject"],
        detail=f"Re-analysed with the {result['engine']} engine",
        confidence=result["confidence"],
    )
    return result
