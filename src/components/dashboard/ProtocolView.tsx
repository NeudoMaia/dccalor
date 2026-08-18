/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { AIAnalysis, StationData } from '../../types';
import { 
  Brain, Bell, Ambulance, TrafficCone, ShieldAlert, Loader2, CheckCircle2, 
  AlertTriangle, Siren, Clock, MapPin, Sparkles, RefreshCw, Flame, Play,
  Activity, HeartPulse, Bug, Users, ShieldCheck, ThermometerSun, Stethoscope, AlertCircle
} from 'lucide-react';
import { cn, IDT_ALERT_TABLE } from '../../lib/utils';
import { motion } from 'motion/react';
import { TechnicalManual } from '../analysis/TechnicalManual';

interface ProtocolViewProps {
  analysis: AIAnalysis | null;
  loading: boolean;
  onRunAnalysis?: () => void;
  stations?: StationData[];
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

export const ProtocolView: React.FC<ProtocolViewProps> = ({ analysis, loading, onRunAnalysis, stations = [] }) => {
  // Ordenar estações das mais quentes (maior Temperatura Real e Sensação Térmica)
  const hottestStations = useMemo(() => {
    if (!stations.length) return [];
    return [...stations].sort((a, b) => {
      if (b.temp !== a.temp) return b.temp - a.temp;
      return b.idt - a.idt;
    }).slice(0, 4);
  }, [stations]);

  const healthReport = analysis?.healthReport;

  // Estilização do badge de nível de alerta epidemiológico
  const healthAlertBadgeStyle = useMemo(() => {
    const level = healthReport?.alertLevel || 'Baixo';
    switch (level) {
      case 'Extremo':
        return 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30 animate-pulse';
      case 'Alto':
        return 'bg-orange-500 text-white border-orange-400 shadow-md';
      case 'Moderado':
        return 'bg-amber-500 text-white border-amber-400';
      default:
        return 'bg-emerald-600 text-white border-emerald-500';
    }
  }, [healthReport?.alertLevel]);

  return (
    <div className="space-y-8">
      {/* Dynamic Action Trigger Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 lg:p-8 text-white shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Geração Preditiva de Protocolos em Tempo Real</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight text-white">
              Análise e Produção de Protocolos Climáticos e Epidemiológicos
            </h2>
            <p className="text-slate-300 text-xs lg:text-sm leading-relaxed font-medium">
              Acione o motor analítico da IA para processar os dados das estações meteorológicas automáticas em tempo real. O sistema identifica os bairros mais quentes e avalia patologias sensíveis ao clima (cardiovasculares, respiratórias, vetoriais e ligadas ao calor).
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 w-full lg:w-auto">
            <button
              onClick={onRunAnalysis}
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-900/40 hover:shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-600 active:scale-98 transition-all disabled:opacity-75 disabled:cursor-not-allowed border border-blue-400/30 group cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-blue-200" />
                  <span>Analisando Dados em Tempo Real...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform" />
                  <span>Análise e Possíveis Protocolos</span>
                </>
              )}
            </button>
            <span className="text-[10px] text-blue-300/70 font-semibold tracking-wider text-center lg:text-right">
              {loading ? "Processando sensores automáticos..." : "Pronto para análise manual sob demanda"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Hottest Neighborhoods + AI Executive Summary + Health Impact Report + Action Protocols */}
        <div className="lg:col-span-2 space-y-6">

          {/* Bairros Mais Quentes em Tempo Real */}
          {hottestStations.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                    Bairros Mais Quentes (Atenção & Alerta em Tempo Real)
                  </h3>
                </div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Estações Automáticas ({hottestStations.length})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hottestStations.map((st, idx) => {
                  const isAttention = st.status === 'NIVEL_1';
                  const isAlert = st.status === 'NIVEL_2';
                  const isAlarm = st.status === 'NIVEL_3';

                  const badgeBg = isAlarm 
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : isAlert 
                    ? 'bg-orange-100 text-orange-800 border-orange-300'
                    : isAttention 
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300';

                  const badgeText = isAlarm 
                    ? 'PERIGO EXT' 
                    : isAlert 
                    ? 'ALERTA' 
                    : isAttention 
                    ? 'ATENÇÃO' 
                    : 'ROTI';

                  return (
                    <motion.div
                      key={st.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase">#{idx + 1}</span>
                            <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">
                              {st.primaryArea || st.name.replace(' (Ref. Térmica)', '')}
                            </h4>
                          </div>
                          <p className="text-[10px] font-medium text-slate-500">
                            Estação {st.name}
                          </p>
                        </div>
                        <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border", badgeBg)}>
                          {badgeText}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 mt-1">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Temp Real</span>
                          <span className="text-sm font-mono font-extrabold text-red-600">{st.temp}°C</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Sensação (IDT)</span>
                          <span className="text-sm font-mono font-bold text-slate-800">{st.idt}°C</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Ilha Calor</span>
                          <span className="text-sm font-mono font-bold text-orange-600">+{st.icu}°C</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Analysis Executive Summary Card */}
          <div className="bg-blue-900 rounded-xl p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-800 rounded-full blur-3xl opacity-50" />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-blue-700 text-blue-200">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Análise Preditiva IA em Tempo Real</h3>
                  <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest leading-none">Motor de Decisão: Gemini Natural Model</p>
                </div>
              </div>

              {onRunAnalysis && (
                <button
                  onClick={onRunAnalysis}
                  disabled={loading}
                  title="Recalcular Análise"
                  className="p-2 rounded-lg bg-blue-800/80 hover:bg-blue-700 text-blue-200 transition-colors border border-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                </button>
              )}
            </div>

            <div className="relative min-h-[120px] bg-black/10 rounded-xl p-6 border border-white/5 backdrop-blur-sm z-10">
              {loading && !analysis ? (
                <div className="flex flex-col items-center justify-center h-28 text-blue-300/70 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
                  <span className="font-bold text-[10px] uppercase tracking-widest italic text-blue-200">Analisando sensores automáticos e patologias...</span>
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
                <div className="flex flex-col items-center justify-center h-28 text-blue-200/70 gap-3">
                  <span className="font-bold text-[10px] uppercase tracking-widest italic">Nenhum resultado disponível no momento. Clique em "Análise e Possíveis Protocolos".</span>
                </div>
              )}
            </div>
          </div>

          {/* NOVO SEÇÃO: BOLETIM EPIDEMIOLÓGICO DE IMPACTOS À SAÚDE E PATOLOGIAS CLIMA-SENSÍVEIS */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    Boletim de Impactos à Saúde & Patologias Clima-Sensíveis
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Análise em tempo real de doenças sensíveis ao clima e estresse térmico
                  </p>
                </div>
              </div>

              {healthReport && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nível de Alerta:</span>
                  <span className={cn("px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border", healthAlertBadgeStyle)}>
                    🚨 {healthReport.alertLevel}
                  </span>
                </div>
              )}
            </div>

            {loading && !healthReport ? (
              <div className="p-8 text-center text-slate-400 space-y-3">
                <Loader2 className="w-7 h-7 animate-spin mx-auto text-blue-600" />
                <p className="text-xs font-medium italic">Processando patologias e riscos climáticos em tempo real...</p>
              </div>
            ) : healthReport ? (
              <div className="space-y-6">
                
                {/* 1. Impactos Imediatos (Relacionadas ao calor) */}
                <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ThermometerSun className="w-4 h-4 text-orange-600" />
                      <h4 className="text-xs font-extrabold text-orange-950 uppercase tracking-wider">
                        1. Impactos Imediatos (Doenças Relacionadas ao Calor)
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {['Insolação', 'Exaustão pelo calor', 'Desidratação', 'Estresse térmico'].map((disease) => (
                      <span key={disease} className="px-2 py-0.5 rounded text-[9px] font-bold bg-orange-100 text-orange-800 border border-orange-200 uppercase">
                        {disease}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {healthReport.immediateImpacts}
                  </p>
                </div>

                {/* 2. Agravamento de Doenças Crônicas (Cardiovasculares e Respiratórias) */}
                <div className="p-4 rounded-xl bg-red-50/50 border border-red-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HeartPulse className="w-4 h-4 text-red-600" />
                      <h4 className="text-xs font-extrabold text-red-950 uppercase tracking-wider">
                        2. Agravamento de Doenças Crônicas (Cardiovasculares & Respiratórias)
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Infarto agudo do miocárdio', 'AVC', 'Insuficiência cardíaca', 
                      'Asma', 'DPOC', 'Pneumonia', 'Infecções agudas', 'Influenza'
                    ].map((disease) => (
                      <span key={disease} className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-800 border border-red-200 uppercase">
                        {disease}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {healthReport.chronicAggravation}
                  </p>
                </div>

                {/* 3. Risco Epidemiológico / Vetorial */}
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bug className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                        3. Risco Epidemiológico / Vetorial (Transmissores Clima-Sensíveis)
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Dengue', 'Zika', 'Chikungunya', 'Malária', 'Febre amarela', 
                      'Febre do Oropouche', 'Leishmaniose', 'Doença de Chagas', 'Filariose', 'Esquistossomose', 'Febre maculosa'
                    ].map((disease) => (
                      <span key={disease} className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                        {disease}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {healthReport.vectorialRisk}
                  </p>
                </div>

                {/* 4. Grupos Vulneráveis Prioritários */}
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                      4. Grupos Vulneráveis Prioritários
                    </h4>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Idosos', 'Crianças (< 5 anos)', 'Gestantes', 'Cardiopatas e Pneumopatas', 
                      'Trabalhadores ao ar livre', 'População em situação de rua'
                    ].map((grp) => (
                      <span key={grp} className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                        {grp}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {healthReport.vulnerableGroups}
                  </p>
                </div>

                {/* 5. Recomendações de Proteção em Saúde */}
                {healthReport.protectionRecommendations?.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                        5. Recomendações de Proteção em Saúde Pública
                      </h4>
                    </div>

                    <ul className="space-y-2">
                      {healthReport.protectionRecommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium leading-relaxed">
                          <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs italic">
                Aguardando execução da análise para gerar o boletim de patologias clima-sensíveis.
              </div>
            )}
          </div>

          {/* Protocols and Recommendations */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 mb-6 uppercase tracking-widest border-b border-slate-100 pb-3">Protocolos e Medidas Preventivas de Resposta</h3>
            
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
                <div className="text-slate-400 text-sm italic">Nenhum protocolo disponível no momento. Clique no botão de análise para gerar novos protocolos.</div>
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

        {/* Right Column: IDT Table & Methodology */}
        <div className="space-y-6">

          {/* IDT Alert Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 mb-5 uppercase tracking-widest border-b border-slate-100 pb-3">
              Tabela de Alertas IDT (Índice de Desconforto Térmico)
            </h3>
            <div className="space-y-3">
              {IDT_ALERT_TABLE.map((alert) => (
                <motion.div
                  key={alert.level}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "rounded-xl border p-3.5 flex gap-3 transition-all",
                    alertBg[alert.level]
                  )}
                >
                  <div className={cn("p-2 h-fit rounded-lg shrink-0", alertIconBg[alert.level])}>
                    {alertIcons[alert.level]}
                  </div>
                  <div>
                    <h4 className={cn("font-bold text-xs tracking-tight mb-0.5", alertText[alert.level])}>
                      {alert.label}
                    </h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {alert.condition}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium leading-normal">
                      {alert.action}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Relatório Técnico Detalhado e Metodologia da IA (Retrátil) */}
      <div className="pt-2">
        <TechnicalManual defaultExpanded={false} />
      </div>
    </div>
  );
};
