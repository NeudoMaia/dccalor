/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { StationData, AIAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeThermalData(stations: StationData[]): Promise<AIAnalysis> {
  const stationSummary = stations.map(s => (
    `${s.name}: ${s.temp}°C (Delta: +${s.delta}°C, Status: ${s.status})`
  )).join(', ');

  const prompt = `
    Como um analista especialista em meteorologia urbana e saúde pública da Prefeitura de Fortaleza, 
    analise os seguintes dados das estações meteorológicas em tempo real: ${stationSummary}.
    
    Identifique se há formação de Ilhas de Calor (ICU). 
    Gere um relatório técnico conciso (máximo 400 caracteres) e recomende ações imediatas para a Defesa Civil e a Secretaria de Saúde.
    As recomendações devem ser classificadas como HEALTH, TRAFFIC ou CIVIL_DEFENSE.
    
    Responda em português.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            report: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["HEALTH", "TRAFFIC", "CIVIL_DEFENSE"] },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["id", "type", "title", "description"]
              }
            }
          },
          required: ["report", "recommendations"]
        }
      }
    });

    return JSON.parse(response.text || "{}") as AIAnalysis;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      report: "Erro ao processar análise em tempo real. Padrão térmico sugere atenção elevada em áreas centrais devido ao adensamento asfáltico.",
      recommendations: [
        {
          id: "rec-err",
          type: "CIVIL_DEFENSE",
          title: "Monitoramento Manual",
          description: "Falha na análise automatizada. Recomenda-se verificação manual dos sensores no Centro e Montese."
        }
      ]
    };
  }
}
