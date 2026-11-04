import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CategoryStats } from "@/lib/menuStats";
import { formatPrice } from "@/lib/format";

interface CategoryPriceBreakdownProps {
  categories: CategoryStats[];
}

export function CategoryPriceBreakdown({ categories }: CategoryPriceBreakdownProps) {
  const chartData = categories
    .filter((category) => category.avg !== null)
    .map((category) => ({ name: category.name, avg: category.avg ?? 0 }));

  return (
    <div className="card space-y-6 p-5">
      <div>
        <h3 className="font-display text-lg font-semibold text-charcoal-800">Preço médio por categoria</h3>
        <p className="text-xs text-charcoal-700/60">Pratos sem preço não entram no cálculo.</p>
      </div>

      {chartData.length > 0 ? (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f2e4cd" />
              <XAxis dataKey="name" tick={{ fill: "#6b5d4f", fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fill: "#6b5d4f", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$ ${formatPrice(Number(value))}`}
                width={88}
              />
              <Tooltip
                cursor={{ fill: "#fff3e0" }}
                contentStyle={{ borderRadius: 12, border: "1px solid #ffe0b3", color: "#2a231c" }}
                formatter={(value) => [`R$ ${formatPrice(Number(value))}`, "Média"]}
              />
              <Bar dataKey="avg" fill="#e0630d" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-sm text-charcoal-700/60">Nenhum prato com preço para exibir o gráfico.</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="border-b border-charcoal-800/10 text-xs uppercase tracking-[0.12em] text-charcoal-700/55">
              <th className="py-2 font-medium">Categoria</th>
              <th className="py-2 text-right font-medium">Itens</th>
              <th className="py-2 text-right font-medium">Mínimo</th>
              <th className="py-2 text-right font-medium">Médio</th>
              <th className="py-2 text-right font-medium">Máximo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-800/5">
            {categories.map((category) => (
              <tr key={category.name} className="text-charcoal-800">
                <td className="py-2.5 font-medium">{category.name}</td>
                <td className="py-2.5 text-right">{category.count}</td>
                <td className="py-2.5 text-right">{formatOptional(category.min)}</td>
                <td className="py-2.5 text-right font-semibold text-warm-600">{formatOptional(category.avg)}</td>
                <td className="py-2.5 text-right">{formatOptional(category.max)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatOptional(value: number | null): string {
  return value === null ? "—" : `R$ ${formatPrice(value)}`;
}
