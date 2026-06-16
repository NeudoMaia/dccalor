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
 * Temperatura Aparente (Apparent Temperature - Modelo Steadman)
 * Considera Temperatura (Ta), Umidade (rh) e Velocidade do Vento (ws em m/s)
 * Formula de Sombra: AT = Ta + 0.33 * e - 0.70 * ws - 4.00
 * Onde 'e' é a pressão de vapor d'água.
 * OBS: A fórmula com radiação solar ao sol foi removida, pois exigiria
 * a radiação líquida absorvida pelo corpo humano, e não a radiação global crua em W/m²,
 * o que estava causando distorções (sensação > 70°C).
 */
export function calculateIDT(tempC: number, rh: number, windSpeed: number = 0, solarRad: number = 0): number {
  // 1. Calcula a pressão de vapor d'água (e) em hPa
  const e = (rh / 100) * 6.105 * Math.exp((17.27 * tempC) / (237.7 + tempC));
  
  // 2. Calcula a Temperatura Aparente (Steadman - Sombra)
  const at = tempC + 0.33 * e - 0.70 * windSpeed - 4.00;
  
  // Evitar que o cálculo fique menor que a temperatura real de forma muito drástica em Fortaleza
  return parseFloat(Math.max(tempC, at).toFixed(1));
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
 * Classificação do status baseado no Índice de Calor (HI) para Fortaleza
 *
 * | Temperatura | Condição                                     |
 * |-------------|----------------------------------------------|
 * | ≤ 27°C      | Nível 0 (Seguro/Rotina)                      |
 * | 27.1 a 32°C | Nível 1 (Atenção / Cuidado)                  |
 * | 32.1 a 41°C | Nível 2 (Alerta / Cuidado Extremo)           |
 * | > 41.1°C    | Nível 3 (Alarme / Perigo a Perigo Extremo)   |
 */
export function getStatusFromIDT(temp: number): HeatLevel {
  if (temp <= 27) return 'NIVEL_0';
  if (temp <= 32) return 'NIVEL_1';
  if (temp <= 41.1) return 'NIVEL_2';
  return 'NIVEL_3';
}
/** Tabela de alertas IDT com ações mitigatórias */
export const IDT_ALERT_TABLE: IDTAlertInfo[] = [
  {
    level: 'NIVEL_0',
    label: 'Nível 0 - Seguro',
    condition: 'HI ≤ 27°C',
    action: 'Monitoramento padrão. Sem impactos esperados.',
    color: '#10b981' // Verde
  },
  {
    level: 'NIVEL_1',
    label: 'Nível 1 - Atenção',
    condition: 'HI 27.1°C – 32°C',
    action: 'Possível fadiga com exposição prolongada. Requer envio de informes preventivos.',
    color: '#eab308' // Amarelo
  },
  {
    level: 'NIVEL_2',
    label: 'Nível 2 - Alerta',
    condition: 'HI 32.1°C – 41°C',
    action: 'Risco de insolação, cãibras. Pausas no trabalho externo entre 13h e 17h, preparar rede de saúde.',
    color: '#f97316' // Laranja
  },
  {
    level: 'NIVEL_3',
    label: 'Nível 3 - Alarme',
    condition: 'HI > 41.1°C',
    action: 'Emergência. Risco de AVC. Suspensão de trabalho externo e abertura de pontos de resfriamento.',
    color: '#dc2626' // Vermelho
  },
  {
    level: 'OFFLINE',
    label: 'Sensor Offline',
    condition: 'Falha/Espúrio',
    action: 'Verificar conexão do sensor.',
    color: '#64748b' // Cinza
  }
];

/** Retorna as informações de alerta para um dado nível */
export function getAlertInfo(status: HeatLevel): IDTAlertInfo {
  return IDT_ALERT_TABLE.find(a => a.level === status) || IDT_ALERT_TABLE[0];
}
