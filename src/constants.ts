/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StationData } from './types.ts';

export const FORTALEZA_CENTER: [number, number] = [-3.76, -38.53];

export const INITIAL_STATIONS: StationData[] = [
  {
    id: 'st-01',
    name: 'Messejana',
    lat: -3.83,
    lng: -38.49,
    temp: 29.5,
    humidity: 65,
    heatIndex: 31.2,
    delta: 0,
    avgAnomaly: 1.2,
    status: 'NORMAL',
    primaryArea: 'Messejana',
    secondaryAreas: ['Cambeba', 'Paupina', 'Sapiranga', 'Curió', 'Guajeru', 'Lagoa Redonda', 'José de Alencar', 'Coaçu']
  },
  {
    id: 'st-02',
    name: 'Montese',
    lat: -3.76,
    lng: -38.54,
    temp: 30.2,
    humidity: 60,
    heatIndex: 32.5,
    delta: 0.7,
    avgAnomaly: 1.8,
    status: 'ATTENTION',
    primaryArea: 'Montese',
    secondaryAreas: ['Parangaba', 'Itaoca', 'Bom Futuro', 'Vila União', 'Damas', 'Jardim América', 'Aeroporto', 'Serrinha']
  },
  {
    id: 'st-03',
    name: 'Centro',
    lat: -3.72,
    lng: -38.52,
    temp: 31.0,
    humidity: 58,
    heatIndex: 34.1,
    delta: 1.5,
    avgAnomaly: 2.2,
    status: 'ALERT',
    primaryArea: 'Centro',
    secondaryAreas: ['Benfica', 'Jacarecanga', 'Praia de Iracema', 'Joaquim Távora', 'Aldeota', 'Meireles', 'Moura Brasil', 'Farias Brito']
  }
];

export const HISTORICAL_DATA = [
  { date: '01/05', messejana: 28.1, montese: 30.5, centro: 31.8 },
  { date: '02/05', messejana: 28.5, montese: 31.1, centro: 32.5 },
  { date: '03/05', messejana: 27.8, montese: 30.0, centro: 31.2 },
  { date: '04/05', messejana: 29.0, montese: 31.8, centro: 33.1 },
  { date: '05/05', messejana: 28.2, montese: 30.9, centro: 32.0 },
  { date: '06/05', messejana: 27.5, montese: 29.5, centro: 31.0 },
  { date: '07/05', messejana: 28.8, montese: 31.2, centro: 32.8 },
  { date: '08/05', messejana: 29.1, montese: 31.5, centro: 33.0 },
  { date: '09/05', messejana: 28.9, montese: 30.8, centro: 32.1 },
  { date: '10/05', messejana: 28.3, montese: 30.2, centro: 31.5 },
  { date: '11/05', messejana: 29.5, montese: 32.1, centro: 33.5 },
  { date: '12/05', messejana: 28.7, montese: 31.0, centro: 32.2 },
  { date: '13/05', messejana: 28.4, montese: 30.6, centro: 31.9 },
  { date: '14/05', messejana: 29.2, montese: 31.9, centro: 33.2 },
  { date: '15/05', messejana: 29.8, montese: 32.5, centro: 34.1 },
];
