/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { StationData, AIAnalysis } from '../types';
import { INITIAL_STATIONS, HISTORICAL_BASELINES } from '../constants';
import { calculateIDT, calculateICU, getStatusFromIDT } from '../lib/utils';
import { calculateAnomaly } from '../lib/prediction';
import { analyzeThermalData } from '../services/geminiService';

export function useWeatherSimulation() {
  const [apiStations, setApiStations] = useState<StationData[]>(INITIAL_STATIONS);
  const [customSensors, setCustomSensors] = useState<StationData[]>([]);
  const [aiReport, setAiReport] = useState<AIAnalysis | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isLive, setIsLive] = useState(false); // Indica se estamos consumindo dados reais da Plugfield
  const [loadingLive, setLoadingLive] = useState(false);

  // Computar a lista final mesclada (Estações da Defesa Civil + Sensores IoT criados pelo usuário)
  const stations = useMemo(() => {
    return [...apiStations, ...customSensors];
  }, [apiStations, customSensors]);

  const stationsRef = useRef<StationData[]>(stations);
  useEffect(() => {
    stationsRef.current = stations;
  }, [stations]);

  // A. Função para buscar dados do backend (/api/stations)
  const fetchLiveStations = useCallback(async () => {
    setLoadingLive(true);
    try {
      const response = await fetch('/api/stations');
      if (!response.ok) {
        throw new Error(`HTTP Error status: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.stations && data.stations.length > 0) {
        setApiStations(data.stations);
        setIsLive(data.source === 'live_api');
      } else {
        throw new Error("Empty stations array returned");
      }
    } catch (error) {
      console.warn("Falha ao buscar dados em tempo real da Plugfield. Mantendo simulação local:", error);
      setIsLive(false);
    } finally {
      setLoadingLive(false);
    }
  }, []);

  // B. Função para rodar simulação local física (usada apenas se isLive for falso)
  const updateLocalSimulation = useCallback(() => {
    if (isLive) return; // Não faz simulação se os dados reais estiverem ativos

    setApiStations(prev => {
      // 1. Encontrar a estação de referência (isReference: true)
      const refStation = prev.find(s => s.isReference);
      
      // 2. Aplicar flutuação física de temperatura e umidade
      const updated = prev.map(station => {
        const tempVariation = (Math.random() * 0.4) - 0.15;
        const humidityVariation = Math.round((Math.random() * 4) - 2);
        const newTemp = Math.max(25, station.temp + tempVariation);
        const newHumidity = Math.max(30, Math.min(95, station.humidity + humidityVariation));
        
        const windVariation = (Math.random() * 0.4) - 0.2;
        const newWind = Math.max(0, (station.windSpeed || 2.0) + windVariation);
        
        // Simulação bem simples do ciclo solar diário
        const hour = new Date().getHours();
        const baseSolar = hour >= 6 && hour <= 17 
          ? Math.max(100, Math.min(1000, 800 * Math.sin(Math.PI * (hour - 6) / 11)))
          : 0;
        const newSolar = Math.max(0, baseSolar + (Math.random() * 50 - 25));
        
        return {
          ...station,
          temp: parseFloat(newTemp.toFixed(1)),
          humidity: newHumidity,
          windSpeed: parseFloat(newWind.toFixed(1)),
          solarRadiation: parseFloat(newSolar.toFixed(0))
        };
      });

      // 3. Obter temperatura da referência Messejana
      const refTemp = updated.find(s => s.isReference)?.temp ?? updated[0].temp;

      // 4. Recalcular IDT (Steadman), ICU e anomalia para cada estação
      return updated.map(s => {
        const idt = calculateIDT(s.temp, s.humidity, s.windSpeed, s.solarRadiation);
        const icu = calculateICU(s.temp, refTemp);
        const baseline = HISTORICAL_BASELINES[s.id] ?? 29.0;
        const avgAnomaly = calculateAnomaly(s.temp, baseline);

        return {
          ...s,
          idt,
          icu,
          avgAnomaly,
          status: getStatusFromIDT(s.temp),
        };
      });
    });
  }, [isLive]);

  // C. Polling para atualizar dados reais a cada 30 segundos
  useEffect(() => {
    fetchLiveStations(); // Chamada inicial imediata
    const interval = setInterval(fetchLiveStations, 30000);
    return () => clearInterval(interval);
  }, [fetchLiveStations]);

  // D. Simulação física periódica a cada 5 segundos apenas quando não estiver live
  useEffect(() => {
    if (isLive) return;
    const interval = setInterval(updateLocalSimulation, 5000);
    return () => clearInterval(interval);
  }, [isLive, updateLocalSimulation]);

  // E. Análise de IA periódica via Gemini a cada 5 minutos
  useEffect(() => {
    const fetchAI = async () => {
      if (stationsRef.current.length === 0) return;
      setLoadingAI(true);
      try {
        const report = await analyzeThermalData(stationsRef.current);
        setAiReport(report);
      } catch (error) {
        console.error("AI Analysis failed, skipping:", error);
      } finally {
        setLoadingAI(false);
      }
    };

    const interval = setInterval(fetchAI, 300000);
    fetchAI(); // Chamada inicial imediata
    return () => clearInterval(interval);
  }, []);

  // F. Adicionar sensores customizados da rede IoT
  const addSensor = (sensor: Omit<StationData, 'id' | 'icu' | 'status' | 'idt' | 'avgAnomaly' | 'isReference' | 'windSpeed' | 'solarRadiation'>) => {
    const refTemp = apiStations.find(s => s.isReference)?.temp ?? apiStations[0]?.temp ?? 29.5;
    const windSpeed = 2.0;
    const solarRadiation = 500;
    const idt = calculateIDT(sensor.temp, sensor.humidity, windSpeed, solarRadiation);
    
    const newSensor: StationData = {
      ...sensor,
      id: `iot-${Date.now()}`,
      windSpeed,
      solarRadiation,
      idt,
      icu: calculateICU(sensor.temp, refTemp),
      avgAnomaly: 0,
      status: getStatusFromIDT(sensor.temp),
      isIoT: true
    };
    
    setCustomSensors(prev => [...prev, newSensor]);
  };

  return { 
    stations, 
    aiReport, 
    loadingAI, 
    addSensor, 
    isLive, 
    loadingLive, 
    refetch: fetchLiveStations 
  };
}
