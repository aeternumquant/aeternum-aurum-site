// Última atualização: 13/05/2026 (mock — atualizar manualmente).
// Fonte de referência pública: CEPEA/ESALQ (cepea.org.br).

import type { Commodity, Destination, Currency } from '../types/tokenization';

export const COMMODITY_PRICES_BRL: Record<Commodity, number> = {
  soja: 122.81,        // R$/saca 60kg, Paranaguá
  milho: 65.51,        // R$/saca 60kg, Campinas
  'boi-gordo': 348.80, // R$/arroba, ESALQ/B3
};

export const COMMODITY_LABELS: Record<Commodity, string> = {
  soja: 'Soja (R$/saca 60kg)',
  milho: 'Milho (R$/saca 60kg)',
  'boi-gordo': 'Boi gordo (R$/arroba)',
};

export const COMMODITY_SHORT_LABELS: Record<Commodity, string> = {
  soja: 'Soja',
  milho: 'Milho',
  'boi-gordo': 'Boi gordo',
};

export const DESTINATION_LABELS: Record<Destination, string> = {
  china: 'China',
  eua: 'Estados Unidos',
  ue: 'União Europeia',
};

export const DESTINATION_DEFAULT_CURRENCY: Record<Destination, Currency> = {
  china: 'CNY',
  eua: 'USD',
  ue: 'EUR',
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  USD: 'USD',
  EUR: 'EUR',
  CNY: 'CNY',
};

export const VOLUME_BOUNDS = {
  min: 100,
  max: 100000,
} as const;

export const PRICE_BOUNDS = {
  min: 1,
  max: 10000,
} as const;
