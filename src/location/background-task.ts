import * as TaskManager from 'expo-task-manager';
import { sendLocationBatch } from '@/src/services/location.api';

const HOP_LOCATION_TASK = 'HOP_LOCATION_TASK'; // debe coincidir con el usado en _layout y/o en tu configuración
TaskManager.defineTask(HOP_LOCATION_TASK, async ({ data, error }) => {
  try {
    if (error) return; // no lances, corta aquí

    const { locations } = (data as any) || {};
    if (!locations?.length) return;

    await sendLocationBatch(
      locations.map((l: any) => ({
        lat: l.coords.latitude,
        lon: l.coords.longitude,
        accuracy_m: l.coords.accuracy ?? undefined,
        speed_mps: l.coords.speed ?? undefined,
        heading_deg: l.coords.heading ?? undefined,
        ts_device: new Date(l.timestamp).toISOString(),
        source: 'bg',
      }))
    );
  } catch (e: any) {
    // 👇 NO permitas que el Task "falle": loguea y termina
    console.warn('[HOP_LOCATION_TASK] error:', e?.message || e);
  }
});
