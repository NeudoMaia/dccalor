/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
// No icons needed — the header uses custom initials

interface HeaderProps {
  title: string;
  isLive?: boolean;
}

export function Header({ title, isLive }: HeaderProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 shadow-sm shrink-0 z-10 w-full">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-700 rounded flex items-center justify-center text-white font-bold shadow-lg shadow-blue-700/20">DC</div>
        <div>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">
            DCCALOR <span className="font-normal text-slate-400 mx-2">|</span> <span className="text-blue-600">{title}</span>
          </h1>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
            Monitoramento de Ilhas de Calor Urbana (ICU) — IDT Thom + IDW + Holt
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2">
          <span className={`flex h-2 w-2 rounded-full animate-pulse ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
            {isLive ? 'Tempo Real (Plugfield)' : 'Simulação Offline'}
          </span>
        </div>
        <div className="h-8 w-px bg-slate-200"></div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-slate-100 text-slate-700 text-[10px] font-black rounded border border-slate-200 uppercase tracking-widest hover:bg-slate-200 transition-colors">
            Exportar Dados
          </button>
          <div className="flex items-center gap-3 ml-2">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">CCO Fortaleza</p>
              <p className="text-xs font-bold text-slate-800">{time.toLocaleTimeString('pt-BR')}</p>
            </div>
            <div className="w-9 h-9 rounded bg-blue-700 text-white flex items-center justify-center font-bold text-sm">
              OP
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
