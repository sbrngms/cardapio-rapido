import { Check, Loader2, AlertCircle } from "lucide-react";
import type { AgentStep } from "@/types";

interface AgentTimelineProps {
  steps: AgentStep[];
}

export function AgentTimeline({ steps }: AgentTimelineProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-0">
      {steps.map((step, i) => (
        <div key={step.name} className="flex items-center sm:flex-1">
          <div className="flex items-center gap-2.5 py-1.5">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                step.status === "done"
                  ? "bg-warm-500 text-white"
                  : step.status === "running"
                    ? "bg-warm-100 text-warm-600 ring-2 ring-warm-300 ring-offset-1"
                    : step.status === "error"
                      ? "bg-red-100 text-red-500"
                      : "bg-charcoal-800/5 text-charcoal-700/30"
              }`}
            >
              {step.status === "done" ? (
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              ) : step.status === "running" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : step.status === "error" ? (
                <AlertCircle className="h-3.5 w-3.5" />
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span
                className={`text-sm font-medium transition-colors ${
                  step.status === "pending" ? "text-charcoal-700/35" : "text-charcoal-800"
                }`}
              >
                {step.label}
              </span>
              {step.duration !== null && step.status === "done" && (
                <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-warm-500/70">
                  {step.duration.toLocaleString("pt-BR")}s
                </span>
              )}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`mx-2 hidden h-px flex-1 transition-colors duration-300 sm:block ${
                step.status === "done" ? "bg-warm-400" : "bg-charcoal-800/8"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
