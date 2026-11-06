import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Hash,
  Layers,
  Package,
  Receipt,
  Wallet,
} from "lucide-react";
import type { AiInsight, InsightsStatus, Menu } from "@/types";
import { computeMenuStats, type MenuStats } from "@/lib/menuStats";
import { formatPrice } from "@/lib/format";
import { CategoryPriceBreakdown } from "@/components/CategoryPriceBreakdown";
import { AiInsights } from "@/components/AiInsights";

interface AnalysisPanelProps {
  menu: Menu;
  insights: AiInsight[];
  insightsStatus: InsightsStatus;
  insightsError: string;
  onGenerateInsights: () => void;
}

export function AnalysisPanel({
  menu,
  insights,
  insightsStatus,
  insightsError,
  onGenerateInsights,
}: AnalysisPanelProps) {
  const stats = useMemo(() => computeMenuStats(menu), [menu]);

  return (
    <div className="space-y-6">
      <SummaryCards stats={stats} />
      <CategoryPriceBreakdown categories={stats.categories} />
      <AlertsCard stats={stats} />
      <CombosCard stats={stats} />
      <AiInsights
        insights={insights}
        status={insightsStatus}
        error={insightsError}
        onGenerate={onGenerateInsights}
      />
    </div>
  );
}

function SummaryCards({ stats }: { stats: MenuStats }) {
  const items = [
    { label: "Pratos", value: String(stats.totalDishes), hint: "no cardápio", icon: Hash },
    { label: "Categorias", value: String(stats.categoryCount), hint: "seções", icon: Layers },
    {
      label: "Preço médio",
      value: stats.averagePrice === null ? "—" : `R$ ${formatPrice(stats.averagePrice)}`,
      hint: "de todos os pratos com preço",
      icon: Wallet,
    },
    {
      label: "Prato mais caro",
      value: stats.priciest === null ? "—" : `R$ ${formatPrice(stats.priciest.price)}`,
      hint: stats.priciest === null ? "sem pratos com preço" : stats.priciest.name,
      icon: ArrowUpCircle,
    },
    {
      label: "Prato mais barato",
      value: stats.cheapest === null ? "—" : `R$ ${formatPrice(stats.cheapest.price)}`,
      hint: stats.cheapest === null ? "sem pratos com preço" : stats.cheapest.name,
      icon: ArrowDownCircle,
    },
    {
      label: "Ticket médio",
      value: stats.ticket === null ? "—" : `R$ ${formatPrice(stats.ticket.value)}`,
      hint: stats.ticket === null ? "precisa de pratos e bebidas" : "1 prato principal + 1 bebida",
      icon: Receipt,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="card min-w-0 p-4">
            <item.icon className="h-4 w-4 text-warm-500" />
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-charcoal-700/55">{item.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-charcoal-800">{item.value}</p>
            <p className="mt-0.5 truncate text-xs text-charcoal-700/55">{item.hint}</p>
          </div>
        ))}
      </div>
      {stats.unpricedCount > 0 && (
        <p className="text-xs text-charcoal-700/60">
          {stats.unpricedCount} {stats.unpricedCount === 1 ? "prato sem preço ficou" : "pratos sem preço ficaram"} de fora dos cálculos.
        </p>
      )}
    </div>
  );
}

function AlertsCard({ stats }: { stats: MenuStats }) {
  return (
    <div className="card space-y-4 p-5">
      <div>
        <h3 className="font-display text-lg font-semibold text-charcoal-800">Alertas de preço</h3>
        <p className="text-xs text-charcoal-700/60">Pratos mais de 40% acima ou abaixo da média da sua categoria.</p>
      </div>

      {stats.alerts.length === 0 ? (
        <p className="text-sm text-charcoal-700/60">Nenhum prato fora da faixa esperada.</p>
      ) : (
        <ul className="space-y-2">
          {stats.alerts.map((alert, i) => {
            const above = alert.deviation > 0;
            const percent = Math.round(Math.abs(alert.deviation) * 100);
            return (
              <li
                key={`${alert.categoryName}-${alert.dishName}-${i}`}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-charcoal-800/5 bg-cream-50 px-4 py-3"
              >
                <AlertTriangle className={`h-4 w-4 shrink-0 ${above ? "text-terracotta-600" : "text-olive-600"}`} />
                <p className="min-w-0 flex-1 text-sm text-charcoal-800">
                  <span className="font-semibold">{alert.dishName}</span> está {percent}% {above ? "acima" : "abaixo"} da média de{" "}
                  <span className="font-semibold">{alert.categoryName}</span>
                </p>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    above ? "bg-terracotta-100 text-terracotta-700" : "bg-olive-100 text-olive-700"
                  }`}
                >
                  R$ {formatPrice(alert.price)} · média R$ {formatPrice(alert.categoryAvg)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function CombosCard({ stats }: { stats: MenuStats }) {
  if (stats.combos.length === 0) return null;

  return (
    <div className="card space-y-4 p-5">
      <div>
        <h3 className="font-display text-lg font-semibold text-charcoal-800">Vantagem dos combos</h3>
        <p className="text-xs text-charcoal-700/60">Compara o preço do combo com a soma dos itens separados.</p>
      </div>

      <ul className="divide-y divide-charcoal-800/5">
        {stats.combos.map((combo, i) => (
          <li key={`${combo.name}-${i}`} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <Package className="h-4 w-4 shrink-0 text-warm-500" />
              <span className="truncate text-sm font-semibold text-charcoal-800">{combo.name}</span>
            </div>
            {combo.savings === null ? (
              <span className="text-xs text-charcoal-700/60">Não calculado: algum item não tem preço no cardápio.</span>
            ) : (
              <div className="text-right text-xs text-charcoal-700/70">
                <p>
                  R$ {formatPrice(combo.savings.separate)} separado → <span className="font-semibold text-warm-600">R$ {formatPrice(combo.savings.price)}</span>
                </p>
                <p className={combo.savings.savings > 0 ? "font-semibold text-olive-700" : "text-terracotta-700"}>
                  {combo.savings.savings > 0
                    ? `Economize R$ ${formatPrice(combo.savings.savings)} (${Math.round(combo.savings.savingsPercent)}%)`
                    : `Sem desconto: R$ ${formatPrice(Math.abs(combo.savings.savings))} a mais`}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
