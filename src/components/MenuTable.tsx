import { useMemo, useState } from "react";
import type { Menu } from "@/types";
import { Plus, Trash2, ChevronDown, ChevronUp, Sparkles, Info } from "lucide-react";

interface PriceInputProps {
  value: number;
  onCommit: (price: number) => void;
}

function parsePriceText(text: string): number {
  const cleaned = text.replace(/[^\d,.]/g, "");
  const normalized = cleaned.includes(",") ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned;
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function PriceInput({ value, onCommit }: PriceInputProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const formatted = value ? value.toFixed(2).replace(".", ",") : "";

  return (
    <input
      type="text"
      inputMode="decimal"
      value={draft ?? formatted}
      onFocus={(e) => e.target.select()}
      onWheel={(e) => e.currentTarget.blur()}
      onChange={(e) => {
        const text = e.target.value.replace(/[^\d,.]/g, "");
        setDraft(text);
        onCommit(parsePriceText(text));
      }}
      onBlur={() => setDraft(null)}
      placeholder="0,00"
      className="w-20 rounded-md bg-transparent text-right text-sm font-semibold text-warm-600 hover:bg-white focus:bg-white"
    />
  );
}

interface MenuTableProps {
  menu: Menu;
  onChange: (menu: Menu) => void;
}

const TAG_STYLES: Record<string, string> = {
  vegetariano: "bg-olive-100 text-olive-700",
  vegano: "bg-olive-200 text-olive-800",
  "sem glúten": "bg-cream-200 text-terracotta-700",
  "sem lactose": "bg-cream-300 text-terracotta-800",
  "mais pedido": "bg-warm-100 text-warm-700",
  picante: "bg-red-100 text-red-700",
  caseiro: "bg-terracotta-100 text-terracotta-700",
  fit: "bg-green-100 text-green-700",
};

export function MenuTable({ menu, onChange }: MenuTableProps) {
  const totalDishes = useMemo(
    () => menu.categories.reduce((sum, c) => sum + c.dishes.length, 0),
    [menu],
  );

  function updateCategory(catIndex: number, name: string) {
    const cats = [...menu.categories];
    cats[catIndex] = { ...cats[catIndex], name };
    onChange({ ...menu, categories: cats });
  }

  function updateDish(catIndex: number, dishIndex: number, field: string, value: string | number | string[]) {
    const cats = [...menu.categories];
    const dishes = [...cats[catIndex].dishes];
    dishes[dishIndex] = { ...dishes[dishIndex], [field]: value };
    cats[catIndex] = { ...cats[catIndex], dishes };
    onChange({ ...menu, categories: cats });
  }

  function addDish(catIndex: number) {
    const cats = [...menu.categories];
    cats[catIndex] = {
      ...cats[catIndex],
      dishes: [
        ...cats[catIndex].dishes,
        { name: "Novo prato", price: 0, description: "", descriptionSuggested: false, tags: [], confirmedTags: [], reviewNote: undefined },
      ],
    };
    onChange({ ...menu, categories: cats });
  }

  function removeDish(catIndex: number, dishIndex: number) {
    const cats = [...menu.categories];
    cats[catIndex] = {
      ...cats[catIndex],
      dishes: cats[catIndex].dishes.filter((_, i) => i !== dishIndex),
    };
    onChange({ ...menu, categories: cats });
  }

  function toggleTag(catIndex: number, dishIndex: number, tag: string) {
    const dish = menu.categories[catIndex].dishes[dishIndex];
    const confirmedTags = dish.confirmedTags.includes(tag)
      ? dish.confirmedTags.filter((item) => item !== tag)
      : [...dish.confirmedTags, tag];
    updateDish(catIndex, dishIndex, "confirmedTags", confirmedTags);
  }

  function moveDish(catIndex: number, dishIndex: number, dir: -1 | 1) {
    const dishes = [...menu.categories[catIndex].dishes];
    const target = dishIndex + dir;
    if (target < 0 || target >= dishes.length) return;
    [dishes[dishIndex], dishes[target]] = [dishes[target], dishes[dishIndex]];
    const cats = [...menu.categories];
    cats[catIndex] = { ...cats[catIndex], dishes };
    onChange({ ...menu, categories: cats });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-semibold text-charcoal-800">
          Cardápio extraído
        </h3>
        <span className="rounded-full bg-warm-100 px-3 py-1 text-xs font-medium text-warm-700">
          {totalDishes} {totalDishes === 1 ? "prato" : "pratos"} · {menu.categories.length} categorias
        </span>
      </div>

      {menu.categories.map((cat, ci) => (
        <div key={ci} className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-charcoal-800/5 bg-cream-50 px-4 py-3">
            <input
              value={cat.name}
              onChange={(e) => updateCategory(ci, e.target.value)}
              className="flex-1 bg-transparent font-display text-base font-semibold text-charcoal-800 focus:text-warm-600"
            />
            <span className="text-xs text-charcoal-700/40">
              {cat.dishes.length} {cat.dishes.length === 1 ? "item" : "itens"}
            </span>
          </div>

          <div className="divide-y divide-charcoal-800/5">
            {cat.dishes.map((dish, di) => (
              <div key={di} className="group px-4 py-3 transition-colors hover:bg-cream-50/50">
                <div className="flex items-start gap-2">
                  <div className="flex flex-col items-center pt-1">
                    <button
                      onClick={() => moveDish(ci, di, -1)}
                      disabled={di === 0}
                      className="text-charcoal-700/30 transition-colors hover:text-warm-500 disabled:opacity-20"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => moveDish(ci, di, 1)}
                      disabled={di === cat.dishes.length - 1}
                      className="text-charcoal-700/30 transition-colors hover:text-warm-500 disabled:opacity-20"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        value={dish.name}
                        onChange={(e) => updateDish(ci, di, "name", e.target.value)}
                        className="min-w-0 flex-1 rounded-md bg-transparent text-sm font-semibold text-charcoal-800 hover:bg-white focus:bg-white"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-charcoal-700/40">R$</span>
                        <PriceInput
                          value={dish.price}
                          onCommit={(price) => updateDish(ci, di, "price", price)}
                        />
                      </div>
                    </div>
                    <div className="mt-1">
                      <input
                        value={dish.description}
                        onChange={(e) => updateDish(ci, di, "description", e.target.value)}
                        placeholder="Descrição…"
                        className={`w-full rounded-md bg-transparent text-xs hover:bg-white focus:bg-white ${
                          dish.descriptionSuggested
                            ? "italic text-charcoal-700/55"
                            : "text-charcoal-700/70"
                        }`}
                      />
                      {dish.descriptionSuggested && (
                        <span className="mt-0.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.12em] text-warm-500/70">
                          <Sparkles className="h-2.5 w-2.5" />
                          Sugestão da IA
                        </span>
                      )}
                    </div>
                    {dish.reviewNote && (
                      <div className="mt-1.5 flex items-start gap-1.5 rounded-md bg-warm-50/80 px-2 py-1.5">
                        <Info className="mt-0.5 h-3 w-3 shrink-0 text-warm-500" />
                        <span className="text-[11px] leading-snug text-warm-700">{dish.reviewNote}</span>
                      </div>
                    )}
                    {dish.tags.length > 0 && (
                      <div className="mt-2">
                        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-charcoal-700/45">
                          Sugestão da IA · clique para confirmar
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {dish.tags.filter((tag) => tag !== "mais pedido").map((tag) => {
                            const isConfirmed = dish.confirmedTags.includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(ci, di, tag)}
                                title={isConfirmed ? "Clique para remover" : "Clique para confirmar"}
                                className={`tag transition-colors ${
                                  isConfirmed
                                    ? TAG_STYLES[tag] || "bg-cream-200 text-charcoal-700"
                                    : "border border-dashed border-charcoal-700/25 bg-white/60 text-charcoal-700/65"
                                }`}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => removeDish(ci, di)}
                    className="mt-1 shrink-0 rounded-md p-1 text-charcoal-700/20 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => addDish(ci)}
            className="flex w-full items-center justify-center gap-1.5 border-t border-charcoal-800/5 py-2.5 text-xs font-medium text-charcoal-700/50 transition-colors hover:bg-warm-50 hover:text-warm-600"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar prato
          </button>
        </div>
      ))}
    </div>
  );
}
