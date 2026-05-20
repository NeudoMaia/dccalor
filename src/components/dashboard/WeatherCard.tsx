/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Droplets, Info } from 'lucide-react';
import { StationData } from '../../types';
import { cn, formatTemp } from '../../lib/utils';
import { motion } from 'motion/react';

interface WeatherCardProps {
  station: StationData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ station }) => {
  const isAlert = station.status === 'ALERT';
  const isAttention = station.status === 'ATTENTION';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={cn(
        "bg-white rounded-xl p-5 border shadow-sm relative overflow-hidden transition-all duration-300",
        isAlert ? "border-red-200 shadow-red-500/5" : isAttention ? "border-orange-200 shadow-orange-500/5" : "border-slate-200"
      )}
    >
      <div className={cn(
        "absolute top-0 left-0 w-full h-1 bg-gradient-to-r",
        isAlert ? "from-rose-500 to-red-600" : isAttention ? "from-yellow-400 to-orange-500" : "from-emerald-400 to-emerald-600"
      )} />
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base leading-tight">{station.name}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{station.isIoT ? 'Rede IoT Distribuída' : 'Monitoramento Civil'}</p>
        </div>
        <span className={cn(
          "text-[9px] px-2 py-0.5 rounded font-black tracking-widest border",
          isAlert ? "bg-red-50 text-red-600 border-red-100 animate-pulse" : 
          isAttention ? "bg-orange-50 text-orange-600 border-orange-100" : 
          "bg-emerald-50 text-emerald-600 border-emerald-100"
        )}>
          {station.status}
        </span>
      </div>

      <div className="flex items-end gap-3 my-4">
        <h2 className={cn(
          "text-4xl font-light tracking-tighter",
          isAlert ? "text-rose-600" : isAttention ? "text-orange-600" : "text-slate-800"
        )}>
          {station.temp.toFixed(1)} <span className="text-lg font-medium text-slate-300">°C</span>
        </h2>
        <div className="text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1 uppercase tracking-tighter">
          <Droplets className="w-3.5 h-3.5 text-blue-400" />
          <span>{station.humidity}% RH</span>
        </div>
      </div>

      <div className={cn(
        "rounded-lg p-3 flex justify-between items-center text-xs mb-4 border transition-colors",
        isAlert ? "bg-red-50/30 border-red-100" : isAttention ? "bg-orange-50/30 border-orange-100" : "bg-slate-50/50 border-slate-100"
      )}>
        <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Índice de Calor</span>
        <span className={cn(
          "font-bold text-sm font-mono",
          isAlert ? "text-red-700" : isAttention ? "text-orange-700" : "text-emerald-700"
        )}>
          {station.heatIndex.toFixed(1)}°
        </span>
      </div>

      <div className="flex justify-between items-center text-[10px] mb-4">
        <span className="text-slate-400 font-bold uppercase tracking-widest">Variação Espacial</span>
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-tighter",
            station.delta > 1 ? "bg-red-50 text-red-600 border border-red-100" : "bg-slate-50 text-slate-500 border border-slate-100"
          )}>
            +{station.delta.toFixed(1)}°C vs Baseline
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex gap-4">
        <div className="flex-1">
          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mb-1 leading-none">Primário</p>
          <p className="text-[11px] font-bold text-slate-600 truncate">{station.primaryArea}</p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mb-1 leading-none">Influência ({station.secondaryAreas.length})</p>
          <p className="text-[11px] font-bold text-slate-600 truncate" title={station.secondaryAreas.join(', ')}>
            {station.secondaryAreas.join(', ')}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
