// src/hooks/location/use-location.hook.ts

import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { RelativePathString, useRouter } from 'expo-router';

type UseRequestLocationPermissionProps = {
  url: RelativePathString | any;
  step: number;
};

export const useRequestLocationPermission = ({
  url,
  step,
}: UseRequestLocationPermissionProps) => {
  const router = useRouter();

  const requestLocationPermission = async () => {
    try {
      // Leer estado actual
      const fg = await Location.getForegroundPermissionsAsync();

      // Si ya está concedido, continuar
      if (fg.status === 'granted') {
        router.push({ pathname: url, params: { step } });
        return;
      }

      // Pedir SOLO foreground
      const req = await Location.requestForegroundPermissionsAsync();

      if (req.status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Activa el permiso de ubicación para continuar.'
        );

        // Permitimos continuar manualmente
        router.push({ pathname: url, params: { step } });
        return;
      }

      // Verificar servicios de ubicación
      const servicesOn =
        await Location.hasServicesEnabledAsync();

      if (!servicesOn) {
        Alert.alert(
          'Ubicación desactivada',
          'Activa los servicios de ubicación del dispositivo para mejorar la precisión.'
        );
      }

      router.push({ pathname: url, params: { step } });
    } catch {
      Alert.alert(
        'Error',
        'Ocurrió un error al solicitar permisos de ubicación.'
      );

      router.push({ pathname: url, params: { step } });
    }
  };

  return { requestLocationPermission };
};