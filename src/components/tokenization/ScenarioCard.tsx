import { useId, useState } from 'react';
import { Info, Clock, type LucideIcon } from 'lucide-react';
import type { CostBreakdown } from '../../types/tokenization';
import { formatBRL } from './format';

type Variant = 'swift' | 'aeternum';

interface LineConfig {
  label: string;
  tooltip: string;
}

interface LineLabels {
  spread: LineConfig;
  networkOrSwiftFee: LineConfig;
  taxesOrCustody: LineConfig;
}

const SWIFT_LINES: LineLabels = {
  spread: {
    label: 'Spread cambial (2,8%)',
    tooltip:
      'Spread médio cobrado por bancos brasileiros em operações de câmbio comercial acima de USD 100k, conforme pesquisa Aeternum 2025.',
  },
  networkOrSwiftFee: {
    label: 'Taxa SWIFT + correspondentes',
    tooltip:
      'Inclui MT103 + 2-3 bancos correspondentes intermediários. Cap operacional de R$ 12.000 por transação acima de R$ 3M.',
  },
  taxesOrCustody: {
    label: 'IOF + tarifas administrativas',
    tooltip:
      'IOF câmbio 0,38% + tarifas administrativas médias do banco emissor.',
  },
};

const AETERNUM_LINES: LineLabels = {
  spread: {
    label: 'Spread otimizado (0,4%)',
    tooltip:
      'Pool de liquidez em XDC com market makers institucionais. Spread efetivo medido em testes Q4 2025.',
  },
  networkOrSwiftFee: {
    label: 'Fee de rede XDC + HBAR',
    tooltip:
      'Custo de gas XDC (~$0.0001) + Hedera HCS (~$0.0001 por mensagem ISO 20022).',
  },
  taxesOrCustody: {
    label: 'Custódia ouro proporcional',
    tooltip:
      'Custódia em cofre auditado em Dubai (DMCC) — taxa anualizada de 1,05% pro-rata aos 30 dias da operação.',
  },
};

interface ScenarioCardProps {
  variant: Variant;
  title: string;
  Icon: LucideIcon;
  breakdown: CostBreakdown;
  totalLabel: string;
}

function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span className="relative inline-flex items-center ml-1.5 align-middle">
      <button
        type="button"
        aria-describedby={open ? tooltipId : undefined}
        aria-label="Mais informações sobre este custo"
        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-muted-foreground/55 hover:text-primary focus:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-1 focus-visible:ring-offset-card transition-colors cursor-help"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false);
            event.currentTarget.blur();
          }
        }}
      >
        <Info className="w-3 h-3" aria-hidden="true" />
      </button>
      {open ? (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-card border border-white/10 rounded-sm shadow-xl shadow-black/50 z-50 pointer-events-none"
        >
          <span className="block text-xs text-muted-foreground font-sans leading-relaxed font-light normal-case tracking-normal text-left">
            {text}
          </span>
        </span>
      ) : null}
    </span>
  );
}

interface CostRowProps {
  label: string;
  tooltip: string;
  value: number;
}

function CostRow({ label, tooltip, value }: CostRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="flex items-center text-xs text-muted-foreground font-sans font-light leading-relaxed">
        <span>{label}</span>
        <InfoTooltip text={tooltip} />
      </div>
      <span className="text-sm text-foreground font-sans font-light tabular-nums">
        {formatBRL(value)}
      </span>
    </div>
  );
}

export function ScenarioCard({ variant, title, Icon, breakdown, totalLabel }: ScenarioCardProps) {
  const lines = variant === 'swift' ? SWIFT_LINES : AETERNUM_LINES;

  const containerBorder =
    variant === 'aeternum'
      ? 'border-primary/55 border-[1.5px]'
      : 'border-white/10 border';

  const totalColor = variant === 'aeternum' ? 'text-primary' : 'text-destructive/80';
  const iconColor = variant === 'aeternum' ? 'text-primary' : 'text-muted-foreground';

  return (
    <div
      className={`relative p-6 sm:p-8 bg-card ${containerBorder} rounded-sm h-full flex flex-col transition-colors duration-200`}
    >
      {variant === 'aeternum' ? (
        <span className="absolute top-3 right-3 text-[9px] tracking-[0.25em] uppercase font-sans font-medium text-primary/80 border border-primary/40 px-2 py-0.5 rounded-sm">
          Aeternum Aurum
        </span>
      ) : null}

      <header className="flex items-center gap-3 mb-6">
        <Icon className={`w-4 h-4 ${iconColor}`} aria-hidden="true" strokeWidth={1.5} />
        <h3 className="font-sans text-[10px] sm:text-xs tracking-[0.25em] uppercase text-foreground/85 font-medium">
          {title}
        </h3>
      </header>

      <div className="flex-1 flex flex-col">
        <CostRow
          label={lines.spread.label}
          tooltip={lines.spread.tooltip}
          value={breakdown.spread}
        />
        <CostRow
          label={lines.networkOrSwiftFee.label}
          tooltip={lines.networkOrSwiftFee.tooltip}
          value={breakdown.networkOrSwiftFee}
        />
        <CostRow
          label={lines.taxesOrCustody.label}
          tooltip={lines.taxesOrCustody.tooltip}
          value={breakdown.taxesOrCustody}
        />

        <div className="flex items-center justify-between gap-4 py-2.5 mt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70 font-sans font-light">
            <Clock className="w-3 h-3" aria-hidden="true" strokeWidth={1.5} />
            <span>Tempo de liquidação</span>
          </div>
          <span className="text-xs text-foreground/85 font-sans font-light">
            {breakdown.settlementTime}
          </span>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-white/10 flex items-end justify-between gap-4">
        <span className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-muted-foreground font-sans">
          {totalLabel}
        </span>
        <span
          className={`font-display text-2xl sm:text-3xl font-light leading-none tabular-nums ${totalColor}`}
          aria-live="polite"
        >
          {formatBRL(breakdown.total)}
        </span>
      </div>
    </div>
  );
}
