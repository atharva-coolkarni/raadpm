import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bot, EyeOff, Play, Sparkles, Wand2 } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfidenceMeter } from "@/components/common/ConfidenceMeter";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { MetricTile } from "@/components/common/MetricTile";
import { Skeleton } from "@/components/ui/skeleton";

const SAMPLES = [
  {
    label: "UPI outage",
    subject: "UPI transaction failures spiking across all channels",
    body:
      "Team, UPI collect requests are failing at 47% since 09:15. This is a critical production " +
      "outage affecting customers on mobile and net banking. Reach me on +91 9876543210 or " +
      "ops.desk@northbank.example.com. Please restore service and investigate the root cause.",
  },
  {
    label: "Audit evidence",
    subject: "Audit evidence request - Q2 access review",
    body:
      "Please provide the Q2 access review evidence for the sample of privileged accounts by 18 Jul. " +
      "This is required for audit testing under control ITGC-04. Kindly confirm the evidence pack " +
      "is complete before submission.",
  },
  {
    label: "Change approval",
    subject: "RITM: standard change approval needed - CHG0112456 storage increase",
    body:
      "Please review and approve the standard change CHG0112456 covering a storage increase for DB02 " +
      "this weekend. Rollback plan is attached and the maintenance window is agreed with application owners.",
  },
];

export default function AIAnalysis() {
  const [subject, setSubject] = useState(SAMPLES[0].subject);
  const [body, setBody] = useState(SAMPLES[0].body);
  const { data: health } = useQuery({ queryKey: ["health"], queryFn: api.health });

  const run = useMutation({ mutationFn: () => api.analyze(subject, body) });
  const result = run.data;

  return (
    <div className="p-6">
      <PageHeader
        title="AI analysis"
        description="Run the triage engine against any message and inspect every step of the decision."
        actions={
          <Badge tone={health?.ai_mode === "llm" ? "brand" : "neutral"}>
            <Bot className="h-3 w-3" /> {health ? `${health.ai_provider} · ${health.ai_mode} engine` : "checking"}
          </Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Message input</CardTitle>
              <CardDescription>Paste a real operational email or start from a sample</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {SAMPLES.map((sample) => (
                <Button
                  key={sample.label}
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSubject(sample.subject);
                    setBody(sample.body);
                  }}
                >
                  <Wand2 /> {sample.label}
                </Button>
              ))}
            </div>

            <div>
              <label className="label-caps" htmlFor="subject">
                Subject
              </label>
              <Input
                id="subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="label-caps" htmlFor="body">
                Body
              </label>
              <Textarea
                id="body"
                rows={10}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                className="mt-1"
              />
            </div>

            <Button
              variant="primary"
              onClick={() => run.mutate()}
              disabled={run.isPending || !subject.trim() || !body.trim()}
            >
              <Play /> {run.isPending ? "Analysing…" : "Run analysis"}
            </Button>
            {run.isError && (
              <p className="text-xs text-critical-deep">
                The API did not respond. Confirm the backend is running on port 8000.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {run.isPending && <Skeleton className="h-[340px]" />}

          {!run.isPending && !result && (
            <Card>
              <CardContent className="flex flex-col items-center py-16 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-ink">No analysis yet</p>
                <p className="mt-1 max-w-sm text-sm text-ink-muted">
                  Run the engine to see priority, ownership, extracted actions, masking and the
                  reasoning behind every field.
                </p>
              </CardContent>
            </Card>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>Decision</CardTitle>
                    <PriorityBadge priority={result.priority} />
                  </div>
                  <Badge tone="neutral">{result.engine} engine</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ConfidenceMeter value={result.confidence} />
                  <div className="grid gap-2 sm:grid-cols-3">
                    <MetricTile label="Risk score" value={`${result.risk_score}/100`} hint={result.risk_level} />
                    <MetricTile label="Category" value={result.category} hint={result.intent} />
                    <MetricTile label="Response due" value={result.sla} hint={result.recommended_team} />
                  </div>
                  <div>
                    <p className="label-caps">Why this decision</p>
                    <p className="mt-1 rounded-md border border-line bg-elevated p-3 text-xs leading-relaxed text-ink-muted">
                      {result.reasoning}
                    </p>
                  </div>
                  {result.signals.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {result.signals.map((signal) => (
                        <span
                          key={signal}
                          className="rounded bg-brand-50 px-1.5 py-0.5 font-mono text-2xs text-brand-700"
                        >
                          {signal}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Extracted actions</CardTitle>
                  <span className="text-2xs text-ink-subtle">
                    Owner suggestion: {result.owner}
                  </span>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.actions.map((action, index) => (
                    <div
                      key={action.id}
                      className="flex items-start gap-2.5 rounded-md border border-line bg-elevated px-3 py-2"
                    >
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-2xs font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-xs text-ink">{action.label}</span>
                      <Badge tone={action.weight === "Primary" ? "brand" : "neutral"}>
                        {action.weight}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <EyeOff className="h-3.5 w-3.5 text-low-base" /> Masked message
                  </CardTitle>
                  <Badge tone={result.pii_masked ? "success" : "neutral"}>
                    {result.pii_masked ? "PII masked" : "No PII detected"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line rounded-md border border-line bg-elevated p-3 font-mono text-xs leading-relaxed text-ink">
                    {result.masked_body}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Draft response</CardTitle>
                  <Badge tone={result.human_approval_required ? "warning" : "success"}>
                    {result.human_approval_required ? "Approval required" : "Auto-eligible"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
                    {result.draft_response}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
