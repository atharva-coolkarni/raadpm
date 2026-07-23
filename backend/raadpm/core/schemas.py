"""Pydantic request and response models."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    subject: str = Field(..., min_length=1, examples=["UPI failures spiking"])
    body: str = Field(..., min_length=1)
    sender: str = ""


class AnalyzeResponse(BaseModel):
    priority: str
    category: str
    risk_level: str
    risk_score: int
    confidence: int
    owner: str
    recommended_team: str
    sla: str
    runbook: str
    intent: str
    actions: List[Dict[str, Any]]
    reasoning: str
    signals: List[str] = []
    masked_body: str
    masked_sender: str = ""
    draft_response: str
    engine: str
    engine_note: str = ""
    human_approval_required: bool
    pii_masked: bool


class StatusUpdate(BaseModel):
    status: str
    actor: str = "App Ops User"


class ApprovalRequest(BaseModel):
    decision: str = Field(..., pattern="^(approve|reject|edit)$")
    actor: str = "App Ops User"
    draft_response: Optional[str] = None
    note: str = ""


class TaskUpdate(BaseModel):
    status: str
    actor: str = "App Ops User"
