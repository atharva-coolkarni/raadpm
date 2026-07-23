import axios from "axios";
import type {
  Analytics,
  AnalysisResult,
  AuditResponse,
  Dashboard,
  Email,
  EmailDetail,
  EmailPage,
  EmailQuery,
  FolderCounts,
  Health,
  Runbook,
  Task,
  TaskResponse,
} from "@/types";

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export const api = {
  health: async (): Promise<Health> => (await client.get("/health")).data,

  dashboard: async (): Promise<Dashboard> => (await client.get("/dashboard")).data,

  emails: async (params: EmailQuery = {}): Promise<EmailPage> =>
    (await client.get("/emails", { params })).data,

  emailCounts: async (): Promise<FolderCounts> => (await client.get("/emails/counts")).data,

  email: async (id: string): Promise<EmailDetail> => (await client.get(`/emails/${id}`)).data,

  updateEmailStatus: async (id: string, status: string): Promise<Email> =>
    (await client.patch(`/emails/${id}/status`, { status })).data,

  recordApproval: async (
    id: string,
    decision: "approve" | "reject" | "edit",
    draft_response?: string,
    note = "",
  ): Promise<{ email: Email }> =>
    (await client.post(`/emails/${id}/approval`, { decision, draft_response, note })).data,

  reanalyze: async (id: string): Promise<AnalysisResult> =>
    (await client.post(`/emails/${id}/reanalyze`)).data,

  analyze: async (subject: string, body: string, sender = ""): Promise<AnalysisResult> =>
    (await client.post("/analyze", { subject, body, sender })).data,

  tasks: async (params: Record<string, string | undefined> = {}): Promise<TaskResponse> =>
    (await client.get("/tasks", { params })).data,

  updateTask: async (id: string, status: string): Promise<Task> =>
    (await client.patch(`/tasks/${id}`, { status })).data,

  analytics: async (): Promise<Analytics> => (await client.get("/analytics")).data,

  audit: async (params: Record<string, string | undefined> = {}): Promise<AuditResponse> =>
    (await client.get("/audit", { params })).data,

  runbooks: async (
    params: Record<string, string | undefined> = {},
  ): Promise<{ items: Runbook[]; total: number; teams: string[] }> =>
    (await client.get("/runbooks", { params })).data,

  runbook: async (id: string): Promise<Runbook> => (await client.get(`/runbooks/${id}`)).data,

  filters: async (): Promise<{
    priorities: string[];
    categories: string[];
    statuses: string[];
    owners: string[];
    departments: string[];
  }> => (await client.get("/meta/filters")).data,
};
