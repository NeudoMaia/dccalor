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

export interface HealthPathologiesReport {
  alertLevel: 'Baixo' | 'Moderado' | 'Alto' | 'Extremo';
  immediateImpacts: string;
  chronicAggravation: string;
  vectorialRisk: string;
  vulnerableGroups: string;
  protectionRecommendations: string[];
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
  healthReport?: HealthPathologiesReport;
}

const GEMINI_KEY = process.env.GEMINI_API_KEY || "";

function generateDynamicFallback(stations: StationData[], forecasts?: any[]): AIAnalysis {
  const recommendations: any[] = [];
  
  let maxTemp = -Infinity;
  let maxIdt = -Infinity;
  let criticalStation: StationData | null = null;
  
  stations.forEach(s => {
    if (s.temp > maxTemp) {
      maxTemp = s.temp;
    }
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
  
  const sName = criticalStation ? (criticalStation as StationData).name.replace(' (Ref. Térmica)', '').replace(' (Ref. T\u00e9rmica)', '') : 'Fortaleza';
  const idtVal = criticalStation ? (criticalStation as StationData).idt : 28;

  if (criticalStation) {
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
        title: `Emergência Médica: Choque Térmico - ${sName}`,
        description: `Sensação extrema de ${idtVal}°C. Risco de choque térmico, AVC e infarto. Permaneça em ambientes resfriados e procure ajuda médica se necessário.`,
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

  // Análise epidemiológica dinâmica de fallback
  let healthAlertLevel: HealthPathologiesReport['alertLevel'] = 'Baixo';
  let immediateImpacts = "";
  let chronicAggravation = "";
  let vectorialRisk = "";
  let vulnerableGroups = "Idosos, crianças (menores de 5 anos), gestantes, pessoas com comorbidades (cardiopatas e pneumopatas), trabalhadores ao ar livre e populações vulneráveis.";
  let protectionRecommendations: string[] = [];

  if (maxIdt >= 40 || maxTemp >= 38) {
    healthAlertLevel = 'Extremo';
    immediateImpacts = `Com a sensação térmica atingindo ${maxIdt.toFixed(1)}°C em ${sName}, o corpo humano perde a capacidade de termorregulação eficiente. Há risco altíssimo e imediato de Desidratação severa, Estresse térmico, Exaustão pelo calor e quadros agudos de Insolação, com perigo à vida para grupos expostos sem refrigeração.`;
    chronicAggravation = `O esforço metabólico compensatório provoca forte vasodilatação periférica, sobrecarregando criticamente o sistema cardiovascular. Risco iminente de descompensação grave levando a Infarto agudo do miocárdio, Insuficiência cardíaca e Acidente Vascular Cerebral (AVC). O ar aquecido e a poluição urbana agravam crises agudas de Asma, DPOC e Infecções respiratórias.`;
    vectorialRisk = `A temperatura elevada (${maxTemp.toFixed(1)}°C) somada à umidade acelera a eclosão de ovos e reduz o ciclo reprodutivo de mosquitos vetores. Alerta vermelho para proliferação acelerada de transmissores de Dengue, Zika e Chikungunya. Atenção acrescida para Febre do Oropouche, Malária e Leishmaniose.`;
    protectionRecommendations = [
      `Suspender imediatamente atividades físicas e laborais pesadas ao ar livre entre 10h e 16h em ${sName}.`,
      `Forçar hidratação constante mesmo sem sensação de sede, priorizando idosos e crianças.`,
      `Reforçar plantões nas UPAs e emergências cardiológicas para pronto atendimento de infartos e AVCs.`,
      `Intensificar fumacê e eliminação de focos de Aedes aegypti e outros vetores cujo ciclo é encurtado pelo calor.`,
      `Manter pontos de resfriamento e distribuição de água potável em áreas de grande circulação.`
    ];
  } else if (maxIdt >= 32.1 || maxTemp >= 32) {
    healthAlertLevel = 'Alto';
    immediateImpacts = `Sensação térmica crítica de ${maxIdt.toFixed(1)}°C no bairro ${sName}. Risco elevado de Estresse térmico, Exaustão pelo calor e Desidratação progressiva após exposição contínua ao sol.`;
    chronicAggravation = `Vasodilatação periférica compensatória eleva o débito cardíaco, aumentando a vulnerabilidade a quadros de Infarto agudo do miocárdio, AVC e sobrecarga na Insuficiência cardíaca. Portadores de Asma e DPOC requerem atenção com a qualidade e temperatura do ar.`;
    vectorialRisk = `Condições térmicas favoráveis para o desenvolvimento de larvas de Aedes aegypti (Dengue, Zika, Chikungunya) e vetores de Leishmaniose nas zonas de microclima úmido.`;
    protectionRecommendations = [
      `Orientar hidratação constante e uso de proteção solar/sombras.`,
      `Determinar pausas obrigatórias de descanso para trabalhadores ao ar livre.`,
      `Monitorar de perto idosos e crianças pequenas nas comunidades prioritárias.`,
      `Reforçar a vigilância de vetores e combate à água parada nos bairros mais quentes.`
    ];
  } else if (maxIdt >= 27.1) {
    healthAlertLevel = 'Moderado';
    immediateImpacts = `Sensação térmica de ${maxIdt.toFixed(1)}°C em ${sName}. Risco moderado de fadiga, perda de eletrólitos e desconforto térmico em tarefas físicas contínuas.`;
    chronicAggravation = `Sensação térmica requer atenção leve para pacientes cardiopatas e hipertensos. Pacientes com Asma e DPOC devem manter medicação regular.`;
    vectorialRisk = `Monitoramento epidemiológico regular de vetores de arboviroses (Dengue, Chikungunya, Zika).`;
    protectionRecommendations = [
      `Manter boa ingestão hídrica ao longo do dia.`,
      `Evitar esforço físico excessivo sob sol forte no meio do dia.`,
      `Verificar recipientes que possam acumular água parada.`
    ];
  } else {
    healthAlertLevel = 'Baixo';
    immediateImpacts = `Condições térmicas dentro do padrão de conforto para a população de Fortaleza.`;
    chronicAggravation = `Estabilidade clínica esperada para portadores de doenças cardiovasculares e respiratórias.`;
    vectorialRisk = `Índices epidemiológicos vetoriais em nível de rotina.`;
    protectionRecommendations = [
      `Manter hábitos saudáveis de hidratação e higiene ambiental.`
    ];
  }

  let report = `Análise Preditiva e Epidemiológica: Atualmente, a rede de estações automáticas indica o bairro ${sName} como ponto de atenção máxima (${maxTemp.toFixed(1)}°C reais, sensação de ${maxIdt.toFixed(1)}°C - Nível ${currentLevelName}). Alerta de saúde classificado como ${healthAlertLevel.toUpperCase()}. A Defesa Civil de Fortaleza recomenda ativação das medidas preventivas descritas no boletim.`;

  return {
    report,
    recommendations: recommendations.slice(0, 5),
    healthReport: {
      alertLevel: healthAlertLevel,
      immediateImpacts,
      chronicAggravation,
      vectorialRisk,
      vulnerableGroups,
      protectionRecommendations
    }
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let payload: { stations: StationData[], forecasts?: any[] } = { stations: [] };
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || { stations: [] });
  } catch (error) {
    console.warn("Corpo inválido em /api/analyze, usando fallback em branco:", error);
  }

  const stations = payload.stations || [];
  const forecasts = payload.forecasts || [];

  if (!GEMINI_KEY) {
    console.log("GEMINI_API_KEY não configurada no ambiente. Fornecendo análise dinâmica local.");
    const dynamicAnalysis = generateDynamicFallback(stations, forecasts);
    res.status(200).json(dynamicAnalysis);
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
[PROMPT DE SISTEMA: MOTOR DE ALERTA CLIMÁTICO, PREDITIVO E DE SAÚDE PÚBLICA - DEFESA CIVIL DE FORTALEZA]

Contexto e Papel:
Você é o motor analítico preditivo e epidemiológico do Observatório de Riscos Climáticos de Fortaleza. Sua função é analisar dados meteorológicos em tempo real e projeções de 3 dias para calcular índices de desconforto térmico, prever picos de calor e emitir o BOLETIM DE IMPACTOS À SAÚDE E PATOLOGIAS CLIMA-SENSÍVEIS e PROTOCOLOS DE AÇÃO.

Dados em tempo real das estações automáticas:
${stationSummary}

Previsão Preditiva (Próximos 3 Dias) via Modelo de Holt:
${forecastSummary}

BASE DE CONHECIMENTO OBRIGATÓRIA (Doenças sensíveis ao clima):
1. Vetoriais (Agravadas por calor associado à chuva/água parada ou histórico de precipitação/alta umidade): Dengue, Zika, Chikungunya, Malária, Febre amarela, Febre do Oropouche, Leishmaniose, Doença de Chagas, Filariose linfática, Esquistossomose, Febre maculosa.
2. Respiratórias (Agravadas por ar seco, frio extremo, ou calor extremo com poluição): Asma, Doença Pulmonar Obstrutiva Crônica (DPOC), Pneumonia, Infecções respiratórias agudas, Influenza (gripe).
3. Cardiovasculares (Agravadas por estresse térmico, tanto calor extremo quanto frio extremo): Infarto agudo do miocárdio, Acidente Vascular Cerebral (AVC), Insuficiência cardíaca.
4. Relacionadas ao calor (Causadas diretamente por altas temperaturas e sensação térmica): Insolação, Exaustão pelo calor, Desidratação, Estresse térmico.

GRUPOS VULNERÁVEIS PRIORITÁRIOS:
Idosos, crianças (especialmente menores de 5 anos), gestantes, pessoas com comorbidades (cardiopatas e pneumopatas), trabalhadores ao ar livre e populações em situação de rua ou sem acesso a refrigeração/saneamento.

REGRAS OBRIGATÓRIAS:
- Seja direto, científico, fisiológico e use tom de urgência proporcional ao risco.
- Baseie as análises de patologias ESTRITAMENTE na Base de Conhecimento fornecida.
- Se o Índice de Calor ou Temperatura Aparente (IDT) atingir ou ultrapassar 40°C em qualquer estação (ex: Centro, Montese, etc.), o alerta para problemas cardiovasculares e estresse térmico DEVE ser classificado como EXTREMO ("Extremo") e considerado fatal para grupos vulneráveis desprotegidos.
- A estação que apresenta a MAIOR TEMPERATURA REAL/IDT no momento deve SEMPRE ser destacada como o ponto de atenção prioritário.

Instruções de Saída:
Analise os dados e gere um JSON contendo:
1. "report": Resumo Executivo conciso em português, focado nas condições atuais e nas principais ameaças preditivas identificadas para os próximos 3 dias (destaque os bairros mais quentes).
2. "recommendations": Lista de ações preventivas e imediatas recomendadas no momento, classificadas por tipo (HEALTH, TRAFFIC, CIVIL_DEFENSE). Cada recomendação deve obrigatoriamente possuir os campos:
   - "id": ID único (ex: "rec-1", "rec-2")
   - "type": 'HEALTH', 'TRAFFIC' ou 'CIVIL_DEFENSE'
   - "title": Título curto da recomendação
   - "description": Detalhes do protocolo sugerido
   - "timeframe": Prazo previsto para ativação (ex: "Imediato", "Próximas 24h", "Próximas 48h", "Próximas 72h")
   - "targetStation": O nome do bairro/estação que requer esta ação (ex: "Centro", "Montese", etc.)
3. "healthReport": Um objeto contendo a análise epidemiológica e clínica estruturada:
   - "alertLevel": Nível de alerta ('Baixo', 'Moderado', 'Alto', 'Extremo').
   - "immediateImpacts": Explicação detalhada de quais doenças "Relacionadas ao calor" (Insolação, Exaustão pelo calor, Desidratação, Estresse térmico) ocorrem de imediato e o mecanismo fisiológico de termorregulação.
   - "chronicAggravation": Explicação de quais doenças "Respiratórias" (Asma, DPOC, Pneumonia, Infecções agudas, Influenza) e "Cardiovasculares" (Infarto agudo do miocárdio, AVC, Insuficiência cardíaca) estão em risco iminente de descompensação e o mecanismo sistêmico (vasodilatação sobrecarregando o sistema circulatório).
   - "vectorialRisk": Análise se a temperatura e umidade atuais favorecem a proliferação dos vetores das doenças listadas (Dengue, Zika, Chikungunya, Febre do Oropouche, Malária, etc.).
   - "vulnerableGroups": Listagem expressa dos grupos prioritários afetados no cenário atual.
   - "protectionRecommendations": Array com 3 a 5 ações práticas de saúde pública ou defesa civil.
  `;

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
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
            },
            healthReport: {
              type: Type.OBJECT,
              properties: {
                alertLevel: { type: Type.STRING, enum: ['Baixo', 'Moderado', 'Alto', 'Extremo'] },
                immediateImpacts: { type: Type.STRING },
                chronicAggravation: { type: Type.STRING },
                vectorialRisk: { type: Type.STRING },
                vulnerableGroups: { type: Type.STRING },
                protectionRecommendations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['alertLevel', 'immediateImpacts', 'chronicAggravation', 'vectorialRisk', 'vulnerableGroups', 'protectionRecommendations']
            }
          },
          required: ['report', 'recommendations', 'healthReport']
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
