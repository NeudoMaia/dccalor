interface StationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  temp: number;
  humidity: number;
  windSpeed: number;
  solarRadiation: number;
  idt: number;
  icu: number;
  avgAnomaly: number;
  status: string;
  primaryArea: string;
  secondaryAreas: string[];
  isIoT?: boolean;
  isReference?: boolean;
  measurementTimestamp?: string;
  deltaTSeconds?: number | null;
  qcTemporalFlag?: string;
}

// Memória de deduplicação de polling por estação (impede duplicatas de 30s / 180s)
const ultimoTimestampIntrinsecoPorEstacao: Record<string, number> = {};

/**
 * Converte qualquer data/timestamp para o fuso estrito America/Fortaleza (GMT-3)
 * e extrai a hora local (0-23) imune ao relógio UTC do container.
 */
function extrairTempoFortalezaGMT3(rawInput?: string | number | Date): {
  isoGMT3: string;
  epochMs: number;
  horaLocalFortaleza: number;
  fusoValidoGMT3: boolean;
} {
  const parsed = rawInput !== undefined && rawInput !== null ? new Date(rawInput) : new Date();
  const dataValida = isNaN(parsed.getTime()) ? new Date() : parsed;
  const epochMs = dataValida.getTime();

  const formatador = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Fortaleza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'longOffset'
  });

  const partes = formatador.formatToParts(dataValida);
  const mapa = Object.fromEntries(partes.map(p => [p.type, p.value]));
  const offset = mapa.timeZoneName?.replace('GMT', '') || '-03:00';
  const fusoValidoGMT3 = offset === '-03:00';
  const isoGMT3 = `${mapa.year}-${mapa.month}-${mapMonthOrDay(mapa.day)}T${mapa.hour}:${mapa.minute}:${mapa.second}${offset}`;
  const horaLocalFortaleza = parseInt(mapa.hour, 10);

  return { isoGMT3, epochMs, horaLocalFortaleza, fusoValidoGMT3 };
}

function mapMonthOrDay(val: string): string {
  return val.padStart(2, '0');
}

/**
 * Audita o Time of Measurement intrínseco do pacote IoT da Plugfield e impede duplicatas de polling.
 */
function auditarPacoteIoTPlugfield(stationId: string, rawMeasurementTime?: string | number): {
  timestampFortalezaISO: string;
  horaLocalFortaleza: number;
  deltaTSegundos: number | null;
  flagTemporal:
    | '[REJEITADO_SEM_TIMESTAMP_ORIGEM]'
    | '[CACHE_HIT / IGNORADO_NO_HISTORICO]'
    | '[SINCRONIZADO]'
    | '[PACOTE PERDIDO / ATRASO]'
    | '[COLISÃO / DADO DUPLICADO]'
    | '[LEITURA INICIAL]';
  ignorarNoHistorico: boolean;
} {
  // Validação estrita: rejeita pacotes sem carimbo de tempo de origem válido (proibido fallback silencioso para new Date())
  const timestampOrigemInvalido =
    rawMeasurementTime === undefined ||
    rawMeasurementTime === null ||
    (typeof rawMeasurementTime === 'string' && rawMeasurementTime.trim() === '') ||
    isNaN(new Date(rawMeasurementTime).getTime());

  if (timestampOrigemInvalido) {
    const { isoGMT3, horaLocalFortaleza } = extrairTempoFortalezaGMT3();
    console.warn(
      `[QC-TELEMETRIA] Estação=${stationId} | TS_ORIGEM=AUSENTE/INVÁLIDO | Status=[REJEITADO_SEM_TIMESTAMP_ORIGEM]`
    );
    return {
      timestampFortalezaISO: isoGMT3,
      horaLocalFortaleza,
      deltaTSegundos: null,
      flagTemporal: '[REJEITADO_SEM_TIMESTAMP_ORIGEM]',
      ignorarNoHistorico: true
    };
  }

  const { isoGMT3, epochMs, horaLocalFortaleza, fusoValidoGMT3 } = extrairTempoFortalezaGMT3(rawMeasurementTime);

  if (!fusoValidoGMT3) {
    console.warn(`[QC-TIMEZONE-ALERTA] Estação ${stationId} fora de GMT-3 (America/Fortaleza)`);
  }

  const ultimoEpochMs = ultimoTimestampIntrinsecoPorEstacao[stationId];

  // Se o Time of Measurement intrínseco do pacote for idêntico ao último processado na memória:
  if (ultimoEpochMs !== undefined && epochMs === ultimoEpochMs) {
    console.info(
      `[QC-TELEMETRIA] Estação=${stationId} | TS_GMT3=${isoGMT3} | DeltaT=0s | Status=[CACHE_HIT / IGNORADO_NO_HISTORICO]`
    );
    return {
      timestampFortalezaISO: isoGMT3,
      horaLocalFortaleza,
      deltaTSegundos: 0,
      flagTemporal: '[CACHE_HIT / IGNORADO_NO_HISTORICO]',
      ignorarNoHistorico: true
    };
  }

  ultimoTimestampIntrinsecoPorEstacao[stationId] = epochMs;

  if (ultimoEpochMs === undefined) {
    console.info(
      `[QC-TELEMETRIA] Estação=${stationId} | TS_GMT3=${isoGMT3} | DeltaT=N/A | Status=[LEITURA INICIAL]`
    );
    return {
      timestampFortalezaISO: isoGMT3,
      horaLocalFortaleza,
      deltaTSegundos: null,
      flagTemporal: '[LEITURA INICIAL]',
      ignorarNoHistorico: false
    };
  }

  const deltaTSegundos = Number(((epochMs - ultimoEpochMs) / 1000).toFixed(3));
  let flagTemporal: '[SINCRONIZADO]' | '[PACOTE PERDIDO / ATRASO]' | '[COLISÃO / DADO DUPLICADO]';

  if (deltaTSegundos >= 595 && deltaTSegundos <= 605) {
    flagTemporal = '[SINCRONIZADO]';
  } else if (deltaTSegundos > 605) {
    flagTemporal = '[PACOTE PERDIDO / ATRASO]';
  } else {
    flagTemporal = '[COLISÃO / DADO DUPLICADO]';
  }

  console.info(
    `[QC-TELEMETRIA] Estação=${stationId} | TS_GMT3=${isoGMT3} | DeltaT=${deltaTSegundos}s | Status=${flagTemporal}`
  );

  return {
    timestampFortalezaISO: isoGMT3,
    horaLocalFortaleza,
    deltaTSegundos,
    flagTemporal,
    ignorarNoHistorico: false
  };
}

// 1. Static Neighborhood mappings for the 11 Defesa Civil weather stations
const STATION_MAPPINGS: Record<number, {
  cleanName: string;
  primaryArea: string;
  secondaryAreas: string[];
}> = {
  9169: {
    cleanName: 'Messejana',
    primaryArea: 'Messejana',
    secondaryAreas: ['Cambeba', 'Paupina', 'Lagoa Redonda', 'Curió', 'Guajeru', 'José de Alencar', 'Coaçu']
  },
  8642: {
    cleanName: 'Centro',
    primaryArea: 'Centro',
    secondaryAreas: ['Praia de Iracema', 'Aldeota', 'Meireles', 'Jacarecanga', 'Moura Brasil', 'Farias Brito']
  },
  8836: {
    cleanName: 'Montese',
    primaryArea: 'Montese',
    secondaryAreas: ['Parangaba', 'Vila União', 'Itaoca', 'Bom Futuro', 'Jardim América', 'Aeroporto', 'Serrinha']
  },
  9281: {
    cleanName: 'Benfica',
    primaryArea: 'Benfica',
    secondaryAreas: ['Farias Brito', 'Rodolfo Teófilo', 'José Bonifácio', 'Gentilândia', 'Damas']
  },
  9134: {
    cleanName: 'Conjunto Esperança',
    primaryArea: 'Conjunto Esperança',
    secondaryAreas: ['Parque Prefeito José Walter', 'Mondubim', 'Maraponga', 'Planalto Ayrton Senna', 'Aracapé']
  },
  9282: {
    cleanName: 'Granja Lisboa',
    primaryArea: 'Granja Lisboa',
    secondaryAreas: ['Granja Portugal', 'Bom Jardim', 'Siqueira', 'Conjunto Ceará', 'Sertãozinho']
  },
  9242: {
    cleanName: 'Guararapes',
    primaryArea: 'Guararapes',
    secondaryAreas: ['Luciano Cavalcante', 'Cocó', 'Patriolino Ribeiro', 'Salinas', 'Edson Queiroz']
  },
  9249: {
    cleanName: 'Jangurussu',
    primaryArea: 'Jangurussu',
    secondaryAreas: ['Conjunto Palmeiras', 'Ancuri', 'Pedras', 'Barroso', 'Passaré']
  },
  9137: {
    cleanName: 'Mucuripe',
    primaryArea: 'Mucuripe',
    secondaryAreas: ['Cais do Porto', 'Varjota', 'Vicente Pinzon', 'Papicu', 'Aldeota']
  },
  8869: {
    cleanName: 'Vila Velha',
    primaryArea: 'Vila Velha',
    secondaryAreas: ['Barra do Ceará', 'Jardim Guanabara', 'Quintino Cunha', 'Antônio Bezerra', 'Cristo Redentor']
  },
  3318: {
    cleanName: 'Dom Lustosa',
    primaryArea: 'Dom Lustosa',
    secondaryAreas: ['Henrique Jorge', 'Pici', 'João XXIII', 'Autran Nunes', 'Bela Vista', 'Amadeu Furtado']
  }
};

// Baselines históricas correspondentes a cada ID para cálculo de anomalias
const STATION_BASELINES: Record<number, number> = {
  9169: 28.59, // Messejana
  8836: 31.04, // Montese
  8642: 32.39, // Centro
  9281: 29.8,
  9134: 30.1,
  9282: 30.9,
  9242: 29.5,
  9249: 30.2,
  9137: 29.1,
  8869: 28.9,
  3318: 29.7
};

// 2. Fórmulas de cálculo locais para robustez do serverless
function computeIDT(tempC: number, rh: number, windSpeed: number = 0, solarRad: number = 0): number {
  const e = (rh / 100) * 6.105 * Math.exp((17.27 * tempC) / (237.7 + tempC));
  const at = tempC + 0.33 * e - 0.70 * windSpeed - 4.00;
  return parseFloat(Math.max(tempC, at).toFixed(1));
}

function computeICU(temp: number, refTemp: number): number {
  return parseFloat((temp - refTemp).toFixed(1));
}

function computeStatus(idt: number): string {
  if (idt <= 27) return 'NIVEL_0';
  if (idt <= 32) return 'NIVEL_1';
  if (idt <= 41.1) return 'NIVEL_2';
  return 'NIVEL_3';
}

// 3. Credenciais padrão de fallback seguro
const DEFAULT_USERNAME = "elineldo.pinheiro@sesec.fortaleza.ce.gov.br";
const DEFAULT_PASSWORD = "Neudo.71";
const DEFAULT_API_KEY = "4pHePHZPCk4i8Ckz8qCsZ3YPDgQFeuf68IZelpRk";

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const username = process.env.PLUGFIELD_USERNAME || DEFAULT_USERNAME;
  const password = process.env.PLUGFIELD_PASSWORD || DEFAULT_PASSWORD;
  const apiKey = process.env.PLUGFIELD_API_KEY || DEFAULT_API_KEY;

  try {
    console.log("Connecting to Plugfield API...");
    // A. Autenticação
    const loginRes = await fetch("https://prod-api.plugfield.com.br/login", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    if (!loginRes.ok) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }

    const loginData = (await loginRes.json()) as { access_token: string };
    const accessToken = loginData.access_token;

    // B. Buscar estações
    const devicesRes = await fetch("https://prod-api.plugfield.com.br/device?limit=50&page_index=1", {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Authorization": accessToken,
        "Content-Type": "application/json"
      }
    });

    if (!devicesRes.ok) {
      throw new Error(`Fetch devices failed with status ${devicesRes.status}`);
    }

    const devicesData = (await devicesRes.json()) as { deviceList: any[] };
    const rawDevices = devicesData.deviceList || [];

    if (rawDevices.length === 0) {
      throw new Error("No devices returned from Plugfield API");
    }

    // C. Identificar a menor temperatura registrada (Referência Térmica Dinâmica)
    let minTemp = Infinity;
    let minTempId: number | null = null;

    for (const dev of rawDevices) {
      if (STATION_MAPPINGS[dev.id]) {
        const t = dev.dashboard?.temp ?? 28.0;
        if (t < minTemp) {
          minTemp = t;
          minTempId = dev.id;
        }
      }
    }

    if (minTemp === Infinity) {
      minTemp = 28.0;
      minTempId = 9169; // Messejana como fallback de segurança
    }

    // D. Mapear e Processar com Auditoria de Time of Measurement (GMT-3)
    const processedStations: StationData[] = [];
    let latestMeasurementISO = extrairTempoFortalezaGMT3().isoGMT3;

    for (const dev of rawDevices) {
      const mapping = STATION_MAPPINGS[dev.id];
      if (!mapping) {
        continue;
      }

      // Captura estrita do Time of Measurement intrínseco do payload da Plugfield
      const rawMeasurementTime = dev.dashboard?.time ?? dev.lastCommunication ?? dev.updatedAt;
      const auditoriaTemporal = auditarPacoteIoTPlugfield(dev.id.toString(), rawMeasurementTime);
      latestMeasurementISO = auditoriaTemporal.timestampFortalezaISO;
      const horaFortaleza = auditoriaTemporal.horaLocalFortaleza;

      let temp = dev.dashboard?.temp ?? 28.0;
      let humidity = dev.dashboard?.humi ?? 70;

      // Vento e Radiação do Plugfield (com modelagem biofísica e fotométrica)
      let windSpeed = dev.dashboard?.windSpeed ?? 
        (typeof dev.dashboard?.wind === 'number' ? parseFloat((dev.dashboard.wind / 3.6).toFixed(1)) : parseFloat((2.0 + Math.sin(dev.id) * 1.5).toFixed(1)));

      /**
       * MODELAGEM METEOROLÓGICA DA RADIAÇÃO SOLAR GLOBAL (W/m²):
       * Fallback astronômico operando estritamente em America/Fortaleza (GMT-3).
       */
      let solarRadiation = dev.dashboard?.radiation ?? 
        dev.dashboard?.solarRadiation ?? 
        (typeof dev.dashboard?.uv === 'number' ? parseFloat((dev.dashboard.uv * 100).toFixed(1)) : undefined) ??
        (typeof dev.dashboard?.radi === 'number' ? parseFloat((dev.dashboard.radi / 126.58).toFixed(1)) : undefined) ??
        (horaFortaleza >= 6 && horaFortaleza <= 17 
          ? Math.max(100, Math.min(1000, 800 * Math.sin(Math.PI * (horaFortaleza - 6) / 11)))
          : 0);
          
      // [Módulo de Integridade]: Validação de Dados (QC)
      let isSpurious = false;
      if (temp < 15 || temp > 50 || humidity < 10 || humidity > 100) {
        isSpurious = true;
        temp = STATION_BASELINES[dev.id] ?? 29.0;
        humidity = 70; 
      }

      const idt = computeIDT(temp, humidity, windSpeed, solarRadiation);
      const icu = computeICU(temp, minTemp);
      const baseline = STATION_BASELINES[dev.id] ?? 29.0;
      const avgAnomaly = parseFloat((temp - baseline).toFixed(2));
      const isRef = dev.id === minTempId;

      processedStations.push({
        id: dev.id.toString(),
        name: mapping.cleanName + (isRef ? ' (Ref. Térmica)' : ''),
        lat: parseFloat(dev.latitude) || -3.76,
        lng: parseFloat(dev.longitude) || -38.53,
        temp,
        humidity,
        windSpeed,
        solarRadiation: parseFloat(solarRadiation.toFixed(1)),
        idt,
        icu,
        avgAnomaly,
        status: isSpurious ? 'OFFLINE' : computeStatus(idt),
        primaryArea: mapping.primaryArea,
        secondaryAreas: mapping.secondaryAreas,
        isReference: isRef,
        measurementTimestamp: auditoriaTemporal.timestampFortalezaISO,
        deltaTSeconds: auditoriaTemporal.deltaTSegundos,
        qcTemporalFlag: auditoriaTemporal.flagTemporal
      });
    }

    // Ordenação dinâmica: maior temperatura real primeiro, seguida por sensação térmica (IDT)
    processedStations.sort((a, b) => {
      if (b.temp !== a.temp) return b.temp - a.temp;
      return b.idt - a.idt;
    });

    res.status(200).json({
      success: true,
      source: "live_api",
      timestamp: latestMeasurementISO,
      stations: processedStations
    });

  } catch (error: any) {
    console.error("Plugfield API integration error, serving simulated fallback:", error);
    const { isoGMT3: timestampFallbackGMT3, horaLocalFortaleza: hourFortaleza, epochMs } = extrairTempoFortalezaGMT3();
    
    // Fallback de Resiliência: Simulação Física com Referência Térmica Dinâmica em GMT-3
    const simulatedStations = Object.entries(STATION_MAPPINGS).map(([idStr, mapping]) => {
      const id = parseInt(idStr);
      const baseline = STATION_BASELINES[id] ?? 29.0;
      
      const hashVal = id % 10;
      const temp = parseFloat((baseline + (Math.sin(epochMs / 100000 + hashVal) * 1.5)).toFixed(1));
      const humidity = Math.max(30, Math.min(95, Math.round(65 + (Math.cos(epochMs / 100000 + hashVal) * 10))));
      const windSpeed = parseFloat((2.5 + Math.sin(epochMs / 50000 + hashVal) * 1.5).toFixed(1));
      const solarRadiation = hourFortaleza >= 6 && hourFortaleza <= 17 
          ? Math.max(100, Math.min(1000, 800 * Math.sin(Math.PI * (hourFortaleza - 6) / 11)))
          : 0;
      
      return {
        id: idStr,
        name: mapping.cleanName,
        lat: id === 9169 ? -3.82561 : (id === 8642 ? -3.72333 : (id === 8836 ? -3.77281 : -3.76 + (hashVal - 5) * 0.015)),
        lng: id === 9169 ? -38.48544 : (id === 8642 ? -38.53775 : (id === 8836 ? -38.55831 : -38.53 + (hashVal - 5) * 0.015)),
        temp,
        humidity,
        windSpeed,
        solarRadiation: parseFloat(solarRadiation.toFixed(1)),
        idt: computeIDT(temp, humidity, windSpeed, solarRadiation),
        icu: 0,
        avgAnomaly: parseFloat((temp - baseline).toFixed(2)),
        status: computeStatus(computeIDT(temp, humidity, windSpeed, solarRadiation)),
        primaryArea: mapping.primaryArea,
        secondaryAreas: mapping.secondaryAreas,
        isReference: false,
        measurementTimestamp: timestampFallbackGMT3,
        deltaTSeconds: null,
        qcTemporalFlag: '[FALLBACK_SIMULADO_GMT3]'
      };
    });

    // Achar menor temperatura simulada
    let minTempSim = Infinity;
    let minTempIdSim = "9169";
    simulatedStations.forEach(s => {
      if (s.temp < minTempSim) {
        minTempSim = s.temp;
        minTempIdSim = s.id;
      }
    });

    const finalSimulated = simulatedStations.map(s => {
      const idt = computeIDT(s.temp, s.humidity, s.windSpeed, s.solarRadiation);
      const isRef = s.id === minTempIdSim;
      return {
        ...s,
        name: s.name + (isRef ? ' (Ref. Térmica)' : ''),
        idt,
        icu: computeICU(s.temp, minTempSim),
        status: computeStatus(idt),
        isReference: isRef
      };
    });

    // Ordenação dinâmica para o fallback
    finalSimulated.sort((a, b) => {
      if (b.temp !== a.temp) return b.temp - a.temp;
      return b.idt - a.idt;
    });

    res.status(200).json({
      success: true,
      source: "simulated_fallback",
      error: error.message || "Unknown error",
      timestamp: timestampFallbackGMT3,
      stations: finalSimulated
    });
  }
}
