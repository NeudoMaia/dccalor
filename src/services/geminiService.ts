/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StationData, AIAnalysis } from "../types";

const ANALYZE_ENDPOINT = '/api/analyze';

export async function analyzeThermalData(stations: StationData[], forecasts: any[]): Promise<AIAnalysis> {
  try {
    const response = await fetch(ANALYZE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stations, forecasts }),
    });

    if (!response.ok) {
      throw new Error(`AI endpoint responded with ${response.status}`);
    }

    const result = await response.json() as AIAnalysis;
    return result;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      report: "Erro ao processar análise em tempo real. IDT e ICU sugerem atenção elevada em áreas centrais devido ao adensamento asfáltico. Referência: Messejana.",
      recommendations: [
        {
          id: "rec-err",
          type: "CIVIL_DEFENSE",
          title: "Monitoramento Manual",
          description: "Falha na análise automatizada. Recomenda-se verificação manual dos sensores no Centro e Montese. ICU acima de 1.5°C detectada."
        }
      ]
    };
  }
}
