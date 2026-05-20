/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { HeatLevel } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateHeatIndex(temp: number, humidity: number): number {
  // Simplified Heat Index formula for runtime UI
  const hi = temp + (0.33 * (humidity / 100) * temp) - 4;
  return parseFloat(hi.toFixed(1));
}

export function formatTemp(temp: number): string {
  return `${temp.toFixed(1)}°C`;
}

export function getStatusFromHeatIndex(hi: number): HeatLevel {
  if (hi < 32) return 'NORMAL';
  if (hi < 35) return 'ATTENTION';
  return 'ALERT';
}
