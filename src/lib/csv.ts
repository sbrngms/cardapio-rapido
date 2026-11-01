import type { Menu } from "@/types";

export function exportToCsv(menu: Menu) {
  const rows: string[] = [];
  rows.push("Categoria,Prato,Preço,Descrição,Tags");

  for (const cat of menu.categories) {
    for (const dish of cat.dishes) {
      const fields = [
        cat.name,
        dish.name,
        dish.price.toFixed(2).replace(".", ","),
        dish.description,
        dish.confirmedTags.join("; "),
      ];
      rows.push(fields.map(escapeCsv).join(","));
    }
  }

  rows.push("");
  rows.push("Combo,Descrição,Itens,Preço");
  for (const combo of menu.combos) {
    const fields = [
      combo.name,
      combo.description,
      combo.items.join("; "),
      combo.price.toFixed(2).replace(".", ","),
    ];
    rows.push(fields.map(escapeCsv).join(","));
  }

  const csv = "\uFEFF" + rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "cardapio-rapido.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string): string {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
