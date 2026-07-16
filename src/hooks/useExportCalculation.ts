import { useMemo } from 'react';
import type {
  CalculationInputs,
  CalculationResult,
  Commodity,
} from '../types/tokenization';

// Peso em kg de cada unidade comercial padrão do agro brasileiro.
// Soja/milho cotados em sacas de 60 kg; boi gordo em arroba (15 kg).
// Calcular `unidades = volume_kg / kg_por_unidade` em vez de usar um fator
// pré-arredondado (ex.: 16,667 sacas/ton) elimina erro acumulativo em
// operações grandes — bate exatamente com qualquer planilha do cliente.
const KG_POR_UNIDADE: Record<Commodity, number> = {
  soja: 60,
  milho: 60,
  'boi-gordo': 15,
};

// Calculadora de VALOR de exportação: volume x preço = valor total em BRL.
// O equivalente em USD (commodity de exportacao liquida em dolar) e calculado
// no componente pela PTAX do cache, via marketFormat.brlToUsdReference.
export function useExportCalculation(inputs: CalculationInputs): CalculationResult {
  const { commodity, volumeToneladas, precoUnitarioBRL } = inputs;

  return useMemo(() => {
    const kgPorUnidade = KG_POR_UNIDADE[commodity];
    const volume = Number.isFinite(volumeToneladas) && volumeToneladas > 0 ? volumeToneladas : 0;
    const price = Number.isFinite(precoUnitarioBRL) && precoUnitarioBRL > 0 ? precoUnitarioBRL : 0;

    const unidades = (volume * 1000) / kgPorUnidade;
    const valorTotalBRL = Math.round(unidades * price);

    return { valorTotalBRL };
  }, [commodity, volumeToneladas, precoUnitarioBRL]);
}
