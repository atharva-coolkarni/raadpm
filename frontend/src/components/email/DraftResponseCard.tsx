import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CircleSlash, Clock, Copy, PenLine, Send, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function DraftResponseCard({
  emailId,
  draft,
  approval,
}: {
  emailId: string;
  draft: string;
  approval?: { decision: string; actor: string; note: string };
}) {
  const queryClient = useQueryClient();
  const [text, setText] = useState(draft);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setText(draft);
    setEditing(false);
  }, [draft, emailId]);

  const decide = useMutation({
    mutationFn: (decision: "approve" | "reject" | "edit") =>
      api.recordApproval(emailId, decision, text),
    onSuccess: (_data, decision) => {
      queryClient.invalidateQueries({ queryKey: ["email", emailId] });
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["audit"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setEditing(false);
      setToast(
        decision === "approve"
          ? "Approved and sent. The decision is recorded in the audit log."
          : decision === "reject"
            ? "Rejected. The message stays in review."
            : "Draft saved. Approve when you are ready to send.",
      );
    },
  });

  const regenerate = useMutation({
    mutationFn: () => api.reanalyze(emailId),
    onSuccess: (result) => {
      setText(result.draft_response);
      queryClient.invalidateQueries({ queryKey: ["email", emailId] });
      setToast("Draft regenerated from the current analysis.");
    },
  });

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <section className="border-t border-line">
      <div className="flex flex-wrap items-center gap-2 px-5 py-3">
        <Sparkles className="h-3.5 w-3.5 text-brand-600" />
        <h3 className="label-caps text-ink">Draft response (AI generated)</h3>
        {approval ? (
          <Badge tone={approval.decision === "approve" ? "success" : "warning"}>
            {approval.decision === "approve" ? "Approved" : "Needs rework"} · {approval.actor}
          </Badge>
        ) : (
          <Badge tone="brand">Ready for review</Badge>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => regenerate.mutate()}
            disabled={regenerate.isPending}
          >
            <Sparkles /> {regenerate.isPending ? "Working" : "Regenerate"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigator.clipboard?.writeText(text)}>
            <Copy /> Copy
          </Button>
        </div>
      </div>

      <div className="px-5 pb-4">
        {editing ? (
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={12}
            className="font-mono text-xs"
          />
        ) : (
          <div className="rounded-md border border-line bg-elevated p-4 text-sm leading-relaxed text-ink">
            {text.split("\n").map((line, index) =>
              line.trim() === "" ? (
                <div key={index} className="h-2" />
              ) : (
                <p key={index} className={index === 0 ? "font-semibold" : ""}>
                  {line}
                </p>
              ),
            )}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-2xs text-ink-subtle">
            Tone: Professional · Length: Medium · Language: English
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing((value) => !value)}>
              <PenLine /> {editing ? "Preview" : "Edit draft"}
            </Button>
            {editing && (
              <Button variant="secondary" size="sm" onClick={() => decide.mutate("edit")}>
                <Check /> Save draft
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => decide.mutate("reject")}>
              <CircleSlash /> Reject
            </Button>
            <Button variant="ghost" size="sm">
              <Clock /> Send later
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={() => decide.mutate("approve")}
              disabled={decide.isPending}
            >
              <Send /> {decide.isPending ? "Recording" : "Approve & send"}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {toast && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 rounded-md border border-low-base/25 bg-low-soft px-3 py-2 text-xs font-medium text-low-deep"
            >
              {toast}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
