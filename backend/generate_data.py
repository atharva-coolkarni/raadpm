"""Seed generator for RAADPM.

Run once (or any time you want a fresh corpus):

    python generate_data.py

Writes JSON files into ./data. Seeded with a fixed random seed so every
teammate and every judge sees exactly the same demo.
"""

from __future__ import annotations

import json
import os
import random
import sys
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from raadpm.services import rules_engine  # noqa: E402

random.seed(20260718)

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)

NOW = datetime(2026, 7, 18, 9, 15)

DEPARTMENTS = [
    "IT Operations", "Payments", "Cyber Security", "Risk & Compliance",
    "Core Banking", "Digital Channels", "Infrastructure", "Branch Operations",
    "Vendor Governance", "Identity & Access",
]

SENDERS = [
    ("Sanjay Iyer", "sanjay.iyer@northbank.example.com", "Core Banking"),
    ("Ritika Bansal", "ritika.bansal@northbank.example.com", "Payments"),
    ("Karthik Nair", "karthik.nair@northbank.example.com", "Infrastructure"),
    ("Fatima Sheikh", "fatima.sheikh@northbank.example.com", "Cyber Security"),
    ("Anand Rao", "anand.rao@northbank.example.com", "Risk & Compliance"),
    ("Priya Deshmukh", "priya.deshmukh@northbank.example.com", "Branch Operations"),
    ("Vikram Salunkhe", "vikram.salunkhe@northbank.example.com", "IT Operations"),
    ("Meera Krishnan", "meera.krishnan@northbank.example.com", "Digital Channels"),
    ("Harsh Malhotra", "harsh.malhotra@vendorcorp.example.net", "Vendor Governance"),
    ("Service Desk", "servicedesk@northbank.example.com", "IT Operations"),
    ("Monitoring Bot", "noreply-monitoring@northbank.example.com", "Infrastructure"),
    ("Nikhil Joshi", "nikhil.joshi@northbank.example.com", "Identity & Access"),
]

# (subject template, body template, tags)
TEMPLATES = [
    (
        "UPI transaction failures spiking on handle @northbank",
        "Team, UPI collect requests are failing at {pct}% since {time}. Customers impacted across "
        "mobile and net banking. Switch logs show timeout against NPCI leg. This is a critical "
        "production outage, please engage the payments bridge immediately. Reference txn "
        "{acct} raised by customer on {phone}.",
        ["upi", "payments", "outage"],
    ),
    (
        "ATM network down - {count} terminals offline in {region} region",
        "{count} ATMs in the {region} circle went offline at {time}. Terminal health checks are "
        "failing and cash dispensing is unavailable. Branch managers are reporting customer "
        "queues. Requesting urgent restoration and an incident bridge.",
        ["atm", "channel", "outage"],
    ),
    (
        "VPN connectivity degraded for remote operations staff",
        "Since {time} the VPN concentrator is showing high latency and intermittent drops. "
        "Roughly {count} users in operations are affected and cannot reach internal apps. "
        "Please investigate the tunnel capacity and confirm restoration timeline.",
        ["vpn", "network", "access"],
    ),
    (
        "Password reset request - locked account for {name}",
        "Hi Service Desk, my account is locked after repeated login attempts. Please reset the "
        "password and confirm on {email}. Employee contact {phone}. I am unable to access the "
        "reconciliation console for today's cutoff.",
        ["access", "service-request"],
    ),
    (
        "Cyber alert: phishing campaign targeting branch staff",
        "Threat intel has flagged an active phishing campaign impersonating our HR portal. "
        "{count} mailboxes have received the lure. This is a critical security matter - please "
        "confirm mail flow rules are blocking the sender domain and review any credential "
        "submissions.",
        ["phishing", "security", "critical"],
    ),
    (
        "Audit evidence request - Q2 access review for privileged accounts",
        "Please provide the Q2 access review evidence for the sample of privileged accounts by "
        "18 Jul. This is required for audit testing under control ITGC-04. Kindly confirm the "
        "evidence pack is complete before submission.",
        ["audit", "access-review", "quarterly-control"],
    ),
    (
        "Database capacity alert - DB0{num} crossed 85% utilisation",
        "DB0{num} has crossed the 85% storage utilisation threshold at {time}. Growth trend "
        "suggests exhaustion within {count} days. Please review the trend and plan capacity "
        "expansion before the next settlement cycle.",
        ["database", "capacity", "infrastructure"],
    ),
    (
        "Network latency between DC and DR exceeding threshold",
        "Replication latency between the primary data centre and DR site has been above the "
        "agreed threshold since {time}. Current lag is {count} minutes which puts our RPO "
        "commitment at risk. Requesting investigation of the link utilisation.",
        ["network", "dr", "latency"],
    ),
    (
        "Vendor escalation - {vendor} SLA breach for {month}",
        "We need to escalate repeated SLA breaches by {vendor} during {month}. Response times "
        "have exceeded contractual limits on {count} tickets. Please review before the "
        "governance forum and confirm the penalty position.",
        ["vendor", "sla", "escalation"],
    ),
    (
        "CBS alert - end of day batch job {job} failed",
        "The core banking end of day batch {job} failed at {time} with a return code error. "
        "Downstream general ledger posting is blocked. This is a critical production failure "
        "requiring immediate recovery before the morning window.",
        ["cbs", "batch", "critical"],
    ),
    (
        "Compliance approval needed - revised data retention policy",
        "Please review and approve the revised data retention policy ahead of the regulatory "
        "submission. Legal has cleared the draft. Approval is pending from operations and risk.",
        ["compliance", "policy", "approval"],
    ),
    (
        "Branch escalation - cash reconciliation mismatch at {region} branch",
        "The {region} branch has reported a reconciliation mismatch for yesterday's cash "
        "position. Difference is under investigation by the branch operations team. Please "
        "confirm the supporting entries and escalate if unresolved by end of day.",
        ["branch", "reconciliation"],
    ),
    (
        "Weekly operations report - week {num}",
        "Please find the weekly operations update for week {num}. Incident volume is stable, "
        "change success rate improved, and the top three recurring issues are summarised in the "
        "attachment. No action required unless you have comments.",
        ["report", "weekly"],
    ),
    (
        "Reminder: {count} access certifications pending beyond 5 days",
        "This is a reminder that {count} access certifications remain pending for more than five "
        "days. Please review and complete the certification to avoid a control exception in the "
        "next audit cycle.",
        ["access-review", "reminder"],
    ),
    (
        "RITM: standard change approval needed - CHG0{num} storage increase",
        "Please review and approve the standard change CHG0{num} covering a storage increase for "
        "DB0{num} this weekend. Rollback plan is attached and the maintenance window is agreed "
        "with application owners.",
        ["change", "cab", "approval"],
    ),
    (
        "Veracode scan report - {count} critical vulnerabilities in web application",
        "The weekly scan has completed. {count} critical and {num} high severity vulnerabilities "
        "were detected in the internet banking web application. Remediation plan and target "
        "dates are required for the security review.",
        ["security", "vulnerability", "scan"],
    ),
    (
        "Incident update - INC10{num} resolved and closed",
        "INC10{num} has been resolved and closed at {time}. Root cause documented as a "
        "configuration drift on the load balancer. Permanent fix scheduled with the next change "
        "window. No further customer impact observed.",
        ["incident", "resolved"],
    ),
    (
        "Card settlement file not received from {vendor}",
        "The daily card settlement file from {vendor} has not been received for {time} cycle. "
        "Reconciliation is blocked and settlement posting cannot complete. Please chase the "
        "vendor and confirm expected delivery. Account reference {acct}.",
        ["settlement", "payments", "vendor"],
    ),
    (
        "Backup failure on {job} - restore validation required",
        "The nightly backup job {job} failed at {time}. Retention copy is available but restore "
        "validation has not been performed this month. Please investigate the failure and "
        "confirm recoverability.",
        ["backup", "infrastructure"],
    ),
    (
        "Firewall rule change request for new payment partner",
        "Requesting a firewall rule change to allow connectivity for the new payment partner "
        "integration. Business justification and risk assessment are attached. Please review and "
        "schedule the change through CAB.",
        ["security", "change", "firewall"],
    ),
    (
        "Regulatory submission due - {month} incident statistics",
        "The {month} incident statistics submission is due in {count} days. Please validate the "
        "figures for severity one and two incidents and confirm sign-off from the risk team "
        "before filing.",
        ["compliance", "regulatory"],
    ),
    (
        "Mobile banking app crash reports rising post release",
        "Crash-free sessions have dropped by {pct}% since the {month} release. Digital channels "
        "is seeing customer complaints on app launch failures. Requesting urgent triage and a "
        "decision on rollback.",
        ["mobile", "release", "customer-impact"],
    ),
    (
        "Privileged access revocation pending for {count} leavers",
        "Access revocation is still pending for {count} employees who exited last month. This is "
        "an open control gap. Please revoke the entitlements and provide confirmation evidence "
        "for the audit file.",
        ["access", "leavers", "audit"],
    ),
    (
        "Certificate expiry warning - {count} certificates expire in 14 days",
        "{count} TLS certificates on customer-facing endpoints expire within 14 days. Renewal has "
        "not started for {num} of them. Please plan renewal to avoid a service outage.",
        ["certificates", "infrastructure"],
    ),
    (
        "Clarification needed on {month} invoice from {vendor}",
        "There is a discrepancy in the {month} invoice raised by {vendor}. The billed volume does "
        "not match our consumption report. Please review the supporting data and confirm the "
        "correct position before payment release.",
        ["vendor", "invoice"],
    ),
]

REGIONS = ["West", "North", "South", "East", "Central"]
VENDORS = ["FinServe Technologies", "CardLink Systems", "NetSecure Partners", "DataVault Inc"]
JOBS = ["EOD-GL-POST", "EOD-INT-CALC", "NIGHTLY-BKP-CBS", "EOD-RECON-01"]
MONTHS = ["April", "May", "June", "July"]
STATUSES = ["New", "In Review", "Awaiting Approval", "In Progress", "Resolved", "Closed"]


def fill(text: str) -> str:
    return (
        text.replace("{pct}", str(random.choice([14, 22, 31, 47, 63])))
        .replace("{count}", str(random.choice([3, 7, 12, 18, 24, 36, 42])))
        .replace("{num}", str(random.randint(10, 99)))
        .replace("{region}", random.choice(REGIONS))
        .replace("{vendor}", random.choice(VENDORS))
        .replace("{job}", random.choice(JOBS))
        .replace("{month}", random.choice(MONTHS))
        .replace("{time}", f"{random.randint(0, 23):02d}:{random.choice(['00', '15', '30', '45'])}")
        .replace("{name}", random.choice(SENDERS)[0])
        .replace("{email}", random.choice(SENDERS)[1])
        .replace("{phone}", f"+91 9{random.randint(100000000, 999999999)}")
        .replace("{acct}", str(random.randint(100000000000, 999999999999)))
    )


def build_emails(total: int = 100) -> list[dict]:
    emails: list[dict] = []
    for i in range(total):
        subject_tpl, body_tpl, tags = TEMPLATES[i % len(TEMPLATES)]
        subject = fill(subject_tpl)
        body = fill(body_tpl)
        sender_name, sender_email, dept = random.choice(SENDERS)

        analysis = rules_engine.analyze(subject, body, sender_email)
        received = NOW - timedelta(minutes=random.randint(5, 60 * 24 * 6))

        status = random.choices(
            STATUSES, weights=[30, 18, 14, 16, 12, 10], k=1
        )[0]
        if analysis["priority"] == "P1" and status in ("Resolved", "Closed"):
            status = random.choice(["New", "In Progress"])

        emails.append(
            {
                "id": f"EM-{1000 + i}",
                "subject": subject,
                "sender": sender_name,
                "sender_email": sender_email,
                "timestamp": received.isoformat(timespec="seconds"),
                "department": dept,
                "priority": analysis["priority"],
                "status": status,
                "category": analysis["category"],
                "risk": analysis["risk_level"],
                "risk_score": analysis["risk_score"],
                "owner": analysis["owner"],
                "recommended_team": analysis["recommended_team"],
                "confidence": analysis["confidence"],
                "sla": analysis["sla"],
                "sla_at_risk": analysis["priority"] in ("P1", "P2")
                and status not in ("Resolved", "Closed")
                and random.random() < 0.42,
                "summary": body.split(".")[0].strip() + ".",
                "body": body,
                "masked_body": analysis["masked_body"],
                "intent": analysis["intent"],
                "tags": tags,
                "duplicate_count": random.choices([0, 1, 2, 3], weights=[62, 20, 12, 6])[0],
                "attachments": random.choices([0, 1, 2], weights=[60, 30, 10])[0],
                "unread": random.random() < 0.38,
                "flagged": random.random() < 0.18,
                "runbook": analysis["runbook"],
                "actions": analysis["actions"],
                "reasoning": analysis["reasoning"],
                "pii_masked": analysis["pii_masked"],
                "human_approval_required": analysis["human_approval_required"],
                "draft_response": analysis["draft_response"],
                "related_incidents": [
                    f"INC10{random.randint(1000, 9999)}" for _ in range(random.randint(0, 3))
                ],
            }
        )
    emails.sort(key=lambda e: e["timestamp"], reverse=True)
    return emails


RUNBOOK_LIBRARY = [
    ("RB-000", "General operational triage", "Operations", [
        "Acknowledge the request and confirm the reporter",
        "Classify against the service catalogue",
        "Assign to the accountable team",
        "Record the resolution and close the loop"]),
    ("RB-001", "UPI transaction failure recovery", "Payments", [
        "Check NPCI switch health dashboard",
        "Validate the payment bridge queue depth",
        "Re-drive failed transactions in batches of 500",
        "Confirm reconciliation with the settlement report",
        "Publish customer communication if impact exceeds 15 minutes"]),
    ("RB-002", "ATM terminal outage restoration", "Channels", [
        "Identify affected terminal IDs from the monitoring console",
        "Confirm network reachability to the terminal controller",
        "Restart the terminal service and verify handshake",
        "Notify branch operations of restoration"]),
    ("RB-003", "VPN and network latency triage", "Infrastructure", [
        "Check concentrator CPU and session count",
        "Review link utilisation on the primary circuit",
        "Fail over to the secondary tunnel if utilisation exceeds 80%",
        "Confirm user connectivity with a sample group"]),
    ("RB-004", "Account lockout and password reset", "Identity & Access", [
        "Verify requester identity against the HR record",
        "Reset credentials and enforce change at next logon",
        "Confirm MFA enrolment is intact",
        "Log the reset in the access register"]),
    ("RB-005", "Critical vulnerability remediation", "Cyber Security", [
        "Confirm the finding and affected asset inventory",
        "Assess exploitability and customer exposure",
        "Raise an emergency change if severity is critical",
        "Patch, retest, and record the closure evidence"]),
    ("RB-006", "Database capacity expansion", "Infrastructure", [
        "Confirm current utilisation and growth trend",
        "Reclaim space from archived partitions",
        "Raise a standard change for volume extension",
        "Validate performance after expansion"]),
    ("RB-007", "Audit evidence preparation", "Risk & Compliance", [
        "Identify the control and the sampling period",
        "Extract system-generated evidence with timestamps",
        "Mask customer identifiers before sharing",
        "Obtain reviewer sign-off and file the pack"]),
    ("RB-008", "Standard change approval", "Change Management", [
        "Validate the implementation and rollback plan",
        "Confirm the maintenance window with owners",
        "Record CAB approval",
        "Verify post-implementation health checks"]),
    ("RB-009", "Phishing campaign containment", "Cyber Security", [
        "Block the sender domain and quarantine delivered mail",
        "Identify recipients who submitted credentials",
        "Force password reset for exposed accounts",
        "Publish an awareness note to staff"]),
    ("RB-010", "Backup failure and restore validation", "Infrastructure", [
        "Review the job log for the failure code",
        "Re-run the backup outside the busy window",
        "Perform a sample restore to a scratch volume",
        "Record the validation result"]),
    ("RB-011", "Core banking batch failure recovery", "Core Banking", [
        "Identify the failed step and return code",
        "Confirm data integrity of partial postings",
        "Restart the batch from the last checkpoint",
        "Reconcile the general ledger before the morning window"]),
    ("RB-012", "Card settlement file exception", "Payments", [
        "Confirm non-receipt with the file transfer log",
        "Raise a chase with the vendor operations desk",
        "Apply the contingency settlement position",
        "Reconcile once the file arrives"]),
    ("RB-013", "Certificate renewal", "Infrastructure", [
        "List certificates expiring within 30 days",
        "Generate CSRs and obtain issued certificates",
        "Deploy through a standard change",
        "Verify chain of trust on all endpoints"]),
    ("RB-014", "Privileged access revocation", "Identity & Access", [
        "Reconcile the leaver list against the directory",
        "Revoke entitlements and shared account access",
        "Capture confirmation screenshots for audit",
        "Update the access register"]),
    ("RB-015", "Vendor SLA escalation", "Vendor Governance", [
        "Compile the breach evidence for the period",
        "Confirm the contractual remedy position",
        "Raise the escalation at the governance forum",
        "Record the agreed corrective plan"]),
    ("RB-016", "Mobile release rollback decision", "Digital Channels", [
        "Review crash-free session trend and complaint volume",
        "Confirm the rollback artefact is available",
        "Take a go or no-go decision with product",
        "Execute rollback through an emergency change"]),
    ("RB-017", "DR replication lag", "Infrastructure", [
        "Measure current lag against the RPO commitment",
        "Check link utilisation and queue depth",
        "Throttle non-critical replication streams",
        "Confirm lag returns within threshold"]),
    ("RB-018", "Branch cash reconciliation mismatch", "Branch Operations", [
        "Retrieve the branch cash position statement",
        "Match against teller and ATM entries",
        "Identify the unmatched entry and correct it",
        "Escalate if unresolved by end of day"]),
    ("RB-019", "Firewall rule change", "Cyber Security", [
        "Validate the business justification",
        "Confirm least-privilege scoping of the rule",
        "Schedule through CAB",
        "Verify connectivity and log the rule owner"]),
]


def build_runbooks() -> list[dict]:
    return [
        {
            "id": rb_id,
            "title": title,
            "owner_team": team,
            "steps": steps,
            "estimated_minutes": 10 + len(steps) * 8,
            "last_reviewed": (NOW - timedelta(days=random.randint(5, 120))).date().isoformat(),
            "usage_count": random.randint(4, 180),
        }
        for rb_id, title, team, steps in RUNBOOK_LIBRARY
    ]


def build_tasks(emails: list[dict], total: int = 40) -> list[dict]:
    tasks: list[dict] = []
    source = [e for e in emails if e["priority"] in ("P1", "P2", "P3")][:total]
    task_states = ["Open", "In Progress", "Blocked", "Awaiting Approval", "Done"]
    for i, email in enumerate(source):
        action = email["actions"][0]["label"]
        due = datetime.fromisoformat(email["timestamp"]) + timedelta(
            hours={"P1": 1, "P2": 4, "P3": 24, "P4": 72}[email["priority"]]
        )
        state = random.choices(task_states, weights=[30, 25, 8, 15, 22], k=1)[0]
        tasks.append(
            {
                "id": f"TSK-{2000 + i}",
                "title": action,
                "email_id": email["id"],
                "email_subject": email["subject"],
                "priority": email["priority"],
                "category": email["category"],
                "owner": email["owner"],
                "team": email["recommended_team"],
                "status": state,
                "due": due.isoformat(timespec="seconds"),
                "overdue": due < NOW and state != "Done",
                "sla": email["sla"],
                "created": email["timestamp"],
                "source": "AI extracted",
                "approved_by": "App Ops User" if state in ("Done", "In Progress") else None,
            }
        )
    return tasks


AUDIT_EVENTS = [
    ("AI analysis executed", "System", "Rule engine classified message and produced draft"),
    ("Draft response approved", "App Ops User", "Human approved AI-generated response before send"),
    ("Draft response edited", "App Ops User", "Human amended AI draft prior to approval"),
    ("Priority overridden", "Ravi Menon", "Human changed AI priority after review"),
    ("Owner reassigned", "Divya Raghavan", "Routing corrected to the accountable team"),
    ("PII masking applied", "System", "Customer identifiers masked before display"),
    ("Action extracted", "System", "Actionable item created from message content"),
    ("Task closed", "Arjun Bhatia", "Action verified complete and closed"),
    ("Evidence exported", "Divya Raghavan", "Audit evidence pack exported for review"),
    ("Runbook linked", "System", "Suggested runbook attached to the message"),
]


def build_audit(emails: list[dict], total: int = 30) -> list[dict]:
    logs = []
    for i in range(total):
        event, actor, detail = AUDIT_EVENTS[i % len(AUDIT_EVENTS)]
        email = random.choice(emails)
        ts = NOW - timedelta(minutes=random.randint(10, 60 * 24 * 5))
        logs.append(
            {
                "id": f"AUD-{3000 + i}",
                "timestamp": ts.isoformat(timespec="seconds"),
                "event": event,
                "actor": actor,
                "actor_type": "System" if actor == "System" else "Human",
                "entity_id": email["id"],
                "entity_subject": email["subject"],
                "detail": detail,
                "confidence": email["confidence"],
                "outcome": random.choice(["Success", "Success", "Success", "Reviewed"]),
                "explainable": True,
            }
        )
    logs.sort(key=lambda x: x["timestamp"], reverse=True)
    return logs


def build_analytics(emails: list[dict], tasks: list[dict]) -> dict:
    def count_by(key: str) -> dict:
        out: dict[str, int] = {}
        for e in emails:
            out[e[key]] = out.get(e[key], 0) + 1
        return out

    daily = []
    for offset in range(13, -1, -1):
        day = NOW - timedelta(days=offset)
        received = sum(
            1 for e in emails if datetime.fromisoformat(e["timestamp"]).date() == day.date()
        )
        received = received or random.randint(48, 96)
        daily.append(
            {
                "date": day.strftime("%d %b"),
                "received": received,
                "auto_resolved": int(received * random.uniform(0.18, 0.34)),
                "escalated": int(received * random.uniform(0.05, 0.14)),
            }
        )

    resolution = [
        {
            "date": d["date"],
            "avg_minutes": random.randint(22, 78),
            "sla_met_pct": random.randint(86, 98),
        }
        for d in daily
    ]

    return {
        "priority_distribution": [
            {"name": k, "value": v} for k, v in sorted(count_by("priority").items())
        ],
        "category_distribution": [
            {"name": k, "value": v}
            for k, v in sorted(count_by("category").items(), key=lambda kv: -kv[1])
        ],
        "status_distribution": [
            {"name": k, "value": v} for k, v in count_by("status").items()
        ],
        "department_load": [
            {"name": k, "value": v}
            for k, v in sorted(count_by("department").items(), key=lambda kv: -kv[1])
        ],
        "daily_trend": daily,
        "resolution_trend": resolution,
        "confidence_bands": [
            {"name": "90-100%", "value": sum(1 for e in emails if e["confidence"] >= 90)},
            {"name": "80-89%", "value": sum(1 for e in emails if 80 <= e["confidence"] < 90)},
            {"name": "70-79%", "value": sum(1 for e in emails if 70 <= e["confidence"] < 80)},
            {"name": "Below 70%", "value": sum(1 for e in emails if e["confidence"] < 70)},
        ],
        "task_status": [
            {"name": s, "value": sum(1 for t in tasks if t["status"] == s)}
            for s in ["Open", "In Progress", "Blocked", "Awaiting Approval", "Done"]
        ],
    }


def main() -> None:
    emails = build_emails()
    runbooks = build_runbooks()
    tasks = build_tasks(emails)
    audit = build_audit(emails)
    analytics = build_analytics(emails, tasks)

    for name, payload in [
        ("emails.json", emails),
        ("runbooks.json", runbooks),
        ("tasks.json", tasks),
        ("audit.json", audit),
        ("analytics.json", analytics),
    ]:
        (DATA_DIR / name).write_text(json.dumps(payload, indent=2), encoding="utf-8")
        print(f"wrote {name}: {len(payload) if isinstance(payload, list) else len(payload.keys())} records")


if __name__ == "__main__":
    main()
