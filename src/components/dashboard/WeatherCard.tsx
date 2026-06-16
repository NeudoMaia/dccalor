/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Droplets, Info, Wind, Sun } from 'lucide-react';
import { StationData } from '../../types';
import { cn, formatTemp, getAlertInfo } from '../../lib/utils';
import { motion } from 'motion/react';

interface WeatherCardProps {
  station: StationData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ station }) => {
  const isComfortable = station.status === 'NIVEL_0';
  const isYellow = station.status === 'NIVEL_1';
  const isOrange = station.status === 'NIVEL_2';
  const isRed = station.status === 'NIVEL_3';
  const isOffline = station.status === 'OFFLINE';

  const alertInfo = getAlertInfo(station.status);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={cn(
        "bg-white rounded-xl p-5 border shadow-sm relative overflow-hidden transition-all duration-300",
        isRed ? "border-red-200 shadow-red-500/5" :
        isOrange ? "border-orange-200 shadow-orange-500/5" :
        isYellow ? "border-yellow-200 shadow-yellow-500/5" :
        "border-slate-200"
      )}
    >
      <div className={cn(
        "absolute top-0 left-0 w-full h-1 bg-gradient-to-r",
        isRed ? "from-rose-500 to-red-600" :
        isOrange ? "from-orange-400 to-orange-600" :
        isYellow ? "from-yellow-300 to-yellow-500" :
        "from-emerald-400 to-emerald-600"
      )} />
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base leading-tight">{station.name}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{station.isIoT ? 'Rede IoT Distribuída' : 'Monitoramento Civil'}</p>
        </div>
        <span className={cn(
          "text-[9px] px-2 py-0.5 rounded font-black tracking-widest border",
          isRed ? "bg-red-50 text-red-600 border-red-100 animate-pulse" : 
          isOrange ? "bg-orange-50 text-orange-600 border-orange-100" : 
          isYellow ? "bg-yellow-50 text-yellow-600 border-yellow-100" :
          "bg-emerald-50 text-emerald-600 border-emerald-100"
        )}>
          {alertInfo.label}
        </span>
      </div>

      <div className="flex items-end gap-3 my-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Temperatura Real</span>
          <h2 className={cn(
            "text-4xl font-light tracking-tighter",
            isRed ? "text-rose-600" :
            isOrange ? "text-orange-600" :
            isYellow ? "text-yellow-600" :
            "text-slate-800"
          )}>
            {station.temp.toFixed(1)} <span className="text-lg font-medium text-slate-300">°C</span>
          </h2>
        </div>
        <div className="flex flex-col gap-1.5 mb-1.5 ml-auto text-right">
          <div className="text-xs font-bold text-slate-400 flex items-center justify-end gap-1.5 uppercase tracking-tighter">
            <span>{station.humidity}% RH</span>
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xs font-bold text-slate-400 flex items-center justify-end gap-1.5 uppercase tracking-tighter">
            <span>{station.windSpeed.toFixed(1)} m/s</span>
            <Wind className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xs font-bold text-slate-400 flex items-center justify-end gap-1.5 uppercase tracking-tighter">
            <span>{station.solarRadiation.toFixed(0)} W/m²</span>
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          </div>
        </div>
      </div>

      <div className={cn(
        "rounded-lg p-3 flex justify-between items-center text-xs mb-4 border transition-colors",
        isRed ? "bg-red-50/30 border-red-100" :
        isOrange ? "bg-orange-50/30 border-orange-100" :
        isYellow ? "bg-yellow-50/30 border-yellow-100" :
        "bg-slate-50/50 border-slate-100"
      )}>
        <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Temp. Aparente (Steadman)</span>
        <span className={cn(
          "font-bold text-sm font-mono",
          isRed ? "text-red-700" :
          isOrange ? "text-orange-700" :
          isYellow ? "text-yellow-700" :
          "text-emerald-700"
        )}>
          {station.idt.toFixed(1)}°
        </span>
      </div>

      <div className="flex justify-between items-center text-[10px] mb-4">
        <span className="text-slate-400 font-bold uppercase tracking-widest">Intensidade ICU</span>
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-tighter",
            station.icu > 1 ? "bg-red-50 text-red-600 border border-red-100" : "bg-slate-50 text-slate-500 border border-slate-100"
          )}>
            +{station.icu.toFixed(1)}°C vs Referência
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
