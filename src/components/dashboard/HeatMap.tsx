/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { StationData } from '../../types';
import { FORTALEZA_CENTER } from '../../constants';
import { generateIDWGrid, FORTALEZA_BOUNDS, idtToColor } from '../../lib/idw';

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

/**
 * IDWOverlay — Renderiza uma camada canvas com interpolação IDW sobre o mapa.
 * Usa a grade gerada por generateIDWGrid e pinta cada célula com a cor
 * correspondente ao IDT interpolado naquele ponto.
 */
function IDWOverlay({ stations }: { stations: StationData[] }) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [, setRenderTick] = useState(0);

  // Force re-render on map move/zoom
  useEffect(() => {
    const handler = () => setRenderTick(t => t + 1);
    map.on('moveend zoomend resize', handler);
    return () => { map.off('moveend zoomend resize', handler); };
  }, [map]);

  useEffect(() => {
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '350'; // Above tiles, below markers
      const pane = map.getContainer().querySelector('.leaflet-overlay-pane');
      if (pane) pane.appendChild(canvas);
      canvasRef.current = canvas;
    }

    const canvas = canvasRef.current;
    const size = map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;

    const ctx = canvas.getContext('2d');
    if (!ctx || stations.length < 2) return;

    const resolution = 35;
    const grid = generateIDWGrid(stations, resolution, 2);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < grid.length - 1; i++) {
      for (let j = 0; j < grid[i].length - 1; j++) {
        const point = grid[i][j];
        const nextI = grid[i + 1][j];
        const nextJ = grid[i][j + 1];

        const topLeft = map.latLngToContainerPoint([point.lat, point.lng]);
        const bottomRight = map.latLngToContainerPoint([nextI.lat, nextJ.lng]);

        const w = bottomRight.x - topLeft.x;
        const h = bottomRight.y - topLeft.y;

        if (w > 0 && h > 0) {
          ctx.fillStyle = idtToColor(point.idt, 0.35);
          ctx.fillRect(topLeft.x, topLeft.y, w, h);
        }
      }
    }

    return () => {
      if (canvasRef.current) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [map, stations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
      }
    };
  }, []);

  return null;
}

export const HeatMap: React.FC<HeatMapProps> = ({ stations }) => {
  const getCircleColor = (status: string) => {
    switch (status) {
      case 'NIVEL_0': return '#10b981';
      case 'NIVEL_1': return '#eab308';
      case 'NIVEL_2': return '#f97316';
      case 'NIVEL_3': return '#dc2626';
      case 'OFFLINE': return '#64748b';
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
        <IDWOverlay stations={stations} />
        
        {stations.map(station => (
          <React.Fragment key={station.id}>
            <Marker position={[station.lat, station.lng]}>
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-slate-800 m-0">{station.name}</h4>
                  <p className="text-xs text-slate-500 m-0 mt-1">Temp. Real: {station.temp}°C</p>
                  <p className="text-xs text-slate-500 m-0">Sensação Térmica: {station.idt.toFixed(1)}°C</p>
                  <p className="text-xs text-slate-500 m-0">ICU: +{station.icu}°C</p>
                </div>
              </Popup>
            </Marker>
            <Circle 
              center={[station.lat, station.lng]}
              radius={2000}
              pathOptions={{
                color: getCircleColor(station.status),
                fillColor: getCircleColor(station.status),
                fillOpacity: 0.2 + (station.icu * 0.1),
                weight: 1,
                dashArray: station.isIoT ? '5, 10' : undefined
              }}
            />
          </React.Fragment>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur p-4 rounded-2xl border border-slate-200 shadow-xl z-[400] text-xs pointer-events-none">
        <h4 className="font-black text-slate-800 mb-3 uppercase tracking-wider text-[10px]">Nível de Alerta de Calor</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0,0,8px,rgba(16,185,129,0.5)]"></span>
            <span className="font-bold text-slate-600">Nível 0 - Seguro (≤ 27°C)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0,0,8px,rgba(234,179,8,0.5)]"></span>
            <span className="font-bold text-slate-600">Nível 1 - Atenção (27.1°C–32°C)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-orange-500 shadow-[0,0,8px,rgba(249,115,22,0.5)]"></span>
            <span className="font-bold text-slate-600">Nível 2 - Alerta (32.1°C–41°C)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-600 shadow-[0,0,8px,rgba(220,38,38,0.5)]"></span>
            <span className="font-bold text-slate-600">Nível 3 - Alarme (≥ 41.1°C)</span>
          </div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-200">
            <span className="w-3 h-3 rounded-full border-2 border-blue-500 border-dashed"></span>
            <span className="font-bold text-slate-600">Sensor IoT Georreferenciado</span>
          </div>
          {/* IDW Interpolation legend */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-200">
            <span
              className="w-12 h-3 rounded"
              style={{
                background: 'linear-gradient(to right, #10b981, #eab308, #f97316, #dc2626)',
              }}
            ></span>
            <span className="font-bold text-slate-600">Interpolação IDW (IDT)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
