/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
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
import { calculateIDT } from '../../lib/utils';
import { Download, TrendingUp, MapPin } from 'lucide-react';
import { StationData } from '../../types';
import { HISTORICAL_BASELINES } from '../../constants';
import { generateAnchoredHistory } from '../../lib/history';

const COLORS = [
  '#ef4444', '#eab308', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#6366f1', '#0ea5e9'
];

interface HistoricalChartProps {
  stations: StationData[];
}

export const HistoricalChart: React.FC<HistoricalChartProps> = ({ stations }) => {
  const [selectedStationId, setSelectedStationId] = useState<string>('all');

  const chartData = useMemo(() => {
    if (!stations || !stations.length) return [];

    const historyMap = new Map<string, number[]>();
    const humidityMap = new Map<string, number[]>();
    
    // 2. Run Holt Predict for each station
    const predictionsMap = new Map<string, any[]>();
    const idtPredictionsMap = new Map<string, any[]>();

    // 1. Generate dynamic anchored history (30 days) for all stations
    stations.forEach(station => {
      const history = generateAnchoredHistory(station, 30);
      const tempValues = history.map(h => h.temp);
      const humValues = history.map(h => h.humidity);
      const windValues = history.map(h => h.windSpeed);
      const radValues = history.map(h => h.solarRadiation);
      
      historyMap.set(station.id, tempValues);
      humidityMap.set(station.id, humValues);
      
      const idtValues = history.map(h => h.idt);
      
      predictionsMap.set(station.id, holtPredict(tempValues, 2));
      idtPredictionsMap.set(station.id, holtPredict(idtValues, 2));
    });

    // 3. Assemble the tabular data for Recharts
    const finalData = [];
    
    // Observed (last 30 days)
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      
      const row: any = { date: dateStr, type: 'observed' };
      
      if (selectedStationId === 'all') {
        stations.forEach(station => {
           const history = historyMap.get(station.id);
           if (history) row[station.id] = history[29 - i];
        });
      } else {
        const history = historyMap.get(selectedStationId);
        if (history) {
          const st = stations.find(s => s.id === selectedStationId);
          if (st) {
            const hist = generateAnchoredHistory(st, 30);
            row['Temperatura Real'] = hist[29 - i].temp;
            row['Temp. Aparente (Steadman)'] = hist[29 - i].idt;
          }
        }
      }
      finalData.push(row);
    }
    
    // Predicted (next 2 days)
    for (let m = 0; m < 2; m++) {
      let dateStr = '';
      const row: any = { type: 'predicted' };
      
      if (selectedStationId === 'all') {
        stations.forEach(station => {
           const preds = predictionsMap.get(station.id);
           if (preds && preds[m]) {
             row[station.id] = preds[m].value;
             dateStr = preds[m].date;
           }
        });
      } else {
        const preds = predictionsMap.get(selectedStationId);
        const idtPreds = idtPredictionsMap.get(selectedStationId);
        if (preds && preds[m] && idtPreds && idtPreds[m]) {
          row['Temperatura Real'] = preds[m].value;
          row['Temp. Aparente (Steadman)'] = idtPreds[m].value;
          dateStr = preds[m].date;
        }
      }
      row.date = dateStr;
      finalData.push(row);
    }

    return finalData;
  }, [stations, selectedStationId]);

  // Last observed date is "today"
  const today = new Date();
  const lastObservedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}`;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Análise Histórica + Previsão (Holt)</h3>
          <p className="text-sm text-slate-500 font-medium">
            Sazonalidade Térmica (30 dias observados + 2 projetados)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select 
                value={selectedStationId}
                onChange={(e) => setSelectedStationId(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '10px auto' }}
              >
                <option value="all">Rede Completa (Todas as Estações)</option>
                <optgroup label="Análise por Estação (Temp x Temp. Aparente)">
                  {stations.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 rounded-lg border border-violet-100">
            <TrendingUp className="w-3.5 h-3.5 text-violet-600" />
            <span className="text-[10px] font-black text-violet-700 uppercase tracking-widest hidden sm:inline">Modelo Holt (α=0.35, β=0.15)</span>
            <span className="text-[10px] font-black text-violet-700 uppercase tracking-widest sm:hidden">Holt</span>
          </div>
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all inline-flex items-center gap-2 border border-slate-200">
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>
      </div>
      
      <div className="h-[450px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              {selectedStationId === 'all' && stations.map((station, i) => {
                const color = COLORS[i % COLORS.length];
                return (
                  <linearGradient key={`color-${station.id}`} id={`color-${station.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                  </linearGradient>
                );
              })}
              {selectedStationId !== 'all' && (
                <>
                  <linearGradient id="color-temp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="color-idt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </>
              )}
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
                if (selectedStationId !== 'all') {
                  return [`${value}°C`, name];
                }
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
                if (selectedStationId !== 'all') return value;
                const station = stations.find(s => s.id === value);
                return station?.name || value;
              }}
            />
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
            {selectedStationId === 'all' ? (
              stations.map((station, i) => {
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
              })
            ) : (
              <>
                <Area 
                  key="temp"
                  name="Temperatura Real"
                  type="monotone" 
                  dataKey="Temperatura Real" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#color-temp)"
                />
                <Area 
                  key="idt"
                  name="Temp. Aparente (Steadman)"
                  type="monotone" 
                  dataKey="Temp. Aparente (Steadman)" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#color-idt)"
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-3">
        <TrendingUp className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-violet-600">Modelo Preditivo:</strong> Suavização Exponencial Dupla (Holt) com α=0.35 e β=0.15.
          Projeções de 2 dias baseadas na tendência dos 30 dias anteriores. {selectedStationId !== 'all' ? 'No modo de estação específica, o modelo prediz a Temperatura Real e a Temperatura Aparente separadamente.' : 'No modo de rede completa, todas as estações são simuladas simultaneamente.'}
        </p>
      </div>
    </div>
  );
}
