import type { Commodity, Destination } from '../types/tokenization';

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

export const VOLUME_BOUNDS = {
  min: 100,
  max: 100000,
} as const;

export const PRICE_BOUNDS = {
  min: 1,
  max: 10000,
} as const;
