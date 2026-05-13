import { useMemo } from 'react';
import type {
  CalculationInputs,
  CalculationResult,
  Commodity,
  ExchangeRateSource,
} from '../types/tokenization';

const RATES = {
  swift: {
    spread: 0.028,
    feeRate: 0.0035,
    feeCap: 12000,
    taxesRate: 0.004,
    settlementTime: '2 a 4 dias úteis',
  },
  aeternum: {
    spread: 0.004,
    networkFee: 0.00008,
    custodyRate: 0.00088,
    settlementTime: '~8 segundos',
  },
} as const;

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

export function useExportCalculation(
  inputs: CalculationInputs,
  exchangeRate: number,
  rateSource: ExchangeRateSource,
): CalculationResult {
  const { commodity, volumeToneladas, precoUnitarioBRL } = inputs;

  return useMemo(() => {
    const kgPorUnidade = KG_POR_UNIDADE[commodity];
    const volume = Number.isFinite(volumeToneladas) && volumeToneladas > 0 ? volumeToneladas : 0;
    const price = Number.isFinite(precoUnitarioBRL) && precoUnitarioBRL > 0 ? precoUnitarioBRL : 0;

    const unidades = (volume * 1000) / kgPorUnidade;
    const valorTotalBRL = Math.round(unidades * price);

    const valorTotalDestino = exchangeRate > 0 ? valorTotalBRL / exchangeRate : 0;

    const swiftSpread = valorTotalBRL * RATES.swift.spread;
    const swiftFee = Math.min(valorTotalBRL * RATES.swift.feeRate, RATES.swift.feeCap);
    const swiftTaxes = valorTotalBRL * RATES.swift.taxesRate;
    const swiftTotal = swiftSpread + swiftFee + swiftTaxes;

    const aetSpread = valorTotalBRL * RATES.aeternum.spread;
    const aetNetwork = valorTotalBRL * RATES.aeternum.networkFee;
    const aetCustody = valorTotalBRL * RATES.aeternum.custodyRate;
    const aetTotal = aetSpread + aetNetwork + aetCustody;

    const economyBRL = swiftTotal - aetTotal;
    const economyPercent = swiftTotal > 0 ? (economyBRL / swiftTotal) * 100 : 0;

    return {
      valorTotalBRL,
      valorTotalDestino: Math.round(valorTotalDestino),
      exchangeRate,
      exchangeRateSource: rateSource,
      swift: {
        spread: Math.round(swiftSpread),
        networkOrSwiftFee: Math.round(swiftFee),
        taxesOrCustody: Math.round(swiftTaxes),
        total: Math.round(swiftTotal),
        settlementTime: RATES.swift.settlementTime,
      },
      aeternum: {
        spread: Math.round(aetSpread),
        networkOrSwiftFee: Math.round(aetNetwork),
        taxesOrCustody: Math.round(aetCustody),
        total: Math.round(aetTotal),
        settlementTime: RATES.aeternum.settlementTime,
      },
      economyBRL: Math.round(economyBRL),
      economyPercent: Math.round(economyPercent * 10) / 10,
    };
  }, [commodity, volumeToneladas, precoUnitarioBRL, exchangeRate, rateSource]);
}
