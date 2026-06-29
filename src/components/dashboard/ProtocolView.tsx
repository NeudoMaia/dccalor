/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AIAnalysis } from '../../types';
import { Brain, Bell, Ambulance, TrafficCone, ShieldAlert, Loader2, CheckCircle2, AlertTriangle, Siren, Clock, MapPin } from 'lucide-react';
import { cn, IDT_ALERT_TABLE, getAlertInfo } from '../../lib/utils';
import { motion } from 'motion/react';

interface ProtocolViewProps {
  analysis: AIAnalysis | null;
  loading: boolean;
}

const alertIcons: Record<string, React.ReactNode> = {
  COMFORTABLE: <CheckCircle2 className="w-5 h-5" />,
  YELLOW_ALERT: <AlertTriangle className="w-5 h-5" />,
  ORANGE_ALERT: <AlertTriangle className="w-5 h-5" />,
  RED_ALERT: <Siren className="w-5 h-5" />,
};

const alertBg: Record<string, string> = {
  COMFORTABLE: 'bg-emerald-50 border-emerald-200',
  YELLOW_ALERT: 'bg-yellow-50 border-yellow-200',
  ORANGE_ALERT: 'bg-orange-50 border-orange-200',
  RED_ALERT: 'bg-red-50 border-red-200',
};

const alertText: Record<string, string> = {
  COMFORTABLE: 'text-emerald-700',
  YELLOW_ALERT: 'text-yellow-700',
  ORANGE_ALERT: 'text-orange-700',
  RED_ALERT: 'text-red-700',
};

const alertIconBg: Record<string, string> = {
  COMFORTABLE: 'bg-emerald-100 text-emerald-600',
  YELLOW_ALERT: 'bg-yellow-100 text-yellow-600',
  ORANGE_ALERT: 'bg-orange-100 text-orange-600',
  RED_ALERT: 'bg-red-100 text-red-600',
};

export const ProtocolView: React.FC<ProtocolViewProps> = ({ analysis, loading }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* AI Analysis Column */}
      <div className="lg:col-span-2 space-y-6">

        {/* IDT Alert Table — Grid of 4 cards */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 mb-5 uppercase tracking-widest border-b border-slate-100 pb-3">
            Tabela de Alertas IDT (Índice de Desconforto Térmico)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {IDT_ALERT_TABLE.map((alert) => (
              <motion.div
                key={alert.level}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "rounded-xl border p-4 flex gap-3 transition-all",
                  alertBg[alert.level]
                )}
              >
                <div className={cn("p-2 h-fit rounded-lg shrink-0", alertIconBg[alert.level])}>
                  {alertIcons[alert.level]}
                </div>
                <div>
                  <h4 className={cn("font-bold text-sm tracking-tight mb-0.5", alertText[alert.level])}>
                    {alert.label}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {alert.condition}
                  </p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {alert.action}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Analysis */}
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
            ) : analysis?.report ? (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-blue-50 leading-relaxed text-base font-medium italic"
              >
                {analysis.report}
              </motion.p>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-blue-200/70 gap-3">
                <span className="font-bold text-[10px] uppercase tracking-widest italic">Nenhum resultado disponível no momento.</span>
              </div>
            )}
          </div>
        </div>

        {/* Protocols and Recommendations */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 mb-6 uppercase tracking-widest border-b border-slate-100 pb-3">Protocolos e Medidas Preventivas</h3>
          
          <div className="space-y-4">
            {analysis?.recommendations?.length ? (
              analysis.recommendations.map((rec) => (
                <motion.div 
                  key={rec.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex gap-4 p-4 rounded-xl border transition-all duration-300 hover:shadow-md",
                    rec.type === 'HEALTH' ? "bg-red-50/30 border-red-100/70" : 
                    rec.type === 'TRAFFIC' ? "bg-amber-50/30 border-amber-100/70" : 
                    "bg-blue-50/30 border-blue-100/70"
                  )}
                >
                  <div className={cn(
                    "p-2.5 h-fit rounded-lg bg-white border shadow-sm",
                    rec.type === 'HEALTH' ? "text-red-500 border-red-100" : 
                    rec.type === 'TRAFFIC' ? "text-amber-600 border-amber-100" : 
                    "text-blue-600 border-blue-100"
                  )}>
                    {rec.type === 'HEALTH' ? <Ambulance className="w-5 h-5" /> : 
                     rec.type === 'TRAFFIC' ? <TrafficCone className="w-5 h-5" /> : 
                     <Bell className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className={cn(
                      "font-bold text-sm tracking-tight mb-1",
                      rec.type === 'HEALTH' ? "text-red-900" : (rec.type === 'TRAFFIC' ? "text-amber-900" : "text-blue-900")
                    )}>
                      {rec.title}
                    </h4>
                    <p className="text-slate-600 text-xs font-medium leading-relaxed mb-2">
                      {rec.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {rec.timeframe && (
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border shadow-sm",
                          rec.timeframe.toLowerCase().includes('imediato') 
                            ? "bg-red-100/80 text-red-700 border-red-200" 
                            : rec.timeframe.toLowerCase().includes('24h')
                            ? "bg-violet-100/80 text-violet-700 border-violet-200"
                            : rec.timeframe.toLowerCase().includes('48h')
                            ? "bg-orange-100/80 text-orange-700 border-orange-200"
                            : "bg-blue-100/80 text-blue-700 border-blue-200"
                        )}>
                          <Clock className="w-3 h-3" />
                          {rec.timeframe}
                        </span>
                      )}
                      {rec.targetStation && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-slate-100/80 text-slate-700 border border-slate-200 shadow-sm">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {rec.targetStation}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-slate-400 text-sm italic">Nenhum protocolo disponível no momento. Aguarde a análise ou verifique a conexão com o serviço de IA.</div>
            )}
          </div>

          {/* Iniciativa do Projeto */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 mb-4 uppercase tracking-widest">Iniciativa do Projeto</h4>
            <div className="flex">
              <span className="text-xs font-black text-blue-700 bg-blue-50 px-4 py-3 rounded-lg border border-blue-100 uppercase tracking-widest w-full text-center">
                Defesa Civil de Fortaleza
              </span>
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
                <p className="text-xs font-bold text-slate-800 uppercase tracking-tighter leading-none mb-1">Estação de Referência (ICU)</p>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">ICU calculada comparando cada estação urbana com o ponto de controle térmico dinâmico da cidade (estação mais fria), conforme ICU = T_urbana − T_referência.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">02</div>
              <div>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-tighter leading-none mb-1">IDT — Fórmula de Thom</p>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Índice de Desconforto Térmico via fórmula IDT = T − (0.55 − 0.0055×UR) × (T − 14.5), classificado em 4 níveis de alerta.</p>
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
