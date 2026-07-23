import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "@/pages/Dashboard";
import Inbox from "@/pages/Inbox";
import EmailDetail from "@/pages/EmailDetail";
import AIAnalysis from "@/pages/AIAnalysis";
import Tasks from "@/pages/Tasks";
import Analytics from "@/pages/Analytics";
import AuditLogs from "@/pages/AuditLogs";
import KnowledgeBase from "@/pages/KnowledgeBase";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="inbox/:folder" element={<Inbox />} />
        <Route path="emails/:id" element={<EmailDetail />} />
        <Route path="analysis" element={<AIAnalysis />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="knowledge-base" element={<KnowledgeBase />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
