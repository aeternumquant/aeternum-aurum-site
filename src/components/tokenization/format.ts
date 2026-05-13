// Utilitários de formatação locais ao módulo tokenization.
// Mantidos próximos aos consumidores em vez de utils/ global,
// para preservar coesão do feature.

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

export function formatBRL(value: number): string {
  if (!Number.isFinite(value)) return 'R$ 0';
  return brlFormatter.format(value);
}

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '0,0';
  return percentFormatter.format(value);
}
