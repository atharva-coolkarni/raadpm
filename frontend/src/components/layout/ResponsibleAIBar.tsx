import { Bot, Eye, Lock, ShieldCheck, Workflow } from "lucide-react";

const PILLARS = [
  { icon: Bot, title: "AI powered", detail: "Understand. Extract. Recommend." },
  { icon: Eye, title: "Human in the loop", detail: "You approve. AI assists." },
  { icon: Workflow, title: "Explainable", detail: "Every decision has a reason." },
  { icon: Lock, title: "Secure & private", detail: "Synthetic data, PII masked." },
  { icon: ShieldCheck, title: "Action oriented", detail: "From email to accountable action." },
];

export function ResponsibleAIBar() {
  return (
    <footer className="flex shrink-0 flex-wrap items-center gap-x-8 gap-y-2 border-t border-white/5 bg-navy-800 px-5 py-2.5">
      {PILLARS.map(({ icon: Icon, title, detail }) => (
        <div key={title} className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.07] text-brand-400">
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-white">{title}</p>
            <p className="text-2xs text-white/45">{detail}</p>
          </div>
        </div>
      ))}
    </footer>
  );
}
