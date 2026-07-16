import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { Commodity, Currency, Destination } from '../../types/tokenization';
import {
  COMMODITY_LABELS,
  DESTINATION_DEFAULT_CURRENCY,
  DESTINATION_LABELS,
  PRICE_BOUNDS,
  VOLUME_BOUNDS,
} from '../../data/commodityPrices';
import { getExchangeRate } from '../../services/currencyService';
import { useExportCalculation } from '../../hooks/useExportCalculation';
import { useMarketData, type MarketPoint } from '../../hooks/useMarketData';
import {
  PTAX_CODE,
  brlReference,
  formatBRLRef,
  formatDayMonthUTC,
  formatValueUnit,
} from '../../lib/marketFormat';
import { formatBRL } from './format';

const COMMODITIES: readonly Commodity[] = ['soja', 'milho', 'boi-gordo'];
const DESTINATIONS: readonly Destination[] = ['china', 'eua', 'ue'];
const CURRENCIES: readonly Currency[] = ['CNY', 'USD', 'EUR'];

const DEBOUNCE_MS = 300;

const destinoNumberFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
});

function parsePtBrNumber(raw: string): number {
  if (typeof raw !== 'string' || raw.trim() === '') return 0;
  const cleaned = raw.replace(/[^\d.,-]/g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function priceToInputString(n: number): string {
  return n.toString().replace('.', ',');
}

const inputBase =
  'w-full bg-background/70 border border-white/10 px-3 py-2.5 text-sm text-foreground font-sans font-light rounded-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/55 focus:ring-1 focus:ring-primary/20';

const labelBase =
  'block text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2 font-sans';

const priceUnitLabel: Record<Commodity, string> = {
  soja: 'R$ / saca 60 kg',
  milho: 'R$ / saca 60 kg',
  'boi-gordo': 'R$ / arroba (15 kg)',
};

// Mapeamento commodity -> serie do cache (as 3 que temos) e o ticker B3
// para a linha de referencia. Uma fonte de verdade com o CommodityTerminal.
const SERIES_BY_COMMODITY: Record<Commodity, string> = {
  soja: 'SOJA_FUT',
  milho: 'MILHO_FUT',
  'boi-gordo': 'BOI_FUT',
};

const TICKER_BY_COMMODITY: Record<Commodity, string> = {
  soja: 'SJC',
  milho: 'CCM',
  'boi-gordo': 'BGI',
};

// Estado do preco de referencia da commodity ativa. So 'ok' produz um default
// honesto; os demais deixam o campo vazio para o usuario informar o preco.
type PriceInfo =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'missing' }
  | { status: 'stale'; point: MarketPoint }
  | { status: 'blocked'; point: MarketPoint }
  | {
      status: 'ok';
      point: MarketPoint;
      defaultBRL: number;
      conversion: { brl: number; ptaxDate: string } | null;
    };

// Cotacao de referencia para o equivalente na moeda do destino.
type FxInfo =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'ok'; rate: number; date: string };

export default function ExportCalculator() {
  const [commodity, setCommodity] = useState<Commodity>('soja');
  const [destination, setDestination] = useState<Destination>('china');
  const [currency, setCurrency] = useState<Currency>('CNY');

  const [volumeRaw, setVolumeRaw] = useState<string>('1000');
  const [volumeDebounced, setVolumeDebounced] = useState<number>(1000);

  // Sem mock: o preco comeca vazio e e preenchido pelo default REAL do cache
  // quando ele chega (ou pelo usuario). Ver o effect e priceInfo abaixo.
  const [priceRaw, setPriceRaw] = useState<string>('');
  const [priceDebounced, setPriceDebounced] = useState<number>(0);

  // Preco de referencia REAL do cache (mesmo hook do CommodityTerminal).
  const { data: marketData, loading: marketLoading, error: marketError } = useMarketData();
  const bySeries = useMemo(() => {
    const map = new Map<string, MarketPoint>();
    for (const p of marketData ?? []) map.set(p.code, p);
    return map;
  }, [marketData]);
  const commodityPoint = bySeries.get(SERIES_BY_COMMODITY[commodity]) ?? null;
  const ptaxPoint = bySeries.get(PTAX_CODE) ?? null;

  // Armadilha de unidade: SOJA_FUT vem em USD/saca; MILHO_FUT/BOI_FUT em BRL.
  // Soja converte pela PTAX (travas de data/stale no brlReference compartilhado);
  // milho/boi usam o valor nativo. Sem conversao honesta -> sem default.
  const priceInfo = useMemo<PriceInfo>(() => {
    if (marketLoading) return { status: 'loading' };
    if (marketError) return { status: 'error' };
    if (!commodityPoint) return { status: 'missing' };
    if (commodityPoint.isStale) return { status: 'stale', point: commodityPoint };
    const isUsd = !!commodityPoint.unit && commodityPoint.unit.toUpperCase().startsWith('USD');
    if (isUsd) {
      const conv = brlReference(commodityPoint, ptaxPoint);
      if (!conv) return { status: 'blocked', point: commodityPoint };
      return { status: 'ok', point: commodityPoint, defaultBRL: conv.brl, conversion: conv };
    }
    return { status: 'ok', point: commodityPoint, defaultBRL: commodityPoint.value, conversion: null };
  }, [marketLoading, marketError, commodityPoint, ptaxPoint]);

  const defaultBRL = priceInfo.status === 'ok' ? priceInfo.defaultBRL : null;

  // Preenche o preco com o default REAL (do cache) quando ele chega ou quando a
  // commodity muda. Sem default honesto (loading/erro/ausente/stale/conversao
  // bloqueada) o campo fica vazio para o usuario informar o preco. O campo e
  // editavel; como defaultBRL nao muda a cada tecla, a edicao nao e sobrescrita.
  useEffect(() => {
    if (defaultBRL != null) {
      const rounded = Math.round(defaultBRL * 100) / 100;
      setPriceRaw(priceToInputString(rounded));
      setPriceDebounced(rounded);
    } else {
      setPriceRaw('');
      setPriceDebounced(0);
    }
  }, [commodity, defaultBRL]);

  // Moeda padrão derivada do destino — usuário pode trocar manualmente.
  useEffect(() => {
    setCurrency(DESTINATION_DEFAULT_CURRENCY[destination]);
  }, [destination]);

  // Debounce do volume — 300ms a partir da última tecla.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      setVolumeDebounced(parsePtBrNumber(volumeRaw));
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [volumeRaw]);

  // Debounce do preço — mesmo padrão.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      setPriceDebounced(parsePtBrNumber(priceRaw));
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [priceRaw]);

  // Cotacao para EUR/CNY vem do BCB via currencyService (sem fallback: null se
  // indisponivel). USD nao passa por aqui: usa a PTAX do cache (abaixo).
  const [remoteFx, setRemoteFx] = useState<FxInfo>({ status: 'loading' });
  useEffect(() => {
    if (currency === 'USD') return;
    let cancelled = false;
    setRemoteFx({ status: 'loading' });
    getExchangeRate(currency).then((res) => {
      if (cancelled) return;
      setRemoteFx(res ? { status: 'ok', rate: res.rate, date: res.date } : { status: 'unavailable' });
    });
    return () => {
      cancelled = true;
    };
  }, [currency]);

  // USD: preferir o cache (PTAX_USD_VENDA, com data e trava de defasagem). Sem
  // PTAX fresca -> indisponivel (nunca converter com cambio velho ou inventado).
  const fx = useMemo<FxInfo>(() => {
    if (currency === 'USD') {
      if (marketLoading) return { status: 'loading' };
      if (!ptaxPoint || ptaxPoint.isStale) return { status: 'unavailable' };
      return { status: 'ok', rate: ptaxPoint.value, date: formatDayMonthUTC(ptaxPoint.ts) };
    }
    return remoteFx;
  }, [currency, marketLoading, ptaxPoint, remoteFx]);

  const exchangeRate = fx.status === 'ok' ? fx.rate : 0;

  const result = useExportCalculation(
    {
      commodity,
      volumeToneladas: volumeDebounced,
      precoUnitarioBRL: priceDebounced,
      destination,
      currency,
    },
    exchangeRate,
  );

  // Linha de referencia sob o input de preco: fonte + data + unidade + estado.
  // Em 'ok' e informativa (muted); nos demais chama atencao (dourado) porque o
  // usuario precisa informar o preco.
  const ticker = TICKER_BY_COMMODITY[commodity];
  const refAttention = priceInfo.status !== 'ok';
  let referenceNode: React.ReactNode;
  switch (priceInfo.status) {
    case 'loading':
      referenceNode = (
        <span
          className="inline-block h-2.5 w-56 max-w-full bg-card/80 animate-pulse rounded-sm align-middle"
          aria-label="Carregando preço de referência"
        />
      );
      break;
    case 'error':
      referenceNode = 'Não foi possível carregar o preço de referência do cache. Informe o preço.';
      break;
    case 'missing':
      referenceNode = `Série ${ticker} indisponível no cache agora. Informe o preço.`;
      break;
    case 'stale':
      referenceNode = `Ref. B3 (${ticker}) ${formatDayMonthUTC(priceInfo.point.ts)}: dado defasado. Informe o preço.`;
      break;
    case 'blocked':
      referenceNode = 'Sem PTAX do dia para converter a soja. Informe o preço em R$.';
      break;
    case 'ok':
      referenceNode = priceInfo.conversion
        ? `Ref. B3 (${ticker}) ${formatDayMonthUTC(priceInfo.point.ts)}: ${formatValueUnit(
            priceInfo.point,
          )} ≈ ${formatBRLRef(priceInfo.conversion.brl)} · PTAX ${priceInfo.conversion.ptaxDate}`
        : `Ref. B3 (${ticker}) ${formatDayMonthUTC(priceInfo.point.ts)}: ${formatValueUnit(
            priceInfo.point,
          )}`;
      break;
  }

  return (
    <section
      id="export-calculator"
      className="relative z-10 py-24 md:py-32 px-4 sm:px-6"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className="text-center mb-16 max-w-3xl mx-auto">
            <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-primary mb-4 font-sans">
              Aeternum Aurum Partners · Export Calculator
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-light text-foreground mb-4 leading-snug">
              Valor de exportação de commodities
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-light leading-relaxed">
              Calcule o valor total de uma operação a partir do volume e do preço unitário, com o
              equivalente na moeda do destino pela taxa de referência (PTAX).
            </p>
          </header>

          <div className="bg-card/40 border border-white/5 rounded-sm p-6 sm:p-10">
            {marketError ? (
              <div className="mb-6 text-xs text-[#C6A85A]/90 border border-[#C6A85A]/25 bg-[#C6A85A]/[0.03] px-3 py-2 rounded-sm font-sans font-light">
                Não foi possível carregar os preços de referência do cache agora. Você ainda pode
                informar os preços manualmente.
              </div>
            ) : null}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div>
                <label htmlFor="ec-commodity" className={labelBase}>
                  Commodity
                </label>
                <select
                  id="ec-commodity"
                  value={commodity}
                  onChange={(event) => setCommodity(event.target.value as Commodity)}
                  className={inputBase}
                >
                  {COMMODITIES.map((c) => (
                    <option key={c} value={c}>
                      {COMMODITY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ec-volume" className={labelBase}>
                  Volume (toneladas)
                </label>
                <input
                  id="ec-volume"
                  type="text"
                  inputMode="numeric"
                  value={volumeRaw}
                  onChange={(event) => setVolumeRaw(event.target.value)}
                  min={VOLUME_BOUNDS.min}
                  max={VOLUME_BOUNDS.max}
                  className={inputBase}
                  aria-describedby="ec-volume-hint"
                />
                <span
                  id="ec-volume-hint"
                  className="block text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 mt-1.5 font-sans"
                >
                  {VOLUME_BOUNDS.min.toLocaleString('pt-BR')} a{' '}
                  {VOLUME_BOUNDS.max.toLocaleString('pt-BR')} t
                </span>
              </div>

              <div>
                <label htmlFor="ec-price" className={labelBase}>
                  Preço unitário
                </label>
                <input
                  id="ec-price"
                  type="text"
                  inputMode="decimal"
                  value={priceRaw}
                  onChange={(event) => setPriceRaw(event.target.value)}
                  min={PRICE_BOUNDS.min}
                  max={PRICE_BOUNDS.max}
                  className={inputBase}
                  aria-describedby="ec-price-hint"
                />
                <span
                  id="ec-price-hint"
                  className="block text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 mt-1.5 font-sans"
                >
                  {priceUnitLabel[commodity]}
                </span>
                <span
                  className={`block text-[10px] mt-1 font-sans leading-relaxed normal-case tracking-normal ${
                    refAttention ? 'text-[#C6A85A]/90' : 'text-muted-foreground/55'
                  }`}
                  aria-live="polite"
                >
                  {referenceNode}
                </span>
              </div>

              <div>
                <label htmlFor="ec-destination" className={labelBase}>
                  Destino
                </label>
                <select
                  id="ec-destination"
                  value={destination}
                  onChange={(event) =>
                    setDestination(event.target.value as Destination)
                  }
                  className={inputBase}
                >
                  {DESTINATIONS.map((d) => (
                    <option key={d} value={d}>
                      {DESTINATION_LABELS[d]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className="mb-8 flex flex-col sm:flex-row sm:items-center gap-3"
              role="group"
              aria-label="Moeda do destino"
            >
              <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-sans">
                Moeda do destino
              </span>
              <div className="flex gap-2 flex-wrap">
                {CURRENCIES.map((c) => {
                  const active = currency === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      aria-pressed={active}
                      className={`px-3 py-1.5 text-xs font-sans tracking-[0.15em] uppercase rounded-sm border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 ${
                        active
                          ? 'border-primary text-primary bg-primary/10'
                          : 'border-white/10 text-foreground/65 hover:border-primary/40 hover:text-primary'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
              aria-live="polite"
            >
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2 font-sans">
                  Valor total da operação
                </p>
                {marketLoading ? (
                  <span
                    className="inline-block w-48 h-9 bg-card/80 animate-pulse rounded-sm align-middle"
                    aria-label="Carregando valor da operação"
                  />
                ) : priceDebounced > 0 ? (
                  <p className="font-display text-3xl sm:text-4xl font-light text-foreground leading-none tabular-nums">
                    {formatBRL(result.valorTotalBRL)}
                  </p>
                ) : (
                  <p className="font-display text-2xl sm:text-3xl font-light text-muted-foreground/60 leading-none">
                    informe o preço
                  </p>
                )}
              </div>
              <div className="text-sm font-sans text-muted-foreground font-light">
                {fx.status === 'loading' ? (
                  <span
                    className="inline-block w-40 h-3 bg-card/80 animate-pulse rounded-sm align-middle"
                    aria-label="Carregando cotação"
                  />
                ) : fx.status === 'unavailable' ? (
                  <span className="text-muted-foreground/60">Cotação {currency} indisponível</span>
                ) : priceDebounced > 0 ? (
                  <>
                    ≈ {destinoNumberFormatter.format(result.valorTotalDestino)} {currency}
                    <span className="text-muted-foreground/55"> · PTAX {fx.date}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <footer className="text-center mt-10">
            <p className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-muted-foreground/45 font-sans">
              Fontes: B3 (via brapi.dev) · BCB PTAX
            </p>
          </footer>
        </motion.div>
      </div>
    </section>
  );
}
