// src/services/location.api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// —————————————————————————————————————————————
// Helpers de token
// —————————————————————————————————————————————
const stripBearer = (t?: string | null): string | null => {
  if (!t) return null;
  let s = String(t).trim();
  // quita comillas sobrantes si llegaron como '"...'
  s = s.replace(/^"+|"+$/g, '');
  // si viene con "Bearer " al inicio, lo removemos (lo agregamos nosotros luego)
  if (s.toLowerCase().startsWith('bearer ')) s = s.slice(7).trim();
  return s || null;
};

// Si viene un JSON string tipo {"token":"...","refreshToken":"..."} extrae .token
const extractBearerFromJsonString = (maybeJson?: string | null): string | null => {
  if (!maybeJson) return null;
  const s = String(maybeJson).trim();
  if (!s.startsWith('{')) return stripBearer(s);
  try {
    const parsed = JSON.parse(s);
    return stripBearer(parsed?.token ?? null);
  } catch {
    return stripBearer(s);
  }
};

// —————————————————————————————————————————————
// Tipos
// —————————————————————————————————————————————
export type LocationPoint = {
  lat: number;
  lon: number;
  accuracy_m?: number;
  speed_mps?: number;
  heading_deg?: number;
  ts_device: string;
  source?: 'fg' | 'bg' | 'fg-kick'; // 👈 agrega 'fg-kick'
};

const PENDING_KEY = 'pending_location_batches';

// —————————————————————————————————————————————
// URL (EXPO_PUBLIC_ tiene prioridad)
// —————————————————————————————————————————————
const API_URL: string | undefined =
  (process.env as any)?.EXPO_PUBLIC_API_URL ||
  (Constants?.expoConfig?.extra as any)?.EXPO_PUBLIC_API_URL ||
  (Constants?.expoConfig?.extra as any)?.EXPO_API_URL ||
  undefined;

// Log de diagnóstico una sola vez
let _loggedApiUrl = false;
const logApiUrlOnce = () => {
  if (!_loggedApiUrl) {
    console.log('[location.api] API_URL =', API_URL);
    _loggedApiUrl = true;
  }
};

// —————————————————————————————————————————————
// Token store (sin hooks)
// —————————————————————————————————————————————
let _authToken: string | null = null;

/** Establece el bearer en memoria y lo guarda como {"token": "<bearer>"} en AsyncStorage */
export function setAuthToken(token: string | null): void {
  // tolera que te pasen un JSON string; extrae .token
  const clean = extractBearerFromJsonString(token);
  _authToken = clean;
  if (clean) {
    // normaliza almacenamiento como JSON { token }
    AsyncStorage.setItem('auth_token', JSON.stringify({ token: clean })).catch(() => {});
  } else {
    AsyncStorage.removeItem('auth_token').catch(() => {});
  }
}

/** Devuelve el bearer string desde memoria o AsyncStorage (acepta JSON o string plano) */
export async function getAuthToken(): Promise<string | null> {
  if (_authToken) return _authToken;
  try {
    const stored = await AsyncStorage.getItem('auth_token');
    if (!stored) return null;
    // Puede ser JSON o string plano
    try {
      const parsed = JSON.parse(stored);
      return stripBearer((parsed?.token as string) ?? stored);
    } catch {
      return stripBearer(stored);
    }
  } catch {
    return null;
  }
}

// —————————————————————————————————————————————
// Cola de envíos pendientes
// —————————————————————————————————————————————
async function readQueue(): Promise<Array<{ points: LocationPoint[] }>> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as Array<{ points: LocationPoint[] }>) : [];
  } catch {
    return [];
  }
}

async function writeQueue(q: Array<{ points: LocationPoint[] }>): Promise<void> {
  try {
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(q));
  } catch {
    // ignore
  }
}

async function enqueueBatch(payload: { points: LocationPoint[] }) {
  const q = await readQueue();
  if (q.length > 100) q.shift(); // evita crecimiento infinito
  q.push(payload);
  await writeQueue(q);
}

// —————————————————————————————————————————————
// Ping de diagnóstico
// —————————————————————————————————————————————
export const pingLocationApi = async () => {
  logApiUrlOnce();
  if (!API_URL) return false;
  try {
    const res = await fetch(`${API_URL}/location/ping`);
    return res.ok;
  } catch {
    return false;
  }
};

// —————————————————————————————————————————————
// Flush de la cola
// —————————————————————————————————————————————
export async function flushPendingBatches(): Promise<void> {
  logApiUrlOnce();
  if (!API_URL) {
    console.warn('[location.api] API_URL no configurada, no se puede hacer flush');
    return;
  }
  let q = await readQueue();
  if (!q.length) return;

  const token = await getAuthToken();
  const url = `${API_URL}/location/batch`;

  const max = Math.min(q.length, 20);
  for (let i = 0; i < max; i++) {
    const payload = q[0];
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        console.warn('[flushPendingBatches] status', res.status, txt);
        if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
        // 4xx → no reintentamos; sacamos el batch para no quedar en loop
      }

      // éxito o 4xx → sacamos de la cola
      q.shift();
      await writeQueue(q);
    } catch {
      // error de red/5xx → detenemos el flush; quedará para la próxima
      break;
    }
  }
}

// —————————————————————————————————————————————
// Envío principal
// —————————————————————————————————————————————
export async function sendLocationBatch(
  pointsIn: LocationPoint[],
  tokenOverride?: string
): Promise<void> {
  logApiUrlOnce();

  // Filtra mediciones inválidas/imprecisas
  const points = pointsIn.filter(
    (p) =>
      Number.isFinite(p.lat) &&
      Number.isFinite(p.lon) &&
      p.lat >= -90 &&
      p.lat <= 90 &&
      p.lon >= -180 &&
      p.lon <= 180 &&
      (p.accuracy_m == null || p.accuracy_m <= 1000)
  );
  if (!points.length) return;

  if (!API_URL) {
    console.warn('[location.api] API_URL no configurada, encolando batch');
    await enqueueBatch({ points });
    return;
  }

  // tokenOverride puede venir como JSON string → extrae .token
  const candidate = tokenOverride ?? (await getAuthToken());
  const token = extractBearerFromJsonString(candidate);
  const url = `${API_URL}/location/batch`;

  const doRequest = async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ points }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.warn('[sendLocationBatch] status', res.status, txt);
      if (!token) console.warn('[sendLocationBatch] ⚠ sin token (probable 401)');
      if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
      // 4xx -> no throws: dejamos continuar a encolado/flush para no hacer retry infinito
    }
  };

  try {
    await doRequest();
    await flushPendingBatches(); // intenta vaciar lo pendiente tras éxito o 4xx
  } catch {
    // backoff simple y reintento único
    await new Promise((r) => setTimeout(r, 1000));
    try {
      await doRequest();
      await flushPendingBatches();
    } catch {
      await enqueueBatch({ points });
    }
  }
}
