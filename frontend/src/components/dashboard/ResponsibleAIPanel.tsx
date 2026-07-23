import { motion } from "framer-motion";
import { BadgeCheck, EyeOff, ScrollText, UserCheck } from "lucide-react";
import type { Dashboard } from "@/types";

const ICONS = [EyeOff, UserCheck, BadgeCheck, ScrollText];

export function ResponsibleAIPanel({ items }: { items: Dashboard["responsible_ai"] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => {
        const Icon = ICONS[index % ICONS.length];
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index, duration: 0.24 }}
            className="panel p-4"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-low-soft text-low-base">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <p className="text-sm font-semibold text-ink">{item.label}</p>
              <span className="ml-auto rounded bg-low-soft px-1.5 py-0.5 text-2xs font-semibold text-low-deep">
                {item.status}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">{item.detail}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
