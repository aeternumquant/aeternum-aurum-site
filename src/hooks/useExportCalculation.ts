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

// Calculadora de VALOR de exportação: volume x preço = valor total, e o
// equivalente na moeda do destino pela taxa de referência (PTAX). Nao ha
// comparacao de custo de trilho, spread ou economia: essas afirmacoes foram
// removidas por nao terem fonte defensavel.
export function useExportCalculation(
  inputs: CalculationInputs,
  exchangeRate: number,
): CalculationResult {
  const { commodity, volumeToneladas, precoUnitarioBRL } = inputs;

  return useMemo(() => {
    const kgPorUnidade = KG_POR_UNIDADE[commodity];
    const volume = Number.isFinite(volumeToneladas) && volumeToneladas > 0 ? volumeToneladas : 0;
    const price = Number.isFinite(precoUnitarioBRL) && precoUnitarioBRL > 0 ? precoUnitarioBRL : 0;

    const unidades = (volume * 1000) / kgPorUnidade;
    const valorTotalBRL = Math.round(unidades * price);

    // exchangeRate = BRL por unidade da moeda do destino (PTAX venda). Sem taxa
    // valida (0), nao ha equivalente no destino.
    const valorTotalDestino = exchangeRate > 0 ? Math.round(valorTotalBRL / exchangeRate) : 0;

    return { valorTotalBRL, valorTotalDestino };
  }, [commodity, volumeToneladas, precoUnitarioBRL, exchangeRate]);
}
