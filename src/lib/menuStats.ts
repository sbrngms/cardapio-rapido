import type { Category, Combo, Dish, Menu } from "@/types";

const MAIN_DISH_CATEGORY = /principal|prato|carne|massa|peixe|frango|burger|hamb|pizza|lanche|refei/i;
const DRINK_CATEGORY = /bebida|drink|suco|refri|cerveja|chopp|[aá]gua|vinho|coquetel/i;
const ALERT_THRESHOLD = 0.4;

export interface CategoryStats {
  name: string;
  count: number;
  pricedCount: number;
  min: number | null;
  avg: number | null;
  max: number | null;
}

export interface PriceAlert {
  categoryName: string;
  dishName: string;
  price: number;
  categoryAvg: number;
  deviation: number;
}

export interface ComboSavings {
  separate: number;
  price: number;
  savings: number;
  savingsPercent: number;
}

export interface ComboResult {
  name: string;
  savings: ComboSavings | null;
}

export interface TicketEstimate {
  value: number;
  mainAvg: number;
  drinkAvg: number;
}

export interface MenuStats {
  totalDishes: number;
  categoryCount: number;
  averagePrice: number | null;
  ticket: TicketEstimate | null;
  categories: CategoryStats[];
  alerts: PriceAlert[];
  combos: ComboResult[];
}

function isPriced(dish: Dish): boolean {
  return dish.price > 0;
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function categoryStats(category: Category): CategoryStats {
  const prices = category.dishes.filter(isPriced).map((dish) => dish.price);
  return {
    name: category.name,
    count: category.dishes.length,
    pricedCount: prices.length,
    min: prices.length ? Math.min(...prices) : null,
    avg: prices.length ? mean(prices) : null,
    max: prices.length ? Math.max(...prices) : null,
  };
}

function averageOfMatchingCategories(menu: Menu, pattern: RegExp): number | null {
  const prices = menu.categories
    .filter((category) => pattern.test(category.name))
    .flatMap((category) => category.dishes.filter(isPriced))
    .map((dish) => dish.price);
  return prices.length ? mean(prices) : null;
}

function buildTicket(menu: Menu): TicketEstimate | null {
  const mainAvg = averageOfMatchingCategories(menu, MAIN_DISH_CATEGORY);
  const drinkAvg = averageOfMatchingCategories(menu, DRINK_CATEGORY);
  if (mainAvg === null || drinkAvg === null) return null;
  return { value: mainAvg + drinkAvg, mainAvg, drinkAvg };
}

function buildAlerts(menu: Menu): PriceAlert[] {
  return menu.categories.flatMap((category) => {
    const priced = category.dishes.filter(isPriced);
    if (priced.length < 2) return [];
    const categoryAvg = mean(priced.map((dish) => dish.price));
    return priced.flatMap((dish) => {
      const deviation = (dish.price - categoryAvg) / categoryAvg;
      if (Math.abs(deviation) <= ALERT_THRESHOLD) return [];
      return [{ categoryName: category.name, dishName: dish.name, price: dish.price, categoryAvg, deviation }];
    });
  });
}

export function getComboSavings(menu: Menu, combo: Combo): ComboSavings | null {
  const dishes = menu.categories.flatMap((category) => category.dishes);
  let separate = 0;

  for (const item of combo.items) {
    const key = normalizeName(item);
    const dish = dishes.find((candidate) => normalizeName(candidate.name) === key && isPriced(candidate));
    if (!dish) return null;
    separate += dish.price;
  }

  if (separate <= 0 || combo.price <= 0) return null;
  const savings = separate - combo.price;
  return { separate, price: combo.price, savings, savingsPercent: (savings / separate) * 100 };
}

export function computeMenuStats(menu: Menu): MenuStats {
  const allDishes = menu.categories.flatMap((category) => category.dishes);
  const pricedPrices = allDishes.filter(isPriced).map((dish) => dish.price);

  return {
    totalDishes: allDishes.length,
    categoryCount: menu.categories.length,
    averagePrice: pricedPrices.length ? mean(pricedPrices) : null,
    ticket: buildTicket(menu),
    categories: menu.categories.map(categoryStats),
    alerts: buildAlerts(menu),
    combos: menu.combos.map((combo) => ({ name: combo.name, savings: getComboSavings(menu, combo) })),
  };
}
