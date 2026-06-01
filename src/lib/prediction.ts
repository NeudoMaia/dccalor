/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Modelo Preditivo — Suavização Exponencial Dupla (Método de Holt)
 *
 * Implementação TypeScript como alternativa leve ao Prophet/LSTM.
 * Captura tendência linear para projeções de curto prazo (7 dias).
 *
 * Equações:
 *   Nível:     S_t = α·Y_t + (1 − α)·(S_{t-1} + b_{t-1})
 *   Tendência: b_t = β·(S_t − S_{t-1}) + (1 − β)·b_{t-1}
 *   Previsão:  F_{t+m} = S_t + m·b_t
 *
 * Nota: Para implementação de produção com regressores externos
 * (radiação, vento), evoluir para ARIMAX/Prophet via endpoint Python
 * conforme equação:
 *   T_t = α + Σ(φi·T_{t-i}) + β1(Radiação) + β2(Vento) + εt
 */

import { PredictionPoint } from '../types';

/**
 * Previsão via Suavização Exponencial Dupla de Holt.
 *
 * @param data         Série temporal observada (mín. 2 pontos)
 * @param periodsAhead Número de períodos a projetar (default: 7)
 * @param alpha        Fator de suavização do nível (0 < α < 1, default: 0.35)
 * @param beta         Fator de suavização da tendência (0 < β < 1, default: 0.15)
 * @returns            Array de PredictionPoint com valor e confiança
 */
export function holtPredict(
  data: number[],
  periodsAhead: number = 7,
  alpha: number = 0.35,
  beta: number = 0.15
): PredictionPoint[] {
  if (data.length < 2) return [];

  // Inicialização
  let level = data[0];
  let trend = data[1] - data[0];

  // Fase de ajuste (fitting)
  for (let t = 1; t < data.length; t++) {
    const newLevel = alpha * data[t] + (1 - alpha) * (level + trend);
    const newTrend = beta * (newLevel - level) + (1 - beta) * trend;
    level = newLevel;
    trend = newTrend;
  }

  // Fase de projeção (forecasting)
  const predictions: PredictionPoint[] = [];

  for (let m = 1; m <= periodsAhead; m++) {
    const value = level + m * trend;
    // Confiança decresce linearmente com o horizonte de previsão
    const confidence = Math.max(0.4, 1 - (m * 0.08));
    
    const d = new Date();
    d.setDate(d.getDate() + m);
    const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;

    predictions.push({
      date: dateStr,
      value: parseFloat(value.toFixed(1)),
      confidence
    });
  }

  return predictions;
}

/**
 * Calcula a baseline histórica (média) de uma série temporal.
 * Usada para computar a anomalia: avgAnomaly = T_atual − baseline.
 */
export function calculateBaseline(data: number[]): number {
  if (data.length === 0) return 0;
  const sum = data.reduce((acc, v) => acc + v, 0);
  return parseFloat((sum / data.length).toFixed(2));
}

/**
 * Calcula a anomalia de temperatura em relação à baseline histórica.
 * Valor positivo = mais quente que o normal.
 * Valor negativo = mais frio que o normal.
 */
export function calculateAnomaly(currentTemp: number, baseline: number): number {
  return parseFloat((currentTemp - baseline).toFixed(1));
}
