// Testes documentados para useExportCalculation.
//
// Estado: este arquivo é um STUB. Vitest/Jest não estão instalados neste
// projeto no momento da escrita (ver package.json — scripts apenas dev/build/preview).
// Os casos abaixo ficam dentro de um bloco /* */ para que o TypeScript trate
// o arquivo como módulo vazio (compilação não quebra), mas o conteúdo pode ser
// "descomentado" e executado assim que infraestrutura de testes for adicionada
// (npm i -D vitest @testing-library/react @testing-library/react-hooks jsdom).
//
// Para ativar: remover o /* na linha abaixo e o */ no final, adicionar
// "test": "vitest" ao package.json, e instalar as devDependencies acima.
//
// NOTA: a comparacao de custo (SWIFT vs trilho) e o seletor de moeda foram
// removidos. O hook so devolve valorTotalBRL; o equivalente em USD e calculado
// no componente pela PTAX do cache (marketFormat.brlToUsdReference).

/*
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useExportCalculation } from './useExportCalculation';
import type { CalculationInputs } from '../types/tokenization';

const baseInputs: CalculationInputs = {
  commodity: 'soja',
  volumeToneladas: 1000,
  precoUnitarioBRL: 122.81,
};

describe('useExportCalculation — valor total da operação', () => {
  it('soja 1000t @ R$122,81/saca → valor total = R$ 2.046.833 (saca 60 kg)', () => {
    const { result } = renderHook(() => useExportCalculation(baseInputs));
    // (1000 × 1000 / 60) × 122.81 = 2,046,833.33 → Math.round = 2.046.833
    expect(result.current.valorTotalBRL).toBe(2046833);
  });

  it('boi-gordo 100t @ R$348,80/arroba → valor total = R$ 2.325.333 (arroba 15 kg)', () => {
    const { result } = renderHook(() =>
      useExportCalculation({
        ...baseInputs,
        commodity: 'boi-gordo',
        volumeToneladas: 100,
        precoUnitarioBRL: 348.80,
      }),
    );
    // (100 × 1000 / 15) × 348.80 = 2,325,333.33 → Math.round = 2.325.333
    expect(result.current.valorTotalBRL).toBe(2325333);
  });

  it('milho usa o mesmo peso de saca da soja (60 kg)', () => {
    const { result } = renderHook(() =>
      useExportCalculation({ ...baseInputs, commodity: 'milho' }),
    );
    expect(result.current.valorTotalBRL).toBe(2046833);
  });
});

describe('useExportCalculation — edge cases (sem NaN, sem Infinity)', () => {
  it('volume zero → valor total zero', () => {
    const { result } = renderHook(() =>
      useExportCalculation({ ...baseInputs, volumeToneladas: 0 }),
    );
    expect(result.current.valorTotalBRL).toBe(0);
  });

  it('preço zero → valor total zero', () => {
    const { result } = renderHook(() =>
      useExportCalculation({ ...baseInputs, precoUnitarioBRL: 0 }),
    );
    expect(result.current.valorTotalBRL).toBe(0);
  });

  it('volume negativo é tratado como zero (defensive guard)', () => {
    const { result } = renderHook(() =>
      useExportCalculation({ ...baseInputs, volumeToneladas: -500 }),
    );
    expect(result.current.valorTotalBRL).toBe(0);
  });

  it('preço NaN é tratado como zero (defensive guard)', () => {
    const { result } = renderHook(() =>
      useExportCalculation({ ...baseInputs, precoUnitarioBRL: NaN }),
    );
    expect(result.current.valorTotalBRL).toBe(0);
  });
});
*/

export {};
