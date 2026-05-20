import { GoogleGenAI, Type } from "@google/genai";

interface StationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  temp: number;
  humidity: number;
  heatIndex: number;
  delta: number;
  avgAnomaly: number;
  status: string;
  primaryArea: string;
  secondaryAreas: string[];
  isIoT?: boolean;
}

interface AIAnalysis {
  report: string;
  recommendations: {
    id: string;
    type: 'HEALTH' | 'TRAFFIC' | 'CIVIL_DEFENSE';
    title: string;
    description: string;
  }[];
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const fallbackResponse: AIAnalysis = {
  report: "Erro ao processar análise em tempo real. Padrão térmico sugere atenção elevada em áreas centrais devido ao adensamento asfáltico.",
  recommendations: [
    {
      id: "rec-err",
      type: "CIVIL_DEFENSE",
      title: "Monitoramento Manual",
      description: "Falha na análise automatizada. Recomenda-se verificação manual dos sensores no Centro e Montese.",
    },
  ],
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({
      error: 'GEMINI_API_KEY não configurada no ambiente do servidor.',
      ...fallbackResponse,
    });
    return;
  }

  let payload: { stations: StationData[] };
  try {
    payload = req.body;
  } catch (error) {
    res.status(400).json({ error: 'Corpo inválido', ...fallbackResponse });
    return;
  }

  const stationSummary = payload.stations.map((s) => (
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
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
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
                  type: { type: Type.STRING, enum: ['HEALTH', 'TRAFFIC', 'CIVIL_DEFENSE'] },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ['id', 'type', 'title', 'description']
              }
            }
          },
          required: ['report', 'recommendations']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}') as AIAnalysis;
    res.status(200).json(parsed);
  } catch (error) {
    console.error('AI Analysis failed:', error);
    res.status(500).json({ error: 'Falha no serviço de IA', ...fallbackResponse });
  }
}
