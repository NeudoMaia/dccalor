/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { WeatherCard } from './components/dashboard/WeatherCard';
import { HeatMap } from './components/dashboard/HeatMap';
import { RankingList } from './components/dashboard/RankingList';
import { ProtocolView } from './components/dashboard/ProtocolView';
import { IoTManager } from './components/iot/IoTManager';
import { HistoricalChart } from './components/analysis/HistoricalChart';
import { TechnicalManual } from './components/analysis/TechnicalManual';
import { useWeatherSimulation } from './hooks/useWeatherSimulation';
import { TabType } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const { stations, aiReport, loadingAI, addSensor, isLive } = useWeatherSimulation();

  // Calcular ponto mais quente, mais frio e a amplitude térmica da rede
  const sortedByTemp = useMemo(() => {
    // Filtrar IoT ou qualquer estação válida
    return [...stations].sort((a, b) => b.temp - a.temp);
  }, [stations]);

  const hottestStation = sortedByTemp[0];
  const coolestStation = sortedByTemp[sortedByTemp.length - 1];
  
  const tempDiff = useMemo(() => {
    if (!hottestStation || !coolestStation) return 0;
    return parseFloat((hottestStation.temp - coolestStation.temp).toFixed(1));
  }, [hottestStation, coolestStation]);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'map': return 'Visão Geral';
      case 'protocols': return 'Análise Preditiva';
      case 'iot': return 'Estações Automáticas';
      case 'analysis': return 'Logs do Sistema';
      default: return 'Visão Geral';
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header title={getPageTitle()} isLive={isLive} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 p-6 overflow-y-auto bg-slate-50 scroll-smooth custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'map' && (
              <motion.div 
                key="map-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stations.slice(0, 3).map(station => (
                    <WeatherCard key={station.id} station={station} />
                  ))}
                  <div className="bg-white border-2 border-orange-600 p-5 rounded-xl shadow-md flex flex-col justify-between group hover:bg-orange-50 transition-colors">
                    <div>
                      <p className="text-[11px] font-bold text-orange-700 uppercase tracking-widest leading-none mb-2">Ponto de Atenção / Área Crítica</p>
                      <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tighter">
                        {hottestStation?.primaryArea || 'Centro'}
                      </h3>
                      <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">
                        Temp. Máxima: {hottestStation?.temp}°C
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-orange-800 uppercase tracking-wider">Gradiente Térmico</span>
                        <span className="text-sm font-mono font-bold text-orange-700">+{tempDiff}°C</span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-medium leading-tight">
                        {hottestStation?.name} ({hottestStation?.temp}°C) vs {coolestStation?.name} ({coolestStation?.temp}°C)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main Visualizations Grid */}
                <div className="grid grid-cols-12 gap-6 pb-6">
                  <div className="col-span-12 lg:col-span-8 h-[600px] shadow-2xl shadow-slate-200/40 rounded-xl overflow-hidden border border-slate-200">
                    <HeatMap stations={stations} />
                  </div>
                  <div className="col-span-12 lg:col-span-4 h-[600px] shadow-2xl shadow-slate-200/40 rounded-xl overflow-hidden border border-slate-200 bg-white">
                    <RankingList stations={stations} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'protocols' && (
              <motion.div 
                key="protocol-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pb-10"
              >
                <ProtocolView analysis={aiReport} loading={loadingAI} />
              </motion.div>
            )}

            {activeTab === 'iot' && (
              <motion.div 
                key="iot-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pb-10"
              >
                <IoTManager onAddSensor={addSensor} stations={stations} />
              </motion.div>
            )}

            {activeTab === 'analysis' && (
              <motion.div 
                key="analysis-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pb-10 space-y-8"
              >
                <HistoricalChart />
                <TechnicalManual />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <footer className="h-8 bg-white border-t border-slate-200 px-8 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
        <div className="flex gap-6">
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Coord: -3.7172, -38.5433</span>
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Fuso: UTC-3 (Fortaleza)</span>
        </div>
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> 
            Sincronização: Tempo Real (5s)
          </span>
          <span className="text-slate-300">v4.0.0 - IDT (Thom) + ICU + IDW + Holt</span>
        </div>
      </footer>
    </div>
  );
}
