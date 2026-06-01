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
import { HISTORICAL_DATA, HISTORICAL_SERIES } from '../../constants';
import { holtPredict } from '../../lib/prediction';
import { Download, TrendingUp } from 'lucide-react';

export const HistoricalChart: React.FC = () => {
  /**
   * Modelo Preditivo — Suavização Exponencial Dupla (Holt)
   * Projeta 7 dias à frente com base nos dados históricos de cada estação.
   */
  const chartData = useMemo(() => {
    const predMessejana = holtPredict(HISTORICAL_SERIES['st-01'], 7);
    const predMontese = holtPredict(HISTORICAL_SERIES['st-02'], 7);
    const predCentro = holtPredict(HISTORICAL_SERIES['st-03'], 7);

    // Dados históricos observados
    const observed = HISTORICAL_DATA.map(d => ({
      ...d,
      type: 'observed' as const
    }));

    // Dados previstos pelo modelo de Holt
    const predicted = predMessejana.map((pm, i) => ({
      date: pm.date,
      messejana: pm.value,
      montese: predMontese[i]?.value ?? 0,
      centro: predCentro[i]?.value ?? 0,
      type: 'predicted' as const
    }));

    return [...observed, ...predicted];
  }, []);

  const lastObservedDate = HISTORICAL_DATA[HISTORICAL_DATA.length - 1].date;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Análise Histórica + Previsão (Holt)</h3>
          <p className="text-sm text-slate-500 font-medium">
            Sazonalidade Térmica — 15 dias observados + 7 dias projetados
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
              domain={[26, 36]}
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
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ paddingTop: '0px', paddingBottom: '20px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
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
            <Area 
              name="Messejana (Ref.)"
              type="monotone" 
              dataKey="messejana" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorMessejana)" 
              strokeDasharray={(undefined as any)}
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

      {/* Prediction Method Note */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-3">
        <TrendingUp className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-violet-600">Modelo Preditivo:</strong> Suavização Exponencial Dupla (Holt) com α=0.35 e β=0.15.
          Projeções de 7 dias baseadas na tendência dos 15 dias anteriores. Para produção,
          evoluir para ARIMAX/Prophet com regressores externos (radiação solar, velocidade do vento).
        </p>
      </div>
    </div>
  );
}
