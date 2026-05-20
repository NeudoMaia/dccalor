/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { StationData, AIAnalysis } from '../types';
import { INITIAL_STATIONS } from '../constants';
import { calculateHeatIndex, getStatusFromHeatIndex } from '../lib/utils';
import { analyzeThermalData } from '../services/geminiService';

export function useWeatherSimulation() {
  const [stations, setStations] = useState<StationData[]>(INITIAL_STATIONS);
  const [aiReport, setAiReport] = useState<AIAnalysis | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const updateSimulation = useCallback(() => {
    setStations(prev => {
      const updated = prev.map(station => {
        // Random fluctuation
        const tempVariation = (Math.random() * 0.4) - 0.15;
        const newTemp = Math.max(25, station.temp + tempVariation);
        const newHeatIndex = calculateHeatIndex(newTemp, station.humidity);
        
        return {
          ...station,
          temp: parseFloat(newTemp.toFixed(1)),
          heatIndex: newHeatIndex,
          status: getStatusFromHeatIndex(newHeatIndex)
        };
      });

      // Calculate deltas based on mean baseline
      const meanTemp = updated.reduce((sum, s) => sum + s.temp, 0) / updated.length;
      return updated.map(s => ({
        ...s,
        delta: parseFloat((s.temp - meanTemp).toFixed(1)),
        avgAnomaly: parseFloat((Math.random() * 2).toFixed(1)) // Mock 15-day anomaly
      }));
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(updateSimulation, 5000);
    return () => clearInterval(interval);
  }, [updateSimulation]);

  // Periodic AI analysis every 5 minutes
  useEffect(() => {
    const fetchAI = async () => {
      setLoadingAI(true);
      try {
        const report = await analyzeThermalData(stations);
        setAiReport(report);
      } catch (error) {
        console.error("AI Analysis failed, skipping:", error);
      } finally {
        setLoadingAI(false);
      }
    };

    const interval = setInterval(fetchAI, 300000);
    fetchAI(); // Initial call
    return () => clearInterval(interval);
  }, [stations.length]);


  const addSensor = (sensor: Omit<StationData, 'id' | 'delta' | 'status' | 'heatIndex' | 'avgAnomaly'>) => {
    const hi = calculateHeatIndex(sensor.temp, sensor.humidity);
    const newSensor: StationData = {
      ...sensor,
      id: `iot-${Date.now()}`,
      heatIndex: hi,
      delta: 0,
      avgAnomaly: 0,
      status: getStatusFromHeatIndex(hi),
      isIoT: true
    };
    setStations(prev => [...prev, newSensor]);
  };

  return { stations, aiReport, loadingAI, addSensor };
}
