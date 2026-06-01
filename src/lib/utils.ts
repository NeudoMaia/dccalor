/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { HeatLevel, IDTAlertInfo } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * IDT — Índice de Desconforto Térmico (Fórmula de Thom)
 * IDT = T − (0.55 − 0.0055 × UR) × (T − 14.5)
 *
 * Onde:
 *   T  = Temperatura do ar em °C
 *   UR = Umidade Relativa em %
 */
export function calculateIDT(temp: number, humidity: number): number {
  const idt = temp - (0.55 - 0.0055 * humidity) * (temp - 14.5);
  return parseFloat(idt.toFixed(1));
}

/**
 * ICU — Intensidade da Ilha de Calor Urbana
 * ICU = T_urbana − T_referência
 *
 * Onde T_referência é a temperatura da estação de referência
 * (área vegetada ou costeira de Fortaleza).
 */
export function calculateICU(tempUrbana: number, tempReferencia: number): number {
  return parseFloat((tempUrbana - tempReferencia).toFixed(1));
}

export function formatTemp(temp: number): string {
  return `${temp.toFixed(1)}°C`;
}

/**
 * Classificação do status baseado nos limiares de temperatura do ar (°C)
 *
 * | Temperatura | Condição                                     |
 * |-------------|----------------------------------------------|
 * | < 24°C      | Confortável — Monitoramento padrão           |
 * | 24 a 27°C   | Alerta Amarelo — Hidratação recomendada       |
 * | 28 a 29°C   | Alerta Laranja — Evitar exposição solar       |
 * | ≥ 30°C      | Alerta Vermelho — Emergência médica iminente  |
 */
export function getStatusFromIDT(temp: number): HeatLevel {
  if (temp < 24) return 'COMFORTABLE';
  if (temp < 28) return 'YELLOW_ALERT';
  if (temp < 30) return 'ORANGE_ALERT';
  return 'RED_ALERT';
}

/** Tabela de alertas IDT com ações mitigatórias */
export const IDT_ALERT_TABLE: IDTAlertInfo[] = [
  {
    level: 'COMFORTABLE',
    label: 'Confortável',
    condition: 'Temp < 24°C',
    action: 'Monitoramento padrão.',
    color: '#10b981'
  },
  {
    level: 'YELLOW_ALERT',
    label: 'Alerta Amarelo',
    condition: 'Temp 24°C – 27°C',
    action: 'Hidratação recomendada. Mais da metade da população sente desconforto.',
    color: '#eab308'
  },
  {
    level: 'ORANGE_ALERT',
    label: 'Alerta Laranja',
    condition: 'Temp 28°C – 29°C',
    action: 'Evitar exposição solar. Desconforto severo e risco à saúde.',
    color: '#f97316'
  },
  {
    level: 'RED_ALERT',
    label: 'Alerta Vermelho',
    condition: 'Temp ≥ 30°C',
    action: 'Emergência médica iminente. Mobilização de abrigos e postos de hidratação.',
    color: '#dc2626'
  }
];

/** Retorna as informações de alerta para um dado nível */
export function getAlertInfo(status: HeatLevel): IDTAlertInfo {
  return IDT_ALERT_TABLE.find(a => a.level === status) || IDT_ALERT_TABLE[0];
}
