import { useEffect } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { getAuthToken, sendLocationBatch } from '@/src/services/location.api';

/* eslint-disable no-console */
export default function useBackgroundLocation(enabled: boolean) {
  const HOP_LOCATION_TASK = 'HOP_LOCATION_TASK'; // debe coincidir con el usado en _layout y/o en tu configuración
  // STOP cuando se apaga
  useEffect(() => {
    if (enabled) return;

    let cancelled = false;
    (async () => {
      try {
        const started = await Location.hasStartedLocationUpdatesAsync(HOP_LOCATION_TASK);
        if (!cancelled && started) {
          await Location.stopLocationUpdatesAsync(HOP_LOCATION_TASK);
          console.log('[bg] stopped');
        }
      } catch (e) {
        console.warn('[bg] stop error:', (e as Error)?.message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  // START solo cuando enabled=true y permisos YA concedidos
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    (async () => {
      try {
        // Verifica permisos sin pedirlos
        const fg = await Location.getForegroundPermissionsAsync();
        const bg = await Location.getBackgroundPermissionsAsync();
        if (fg.status !== 'granted' || bg.status !== 'granted') {
          console.warn('[bg] missing permission(s), not starting');
          return;
        }

        const already = await Location.hasStartedLocationUpdatesAsync(HOP_LOCATION_TASK);
        if (!already) {
          await Location.startLocationUpdatesAsync(HOP_LOCATION_TASK, {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 10000,
            distanceInterval: 10,
            deferredUpdatesInterval: 5000,
            pausesUpdatesAutomatically: false,
            activityType: Location.ActivityType.AutomotiveNavigation,
            showsBackgroundLocationIndicator: true, // iOS
            foregroundService: Platform.OS === 'android'
              ? {
                  notificationTitle: 'Hop en línea',
                  notificationBody: 'Compartiendo tu ubicación para asignaciones',
                }
              : undefined,
          });
          console.log('[bg] started');
        }

        // Kick inmediato si hay token
        const tok = await getAuthToken();
        if (tok) {
          try {
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            if (cancelled) return;
            await sendLocationBatch([{
              lat: loc.coords.latitude,
              lon: loc.coords.longitude,
              accuracy_m: loc.coords.accuracy ?? undefined,
              speed_mps: loc.coords.speed ?? undefined,
              heading_deg: loc.coords.heading ?? undefined,
              ts_device: new Date(loc.timestamp).toISOString(),
              source: 'fg',
            }], tok);
            console.log('[bg] kick sent');
          } catch (e) {
            console.warn('[bg] kick failed:', (e as Error)?.message);
          }
        }
      } catch (e) {
        console.warn('[bg] error:', (e as Error)?.message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);
}
