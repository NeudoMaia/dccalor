/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StationData } from '../../types';
import { cn } from '../../lib/utils';
// No icons used in this component

interface RankingListProps {
  stations: StationData[];
}

export const RankingList: React.FC<RankingListProps> = ({ stations }) => {
  const sorted = [...stations].sort((a, b) => b.temp - a.temp);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Ranking de Intensidade</h4>
        <div className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
      </div>
      
      <div className="space-y-3 overflow-y-auto pr-1 flex-1 custom-scrollbar">
        {sorted.map((station, index) => (
          <div 
            key={station.id}
            className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
          >
            <div className="flex flex-col">
              <p className="text-xs font-bold text-slate-800">
                {index + 1}. {station.name}
              </p>
              <p className="text-[10px] text-slate-400 italic">
                ΔT: <span className={cn(
                  "font-mono font-bold",
                  station.delta > 1.5 ? "text-rose-600" : (station.delta > 0.5 ? "text-orange-600" : "text-emerald-600")
                )}>+{station.delta.toFixed(1)}°C</span>
              </p>
            </div>
            
            <div className="text-right">
              <p className={cn(
                "text-sm font-mono font-bold",
                index === 0 ? "text-rose-600" : (index === 1 ? "text-orange-600" : "text-slate-700")
              )}>
                {station.temp.toFixed(1)}°C
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Base de Referência</span>
        <span className="text-[10px] font-mono text-slate-700 px-1.5 py-0.5 bg-slate-50 rounded">
          {Math.min(...stations.map(s => s.temp)).toFixed(1)}°C
        </span>
      </div>
    </div>
  );
};
