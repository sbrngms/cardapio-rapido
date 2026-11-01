export interface Dish {
  name: string;
  price: number;
  description: string;
  descriptionSuggested: boolean;
  tags: string[];
  confirmedTags: string[];
  reviewNote?: string;
}

export interface Category {
  name: string;
  dishes: Dish[];
}

export interface Combo {
  name: string;
  description: string;
  items: string[];
  price: number;
}

export interface Menu {
  categories: Category[];
  combos: Combo[];
}

export type AppState =
  | "idle"
  | "extracting"
  | "reviewing"
  | "writing"
  | "partial"
  | "results"
  | "error";

export type AgentStepName = "extract" | "review" | "write";

export interface AgentStep {
  name: AgentStepName;
  label: string;
  status: "pending" | "running" | "done" | "error";
  duration: number | null;
}

export interface AgentTimeline {
  extract: AgentStep;
  review: AgentStep;
  write: AgentStep;
}

export const AGENT_STEPS: AgentStep[] = [
  { name: "extract", label: "Extrator lendo o cardápio", status: "pending", duration: null },
  { name: "review", label: "Revisor conferindo", status: "pending", duration: null },
  { name: "write", label: "Redator escrevendo", status: "pending", duration: null },
];
