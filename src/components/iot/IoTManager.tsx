/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Radio, Plus, Satellite, MapPin, Thermometer, Droplets } from 'lucide-react';
import { StationData } from '../../types';

interface IoTManagerProps {
  onAddSensor: (sensor: Omit<StationData, 'id' | 'delta' | 'status' | 'heatIndex' | 'avgAnomaly'>) => void;
  stations: StationData[];
}

export const IoTManager: React.FC<IoTManagerProps> = ({ onAddSensor, stations }) => {
  const iotStations = stations.filter(s => s.isIoT);
  
  const [formData, setFormData] = useState({
    name: '',
    lat: '',
    lng: '',
    temp: '',
    humidity: '',
    primaryArea: '',
    secondaryAreas: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSensor({
      name: formData.name,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      temp: parseFloat(formData.temp),
      humidity: parseInt(formData.humidity),
      primaryArea: formData.primaryArea,
      secondaryAreas: formData.secondaryAreas.split(',').map(s => s.trim())
    });
    setFormData({
      name: '', lat: '', lng: '', temp: '', humidity: '', primaryArea: '', secondaryAreas: ''
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="xl:col-span-1 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm h-fit">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
          <Satellite className="w-6 h-6 text-blue-500" /> Registro de Sensor
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Identificação / Local</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Terminal Antônio Bezerra" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Latitude</label>
              <input 
                type="number" step="0.0001" required 
                value={formData.lat}
                onChange={e => setFormData({...formData, lat: e.target.value})}
                placeholder="-3.7600" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Longitude</label>
              <input 
                type="number" step="0.0001" required 
                value={formData.lng}
                onChange={e => setFormData({...formData, lng: e.target.value})}
                placeholder="-38.5300" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Temp (°C)</label>
              <div className="relative">
                <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="number" step="0.1" required 
                  value={formData.temp}
                  onChange={e => setFormData({...formData, temp: e.target.value})}
                  placeholder="30.5" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Umid (%)</label>
              <div className="relative">
                <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="number" required 
                  value={formData.humidity}
                  onChange={e => setFormData({...formData, humidity: e.target.value})}
                  placeholder="60" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Bairro Primário</label>
            <input 
              type="text" required 
              value={formData.primaryArea}
              onChange={e => setFormData({...formData, primaryArea: e.target.value})}
              placeholder="Antônio Bezerra" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Áreas de Influência (via vírgula)</label>
            <input 
              type="text" 
              value={formData.secondaryAreas}
              onChange={e => setFormData({...formData, secondaryAreas: e.target.value})}
              placeholder="Quintino Cunha, Olavo Oliveira" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-95">
            <Plus className="w-5 h-5" /> Ativar Sensor na Malha
          </button>
        </form>
      </div>

      {/* List Section */}
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
            <h3 className="text-xl font-black text-slate-800">Rede IoT Dispersa</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black border border-emerald-100 uppercase tracking-tighter animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {iotStations.length} Dispositivos Online
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {iotStations.length === 0 ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl">
                <Satellite className="w-16 h-16 mb-4 opacity-50" />
                <p className="font-bold uppercase tracking-widest text-xs">Nenhum sensor customizado na malha</p>
              </div>
            ) : (
              iotStations.map(station => (
                <div key={station.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 group hover:border-blue-200 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black text-slate-800 tracking-tight">{station.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400">{station.lat.toFixed(4)}, {station.lng.toFixed(4)}</p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0,0,8px,rgba(16,185,129,0.5)]" />
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-black text-slate-800 tracking-tight">{station.temp.toFixed(1)}°C</p>
                      <p className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1">
                        <Droplets className="w-3 h-3" /> {station.humidity}% Umid
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Delta Relativo</p>
                      <p className="text-sm font-black text-red-500">+{station.delta}°C</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
