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
    Como um analista especialista em meteorologia urbana e saúde pública da Defesa Civil de Fortaleza,
    analise os seguintes dados das estações meteorológicas em tempo real: ${stationSummary}.

    Seu diagnóstico e relatórios devem ser baseados nas seguintes premissas e LÓGICA TERMAL ESPECÍFICA DE FORTALEZA:
    1. Aclimatação & Conforto Tropical: Por estarmos em uma região de clima tropical úmido, a zona de conforto térmico da população local é ligeiramente mais alta, situando-se tipicamente entre 24°C e 27°C.
    2. Impacto da Umidade Relativa: Fortaleza possui umidade média elevada (>70%). Sob alta umidade, o suor não evapora facilmente, bloqueando o resfriamento biológico do corpo e acelerando a fadiga térmica (exemplo: 29°C com 80% de umidade gera estresse térmico correspondente a sensação >33°C).
    3. Efeito Refrescante dos Ventos Alísios: A ventilação constante atua como um regulador natural. Sob brisa constante (típica dos alísios de Fortaleza), temperaturas de 28°C-29°C tornam-se toleráveis e confortáveis devido à aceleração da evaporação cutânea.
    4. Adensamento e ICU precoce: As superfícies asfálticas e de concreto em bairros adensados (ex: Centro ou Aldeota) retêm muito mais radiação, fazendo com que ultrapassem os limites saudáveis de conforto muito mais cedo que as áreas litorâneas ou florestadas.

    Analise os Índices de Desconforto Térmico (IDT - Thom) e a Intensidade das Ilhas de Calor (ICU = T_urbana − T_mínima).
    Classifique cada estação conforme: IDT<24=Confortável, 24-27=Alerta Amarelo, 28-29=Alerta Laranja, ≥30=Emergência Médica.

    Gere um relatório técnico extremamente conciso (máximo 400 caracteres) aplicando esta lógica termal local e recomende ações imediatas e mitigatórias exclusivas para a Defesa Civil de Fortaleza.
    As recomendações devem ser classificadas como HEALTH, TRAFFIC ou CIVIL_DEFENSE.

    Responda em português.
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
