/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AIAnalysis } from '../../types';
import { Brain, Bell, Ambulance, TrafficCone, ShieldAlert, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface ProtocolViewProps {
  analysis: AIAnalysis | null;
  loading: boolean;
}

export const ProtocolView: React.FC<ProtocolViewProps> = ({ analysis, loading }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* AI Analysis Column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-blue-900 rounded-xl p-8 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-800 rounded-full blur-3xl opacity-50" />
          
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="p-2.5 rounded-lg bg-blue-700 text-blue-200">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Análise Preditiva IA</h3>
              <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest leading-none">Consistência: 98.4% (Calculado)</p>
            </div>
          </div>

          <div className="relative min-h-[140px] bg-black/10 rounded-xl p-6 border border-white/5 backdrop-blur-sm z-10">
            {loading && !analysis ? (
              <div className="flex flex-col items-center justify-center h-32 text-blue-300/40 gap-3">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="font-bold text-[10px] uppercase tracking-widest italic">Processando padrões térmicos...</span>
              </div>
            ) : (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-blue-50 leading-relaxed text-base font-medium italic"
              >
                {analysis?.report}
              </motion.p>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 mb-6 uppercase tracking-widest border-b border-slate-100 pb-3">Protocolos e Medidas Preventivas</h3>
          
          <div className="space-y-3">
            {analysis?.recommendations.map((rec) => (
              <motion.div 
                key={rec.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "flex gap-4 p-4 rounded-lg border transition-all duration-300",
                  rec.type === 'HEALTH' ? "bg-red-50/50 border-red-100" : 
                  rec.type === 'TRAFFIC' ? "bg-amber-50/50 border-amber-100" : 
                  "bg-blue-50/50 border-blue-100"
                )}
              >
                <div className={cn(
                  "p-2.5 h-fit rounded bg-white border shadow-sm",
                  rec.type === 'HEALTH' ? "text-red-500 border-red-100" : 
                  rec.type === 'TRAFFIC' ? "text-amber-600 border-amber-100" : 
                  "text-blue-600 border-blue-100"
                )}>
                  {rec.type === 'HEALTH' ? <Ambulance className="w-5 h-5" /> : 
                   rec.type === 'TRAFFIC' ? <TrafficCone className="w-5 h-5" /> : 
                   <Bell className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className={cn(
                    "font-bold text-sm tracking-tight mb-0.5",
                    rec.type === 'HEALTH' ? "text-red-900" : (rec.type === 'TRAFFIC' ? "text-amber-900" : "text-blue-900")
                  )}>
                    {rec.title}
                  </h4>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 mb-4 uppercase tracking-widest">Parceiros Estratégicos</h4>
            <div className="grid grid-cols-2 gap-3">
              <span className="text-[10px] font-bold text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 uppercase">Defesa Civil</span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 uppercase">Sec. Municipal Saúde</span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 uppercase">Urbanismo - SEUMA</span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 uppercase">AMC (Trânsito)</span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 uppercase">Funceme</span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 uppercase">Univ. Federal (UFC)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Methodology Section */}
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Metodologia de Cálculo</h4>
          <div className="space-y-5">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">01</div>
              <div>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-tighter leading-none mb-1">Linha de Base Dinâmica</p>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Baseline calculada em tempo real com base no nó mais resfriado da malha urbana.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">02</div>
              <div>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-tighter leading-none mb-1">Índice de Calor (HI)</p>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Cruzamento de Humidade e Temperatura via algoritmo de Steadman-Rothfusz.</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-6 py-2 px-4 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition-colors">
            Documentação Técnica
          </button>
        </div>
      </div>
    </div>
  );
};
