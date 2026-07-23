"""The one place in the codebase that talks to an LLM.

Everything else imports `analyze_email` from here. If no API key is present,
or the provider errors or times out, we silently return the deterministic
rule-based result so the demo never breaks.

Supported free tiers (set RAADPM_AI_PROVIDER + the matching key):
    groq        -> GROQ_API_KEY
    gemini      -> GEMINI_API_KEY
    openrouter  -> OPENROUTER_API_KEY
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any, Dict

import httpx

from raadpm.services import rules_engine

log = logging.getLogger("raadpm.ai")

PROVIDER = os.getenv("RAADPM_AI_PROVIDER", "none").lower()
TIMEOUT = float(os.getenv("RAADPM_AI_TIMEOUT", "12"))

_ENDPOINTS = {
    "groq": (
        "https://api.groq.com/openai/v1/chat/completions",
        os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"),
        "GROQ_API_KEY",
    ),
    "openrouter": (
        "https://openrouter.ai/api/v1/chat/completions",
        os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.1-8b-instruct:free"),
        "OPENROUTER_API_KEY",
    ),
    "gemini": (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')}:generateContent",
        os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
        "GEMINI_API_KEY",
    ),
}

SYSTEM_PROMPT = """You are the triage engine of a bank's operations mailbox.
Return ONLY a JSON object, no markdown, no prose, with exactly these keys:
priority (one of P1,P2,P3,P4), category, risk_level (Critical,High,Medium,Low),
risk_score (0-100 integer), confidence (0-100 integer), owner,
recommended_team, sla, intent, reasoning, summary,
actions (array of {id,label,weight}).
Be conservative: anything customer-impacting or security-related is P1 or P2."""


def _llm_available() -> bool:
    if PROVIDER not in _ENDPOINTS:
        return False
    _, _, key_name = _ENDPOINTS[PROVIDER]
    return bool(os.getenv(key_name))


def _call_llm(subject: str, body: str) -> Dict[str, Any] | None:
    url, model, key_name = _ENDPOINTS[PROVIDER]
    api_key = os.getenv(key_name, "")
    user_msg = f"Subject: {subject}\n\nBody:\n{body}"

    try:
        with httpx.Client(timeout=TIMEOUT) as client:
            if PROVIDER == "gemini":
                resp = client.post(
                    url,
                    params={"key": api_key},
                    json={
                        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
                        "contents": [{"parts": [{"text": user_msg}]}],
                        "generationConfig": {"response_mime_type": "application/json"},
                    },
                )
                resp.raise_for_status()
                text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
            else:
                resp = client.post(
                    url,
                    headers={"Authorization": f"Bearer {api_key}"},
                    json={
                        "model": model,
                        "temperature": 0.1,
                        "response_format": {"type": "json_object"},
                        "messages": [
                            {"role": "system", "content": SYSTEM_PROMPT},
                            {"role": "user", "content": user_msg},
                        ],
                    },
                )
                resp.raise_for_status()
                text = resp.json()["choices"][0]["message"]["content"]

        cleaned = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```")
        return json.loads(cleaned)
    except Exception as exc:  # noqa: BLE001 - demo must never crash on AI failure
        log.warning("LLM call failed (%s), falling back to rules: %s", PROVIDER, exc)
        return None


def analyze_email(subject: str, body: str, sender: str = "") -> Dict[str, Any]:
    """Analyse one message. Always returns a complete, valid result."""
    baseline = rules_engine.analyze(subject, body, sender)

    if not _llm_available():
        baseline["engine"] = "rules"
        baseline["engine_note"] = "No AI key configured - deterministic rule engine in use."
        return baseline

    enriched = _call_llm(subject, body)
    if not enriched:
        baseline["engine"] = "rules"
        baseline["engine_note"] = f"{PROVIDER} unavailable - fell back to rule engine."
        return baseline

    # Merge: LLM wins on judgement fields, rules keep the safety fields.
    merged = {**baseline}
    for field in (
        "priority", "category", "risk_level", "risk_score", "confidence",
        "owner", "recommended_team", "sla", "intent", "reasoning", "actions",
    ):
        if field in enriched and enriched[field] not in (None, "", []):
            merged[field] = enriched[field]

    merged["engine"] = PROVIDER
    merged["engine_note"] = f"Analysed by {PROVIDER}, PII masking applied locally."
    merged["human_approval_required"] = (
        merged["priority"] in ("P1", "P2") or int(merged.get("confidence", 0)) < 80
    )
    return merged
