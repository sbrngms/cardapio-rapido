import type { Menu } from "@/types";
import { UtensilsCrossed, Package } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { getComboSavings } from "@/lib/menuStats";

interface CombosProps {
  menu: Menu;
}

export function Combos({ menu }: CombosProps) {
  if (!menu.combos.length) return null;
  const savingsByCombo = menu.combos.map((combo) => getComboSavings(menu, combo));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-terracotta-100 text-terracotta-600">
          <Package className="h-4.5 w-4.5" strokeWidth={2} />
        </div>
        <h3 className="font-display text-lg font-semibold text-charcoal-800">
          Combos sugeridos
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {menu.combos.map((combo, i) => (
          <div
            key={i}
            className="card group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-warm"
            style={{ animation: `slideUp 0.4s ease-out ${i * 0.1}s both` }}
          >
            <div className="absolute right-0 top-0 h-20 w-20 -translate-y-6 translate-x-6 rounded-full bg-warm-100 opacity-60 transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-1 inline-flex rounded-full bg-terracotta-500 px-2.5 py-0.5 text-xs font-bold text-white">
                Combo {i + 1}
              </div>
              <h4 className="font-display text-base font-semibold text-charcoal-800">
                {combo.name}
              </h4>
              <p className="mt-1 text-xs text-charcoal-700/70">{combo.description}</p>
              <div className="mt-3 space-y-1">
                {combo.items.map((item, ii) => (
                  <div key={ii} className="flex items-center gap-1.5 text-xs text-charcoal-700/80">
                    <UtensilsCrossed className="h-3 w-3 shrink-0 text-warm-400" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-charcoal-800/5 pt-3">
                <span className="text-xs text-charcoal-700/50">Preço do combo</span>
                <span className="font-display text-xl font-bold text-warm-600">
                  R$ {formatPrice(combo.price)}
                </span>
              </div>
              {savingsByCombo[i] && savingsByCombo[i].savings > 0 && (
                <p className="mt-2 text-right text-xs font-semibold text-olive-700">
                  Economize R$ {formatPrice(savingsByCombo[i].savings)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
