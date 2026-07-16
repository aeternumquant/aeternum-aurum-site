export type Commodity = 'soja' | 'milho' | 'boi-gordo';
export type Destination = 'china' | 'eua' | 'ue';

export interface CalculationInputs {
  commodity: Commodity;
  volumeToneladas: number;
  precoUnitarioBRL: number;
}

export interface CalculationResult {
  valorTotalBRL: number;
}
