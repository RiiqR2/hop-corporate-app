// src/hooks/location/use-location.hook.ts
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { RelativePathString, useRouter } from 'expo-router';

type UseRequestLocationPermissionProps = {
  url: RelativePathString | any;
  step: number;
};

export const useRequestLocationPermission = ({ url, step }: UseRequestLocationPermissionProps) => {
  const router = useRouter();

  const requestLocationPermission = async () => {
    try {
      // 1) Leer estado actual — no pedimos nada si ya está concedido
      const fg = await Location.getForegroundPermissionsAsync();
      const bg = await Location.getBackgroundPermissionsAsync();

      // Si ya tenemos foreground o background, no re-solicitamos (evita “downgrade” accidental)
      if (fg.status === 'granted' || bg.status === 'granted') {
        router.push({ pathname: url, params: { step } });
        return;
      }

      // 2) Pedir SOLO foreground para este flujo (abrir mapa y elegir punto)
      const req = await Location.requestForegroundPermissionsAsync();
      if (req.status !== 'granted') {
        Alert.alert('Permiso requerido', 'Activa el permiso de ubicación para continuar.');
        // Igual permitimos que abra el mapa para buscar manualmente
        router.push({ pathname: url, params: { step } });
        return;
      }

      // 3) (Opcional) Verificar si los servicios están encendidos; navegamos igual
      const servicesOn = await Location.hasServicesEnabledAsync();
      if (!servicesOn) {
        Alert.alert('Ubicación desactivada', 'Activa los servicios de ubicación del dispositivo para mejorar la precisión.');
      }

      // 4) Navegar al mapa (sin leer posición aquí)
      router.push({ pathname: url, params: { step } });
    } catch {
      Alert.alert('Error', 'Ocurrió un error al solicitar permisos de ubicación.');
      router.push({ pathname: url, params: { step } });
    }
  };

  return { requestLocationPermission };
};
