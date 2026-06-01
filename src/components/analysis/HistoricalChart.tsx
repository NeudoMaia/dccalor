/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import { holtPredict } from '../../lib/prediction';
import { Download, TrendingUp } from 'lucide-react';
import { StationData } from '../../types';
import { HISTORICAL_BASELINES } from '../../constants';

const COLORS = [
  '#ef4444', '#eab308', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#6366f1', '#0ea5e9'
];

interface HistoricalChartProps {
  stations: StationData[];
}

export const HistoricalChart: React.FC<HistoricalChartProps> = ({ stations }) => {
  const chartData = useMemo(() => {
    if (!stations || !stations.length) return [];

    const historyMap = new Map<string, number[]>();
    
    // 1. Generate dynamic history based on baseline/current temp for all stations
    stations.forEach(station => {
      const hash = station.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const values: number[] = [];
      const today = new Date();
      const baseTemp = HISTORICAL_BASELINES[station.id] || station.temp;
      
      for (let i = 14; i >= 0; i--) {
         const d = new Date(today);
         d.setDate(today.getDate() - i);
         const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
         const wave = Math.sin(dayOfYear * (Math.PI * 2 / 7)) * 0.5 + Math.sin(dayOfYear * (Math.PI * 2 / 30)) * 0.5;
         const noise = Math.sin(dayOfYear * (hash % 10 + 1)) * 0.5;
         values.push(parseFloat((baseTemp + wave + noise).toFixed(1)));
      }
      historyMap.set(station.id, values);
    });

    // 2. Run Holt Predict for each station
    const predictionsMap = new Map<string, any[]>();
    stations.forEach(station => {
      const history = historyMap.get(station.id) || [];
      predictionsMap.set(station.id, holtPredict(history, 7));
    });

    // 3. Assemble the tabular data for Recharts
    const finalData = [];
    
    // Observed (last 15 days)
    const today = new Date();
    for (let i = 14; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      
      const row: any = { date: dateStr, type: 'observed' };
      stations.forEach(station => {
         const history = historyMap.get(station.id);
         if (history) row[station.id] = history[14 - i];
      });
      finalData.push(row);
    }
    
    // Predicted (next 7 days)
    for (let m = 0; m < 7; m++) {
      let dateStr = '';
      const row: any = { type: 'predicted' };
      stations.forEach(station => {
         const preds = predictionsMap.get(station.id);
         if (preds && preds[m]) {
           row[station.id] = preds[m].value;
           dateStr = preds[m].date;
         }
      });
      row.date = dateStr;
      finalData.push(row);
    }

    return finalData;
  }, [stations]);

  // Last observed date is "today"
  const today = new Date();
  const lastObservedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}`;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Análise Histórica + Previsão (Holt)</h3>
          <p className="text-sm text-slate-500 font-medium">
            Sazonalidade Térmica — Todas as {stations.length} estações (15 dias + 7 projetados)
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 rounded-lg border border-violet-100">
            <TrendingUp className="w-3.5 h-3.5 text-violet-600" />
            <span className="text-[10px] font-black text-violet-700 uppercase tracking-widest">Modelo Holt (α=0.35, β=0.15)</span>
          </div>
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all inline-flex items-center gap-2 border border-slate-200">
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>
      </div>
      
      <div className="h-[450px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              {stations.map((station, i) => {
                const color = COLORS[i % COLORS.length];
                return (
                  <linearGradient key={`color-${station.id}`} id={`color-${station.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
              domain={['dataMin - 1', 'dataMax + 1']}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '12px'
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.date === label);
                return item?.type === 'predicted' ? `${label} (Previsão)` : label;
              }}
              formatter={(value: number, name: string) => {
                const station = stations.find(s => s.id === name);
                return [`${value}°C`, station?.name || name];
              }}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ paddingTop: '0px', paddingBottom: '20px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
              formatter={(value: string) => {
                const station = stations.find(s => s.id === value);
                return station?.name || value;
              }}
            />
            {/* Linha de separação entre observado e previsto */}
            <ReferenceLine
              x={lastObservedDate}
              stroke="#8b5cf6"
              strokeDasharray="6 4"
              strokeWidth={2}
              label={{
                value: "← Observado | Previsão →",
                position: "top",
                fill: "#7c3aed",
                fontSize: 9,
                fontWeight: 800,
              }}
            />
            {stations.map((station, i) => {
              const color = COLORS[i % COLORS.length];
              return (
                <Area 
                  key={station.id}
                  name={station.id}
                  type="monotone" 
                  dataKey={station.id} 
                  stroke={color} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill={`url(#color-${station.id})`}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Prediction Method Note */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-3">
        <TrendingUp className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-violet-600">Modelo Preditivo:</strong> Suavização Exponencial Dupla (Holt) com α=0.35 e β=0.15.
          Projeções de 7 dias baseadas na tendência dos 15 dias anteriores. Todas as estações da rede são simuladas dinamicamente neste mapa.
        </p>
      </div>
    </div>
  );
}
