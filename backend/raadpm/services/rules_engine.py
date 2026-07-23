"""Deterministic, keyword-driven triage engine.

This is the fallback (and default) analyser for RAADPM. It never calls the
network, so the demo works on an air-gapped laptop in front of judges.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Tuple

# --------------------------------------------------------------------------
# Signal dictionaries
# --------------------------------------------------------------------------

P1_TERMS = [
    "outage", "down", "critical", "sev1", "p1", "data breach", "data loss",
    "production failure", "unavailable", "not working for all", "fraud",
    "ransomware", "mass failure", "customers impacted", "cbs down",
]
P2_TERMS = [
    "urgent", "failure", "degraded", "latency", "slow", "escalation",
    "high severity", "vulnerability", "sla breach", "intermittent",
    "capacity", "threshold", "declined", "timeout", "not received", "blocked",
    "expire", "expiry", "mismatch",
]
P3_TERMS = [
    "request", "approval", "review", "pending", "reminder", "access",
    "change", "schedule", "evidence", "clarification",
]

CATEGORY_RULES: List[Tuple[str, List[str]]] = [
    ("Incident Management", ["incident", "inc0", "outage", "sev1", "sev2", "restored",
                             "root cause", "bridge"]),
    ("Security", ["vulnerability", "vulnerabilities", "phishing", "malware", "cve", "veracode",
                  "data breach", "security breach", "unauthorized", "firewall", "cyber",
                  "threat intel", "ransomware", "scan"]),
    ("Core Banking", ["cbs", "core banking", "general ledger", "end of day batch",
                      "batch", "posting", "eod"]),
    ("Payments", ["upi", "neft", "rtgs", "imps", "settlement", "transaction", "payment",
                  "switch", "atm", "card", "pos"]),
    ("Audit & Compliance", ["audit", "evidence", "compliance", "regulatory", "rbi",
                            "attestation", "access review", "control", "policy"]),
    ("Change Management", ["change", "chg0", "cab", "release", "deployment", "rollback",
                           "maintenance window", "patch"]),
    ("Infrastructure", ["database", "db0", "storage", "capacity", "server", "cpu", "disk",
                        "network", "vpn", "bandwidth", "cluster", "backup"]),
    ("Access Management", ["password", "reset", "locked", "login", "sso", "mfa",
                           "provisioning", "revoke", "entitlement"]),
    ("Vendor Management", ["vendor", "contract", "sow", "invoice", "third party", "msa",
                           "governance forum", "penalty"]),
    ("Reporting", ["weekly report", "operations report", "monthly report", "weekly",
                   "dashboard", "metrics", "no action required"]),
]

OWNER_RULES: Dict[str, Tuple[str, str]] = {
    # category -> (suggested owner, recommended team)
    "Incident Management": ("Ravi Menon", "Major Incident Team"),
    "Core Banking": ("Sanjay Iyer", "Core Banking Support"),
    "Security": ("Neha Kulkarni", "Cyber Defence Centre"),
    "Payments": ("Arjun Bhatia", "Payments Operations"),
    "Audit & Compliance": ("Divya Raghavan", "Risk & Compliance"),
    "Change Management": ("Mihir Sethi", "Change Advisory Board"),
    "Infrastructure": ("Payal Shetty", "Core Infrastructure"),
    "Access Management": ("Aamit Verma", "Identity & Access Team"),
    "Vendor Management": ("Rooshi Nanda", "Vendor Governance"),
    "Reporting": ("App Ops User", "Application Operations"),
    "General": ("App Ops User", "Application Operations"),
}

SLA_BY_PRIORITY = {"P1": "15 min", "P2": "1 hour", "P3": "8 hours", "P4": "24 hours"}
RISK_BY_PRIORITY = {"P1": "Critical", "P2": "High", "P3": "Medium", "P4": "Low"}

RUNBOOK_RULES: List[Tuple[str, List[str]]] = [
    ("RB-011", ["cbs", "end of day batch", "general ledger"]),
    ("RB-001", ["upi", "payment", "transaction", "settlement"]),
    ("RB-002", ["atm", "switch", "card"]),
    ("RB-003", ["vpn", "network", "latency", "bandwidth"]),
    ("RB-004", ["password", "locked", "reset", "mfa"]),
    ("RB-005", ["vulnerability", "cve", "veracode", "patch"]),
    ("RB-006", ["database", "capacity", "storage", "disk"]),
    ("RB-007", ["audit", "evidence", "access review"]),
    ("RB-008", ["change", "chg0", "cab", "rollback"]),
    ("RB-009", ["phishing", "malware", "ransomware"]),
    ("RB-010", ["backup", "restore", "recovery"]),
    ("RB-013", ["certificate", "certificates", "tls"]),
    ("RB-015", ["vendor", "invoice", "sla breach"]),
    ("RB-018", ["reconciliation", "branch"]),
]

ACTION_PATTERNS: List[Tuple[str, str]] = [
    (r"\b(provide|share|send|attach)\b", "Provide the requested artefact to the requester"),
    (r"\b(approve|approval|sign[- ]off)\b", "Obtain approval from the accountable owner"),
    (r"\b(review|validate|verify|confirm)\b", "Review and confirm completeness of the details"),
    (r"\b(restore|restart|failover|bounce)\b", "Restore service using the linked runbook"),
    (r"\b(investigate|root cause|rca)\b", "Investigate and document the root cause"),
    (r"\b(escalate|escalation)\b", "Escalate to the accountable team lead"),
    (r"\b(patch|remediate|fix)\b", "Plan remediation and record the target date"),
    (r"\b(schedule|plan|window)\b", "Schedule the activity and publish the window"),
]

PII_PATTERNS: List[Tuple[str, str]] = [
    (r"\b[\w.+-]+@[\w-]+\.[\w.]+\b", "[EMAIL_MASKED]"),
    (r"\b(?:\+91[- ]?)?[6-9]\d{9}\b", "[PHONE_MASKED]"),
    (r"\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b", "[CARD_MASKED]"),
    (r"\b[A-Z]{4}0[A-Z0-9]{6}\b", "[IFSC_MASKED]"),
    (r"\b\d{9,18}\b", "[ACCOUNT_MASKED]"),
    (r"\b[A-Z]{5}\d{4}[A-Z]\b", "[PAN_MASKED]"),
]


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------

def _hits(text: str, terms: List[str]) -> List[str]:
    """Whole-word keyword match, so 'sev' never fires inside 'severity'."""
    found = []
    for term in terms:
        if re.search(rf"(?<![a-z0-9]){re.escape(term)}(?![a-z])", text):
            found.append(term)
    return found


def mask_pii(text: str) -> str:
    """Replace anything that looks like customer or staff PII."""
    masked = text
    for pattern, token in PII_PATTERNS:
        masked = re.sub(pattern, token, masked)
    return masked


def detect_priority(text: str) -> Tuple[str, List[str]]:
    p1 = _hits(text, P1_TERMS)
    p2 = _hits(text, P2_TERMS)
    p3 = _hits(text, P3_TERMS)
    if p1:
        return "P1", p1
    if len(p2) >= 2:
        return "P1" if "vulnerability" in p2 and "critical" in text else "P2", p2
    if p2:
        return "P2", p2
    if p3:
        return "P3", p3
    return "P4", []


def detect_category(text: str, subject: str = "") -> Tuple[str, List[str]]:
    """Score every category; keywords in the subject line count double."""
    subject_lc = subject.lower()
    best, best_hits, best_score = "General", [], 0
    for category, terms in CATEGORY_RULES:
        found = _hits(text, terms)
        if not found:
            continue
        score = len(found) + len(_hits(subject_lc, terms))
        if score > best_score:
            best, best_hits, best_score = category, found, score
    return best, best_hits


def detect_runbook(text: str) -> str:
    for runbook_id, terms in RUNBOOK_RULES:
        if _hits(text, terms):
            return runbook_id
    return "RB-000"


def extract_actions(text: str, category: str) -> List[Dict[str, Any]]:
    actions: List[Dict[str, Any]] = []
    for pattern, label in ACTION_PATTERNS:
        if re.search(pattern, text):
            actions.append(
                {
                    "id": f"ACT-{len(actions) + 1}",
                    "label": label,
                    "weight": "Primary" if not actions else "Secondary",
                }
            )
        if len(actions) == 3:
            break
    if not actions:
        actions.append(
            {"id": "ACT-1", "label": f"Acknowledge and triage under {category}", "weight": "Primary"}
        )
    return actions


def score_confidence(signal_count: int, body_length: int) -> int:
    """Confidence grows with signal density and shrinks on very short bodies."""
    base = 62 + min(signal_count, 6) * 5
    if body_length < 120:
        base -= 8
    return max(48, min(97, base))


def risk_score(priority: str, signals: int) -> int:
    base = {"P1": 88, "P2": 72, "P3": 54, "P4": 31}[priority]
    return min(99, base + min(signals, 4) * 2)


def build_draft_response(subject: str, category: str, priority: str, team: str) -> str:
    sla = SLA_BY_PRIORITY[priority]
    return (
        f"Subject: Re: {subject}\n\n"
        "Hi Team,\n\n"
        "Thank you for reaching out. We have logged this request with the "
        f"{team} and classified it as {priority} under {category}.\n\n"
        f"Our target first response for this classification is {sla}. "
        "We will share a status update once the assigned engineer has "
        "reviewed the details, and we will confirm here as soon as the "
        "action is complete.\n\n"
        "Please reply to this thread if any additional context becomes available.\n\n"
        "Regards,\nApplication Operations Team"
    )


# --------------------------------------------------------------------------
# Public entry point
# --------------------------------------------------------------------------

def analyze(subject: str, body: str, sender: str = "") -> Dict[str, Any]:
    """Full rule-based triage of one message."""
    raw = f"{subject}\n{body}".lower()

    priority, priority_signals = detect_priority(raw)
    category, category_signals = detect_category(raw, subject)
    owner, team = OWNER_RULES.get(category, OWNER_RULES["General"])
    signals = priority_signals + category_signals
    confidence = score_confidence(len(signals), len(body))
    risk = risk_score(priority, len(signals))

    intent_map = {
        "Incident Management": "Report a service disruption",
        "Core Banking": "Report a core banking batch or posting failure",
        "Security": "Report a security finding requiring remediation",
        "Payments": "Report a payment channel failure",
        "Audit & Compliance": "Request audit evidence or control confirmation",
        "Change Management": "Seek approval for a planned change",
        "Infrastructure": "Raise an infrastructure capacity or health concern",
        "Access Management": "Request access or credential remediation",
        "Vendor Management": "Progress a vendor commercial or delivery item",
        "Reporting": "Share an operational update",
        "General": "Share operational information",
    }

    return {
        "priority": priority,
        "category": category,
        "risk_level": RISK_BY_PRIORITY[priority],
        "risk_score": risk,
        "confidence": confidence,
        "owner": owner,
        "recommended_team": team,
        "sla": SLA_BY_PRIORITY[priority],
        "runbook": detect_runbook(raw),
        "actions": extract_actions(raw, category),
        "intent": intent_map.get(category, "Share operational information"),
        "masked_body": mask_pii(body),
        "masked_sender": mask_pii(sender),
        "signals": sorted(set(signals))[:8],
        "reasoning": (
            f"Matched {len(signals)} triage signal(s). "
            f"Priority {priority} was set from severity keywords "
            f"({', '.join(priority_signals[:3]) or 'no severity keywords, defaulted'}). "
            f"Category {category} was set from domain keywords "
            f"({', '.join(category_signals[:3]) or 'no domain keywords, defaulted'}). "
            f"Routing follows the standing ownership matrix for {category}."
        ),
        "draft_response": build_draft_response(subject, category, priority, team),
        "engine": "rules",
        "human_approval_required": priority in ("P1", "P2") or confidence < 80,
        "pii_masked": mask_pii(body) != body or mask_pii(sender) != sender,
    }
