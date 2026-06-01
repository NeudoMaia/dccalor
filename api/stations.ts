interface StationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  temp: number;
  humidity: number;
  idt: number;
  icu: number;
  avgAnomaly: number;
  status: string;
  primaryArea: string;
  secondaryAreas: string[];
  isIoT?: boolean;
  isReference?: boolean;
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
function computeIDT(temp: number, humidity: number): number {
  const idt = temp - (0.55 - 0.0055 * humidity) * (temp - 14.5);
  return parseFloat(idt.toFixed(1));
}

function computeICU(temp: number, refTemp: number): number {
  return parseFloat((temp - refTemp).toFixed(1));
}

function computeStatus(temp: number): string {
  if (temp < 24) return 'COMFORTABLE';
  if (temp < 28) return 'YELLOW_ALERT';
  if (temp < 30) return 'ORANGE_ALERT';
  return 'RED_ALERT';
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

    // D. Mapear e Processar
    const processedStations: StationData[] = [];

    for (const dev of rawDevices) {
      const mapping = STATION_MAPPINGS[dev.id];
      if (!mapping) {
        continue;
      }

      const temp = dev.dashboard?.temp ?? 28.0;
      const humidity = dev.dashboard?.humi ?? 70;
      const idt = computeIDT(temp, humidity);
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
        idt,
        icu,
        avgAnomaly,
        status: computeStatus(temp),
        primaryArea: mapping.primaryArea,
        secondaryAreas: mapping.secondaryAreas,
        isReference: isRef
      });
    }

    // Ordenação estável dos 3 primeiros cards de topo (Messejana, Centro, Montese) para consistência visual do Dashboard
    processedStations.sort((a, b) => {
      const order = { '9169': 1, '8642': 2, '8836': 3 } as Record<string, number>;
      const oA = order[a.id] ?? 99;
      const oB = order[b.id] ?? 99;
      if (oA !== oB) return oA - oB;
      return b.temp - a.temp; // Resto ordena por temperatura decrescente
    });

    res.status(200).json({
      success: true,
      source: "live_api",
      timestamp: new Date().toISOString(),
      stations: processedStations
    });

  } catch (error: any) {
    console.error("Plugfield API integration error, serving simulated fallback:", error);
    
    // Fallback de Resiliência: Simulação Física com Referência Térmica Dinâmica
    const simulatedStations = Object.entries(STATION_MAPPINGS).map(([idStr, mapping]) => {
      const id = parseInt(idStr);
      const baseline = STATION_BASELINES[id] ?? 29.0;
      
      const hashVal = id % 10;
      const temp = parseFloat((baseline + (Math.sin(Date.now() / 100000 + hashVal) * 1.5)).toFixed(1));
      const humidity = Math.max(30, Math.min(95, Math.round(65 + (Math.cos(Date.now() / 100000 + hashVal) * 10))));
      
      return {
        id: idStr,
        name: mapping.cleanName,
        lat: id === 9169 ? -3.82561 : (id === 8642 ? -3.72333 : (id === 8836 ? -3.77281 : -3.76 + (hashVal - 5) * 0.015)),
        lng: id === 9169 ? -38.48544 : (id === 8642 ? -38.53775 : (id === 8836 ? -38.55831 : -38.53 + (hashVal - 5) * 0.015)),
        temp,
        humidity,
        idt: computeIDT(temp, humidity),
        icu: 0,
        avgAnomaly: parseFloat((temp - baseline).toFixed(2)),
        status: "COMFORTABLE",
        primaryArea: mapping.primaryArea,
        secondaryAreas: mapping.secondaryAreas,
        isReference: false
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
      const idt = computeIDT(s.temp, s.humidity);
      const isRef = s.id === minTempIdSim;
      return {
        ...s,
        name: s.name + (isRef ? ' (Ref. Térmica)' : ''),
        idt,
        icu: computeICU(s.temp, minTempSim),
        status: computeStatus(s.temp),
        isReference: isRef
      };
    });

    finalSimulated.sort((a, b) => {
      const order = { '9169': 1, '8642': 2, '8836': 3 } as Record<string, number>;
      const oA = order[a.id] ?? 99;
      const oB = order[b.id] ?? 99;
      if (oA !== oB) return oA - oB;
      return b.temp - a.temp;
    });

    res.status(200).json({
      success: true,
      source: "simulated_fallback",
      error: error.message || "Unknown error",
      timestamp: new Date().toISOString(),
      stations: finalSimulated
    });
  }
}
