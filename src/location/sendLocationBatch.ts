import { api } from '@/src/services/api';
import { getAuthTokenString } from '@/src/auth/getAuthToken';

type LocationPoint = { latitude: number; longitude: number; timestamp?: number };
type BatchPayload = { locations: LocationPoint[] };

export async function sendLocationBatch(batch: BatchPayload) {
  const token = await getAuthTokenString();
  if (!token) {
    console.warn('[sendLocationBatch] ⚠ sin token → no envío');
    return;
  }
  try {
    await api.post('/locations/batch', batch);
  } catch (e: any) {
    const status = e?.response?.status;
    if (status === 401) {
      console.warn('[sendLocationBatch] 401: token inválido/ausente (pauso envíos)');
      // Si esto viene del background, no hagas logout global aquí.
    }
    throw e;
  }
}
