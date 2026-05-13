import { TrendingDown } from 'lucide-react';
import { formatBRL, formatPercent } from './format';

interface EconomyBarProps {
  economyBRL: number;
  economyPercent: number;
}

export function EconomyBar({ economyBRL, economyPercent }: EconomyBarProps) {
  return (
    <div
      className="relative bg-primary/[0.08] border-t border-primary/40 rounded-sm px-6 sm:px-8 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6"
      role="group"
      aria-label="Economia total por operação via Aeternum"
    >
      <div className="flex items-center gap-2.5 text-[10px] sm:text-xs tracking-[0.25em] uppercase text-foreground/85 font-sans font-medium">
        <TrendingDown
          className="w-3.5 h-3.5 text-primary"
          aria-hidden="true"
          strokeWidth={1.5}
        />
        <span>Economia por operação</span>
      </div>

      <div
        className="flex items-baseline gap-3 sm:gap-4 sm:justify-end"
        aria-live="polite"
      >
        <span className="font-display text-3xl sm:text-4xl font-light leading-none text-primary tabular-nums">
          {formatBRL(economyBRL)}
        </span>
        <span className="font-sans text-sm sm:text-base text-primary/75 font-light tabular-nums">
          · {formatPercent(economyPercent)}%
        </span>
      </div>
    </div>
  );
}
