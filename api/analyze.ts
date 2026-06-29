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

function generateDynamicFallback(stations: StationData[], forecasts?: any[]): AIAnalysis {
  const recommendations: any[] = [];
  
  let maxIdt = -Infinity;
  let criticalStation: StationData | null = null;
  
  stations.forEach(s => {
    if (s.idt > maxIdt) {
      maxIdt = s.idt;
      criticalStation = s;
    }
  });

  const currentLevel = criticalStation ? (criticalStation as StationData).status : 'NIVEL_0';
  const currentLevelName = 
    currentLevel === 'NIVEL_3' ? 'Alarme' :
    currentLevel === 'NIVEL_2' ? 'Alerta' :
    currentLevel === 'NIVEL_1' ? 'Atenção' : 'Seguro';
  
  if (criticalStation) {
    const sName = (criticalStation as StationData).name.replace(' (Ref. Térmica)', '').replace(' (Ref. T\u00e9rmica)', '');
    const idtVal = (criticalStation as StationData).idt;
    if (currentLevel === 'NIVEL_1') {
      recommendations.push({
        id: "rec-cur-1",
        type: "HEALTH",
        title: `Hidratação Preventiva - ${sName}`,
        description: `Sensação térmica de ${idtVal}°C (Nível de Atenção). Recomenda-se beber água constantemente e evitar exposição prolongada ao sol.`,
        timeframe: "Imediato",
        targetStation: sName
      });
      recommendations.push({
        id: "rec-cur-2",
        type: "CIVIL_DEFENSE",
        title: `Informativos de Saúde - ${sName}`,
        description: `Disparar alertas preventivos de autocuidado nos canais oficiais para o bairro ${sName} e adjacências.`,
        timeframe: "Imediato",
        targetStation: sName
      });
    } else if (currentLevel === 'NIVEL_2') {
      recommendations.push({
        id: "rec-cur-1",
        type: "HEALTH",
        title: `Risco de Insolação - ${sName}`,
        description: `Sensação térmica crítica de ${idtVal}°C. Recomenda-se evitar atividades físicas externas e pausar trabalhos ao ar livre.`,
        timeframe: "Imediato",
        targetStation: sName
      });
      recommendations.push({
        id: "rec-cur-2",
        type: "CIVIL_DEFENSE",
        title: `Pausas no Trabalho Externo - ${sName}`,
        description: `Recomendar pausas obrigatórias no trabalho ao ar livre de operários/agentes entre 13h e 17h. Preparar rede de atendimento de saúde.`,
        timeframe: "Imediato",
        targetStation: sName
      });
      recommendations.push({
        id: "rec-cur-3",
        type: "TRAFFIC",
        title: `Monitoramento de Vias - ${sName}`,
        description: `Intensificar fiscalização de trânsito em pontos de congestionamento para reduzir tempo de exposição dos condutores ao calor.`,
        timeframe: "Imediato",
        targetStation: sName
      });
    } else if (currentLevel === 'NIVEL_3') {
      recommendations.push({
        id: "rec-cur-1",
        type: "HEALTH",
        title: `Emergência Médica: AVC Térmico - ${sName}`,
        description: `Sensação extrema de ${idtVal}°C. Risco de choque térmico e AVC. Permaneça em ambientes resfriados e procure ajuda médica se necessário.`,
        timeframe: "Imediato",
        targetStation: sName
      });
      recommendations.push({
        id: "rec-cur-2",
        type: "CIVIL_DEFENSE",
        title: `Pontos de Resfriamento - ${sName}`,
        description: `Determinar abertura emergencial de abrigos públicos com ar-condicionado e distribuição de água. Suspensão total de obras externas nas vias.`,
        timeframe: "Imediato",
        targetStation: sName
      });
      recommendations.push({
        id: "rec-cur-3",
        type: "TRAFFIC",
        title: `Suspensão de Obras de Asfalto - ${sName}`,
        description: `Paralisar recapeamento asfáltico para evitar sobreaquecimento adicional da atmosfera urbana em áreas críticas.`,
        timeframe: "Imediato",
        targetStation: sName
      });
    } else {
      recommendations.push({
        id: "rec-cur-default",
        type: "CIVIL_DEFENSE",
        title: `Monitoramento Climatológico - ${sName}`,
        description: `Temperatura e sensação térmica de ${idtVal}°C dentro da faixa de segurança em ${sName}. Seguir rotina padrão.`,
        timeframe: "Imediato",
        targetStation: sName
      });
    }
  }

  const risingStations: any[] = [];
  if (forecasts && forecasts.length > 0) {
    forecasts.forEach((f: any) => {
      const sName = f.name.replace(' (Ref. Térmica)', '').replace(' (Ref. T\u00e9rmica)', '');
      const curStat = stations.find(s => s.id === f.id);
      const curIdt = curStat ? curStat.idt : 28;
      
      if (f.idtForecast) {
        f.idtForecast.forEach((day: any, idx: number) => {
          const forecastedIdt = day.value;
          const forecastedLevel = 
            forecastedIdt <= 27 ? 'NIVEL_0' :
            forecastedIdt <= 32 ? 'NIVEL_1' :
            forecastedIdt <= 41.1 ? 'NIVEL_2' : 'NIVEL_3';
          
          if (forecastedIdt - curIdt >= 1.2 && forecastedLevel !== 'NIVEL_0') {
            const dayNum = idx + 1;
            const timeframeStr = `Próximas ${dayNum * 24}h`;
            
            if (!risingStations.some(r => r.name === sName && r.timeframe === timeframeStr)) {
              risingStations.push({
                name: sName,
                currentIdt: curIdt,
                predictedIdt: forecastedIdt,
                timeframe: timeframeStr,
                level: forecastedLevel
              });
            }
          }
        });
      }
    });
  }

  risingStations.slice(0, 3).forEach((r, idx) => {
    let title = "";
    let desc = "";
    let type: 'HEALTH' | 'TRAFFIC' | 'CIVIL_DEFENSE' = "CIVIL_DEFENSE";

    if (r.level === 'NIVEL_2' || r.level === 'NIVEL_3') {
      type = "CIVIL_DEFENSE";
      title = `Prevenção Climatológica (${r.timeframe}) - ${r.name}`;
      desc = `Projeção matemática (Holt) aponta elevação crítica da sensação térmica para ${r.predictedIdt}°C. Recomenda-se pré-alertar hospitais e preparar planos de contingência locais.`;
    } else {
      type = "HEALTH";
      title = `Alerta Preventivo (${r.timeframe}) - ${r.name}`;
      desc = `Previsão de aumento de sensação térmica de ${r.currentIdt}°C para ${r.predictedIdt}°C. Recomendamos divulgar cuidados básicos com hidratação e insolação preventiva.`;
    }

    recommendations.push({
      id: `rec-pred-${idx}`,
      type,
      title,
      description: desc,
      timeframe: r.timeframe,
      targetStation: r.name
    });
  });

  if (recommendations.filter(r => r.id.startsWith('rec-pred')).length === 0 && forecasts && forecasts.length > 0) {
    const highestFuture = forecasts.map((f: any) => {
      const maxVal = f.idtForecast && f.idtForecast.length > 0 
        ? Math.max(...f.idtForecast.map((d: any) => d.value)) 
        : 28;
      return { name: f.name.replace(' (Ref. Térmica)', '').replace(' (Ref. T\u00e9rmica)', ''), maxVal };
    }).sort((a, b) => b.maxVal - a.maxVal)[0];

    if (highestFuture) {
      recommendations.push({
        id: "rec-pred-default",
        type: "CIVIL_DEFENSE",
        title: `Manutenção de Alerta - ${highestFuture.name}`,
        description: `Tendência estável de sensação térmica em torno de ${highestFuture.maxVal.toFixed(1)}°C nos próximos 3 dias. Manter rotina de monitoramento.`,
        timeframe: "Próximas 48h",
        targetStation: highestFuture.name
      });
    }
  }

  let report = "";
  if (criticalStation) {
    const sName = (criticalStation as StationData).name.replace(' (Ref. Térmica)', '').replace(' (Ref. T\u00e9rmica)', '');
    report = `Análise Preditiva Dinâmica: Atualmente, a rede de monitoramento registra nível de ${currentLevelName} devido à sensação de ${(criticalStation as StationData).idt}°C no bairro ${sName}. `;
    
    if (risingStations.length > 0) {
      const risingText = risingStations.map(r => `${r.name} (${r.predictedIdt}°C em ${r.timeframe})`).join(', ');
      report += `Modelos matemáticos de Holt preveem aquecimento e maior estresse térmico para: ${risingText}. A Defesa Civil de Fortaleza recomenda ativação imediata de protocolos preventivos de hidratação e restrição de trabalho externo nessas áreas.`;
    } else {
      report += `As projeções de curto prazo para os próximos 3 dias indicam estabilização térmica e manutenção das condições normais na malha urbana de Fortaleza.`;
    }
  } else {
    report = `Sistema operando em modo de segurança. Sensores sob monitoramento de rotina. Sem alterações térmicas esperadas para as próximas 72 horas.`;
  }

  return {
    report,
    recommendations: recommendations.slice(0, 5)
  };
}

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
    console.error('AI Analysis failed, serving dynamic fallback:', error);
    const dynamicAnalysis = generateDynamicFallback(payload.stations, payload.forecasts);
    res.status(200).json(dynamicAnalysis);
  }
}
