import { GoogleGenAI, Type } from "@google/genai";

interface StationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  temp: number;
  humidity: number;
  /** Índice de Desconforto Térmico (Fórmula de Thom) */
  idt: number;
  /** Intensidade da Ilha de Calor Urbana: T_urbana − T_referência */
  icu: number;
  avgAnomaly: number;
  status: string;
  primaryArea: string;
  secondaryAreas: string[];
  isIoT?: boolean;
  isReference?: boolean;
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

const GEMINI_KEY = process.env.GEMINI_API_KEY || "AIzaSyD1WOd4p4bzEobzWb4iIVhLJ79qnGOOHc8";
const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

const fallbackResponse: AIAnalysis = {
  report: "Erro ao processar análise em tempo real. IDT e ICU sugerem atenção elevada em áreas centrais devido ao adensamento asfáltico. Referência: Messejana.",
  recommendations: [
    {
      id: "rec-err",
      type: "CIVIL_DEFENSE",
      title: "Monitoramento Manual",
      description: "Falha na análise automatizada. Recomenda-se verificação manual dos sensores no Centro e Montese. ICU acima de 1.5°C detectada.",
    },
  ],
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!GEMINI_KEY) {
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
    `${s.name}: ${s.temp}°C (IDT: ${s.idt}, ICU: +${s.icu}°C, Status: ${s.status}${s.isReference ? ' [REF]' : ''})`
  )).join(', ');

  const prompt = `
[PROMPT DE SISTEMA: MOTOR DE ALERTA CLIMÁTICO - DEFESA CIVIL DE FORTALEZA]

Contexto e Papel:
Você é o motor analítico do Observatório de Riscos Climáticos de Fortaleza. Sua função é ingerir dados meteorológicos brutos em tempo real, calcular índices de conforto térmico e gerar produtos de monitoramento, relatórios e alertas escalonados (Atenção, Alerta e Alarme) para o Plano Municipal de Contingência.

Dados em tempo real das estações:
${stationSummary}

Regras de Processamento (Aclimatação da População):
A zona de desconforto crítico em Fortaleza só se inicia a partir de um Índice de Calor (HI) de 32,1°C devido à aclimatação tropical, ventos alísios constantes e umidade. 

Parâmetros de Gatilho e Estabilidade (Thresholds de Segurança):
Classifique o cenário geral da cidade usando os dados acima nestas faixas:
- Nível 0 (Seguro/Rotina): HI até 27°C. Sem impactos esperados.
- Nível 1 (ATENÇÃO / Cuidado): HI entre 27,1°C e 32°C. Possível fadiga. Requer informes preventivos.
- Nível 2 (ALERTA / Cuidado Extremo): HI entre 32,1°C e 41°C. Risco de insolação. Orientações de saúde necessárias.
- Nível 3 (ALARME / Perigo Extremo): HI acima de 41,1°C. Risco iminente de colapso térmico.

Regra de Rebaixamento (Anti-Fadiga de Alertas):
O backend já aplica uma validação de 60 minutos para rebaixar o status de uma estação. Assuma os dados fornecidos como já filtrados e qualificados.

Instruções de Saída:
Analise os dados e gere um JSON contendo:
1. "report": Um Resumo Executivo conciso com o Status Atual (Nível mais alto detectado na cidade) e o Bairro mais crítico (se houver atenção).
2. "recommendations": Uma lista de ações obrigatórias a serem ativadas no momento (ex: hidratação, suspensão de atividades ao ar livre), classificadas por tipo (HEALTH, TRAFFIC, CIVIL_DEFENSE). Responda em português.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
