import { useRef, useState } from "react";
import { Download, RotateCcw, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { UploadZone } from "@/components/UploadZone";
import { ProcessingState } from "@/components/ProcessingState";
import { MenuTable } from "@/components/MenuTable";
import { Combos } from "@/components/Combos";
import { AgentTimeline } from "@/components/AgentTimeline";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import type { Menu, AppState, AgentStep, AiInsight, InsightsStatus } from "@/types";
import { AGENT_STEPS } from "@/types";
import { EDGE_FUNCTION_URL } from "@/lib/supabase";
import { exportToCsv } from "@/lib/csv";
import { resizeImage } from "@/lib/image";
import { computeMenuStats } from "@/lib/menuStats";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((tag): tag is string => typeof tag === "string" && tag !== "mais pedido");
}

function stripLeadingNumber(name: string): string {
  return name.replace(/^\s*(?:\d+\s*[-).\u2013\u2014]?\s*)+/i, "").trim();
}

function normalizeCategories(value: unknown): Menu["categories"] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((category) => ({
    name: typeof category.name === "string" ? category.name : "Sem categoria",
    dishes: Array.isArray(category.dishes)
      ? category.dishes.filter(isRecord).map((dish) => {
          const description = typeof dish.description === "string" ? dish.description : "";
          return {
            name: typeof dish.name === "string" ? stripLeadingNumber(dish.name) : "Novo prato",
            price: typeof dish.price === "number" ? dish.price : 0,
            description,
            descriptionSuggested: false,
            tags: normalizeTags(dish.tags),
            confirmedTags: [],
            reviewNote: typeof dish.reviewNote === "string" && dish.reviewNote.trim() ? dish.reviewNote : undefined,
          };
        })
      : [],
  }));
}

function mergeReview(original: Menu["categories"], reviewedValue: unknown): Menu["categories"] {
  const reviewed = normalizeCategories(reviewedValue);
  if (reviewed.length === 0) return original;

  return original.map((category) => {
    const reviewedCategory = reviewed.find(
      (item) => item.name.trim().toLowerCase() === category.name.trim().toLowerCase(),
    );
    return {
      ...category,
      dishes: category.dishes.map((dish) => {
        const reviewedDish = reviewedCategory?.dishes.find(
          (item) => item.name.trim().toLowerCase() === dish.name.trim().toLowerCase(),
        );
        if (!reviewedDish) return dish;
        return {
          ...dish,
          price: reviewedDish.price || dish.price,
          name: reviewedDish.name || dish.name,
          reviewNote: reviewedDish.reviewNote,
        };
      }),
    };
  });
}

function mergeWrite(original: Menu["categories"], writeValue: unknown): Menu["categories"] {
  const written = normalizeCategories(writeValue);
  return original.map((category) => {
    const writtenCategory = written.find(
      (item) => item.name.trim().toLowerCase() === category.name.trim().toLowerCase(),
    );
    return {
      ...category,
      dishes: category.dishes.map((dish) => {
        const writtenDish = writtenCategory?.dishes.find(
          (item) => item.name.trim().toLowerCase() === dish.name.trim().toLowerCase(),
        );
        if (!writtenDish) return dish;
        const hadOriginalDescription = dish.description.trim().length > 0;
        const newDescription = hadOriginalDescription ? dish.description : writtenDish.description;
        return {
          ...dish,
          description: newDescription,
          descriptionSuggested: !hadOriginalDescription && writtenDish.description.length > 0,
          tags: writtenDish.tags,
          confirmedTags: dish.confirmedTags.filter((tag) => writtenDish.tags.includes(tag)),
        };
      }),
    };
  });
}

function normalizeInsights(value: unknown): AiInsight[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .filter((item) => typeof item.title === "string" && typeof item.explanation === "string")
    .map((item) => ({ title: String(item.title), explanation: String(item.explanation) }))
    .slice(0, 5);
}

export default function App() {
  const [state, setState] = useState<AppState>("idle");
  const [menu, setMenu] = useState<Menu | null>(null);
  const [error, setError] = useState<string>("");
  const [writeError, setWriteError] = useState<string>("");
  const [reviewNote, setReviewNote] = useState<string>("");
  const [processingMessage, setProcessingMessage] = useState("Extraindo categorias e preços da foto");
  const [analysisDuration, setAnalysisDuration] = useState<number | null>(null);
  const [timeline, setTimeline] = useState<AgentStep[]>(AGENT_STEPS);
  const imageRef = useRef<{ base64: string; mimeType: string } | null>(null);
  const analysisStartedAt = useRef<number | null>(null);

  function updateStep(name: AgentStep["name"], status: AgentStep["status"], duration: number | null) {
    setTimeline((prev) => prev.map((s) => (s.name === name ? { ...s, status, duration } : s)));
  }

  function resetTimeline() {
    setTimeline(AGENT_STEPS.map((s) => ({ ...s })));
  }

  async function requestWithRetries(
    body: Record<string, unknown>,
    onRetry?: (message: string) => void,
  ): Promise<Record<string, unknown>> {
    const models = ["gemini-3.6-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite"];

    for (let attempt = 0; attempt < models.length; attempt += 1) {
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ ...body, model: models[attempt] }),
      });

      const data: unknown = await res.json();
      const responseData = isRecord(data) ? data : {};
      const isBusy = res.status === 404 || res.status === 429 || res.status === 503 || res.status === 504;

      if (res.ok) return responseData;

      if (isBusy && attempt < models.length - 1) {
        onRetry?.(
          res.status === 429
            ? "Limite de uso da IA atingido. Tentando de novo..."
            : "Serviço de IA sobrecarregado. Tentando de novo...",
        );
        await new Promise((resolve) => setTimeout(resolve, 3000));
        continue;
      }

      throw new Error(
        typeof responseData.error === "string"
          ? responseData.error
          : "Não foi possível processar o cardápio agora.",
      );
    }

    throw new Error("Não foi possível processar o cardápio agora.");
  }

  async function handleProcess(file: File) {
    setState("extracting");
    setError("");
    setWriteError("");
    setAnalysisDuration(null);
    setProcessingMessage("Extraindo categorias e preços da foto");
    resetTimeline();
    updateStep("extract", "running", null);
    analysisStartedAt.current = performance.now();

    const extractStart = performance.now();
    try {
      const { base64, mimeType } = await resizeImage(file);
      imageRef.current = { base64, mimeType };

      const data = await requestWithRetries(
        { step: "extract", image: base64, mimeType },
        setProcessingMessage,
      );
      updateStep("extract", "done", roundSeconds(performance.now() - extractStart));

      const extractedMenu: Menu = {
        categories: normalizeCategories(data.categories),
        combos: [],
      };

      await runReview(extractedMenu);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível analisar o cardápio.";
      updateStep("extract", "error", null);
      setError(msg);
      setState("error");
    }
  }

  async function runReview(currentMenu: Menu) {
    setState("reviewing");
    setProcessingMessage("Revisor conferindo o cardápio…");
    updateStep("review", "running", null);

    const reviewStart = performance.now();
    try {
      const data = await requestWithRetries(
        {
          step: "review",
          image: imageRef.current?.base64,
          mimeType: imageRef.current?.mimeType,
          menu: currentMenu,
        },
        setProcessingMessage,
      );
      updateStep("review", "done", roundSeconds(performance.now() - reviewStart));

      const overallNote = typeof data.overallNote === "string" ? data.overallNote : "";
      setReviewNote(overallNote);

      const reviewedMenu: Menu = {
        ...currentMenu,
        categories: mergeReview(currentMenu.categories, data.categories),
      };

      setMenu(reviewedMenu);
      setState("partial");

      await runWrite(reviewedMenu);
    } catch (err) {
      updateStep("review", "error", null);
      const msg = err instanceof Error ? err.message : "O revisor não pôde concluir.";
      setError(msg);
      setState("error");
    }
  }

  async function runWrite(currentMenu: Menu) {
    setState("writing");
    setProcessingMessage("Redator escrevendo descrições e combos…");
    updateStep("write", "running", null);

    const writeStart = performance.now();
    try {
      const data = await requestWithRetries(
        { step: "write", menu: currentMenu },
        setProcessingMessage,
      );
      updateStep("write", "done", roundSeconds(performance.now() - writeStart));

      const finalMenu: Menu = {
        categories: mergeWrite(currentMenu.categories, data.categories),
        combos: Array.isArray(data.combos) ? (data.combos as Menu["combos"]) : [],
      };

      setMenu(finalMenu);
      setAnalysisDuration(roundSeconds(performance.now() - (analysisStartedAt.current ?? performance.now())));
      setState("results");
    } catch (err) {
      updateStep("write", "error", null);
      const msg = err instanceof Error ? err.message : "Não foi possível gerar descrições e combos.";
      setWriteError(msg);
      setAnalysisDuration(roundSeconds(performance.now() - (analysisStartedAt.current ?? performance.now())));
      setState("results");
    }
  }

  function roundSeconds(ms: number): number {
    return Math.max(0, Math.round(ms / 100) / 10);
  }

  function reset() {
    setState("idle");
    setMenu(null);
    setError("");
    setWriteError("");
    setReviewNote("");
    setProcessingMessage("Extraindo categorias e preços da foto");
    setAnalysisDuration(null);
    resetTimeline();
    imageRef.current = null;
    analysisStartedAt.current = null;
    setReviewNote("");
  }

  const isProcessing = state === "extracting" || state === "reviewing" || state === "writing";

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pb-20 pt-6">
        {state === "idle" && <UploadZone onProcess={handleProcess} disabled={false} />}

        {isProcessing && (
          <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6">
            <ProcessingState
              title={state === "extracting" ? "Lendo o cardápio…" : state === "reviewing" ? "Conferindo o cardápio…" : "Escrevendo descrições…"}
              message={processingMessage}
            />
            <div className="rounded-xl border border-warm-200 bg-white/70 px-5 py-4">
              <AgentTimeline steps={timeline} />
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="mx-auto max-w-md px-4 py-16 text-center animate-fade-in">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
            <h2 className="font-display text-xl font-semibold text-charcoal-800">
              Não consegui analisar o cardápio
            </h2>
            <p className="mt-2 text-sm text-charcoal-700/70">{error}</p>
            <div className="mt-4 rounded-xl border border-warm-200 bg-white/70 px-5 py-4">
              <AgentTimeline steps={timeline} />
            </div>
            <button onClick={reset} className="btn-primary mt-6">
              <RotateCcw className="h-4 w-4" />
              Tentar novamente
            </button>
          </div>
        )}

        {state === "partial" && menu && (
          <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold text-charcoal-800">
                  Cardápio extraído
                </h2>
                <p className="text-sm text-charcoal-700/60">
                  O redator está preparando descrições e combos…
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={reset} className="btn-ghost">
                  <RotateCcw className="h-4 w-4" />
                  Nova foto
                </button>
                <button onClick={() => exportToCsv(menu)} className="btn-primary">
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-warm-200 bg-white/70 px-5 py-4">
              <AgentTimeline steps={timeline} />
            </div>

            <MenuTable menu={menu} onChange={setMenu} />

            <div className="flex items-center justify-center gap-2 rounded-xl border border-warm-200 bg-warm-50 px-4 py-3 text-sm text-warm-700 animate-fade-in">
              <Loader2 className="h-4 w-4 animate-spin" />
              {processingMessage}
            </div>
          </div>
        )}

        {state === "results" && menu && (
          <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold text-charcoal-800">
                  Pronto! Revise e exporte
                </h2>
                <p className="text-sm text-charcoal-700/60">
                  Edite qualquer campo diretamente na tabela abaixo.
                </p>
                {analysisDuration !== null && (
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-warm-600">
                    Análise concluída em {analysisDuration.toLocaleString("pt-BR")}s
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={reset} className="btn-ghost">
                  <RotateCcw className="h-4 w-4" />
                  Nova foto
                </button>
                <button onClick={() => exportToCsv(menu)} className="btn-primary">
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-warm-200 bg-white/70 px-5 py-4">
              <AgentTimeline steps={timeline} />
            </div>

            {reviewNote && (
              <div
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm animate-fade-in ${
                  reviewNote.includes("nenhum problema")
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-warm-200 bg-warm-50 text-warm-700"
                }`}
              >
                {reviewNote}
              </div>
            )}

            {writeError && (
              <div className="flex items-center gap-2 rounded-xl border border-warm-200 bg-warm-50 px-4 py-3 text-sm text-warm-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  As descrições e combos não puderam ser gerados ({writeError}). A
                  tabela com pratos e preços está disponível para edição.
                </span>
                <button
                  onClick={() => menu && runWrite(menu)}
                  className="ml-auto flex shrink-0 items-center gap-1 font-medium text-warm-600 hover:text-warm-700"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Repetir
                </button>
              </div>
            )}

            <MenuTable menu={menu} onChange={setMenu} />
            <Combos menu={menu} />

            <div className="flex justify-center pt-4">
              <button onClick={() => exportToCsv(menu)} className="btn-primary">
                <Download className="h-4 w-4" />
                Exportar cardápio completo (CSV)
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-charcoal-800/5 py-6 text-center">
        <p className="text-xs text-charcoal-700/40">
          Cardápio Rápido — feito para donos de restaurantes pequenos
        </p>
      </footer>
    </div>
  );
}
