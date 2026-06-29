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
    timeframe?: string;
    targetStation?: string;
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
      timeframe: "Imediato",
      targetStation: "Centro"
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

  let payload: { stations: StationData[], forecasts?: any[] };
  try {
    payload = req.body;
  } catch (error) {
    res.status(400).json({ error: 'Corpo inválido', ...fallbackResponse });
    return;
  }

  const stationSummary = payload.stations.map((s) => (
    `${s.name}: ${s.temp}°C (IDT: ${s.idt}, ICU: +${s.icu}°C, Status: ${s.status}${s.isReference ? ' [REF]' : ''})`
  )).join(', ');

  let forecastSummary = "";
  if (payload.forecasts && payload.forecasts.length > 0) {
    forecastSummary = payload.forecasts.map((f: any) => {
      const day1 = f.tempForecast && f.tempForecast[0] ? `Dia +1: ${f.tempForecast[0].value}°C (IDT/Ap: ${f.idtForecast[0].value}°C)` : '';
      const day2 = f.tempForecast && f.tempForecast[1] ? `Dia +2: ${f.tempForecast[1].value}°C (IDT/Ap: ${f.idtForecast[1].value}°C)` : '';
      const day3 = f.tempForecast && f.tempForecast[2] ? `Dia +3: ${f.tempForecast[2].value}°C (IDT/Ap: ${f.idtForecast[2].value}°C)` : '';
      return `- ${f.name}: [${day1}] [${day2}] [${day3}]`;
    }).join('\n');
  } else {
    forecastSummary = "Previsões não fornecidas.";
  }

  const prompt = `
[PROMPT DE SISTEMA: MOTOR DE ALERTA CLIMÁTICO E PREDITIVO - DEFESA CIVIL DE FORTALEZA]

Contexto e Papel:
Você é o motor analítico preditivo do Observatório de Riscos Climáticos de Fortaleza. Sua função é analisar dados meteorológicos em tempo real e as projeções matemáticas de 3 dias para calcular índices de desconforto térmico, prever picos de calor e gerar recomendações e protocolos preventivos ativados por prazo (ex: alertas antecipados de 24h, 48h ou 72h).

Dados em tempo real das estações:
${stationSummary}

Previsão Preditiva (Próximos 3 Dias) via Modelo de Holt:
${forecastSummary}

Regras de Processamento (Aclimatação da População):
A zona de desconforto crítico em Fortaleza só se inicia a partir de um Índice de Calor (HI) ou Temperatura Aparente (IDT) de 32,1°C devido à aclimatação tropical, ventos alísios constantes e umidade.

Parâmetros de Gatilho e Estabilidade (Thresholds de Segurança):
Classifique o cenário das estações (tanto atual quanto futuro) nestas faixas:
- Nível 0 (Seguro/Rotina): HI/IDT até 27°C. Sem impactos esperados.
- Nível 1 (ATENÇÃO / Cuidado): HI/IDT entre 27,1°C e 32°C. Possível fadiga. Requer informes preventivos.
- Nível 2 (ALERTA / Cuidado Extremo): HI/IDT entre 32,1°C e 41°C. Risco de insolação. Orientações de saúde necessárias.
- Nível 3 (ALARME / Perigo Extremo): HI/IDT acima de 41,1°C. Risco iminente de colapso térmico.

Diretrizes de Análise Preditiva:
1. Compare os valores atuais com as previsões para os dias +1, +2 e +3.
2. Identifique tendências de aumento significativo de temperatura/IDT (ilha de calor).
3. Se alguma estação estiver prevista para subir de nível (ex: Nível 1 para Nível 2) nos próximos dias, crie recomendações de protocolo preventivo adequadas.
4. Para cada recomendação, associe o "timeframe" correspondente (ex: "Imediato", "Próximas 24h", "Próximas 48h" ou "Próximas 72h") e a estação/bairro alvo ("targetStation").

Instruções de Saída:
Analise os dados e gere um JSON contendo:
1. "report": Um Resumo Executivo conciso em português, focado nas condições atuais e nas principais ameaças preditivas identificadas para os próximos 3 dias (mencione os bairros que exigem mais atenção preventiva).
2. "recommendations": Uma lista de ações preventivas e imediatas recomendadas no momento, classificadas por tipo (HEALTH, TRAFFIC, CIVIL_DEFENSE). Cada recomendação deve obrigatoriamente possuir os campos:
   - "id": ID único (ex: "rec-1", "rec-2")
   - "type": 'HEALTH', 'TRAFFIC' ou 'CIVIL_DEFENSE'
   - "title": Título curto da recomendação
   - "description": Detalhes do protocolo sugerido
   - "timeframe": Prazo previsto para ativação (ex: "Imediato", "Próximas 24h", "Próximas 48h", "Próximas 72h")
   - "targetStation": O nome do bairro/estação que requer esta ação (ex: "Centro", "Montese", etc.)
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
                  description: { type: Type.STRING },
                  timeframe: { type: Type.STRING },
                  targetStation: { type: Type.STRING }
                },
                required: ['id', 'type', 'title', 'description', 'timeframe', 'targetStation']
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
