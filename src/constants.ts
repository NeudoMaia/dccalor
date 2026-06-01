/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StationData } from './types.ts';
import { calculateIDT, calculateICU, getStatusFromIDT } from './lib/utils.ts';

/**
 * Estação de referência: Messejana
 * Escolhida por ser a mais periférica e vegetada da malha atual,
 * servindo como proxy de área não-urbanizada para o cálculo ICU.
 *
 * Nota: Para maior rigor, substituir por estação em área
 * costeira/parque (ex: Parque do Cocó, Beira-Mar) quando disponível.
 */
const REF_TEMP = 29.5; // Temperatura de referência inicial (Messejana)

export const FORTALEZA_CENTER: [number, number] = [-3.76, -38.53];

export const INITIAL_STATIONS: StationData[] = [
  {
    id: 'st-01',
    name: 'Messejana',
    lat: -3.83,
    lng: -38.49,
    temp: 29.5,
    humidity: 65,
    idt: calculateIDT(29.5, 65),         // IDT Thom
    icu: calculateICU(29.5, REF_TEMP),   // ICU = 0 (é a referência)
    avgAnomaly: 0,
    status: getStatusFromIDT(29.5),
    primaryArea: 'Messejana',
    secondaryAreas: ['Cambeba', 'Paupina', 'Sapiranga', 'Curió', 'Guajeru', 'Lagoa Redonda', 'José de Alencar', 'Coaçu'],
    isReference: true
  },
  {
    id: 'st-02',
    name: 'Montese',
    lat: -3.76,
    lng: -38.54,
    temp: 30.2,
    humidity: 60,
    idt: calculateIDT(30.2, 60),
    icu: calculateICU(30.2, REF_TEMP),
    avgAnomaly: 0,
    status: getStatusFromIDT(30.2),
    primaryArea: 'Montese',
    secondaryAreas: ['Parangaba', 'Itaoca', 'Bom Futuro', 'Vila União', 'Damas', 'Jardim América', 'Aeroporto', 'Serrinha']
  },
  {
    id: 'st-03',
    name: 'Centro',
    lat: -3.72,
    lng: -38.52,
    temp: 31.0,
    humidity: 58,
    idt: calculateIDT(31.0, 58),
    icu: calculateICU(31.0, REF_TEMP),
    avgAnomaly: 0,
    status: getStatusFromIDT(31.0),
    primaryArea: 'Centro',
    secondaryAreas: ['Benfica', 'Jacarecanga', 'Praia de Iracema', 'Joaquim Távora', 'Aldeota', 'Meireles', 'Moura Brasil', 'Farias Brito']
  }
];

/**
 * Dados históricos de temperatura (15 dias) para cada estação.
 * Usados para:
 *   1. Visualização no gráfico de análise histórica
 *   2. Cálculo da baseline e anomalia
 *   3. Alimentação do modelo preditivo (Holt)
 */
const generateHistoricalData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 14; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    
    // Wave 1: 7-day cycle, Wave 2: 30-day cycle
    const wave = Math.sin(dayOfYear * (Math.PI * 2 / 7)) * 0.5 + Math.sin(dayOfYear * (Math.PI * 2 / 30)) * 0.5;
    
    // Add small pseudo-random noise
    const noiseM = (Math.sin(dayOfYear * 12.3) * 0.5);
    const noiseMo = (Math.cos(dayOfYear * 8.7) * 0.5);
    const noiseC = (Math.sin(dayOfYear * 15.1) * 0.5);

    data.push({
      date: dateStr,
      messejana: parseFloat((28.5 + wave + noiseM).toFixed(1)),
      montese: parseFloat((31.0 + wave + noiseMo).toFixed(1)),
      centro: parseFloat((32.5 + wave + noiseC).toFixed(1)),
    });
  }
  return data;
};

export const HISTORICAL_DATA = generateHistoricalData();

/**
 * Baselines históricas pré-calculadas para cada estação.
 * Média dos 15 dias de HISTORICAL_DATA.
 * Usadas para calcular a anomalia: avgAnomaly = T_atual − baseline.
 */
export const HISTORICAL_BASELINES: Record<string, number> = {
  'st-01': parseFloat((HISTORICAL_DATA.reduce((s, d) => s + d.messejana, 0) / HISTORICAL_DATA.length).toFixed(2)),  // ~28.59
  'st-02': parseFloat((HISTORICAL_DATA.reduce((s, d) => s + d.montese, 0) / HISTORICAL_DATA.length).toFixed(2)),    // ~31.04
  'st-03': parseFloat((HISTORICAL_DATA.reduce((s, d) => s + d.centro, 0) / HISTORICAL_DATA.length).toFixed(2)),     // ~32.39
  // Aliases para IDs de produção reais da Plugfield
  '9169': parseFloat((HISTORICAL_DATA.reduce((s, d) => s + d.messejana, 0) / HISTORICAL_DATA.length).toFixed(2)),
  '8836': parseFloat((HISTORICAL_DATA.reduce((s, d) => s + d.montese, 0) / HISTORICAL_DATA.length).toFixed(2)),
  '8642': parseFloat((HISTORICAL_DATA.reduce((s, d) => s + d.centro, 0) / HISTORICAL_DATA.length).toFixed(2)),
};

/**
 * Séries históricas separadas por estação para o modelo preditivo.
 */
export const HISTORICAL_SERIES: Record<string, number[]> = {
  'st-01': HISTORICAL_DATA.map(d => d.messejana),
  'st-02': HISTORICAL_DATA.map(d => d.montese),
  'st-03': HISTORICAL_DATA.map(d => d.centro),
  // Aliases para IDs de produção reais da Plugfield
  '9169': HISTORICAL_DATA.map(d => d.messejana),
  '8836': HISTORICAL_DATA.map(d => d.montese),
  '8642': HISTORICAL_DATA.map(d => d.centro),
};
