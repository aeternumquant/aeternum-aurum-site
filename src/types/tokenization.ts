export type Commodity = 'soja' | 'milho' | 'boi-gordo';
export type Destination = 'china' | 'eua' | 'ue';
export type Currency = 'USD' | 'EUR' | 'CNY';

export type ExchangeRateSource = 'live' | 'cache';

export interface CalculationInputs {
  commodity: Commodity;
  volumeToneladas: number;
  precoUnitarioBRL: number;
  destination: Destination;
  currency: Currency;
}

export interface CostBreakdown {
  spread: number;
  networkOrSwiftFee: number;
  taxesOrCustody: number;
  total: number;
  settlementTime: string;
}

export interface CalculationResult {
  valorTotalBRL: number;
  valorTotalDestino: number;
  exchangeRate: number;
  exchangeRateSource: ExchangeRateSource;
  swift: CostBreakdown;
  aeternum: CostBreakdown;
  economyBRL: number;
  economyPercent: number;
}

export interface DestinationConfig {
  label: string;
  defaultCurrency: Currency;
}
