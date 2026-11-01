import { UtensilsCrossed } from "lucide-react";

interface ProcessingStateProps {
  title: string;
  message: string;
}

export function ProcessingState({ title, message }: ProcessingStateProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center animate-fade-in">
      <div className="relative mb-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-warm-500 text-white shadow-warm">
          <UtensilsCrossed className="h-10 w-10 animate-pulse-warm" strokeWidth={1.8} />
        </div>
        <div className="absolute -inset-2 -z-10 animate-ping rounded-3xl bg-warm-400/30" />
      </div>
      <h2 className="font-display text-xl font-semibold text-charcoal-800">{title}</h2>
      <p className="mt-1 text-sm text-charcoal-700/60">{message}</p>
      <div className="mt-8 w-full">
        <div className="flex items-center gap-3 rounded-xl bg-white/70 px-4 py-3 text-left">
          <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-warm-500" />
          <span className="text-sm text-charcoal-700/80">{message}</span>
        </div>
      </div>
    </div>
  );
}
