/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HeatLevel = 'NORMAL' | 'ATTENTION' | 'ALERT';

export interface StationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  temp: number;
  humidity: number;
  heatIndex: number;
  delta: number;
  avgAnomaly: number;
  status: HeatLevel;
  primaryArea: string;
  secondaryAreas: string[];
  isIoT?: boolean;
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

export type TabType = 'map' | 'protocols' | 'iot' | 'analysis';
