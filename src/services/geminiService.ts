/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StationData, AIAnalysis } from "../types";

const ANALYZE_ENDPOINT = '/api/analyze';

export function generateClientDynamicAnalysis(stations: StationData[], forecasts?: any[]): AIAnalysis {
  if (!stations || stations.length === 0) {
    return {
      report: "Rede de monitoramento operando em rotina. Sensores sob acompanhamento continuo.",
      recommendations: [
        {
          id: "rec-def-1",
          type: "CIVIL_DEFENSE",
          title: "Monitoramento de Rotina",
          description: "Manter observação das estações automáticas da Defesa Civil.",
          timeframe: "Imediato",
          targetStation: "Fortaleza"
        }
      ]
    };
  }

  const sorted = [...stations].sort((a, b) => b.temp - a.temp);
  const hottest = sorted[0];
  const sName = hottest.name.replace(' (Ref. Térmica)', '').replace(' (Ref. T\u00e9rmica)', '');
  
  const recommendations: AIAnalysis['recommendations'] = [];

  const currentLevel = hottest.status;
  const currentLevelName = 
    currentLevel === 'NIVEL_3' ? 'Alarme (Perigo Extremo)' :
    currentLevel === 'NIVEL_2' ? 'Alerta' :
    currentLevel === 'NIVEL_1' ? 'Atenção' : 'Seguro (Rotina)';

  if (currentLevel === 'NIVEL_1') {
    recommendations.push({
      id: "rec-1",
      type: "HEALTH",
      title: `Hidratação e Autocuidado - ${sName}`,
      description: `Ponto mais quente da rede com ${hottest.temp}°C reais e sensação térmica de ${hottest.idt.toFixed(1)}°C. Recomendado reforçar a ingestão de líquidos.`,
      timeframe: "Imediato",
      targetStation: sName
    });
    recommendations.push({
      id: "rec-2",
      type: "CIVIL_DEFENSE",
      title: `Informativo Preventivo - ${sName}`,
      description: `Disparar orientações de cuidado térmico aos moradores de ${sName} e bairros vizinhos.`,
      timeframe: "Imediato",
      targetStation: sName
    });
  } else if (currentLevel === 'NIVEL_2') {
    recommendations.push({
      id: "rec-1",
      type: "HEALTH",
      title: `Prevenção de Insolação - ${sName}`,
      description: `Temperatura elevada de ${hottest.temp}°C e sensação de ${hottest.idt.toFixed(1)}°C. Evitar atividades físicas sob exposição solar direta.`,
      timeframe: "Imediato",
      targetStation: sName
    });
    recommendations.push({
      id: "rec-2",
      type: "CIVIL_DEFENSE",
      title: `Pausas no Trabalho Externo - ${sName}`,
      description: `Orientar pausas de hidratação a trabalhadores expostos ao ar livre na região de ${sName}.`,
      timeframe: "Imediato",
      targetStation: sName
    });
    recommendations.push({
      id: "rec-3",
      type: "TRAFFIC",
      title: `Fiscalização de Vias - ${sName}`,
      description: `Manter fluidez do trânsito nos trechos de maior adensamento para reduzir tempo de exposição.`,
      timeframe: "Imediato",
      targetStation: sName
    });
  } else if (currentLevel === 'NIVEL_3') {
    recommendations.push({
      id: "rec-1",
      type: "HEALTH",
      title: `Alerta Extremo de Saúde - ${sName}`,
      description: `Sensação térmica crítica de ${hottest.idt.toFixed(1)}°C. Risco elevado de choque térmico e insolação aguda.`,
      timeframe: "Imediato",
      targetStation: sName
    });
    recommendations.push({
      id: "rec-2",
      type: "CIVIL_DEFENSE",
      title: `Abrigos e Pontos de Resfriamento - ${sName}`,
      description: `Disponibilizar pontos públicos de hidratação e áreas resfriadas em ${sName}.`,
      timeframe: "Imediato",
      targetStation: sName
    });
  } else {
    recommendations.push({
      id: "rec-1",
      type: "CIVIL_DEFENSE",
      title: `Monitoramento Preventivo - ${sName}`,
      description: `Temperatura de ${hottest.temp}°C dentro dos limites normais de operação.`,
      timeframe: "Imediato",
      targetStation: sName
    });
  }

  // Verificar previsões futuras de Holt se enviadas
  if (forecasts && forecasts.length > 0) {
    const rising = forecasts
      .map(f => {
        const name = f.name.replace(' (Ref. Térmica)', '').replace(' (Ref. T\u00e9rmica)', '');
        const maxVal = f.idtForecast ? Math.max(...f.idtForecast.map((d: any) => d.value)) : 0;
        return { name, maxVal };
      })
      .sort((a, b) => b.maxVal - a.maxVal)[0];

    if (rising && rising.maxVal > 30) {
      recommendations.push({
        id: "rec-pred-1",
        type: "CIVIL_DEFENSE",
        title: `Projeção de Aquecimento (${rising.name})`,
        description: `Modelo Holt projeta pico térmico de até ${rising.maxVal.toFixed(1)}°C nos próximos 3 dias em ${rising.name}.`,
        timeframe: "Próximas 48h",
        targetStation: rising.name
      });
    }
  }

  const report = `Análise Preditiva em Tempo Real: O bairro de ${sName} apresenta atualmente a maior temperatura da malha urbana (${hottest.temp}°C, sensação térmica de ${hottest.idt.toFixed(1)}°C - Nível ${currentLevelName}). A Defesa Civil de Fortaleza recomenda monitoramento contínuo dos protocolos preventivos.`;

  return {
    report,
    recommendations: recommendations.slice(0, 5)
  };
}

export async function analyzeThermalData(stations: StationData[], forecasts: any[]): Promise<AIAnalysis> {
  try {
    const response = await fetch(ANALYZE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stations, forecasts }),
    });

    if (response.ok) {
      const result = await response.json() as AIAnalysis;
      if (result && result.report && result.recommendations) {
        return result;
      }
    }
    
    // Se a API retornar objeto JSON de fallback válido
    const data = await response.json().catch(() => null);
    if (data && data.report && data.recommendations) {
      return data;
    }

    return generateClientDynamicAnalysis(stations, forecasts);
  } catch (error) {
    console.warn("Conexão ao servidor de IA indisponível, gerando análise dinâmica local:", error);
    return generateClientDynamicAnalysis(stations, forecasts);
  }
}
