/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Map as MapIcon, 
  ShieldCheck, 
  Radio, 
  BarChart3,
  Heart
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { TabType } from '../../types';
import { DefesaCivilLogo } from '../auth/Login';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const items = [
    { id: 'map', label: 'Monitoramento', icon: MapIcon, category: 'Dashboard' },
    { id: 'protocols', label: 'Protocolos de Ação', icon: ShieldCheck, category: 'Dashboard' },
    { id: 'iot', label: 'Estações IoT', icon: Radio, category: 'Infraestrutura' },
    { id: 'analysis', label: 'Relatórios Históricos', icon: BarChart3, category: 'Infraestrutura' },
    { id: 'dcpet', label: 'DCPET - Saúde Animal', icon: Heart, category: 'Sistemas Externos', url: 'https://dcpet-defesa-civil.vercel.app/' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6">
          {['Dashboard', 'Infraestrutura', 'Sistemas Externos'].map((cat) => (
            <div key={cat} className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 px-4 mb-2 uppercase tracking-widest leading-none">
                {cat}
              </div>
              <div className="space-y-1">
                {items
                  .filter((i) => i.category === cat)
                  .map((item) => {
                    const isExternal = !!item.url;
                    const content = (
                      <>
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all duration-300",
                          activeTab === item.id ? "bg-blue-700 scale-100" : "bg-slate-300 scale-75 group-hover:bg-slate-400"
                        )} />
                        <span className={cn(
                          "text-sm tracking-tight",
                          activeTab === item.id ? "font-bold uppercase" : "font-medium"
                        )}>
                          {item.label}
                        </span>
                      </>
                    );

                    const commonClasses = cn(
                      "w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative",
                      activeTab === item.id 
                        ? "bg-blue-50 text-blue-700 shadow-sm" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    );

                    if (isExternal) {
                      return (
                        <a
                          key={item.id}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={commonClasses}
                        >
                          {content}
                        </a>
                      );
                    }

                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as TabType)}
                        className={commonClasses}
                      >
                        {content}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
          
          {/* Logo da Defesa Civil de Fortaleza */}
          <div className="pt-6 border-t border-slate-100 flex flex-col items-center justify-center gap-2">
            <DefesaCivilLogo className="w-24 h-24 drop-shadow-sm transform hover:scale-105 transition-all duration-300" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center leading-tight">
              Defesa Civil<br />Fortaleza
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-900 rounded-xl p-4 text-white shadow-xl shadow-slate-900/10">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Status da Malha</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400">ONLINE</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">v4.0</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/50 text-[9px] text-slate-500 font-medium space-y-1">
            <p>IDT (Thom) + ICU + IDW</p>
            <p>Modelo Holt ativo</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
