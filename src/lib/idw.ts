/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * IDW — Ponderação pelo Inverso da Distância (Inverse Distance Weighting)
 *
 * Método determinístico para interpolação espacial em tempo real.
 * Estações mais próximas a um ponto sem sensor têm maior influência
 * sobre a temperatura estimada naquele local.
 *
 * Z(x) = Σ(Zi / di^p) / Σ(1 / di^p)
 *
 * Onde:
 *   Z(x) = Valor estimado no ponto desconhecido
 *   Zi   = Leitura da estação i
 *   di   = Distância entre o ponto desconhecido e a estação i
 *   p    = Parâmetro de potência (geralmente 2)
 */

import { StationData, GridPoint } from '../types';
import { calculateIDT } from './utils';

/**
 * Calcula a distância de Haversine entre dois pontos (em km)
 */
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Interpola o valor de uma variável em um ponto desconhecido usando IDW.
 *
 * @param targetLat  Latitude do ponto alvo
 * @param targetLng  Longitude do ponto alvo
 * @param stations   Array de estações com dados
 * @param field      Campo a interpolar: 'temp' ou 'idt'
 * @param p          Parâmetro de potência (default: 2)
 * @returns          Valor interpolado
 */
export function interpolateIDW(
  targetLat: number,
  targetLng: number,
  stations: StationData[],
  field: 'temp' | 'idt' = 'temp',
  p: number = 2
): number {
  let numerator = 0;
  let denominator = 0;

  for (const station of stations) {
    const d = haversineDistance(targetLat, targetLng, station.lat, station.lng);

    // Se muito próximo da estação, retornar o valor exato
    if (d < 0.05) return station[field];

    const weight = 1 / Math.pow(d, p);
    numerator += station[field] * weight;
    denominator += weight;
  }

  return denominator === 0 ? 0 : numerator / denominator;
}

/** Limites geográficos da área metropolitana de Fortaleza */
export const FORTALEZA_BOUNDS = {
  minLat: -3.88,
  maxLat: -3.68,
  minLng: -38.63,
  maxLng: -38.43
};

/**
 * Gera uma grade de valores interpolados via IDW para toda a área de Fortaleza.
 *
 * @param stations    Estações com dados
 * @param resolution  Número de divisões na grade (default: 40 → 41×41 = 1681 pontos)
 * @param p           Parâmetro de potência IDW (default: 2)
 * @returns           Matriz 2D de GridPoints
 */
export function generateIDWGrid(
  stations: StationData[],
  resolution: number = 40,
  p: number = 2
): GridPoint[][] {
  const { minLat, maxLat, minLng, maxLng } = FORTALEZA_BOUNDS;
  const grid: GridPoint[][] = [];
  const latStep = (maxLat - minLat) / resolution;
  const lngStep = (maxLng - minLng) / resolution;

  for (let i = 0; i <= resolution; i++) {
    const row: GridPoint[] = [];
    for (let j = 0; j <= resolution; j++) {
      const lat = minLat + i * latStep;
      const lng = minLng + j * lngStep;
      const temp = interpolateIDW(lat, lng, stations, 'temp', p);
      const idt = interpolateIDW(lat, lng, stations, 'idt', p);
      row.push({ lat, lng, temp, idt });
    }
    grid.push(row);
  }

  return grid;
}

/**
 * Mapeia um valor IDT para uma cor RGBA (gradiente contínuo).
 *
 * < 24: Verde (Confortável)
 * 24-27: Amarelo (Alerta Amarelo)
 * 28-29: Laranja (Alerta Laranja)
 * ≥ 30: Vermelho (Alerta Vermelho)
 */
export function idtToColor(idt: number, opacity: number = 0.45): string {
  // Normalizar IDT para faixa 22–32 (clamp)
  const min = 22;
  const max = 32;
  const t = Math.max(0, Math.min(1, (idt - min) / (max - min)));

  let r: number, g: number, b: number;

  if (t < 0.2) {
    // Verde → Verde-Amarelo
    r = Math.round(16 + t * 5 * (234 - 16));
    g = Math.round(185 + t * 5 * (179 - 185));
    b = Math.round(129 - t * 5 * 121);
  } else if (t < 0.5) {
    // Amarelo → Laranja
    const s = (t - 0.2) / 0.3;
    r = Math.round(234 + s * (249 - 234));
    g = Math.round(179 - s * (179 - 115));
    b = Math.round(8 + s * (22 - 8));
  } else if (t < 0.8) {
    // Laranja → Vermelho
    const s = (t - 0.5) / 0.3;
    r = Math.round(249 - s * (249 - 220));
    g = Math.round(115 - s * (115 - 38));
    b = Math.round(22 + s * (38 - 22));
  } else {
    // Vermelho profundo
    const s = (t - 0.8) / 0.2;
    r = Math.round(220 - s * 30);
    g = Math.round(38 - s * 20);
    b = Math.round(38 - s * 10);
  }

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
