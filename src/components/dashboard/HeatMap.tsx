/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { StationData } from '../../types';
import { FORTALEZA_CENTER } from '../../constants';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface HeatMapProps {
  stations: StationData[];
}

function InvalidateMap() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 400);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export const HeatMap: React.FC<HeatMapProps> = ({ stations }) => {
  const getCircleColor = (status: string) => {
    switch (status) {
      case 'ALERT': return '#dc2626';
      case 'ATTENTION': return '#eab308';
      default: return '#10b981';
    }
  };

  return (
    <div className="w-full h-full min-h-[400px] bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-200">
      <MapContainer 
        center={FORTALEZA_CENTER} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <InvalidateMap />
        
        {stations.map(station => (
          <React.Fragment key={station.id}>
            <Marker position={[station.lat, station.lng]}>
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-slate-800 m-0">{station.name}</h4>
                  <p className="text-xs text-slate-500 m-0 mt-1">Temp: {station.temp}°C</p>
                  <p className="text-xs text-slate-500 m-0">Index: {station.heatIndex}°C</p>
                </div>
              </Popup>
            </Marker>
            <Circle 
              center={[station.lat, station.lng]}
              radius={station.status === 'ALERT' ? 2500 : 2000}
              pathOptions={{
                color: getCircleColor(station.status),
                fillColor: getCircleColor(station.status),
                fillOpacity: 0.2 + (station.delta * 0.1),
                weight: 1,
                dashArray: station.isIoT ? '5, 10' : undefined
              }}
            />
          </React.Fragment>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur p-4 rounded-2xl border border-slate-200 shadow-xl z-[400] text-xs pointer-events-none">
        <h4 className="font-black text-slate-800 mb-3 uppercase tracking-wider text-[10px]">Densidade Térmica (ΔT)</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0,0,8px,rgba(16,185,129,0.5)]"></span>
            <span className="font-bold text-slate-600">Normal (ΔT {'<'} 0.5)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0,0,8px,rgba(234,179,8,0.5)]"></span>
            <span className="font-bold text-slate-600">Atenção (ΔT {'<'} 1.5)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-600 shadow-[0,0,8px,rgba(220,38,38,0.5)]"></span>
            <span className="font-bold text-slate-600">Alerta (ΔT {'>'} 1.5)</span>
          </div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-200">
            <span className="w-3 h-3 rounded-full border-2 border-blue-500 border-dashed"></span>
            <span className="font-bold text-slate-600">Sensor IoT Georreferenciado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
