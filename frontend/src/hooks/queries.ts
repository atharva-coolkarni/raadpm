import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { EmailQuery } from "@/types";

export function useDashboard() {
  return useQuery({ queryKey: ["dashboard"], queryFn: api.dashboard });
}

export function useEmails(query: EmailQuery) {
  return useQuery({
    queryKey: ["emails", query],
    queryFn: () => api.emails(query),
    placeholderData: (previous) => previous,
  });
}

export function useEmail(id: string | undefined) {
  return useQuery({
    queryKey: ["email", id],
    queryFn: () => api.email(id as string),
    enabled: Boolean(id),
  });
}

export function useTasks(params: Record<string, string | undefined>) {
  return useQuery({ queryKey: ["tasks", params], queryFn: () => api.tasks(params) });
}

export function useAnalytics() {
  return useQuery({ queryKey: ["analytics"], queryFn: api.analytics });
}

export function useAudit(params: Record<string, string | undefined>) {
  return useQuery({ queryKey: ["audit", params], queryFn: () => api.audit(params) });
}

export function useRunbooks(params: Record<string, string | undefined>) {
  return useQuery({ queryKey: ["runbooks", params], queryFn: () => api.runbooks(params) });
}

export function useFilters() {
  return useQuery({ queryKey: ["filters"], queryFn: api.filters, staleTime: Infinity });
}
