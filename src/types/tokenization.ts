export type Commodity = 'soja' | 'milho' | 'boi-gordo';
export type Destination = 'china' | 'eua' | 'ue';
export type Currency = 'USD' | 'EUR' | 'CNY';

export interface CalculationInputs {
  commodity: Commodity;
  volumeToneladas: number;
  precoUnitarioBRL: number;
  destination: Destination;
  currency: Currency;
}

export interface CalculationResult {
  valorTotalBRL: number;
  valorTotalDestino: number;
}

export interface DestinationConfig {
  label: string;
  defaultCurrency: Currency;
}
