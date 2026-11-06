import { AlertCircle, Loader2, Sparkles, RotateCcw } from "lucide-react";
import type { AiInsight, InsightsStatus } from "@/types";

interface AiInsightsProps {
  insights: AiInsight[];
  status: InsightsStatus;
  error: string;
  onGenerate: () => void;
}

export function AiInsights({ insights, status, error, onGenerate }: AiInsightsProps) {
  const isLoading = status === "loading";

  return (
    <div className="card space-y-5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warm-100 text-warm-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-charcoal-800">Insights do Analista</h3>
            <p className="text-xs text-charcoal-700/60">Baseados apenas nos números do cardápio.</p>
          </div>
        </div>
        <button onClick={onGenerate} disabled={isLoading} className="btn-primary">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : status === "done" ? <RotateCcw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          {isLoading ? "Analisando…" : status === "done" ? "Gerar novamente" : "Gerar insights com IA"}
        </button>
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-xl border border-warm-200 bg-warm-50 px-4 py-3 text-sm text-warm-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Não foi possível gerar os insights ({error}).</span>
        </div>
      )}

      {status === "done" && insights.length === 0 && (
        <p className="text-sm text-charcoal-700/60">Nenhum insight relevante encontrado para este cardápio.</p>
      )}

      {status === "done" && insights.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {insights.map((insight, i) => (
            <div
              key={i}
              className="rounded-xl border border-charcoal-800/5 bg-cream-50 p-4 animate-slide-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span className="inline-flex items-center gap-1 rounded-full bg-warm-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-warm-700">
                <Sparkles className="h-2.5 w-2.5" />
                Sugestão da IA
              </span>
              <h4 className="mt-2 font-display text-base font-semibold text-charcoal-800">{insight.title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-charcoal-700/80">{insight.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
