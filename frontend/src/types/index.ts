export type Priority = "P1" | "P2" | "P3" | "P4";
export type RiskLevel = "Critical" | "High" | "Medium" | "Low";

export interface ExtractedAction {
  id: string;
  label: string;
  weight: "Primary" | "Secondary";
}

export interface Email {
  id: string;
  subject: string;
  sender: string;
  sender_email: string;
  timestamp: string;
  department: string;
  priority: Priority;
  status: string;
  category: string;
  risk: RiskLevel;
  risk_score: number;
  owner: string;
  recommended_team: string;
  confidence: number;
  sla: string;
  sla_at_risk: boolean;
  summary: string;
  body: string;
  masked_body: string;
  intent: string;
  tags: string[];
  duplicate_count: number;
  attachments: number;
  unread: boolean;
  flagged: boolean;
  runbook: string;
  actions: ExtractedAction[];
  reasoning: string;
  pii_masked: boolean;
  human_approval_required: boolean;
  draft_response: string;
  related_incidents: string[];
  approval?: { decision: string; actor: string; note: string };
}

export interface Runbook {
  id: string;
  title: string;
  owner_team: string;
  steps: string[];
  estimated_minutes: number;
  last_reviewed: string;
  usage_count: number;
  linked_emails?: number | { id: string; subject: string; priority: Priority }[];
}

export interface EmailDetail extends Email {
  runbook_detail: Runbook | null;
  related_emails: {
    id: string;
    subject: string;
    priority: Priority;
    timestamp: string;
    status: string;
  }[];
  tasks: Task[];
}

export interface EmailPage {
  items: Email[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export type FolderCounts = Record<string, number>;

export interface Task {
  id: string;
  title: string;
  email_id: string;
  email_subject: string;
  priority: Priority;
  category: string;
  owner: string;
  team: string;
  status: "Open" | "In Progress" | "Blocked" | "Awaiting Approval" | "Done";
  due: string;
  overdue: boolean;
  sla: string;
  created: string;
  source: string;
  approved_by: string | null;
}

export interface TaskResponse {
  items: Task[];
  total: number;
  summary: {
    open: number;
    in_progress: number;
    blocked: number;
    awaiting_approval: number;
    done: number;
    overdue: number;
  };
}

export interface Kpi {
  key: string;
  label: string;
  value: number;
  delta: string;
  trend: "up" | "down";
  tone: "neutral" | "critical" | "warning" | "info" | "success";
}

export interface NamedValue {
  name: string;
  value: number;
}

export interface DailyPoint {
  date: string;
  received: number;
  auto_resolved: number;
  escalated: number;
}

export interface ResolutionPoint {
  date: string;
  avg_minutes: number;
  sla_met_pct: number;
}

export interface Dashboard {
  generated_at: string;
  kpis: Kpi[];
  charts: {
    priority_distribution: NamedValue[];
    category_distribution: NamedValue[];
    daily_trend: DailyPoint[];
    resolution_trend: ResolutionPoint[];
  };
  responsible_ai: { label: string; status: string; detail: string }[];
  queue: {
    id: string;
    subject: string;
    priority: Priority;
    category: string;
    owner: string;
    sla: string;
    risk_score: number;
    confidence: number;
    timestamp: string;
    status: string;
  }[];
  workload: NamedValue[];
}

export interface Analytics {
  priority_distribution: NamedValue[];
  category_distribution: NamedValue[];
  status_distribution: NamedValue[];
  department_load: NamedValue[];
  daily_trend: DailyPoint[];
  resolution_trend: ResolutionPoint[];
  confidence_bands: NamedValue[];
  task_status: NamedValue[];
  owner_load: NamedValue[];
  headline: { label: string; value: number; unit: string }[];
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  event: string;
  actor: string;
  actor_type: "Human" | "System";
  entity_id: string;
  entity_subject: string;
  detail: string;
  confidence: number | null;
  outcome: string;
  explainable: boolean;
}

export interface AuditResponse {
  items: AuditEntry[];
  total: number;
  events: string[];
  summary: { human_actions: number; system_actions: number; explainable: number };
}

export interface AnalysisResult {
  priority: Priority;
  category: string;
  risk_level: RiskLevel;
  risk_score: number;
  confidence: number;
  owner: string;
  recommended_team: string;
  sla: string;
  runbook: string;
  intent: string;
  actions: ExtractedAction[];
  reasoning: string;
  signals: string[];
  masked_body: string;
  masked_sender: string;
  draft_response: string;
  engine: string;
  engine_note: string;
  human_approval_required: boolean;
  pii_masked: boolean;
}

export interface Health {
  status: string;
  service: string;
  ai_provider: string;
  ai_mode: string;
  records: { emails: number; tasks: number; runbooks: number; audit: number };
}

export interface EmailQuery {
  q?: string;
  priority?: string;
  category?: string;
  status?: string;
  owner?: string;
  folder?: string;
  sort?: "priority" | "newest" | "oldest" | "risk" | "confidence";
  page?: number;
  page_size?: number;
}
