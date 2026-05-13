import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Landmark } from 'lucide-react';
import type {
  Commodity,
  Currency,
  Destination,
  ExchangeRateSource,
} from '../../types/tokenization';
import {
  COMMODITY_LABELS,
  COMMODITY_PRICES_BRL,
  DESTINATION_DEFAULT_CURRENCY,
  DESTINATION_LABELS,
  PRICE_BOUNDS,
  VOLUME_BOUNDS,
} from '../../data/commodityPrices';
import { getExchangeRate } from '../../services/currencyService';
import { useExportCalculation } from '../../hooks/useExportCalculation';
import { ScenarioCard } from './ScenarioCard';
import { EconomyBar } from './EconomyBar';
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

export default function ExportCalculator() {
  const [commodity, setCommodity] = useState<Commodity>('soja');
  const [destination, setDestination] = useState<Destination>('china');
  const [currency, setCurrency] = useState<Currency>('CNY');

  const [volumeRaw, setVolumeRaw] = useState<string>('1000');
  const [volumeDebounced, setVolumeDebounced] = useState<number>(1000);

  const [priceRaw, setPriceRaw] = useState<string>(
    priceToInputString(COMMODITY_PRICES_BRL.soja),
  );
  const [priceDebounced, setPriceDebounced] = useState<number>(
    COMMODITY_PRICES_BRL.soja,
  );

  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [rateSource, setRateSource] = useState<ExchangeRateSource>('cache');
  const [rateReady, setRateReady] = useState<boolean>(false);

  // Reset preço para o default de mercado quando a commodity muda.
  // Usuário ainda pode editar livremente depois.
  useEffect(() => {
    const defaultPrice = COMMODITY_PRICES_BRL[commodity];
    setPriceRaw(priceToInputString(defaultPrice));
    setPriceDebounced(defaultPrice);
  }, [commodity]);

  // Moeda padrão derivada do destino — usuário pode trocar manualmente
  // via os chips abaixo.
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

  // Fetch PTAX quando a moeda muda. Skeleton apenas no primeiro fetch;
  // trocas subsequentes de moeda atualizam silenciosamente.
  useEffect(() => {
    let cancelled = false;
    getExchangeRate(currency).then(({ rate, source }) => {
      if (cancelled) return;
      setExchangeRate(rate);
      setRateSource(source);
      setRateReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [currency]);

  const result = useExportCalculation(
    {
      commodity,
      volumeToneladas: volumeDebounced,
      precoUnitarioBRL: priceDebounced,
      destination,
      currency,
    },
    exchangeRate,
    rateSource,
  );

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
              Liquidação cross-border de commodities
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-light leading-relaxed">
              Simule o custo real de exportar via SWIFT tradicional comparado ao
              trilho Aeternum (XDC + HBAR + ouro auditável em Dubai).
            </p>
          </header>

          <div className="bg-card/40 border border-white/5 rounded-sm p-6 sm:p-10">
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
              aria-label="Moeda de liquidação"
            >
              <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-sans">
                Moeda de liquidação
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
              className="mb-10 pb-10 border-b border-white/5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
              aria-live="polite"
            >
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2 font-sans">
                  Valor total da operação
                </p>
                <p className="font-display text-3xl sm:text-4xl font-light text-foreground leading-none tabular-nums">
                  {formatBRL(result.valorTotalBRL)}
                </p>
              </div>
              <div className="text-sm font-sans text-muted-foreground font-light">
                {rateReady && exchangeRate > 0 ? (
                  <>
                    ≈ {destinoNumberFormatter.format(result.valorTotalDestino)}{' '}
                    {currency}
                    {rateSource === 'cache' ? (
                      <span className="text-muted-foreground/55">
                        {' '}
                        · cotação em cache
                      </span>
                    ) : null}
                  </>
                ) : (
                  <span
                    className="inline-block w-40 h-3 bg-card/80 animate-pulse rounded-sm align-middle"
                    aria-label="Carregando cotação"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <ScenarioCard
                variant="swift"
                title="Via SWIFT tradicional"
                Icon={Landmark}
                breakdown={result.swift}
                totalLabel="Custo total SWIFT"
              />
              <ScenarioCard
                variant="aeternum"
                title="Via Aeternum Aurum"
                Icon={Coins}
                breakdown={result.aeternum}
                totalLabel="Custo total Aeternum"
              />
            </div>

            <EconomyBar
              economyBRL={result.economyBRL}
              economyPercent={result.economyPercent}
            />
          </div>

          <footer className="text-center mt-10">
            <p className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-muted-foreground/45 font-sans">
              Fontes: CEPEA/ESALQ · BCB PTAX · pesquisa Aeternum 2025
            </p>
          </footer>
        </motion.div>
      </div>
    </section>
  );
}
