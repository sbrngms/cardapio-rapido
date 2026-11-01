import { Camera, UtensilsCrossed } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-charcoal-800/5 bg-cream-100/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warm-500 text-white shadow-warm">
            <UtensilsCrossed className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div className="leading-tight">
            <h1 className="font-display text-lg font-semibold text-charcoal-800">
              Cardápio Rápido
            </h1>
            <p className="hidden text-xs text-charcoal-700/60 sm:block">
              Seu cardápio no delivery em segundos
            </p>
          </div>
        </div>
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg bg-white/70 px-3 py-1.5 text-xs font-medium text-charcoal-700/70 transition-colors hover:text-warm-600"
        >
          <Camera className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Powered by Gemini</span>
        </a>
      </div>
    </header>
  );
}
