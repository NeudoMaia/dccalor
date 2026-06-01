/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Níveis de alerta baseados no IDT (Índice de Desconforto Térmico - Thom)
 * COMFORTABLE:   IDT < 24   — Monitoramento padrão
 * YELLOW_ALERT:  IDT 24–27  — Hidratação recomendada
 * ORANGE_ALERT:  IDT 28–29  — Evitar exposição solar
 * RED_ALERT:     IDT ≥ 30   — Emergência médica iminente
 */
export type HeatLevel = 'COMFORTABLE' | 'YELLOW_ALERT' | 'ORANGE_ALERT' | 'RED_ALERT';

export interface StationData {
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
