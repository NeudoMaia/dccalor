import { StationData } from '../types';
import { HISTORICAL_BASELINES } from '../constants';
import { calculateIDT } from './utils';

export interface DailyData {
  date: Date;
  temp: number;
  humidity: number;
  windSpeed: number;
  solarRadiation: number;
  idt: number;
}

/**
 * Gera um array de dados simulados do passado, mas com o ponto atual
 * (hoje) perfeitamente alinhado com a temperatura/umidade/idt ao vivo da estação.
 */
export function generateAnchoredHistory(station: StationData, days: number = 31): DailyData[] {
  const hash = station.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const baseTemp = HISTORICAL_BASELINES[parseInt(station.id)] || 29.0;
  
  const today = new Date();
  
  // 1. Primeiro geramos a curva pura matemática para os X dias
  const rawCurve: { t: number, h: number, w: number, sr: number, d: Date }[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    
    const wave = Math.sin(dayOfYear * (Math.PI * 2 / 7)) * 0.5 + Math.sin(dayOfYear * (Math.PI * 2 / 30)) * 0.5;
    const noise = Math.sin(dayOfYear * (hash % 10 + 1)) * 0.5;
    
    const t = parseFloat((baseTemp + wave + noise).toFixed(1));
    const h = Math.max(30, Math.min(95, Math.round(75 + Math.sin(dayOfYear + hash) * 10)));
    const w = parseFloat((2.0 + Math.sin(dayOfYear + hash) * 1.5).toFixed(1));
    const hour = d.getHours();
    const sr = hour >= 6 && hour <= 17 
      ? Math.max(100, Math.min(1000, 800 * Math.sin(Math.PI * (hour - 6) / 11)))
      : 0;
    
    rawCurve.push({ t, h, w, sr, d });
  }
  
  // 2. Pegamos os valores do DIA ATUAL da curva (que seria o último elemento)
  const curveToday = rawCurve[rawCurve.length - 1];
  
  // 3. Calculamos o "delta" de erro da curva para a realidade AO VIVO
  // O offset diz quanto a curva inteira precisa subir ou descer para encaixar perfeitamente.
  const tempOffset = station.temp - curveToday.t;
  const humOffset = station.humidity - curveToday.h;
  const windOffset = station.windSpeed - curveToday.w;
  const radOffset = station.solarRadiation - curveToday.sr;
  
  // 4. Deslocamos todos os pontos da curva usando o offset
  const finalHistory: DailyData[] = rawCurve.map(item => {
    const anchoredTemp = parseFloat((item.t + tempOffset).toFixed(1));
    const anchoredHum = Math.round(item.h + humOffset);
    const anchoredWind = Math.max(0, parseFloat((item.w + windOffset).toFixed(1)));
    const anchoredRad = Math.max(0, parseFloat((item.sr + radOffset).toFixed(1)));
    
    return {
      date: item.d,
      temp: anchoredTemp,
      humidity: anchoredHum,
      windSpeed: anchoredWind,
      solarRadiation: anchoredRad,
      idt: calculateIDT(anchoredTemp, anchoredHum, anchoredWind, anchoredRad)
    };
  });
  
  return finalHistory;
}
