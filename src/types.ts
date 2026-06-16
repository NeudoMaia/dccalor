/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Níveis de alerta baseados no Índice de Calor (Heat Index) para Fortaleza
 * NIVEL_0:  HI ≤ 27°C      — Nível 0 (Seguro/Rotina)
 * NIVEL_1:  HI 27.1–32°C   — Nível 1 (ATENÇÃO / Cuidado)
 * NIVEL_2:  HI 32.1–41°C   — Nível 2 (ALERTA / Cuidado Extremo)
 * NIVEL_3:  HI > 41.1°C    — Nível 3 (ALARME / Perigo a Perigo Extremo)
 */
export type HeatLevel = 'NIVEL_0' | 'NIVEL_1' | 'NIVEL_2' | 'NIVEL_3' | 'OFFLINE';

export interface StationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  temp: number;
  humidity: number;
  windSpeed: number; // m/s
  solarRadiation: number; // W/m²
  /** Índice de Desconforto Térmico (Agora como Temperatura Aparente de Steadman) */
  idt: number;
  /** Intensidade da Ilha de Calor Urbana: T_urbana − T_referência */
  icu: number;
  /** Anomalia média de 15 dias em relação à baseline histórica */
  avgAnomaly: number;
  status: HeatLevel;
  primaryArea: string;
  secondaryAreas: string[];
  isIoT?: boolean;
  /** Marca estação de referência (área vegetada/costeira) para cálculo do ICU */
  isReference?: boolean;
}

export interface IDTAlertInfo {
  level: HeatLevel;
  label: string;
  condition: string;
  action: string;
  color: string;
}

export interface AIAnalysis {
  report: string;
  recommendations: {
    id: string;
    type: 'HEALTH' | 'TRAFFIC' | 'CIVIL_DEFENSE';
    title: string;
    description: string;
  }[];
}

export interface GridPoint {
  lat: number;
  lng: number;
  temp: number;
  idt: number;
}

export interface PredictionPoint {
  date: string;
  value: number;
  confidence: number;
}

export type TabType = 'map' | 'protocols' | 'iot' | 'analysis';
