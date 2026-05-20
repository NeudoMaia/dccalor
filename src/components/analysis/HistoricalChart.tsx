/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { HISTORICAL_DATA } from '../../constants';
import { Download } from 'lucide-react';

export const HistoricalChart: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Análise Histórica: Índice de Calor</h3>
          <p className="text-sm text-slate-500 font-medium">Sazonalidade Térmica Mensal (Abril 2026)</p>
        </div>
        <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all inline-flex items-center gap-2 border border-slate-200">
          <Download className="w-4 h-4" /> Exportar Dados CSV
        </button>
      </div>
      
      <div className="h-[450px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={HISTORICAL_DATA}>
            <defs>
              <linearGradient id="colorMessejana" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMontese" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCentro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
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
              domain={[28, 36]}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '12px'
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ paddingTop: '0px', paddingBottom: '20px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
            />
            <Area 
              name="Messejana"
              type="monotone" 
              dataKey="messejana" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorMessejana)" 
            />
            <Area 
              name="Montese"
              type="monotone" 
              dataKey="montese" 
              stroke="#eab308" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorMontese)" 
            />
            <Area 
              name="Centro"
              type="monotone" 
              dataKey="centro" 
              stroke="#ef4444" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCentro)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
