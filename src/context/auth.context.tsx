import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AppState, AppStateStatus, Alert } from 'react-native';
import axiosInstance from '@/src/axios/axios.config';
import { userRoles } from '@/src/utils/enum/role.enum';

import useBackgroundLocation from '@/src/location/useBackgroundLocation';
import {
  setAuthToken,
  flushPendingBatches,
  sendLocationBatch,
} from '@/src/services/location.api';
import { getMyPresence, setMyPresence } from '@/src/services/presence.api';

// === Tipos ===
type Address = {
  address: string;
  latitude: number;
  longitude: number;
};

type PayloadState = {
  user_info: Address;
  hotel_info: Address;
};

interface AuthContextType {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
  state: PayloadState;
  updatePayload: (newData: Partial<PayloadState>) => void;
  clearLocation: () => void;
  location: { latitude: number; longitude: number } | null;
  isOnline: boolean;
  setIsOnline: React.Dispatch<React.SetStateAction<boolean>>; // legacy
  setOnline: (next: boolean) => Promise<void>;                // usar en UI
  userRole: string | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [state, setState] = useState<PayloadState>({
    user_info: { address: '', latitude: 0, longitude: 0 },
    hotel_info: { address: '', latitude: 0, longitude: 0 },
  });

  const [isOnline, setIsOnline] = useState(false);

  // BG solo si es HOPPER y Online
  useBackgroundLocation(isOnline && userRole === userRoles.USER_HOPPER);

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const clearLocation = () => {
    setState({
      user_info: { address: '', latitude: 0, longitude: 0 },
      hotel_info: { address: '', latitude: 0, longitude: 0 },
    });
  };

  const updatePayload = (newData: Partial<PayloadState>) => {
    setState((prevState) => ({
      ...prevState,
      ...newData,
    }));
  };

  const handleClearToken = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      setToken(null);
      setAuthToken(null);
      setUserRole(null);
      setIsOnline(false);
      setState({
        user_info: { address: '', latitude: 0, longitude: 0 },
        hotel_info: { address: '', latitude: 0, longitude: 0 },
      });
      // no llamamos presence aquí; sesión inválida
    } catch (error) {
      console.error('Error al limpiar datos:', error);
    }
  };

  // Carga inicial del token y rol
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('auth_token');
        if (!saved) return;

        let bearer: string | null = null;
        try {
          const parsed = JSON.parse(saved);
          bearer = parsed?.token ?? null;
        } catch {
          bearer = saved;
        }
        if (!bearer) {
          await handleClearToken();
          return;
        }

        setAuthToken(bearer);

        try {
          const me = await axiosInstance.get('/user/logged').then((r) => r.data);
          setToken(bearer);
          setUserRole(me?.role ?? null);
        } catch {
          await handleClearToken();
        }
      } catch {
        await handleClearToken();
      }
    })();
  }, []);

  // Mantener el token en el cliente de ubicaciones
  useEffect(() => {
    setAuthToken(token ?? null);
  }, [token]);

  // Intentar vaciar cola de ubicaciones pendientes al iniciar
  useEffect(() => {
    flushPendingBatches().catch(() => {});
  }, []);

  const handleSetToken = async (newToken: string) => {
    await AsyncStorage.setItem('auth_token', JSON.stringify({ token: newToken }));
    setToken(newToken);
    setAuthToken(newToken);

    try {
      const me = await axiosInstance.get('/user/logged').then((r) => r.data);
      setUserRole(me?.role ?? null);
    } catch {
      await handleClearToken();
    }
  };

  // Estado inicial de online: SIEMPRE false tras login, y sincroniza backend
  useEffect(() => {
    (async () => {
      if (!token || !userRole) return;
      // Solo HOPPER maneja online
      if (userRole !== userRoles.USER_HOPPER) {
        setIsOnline(false);
        return;
      }
      const presence = await getMyPresence();
      setIsOnline(presence?.online?? false);
    })();
  }, [token, userRole]);

  // Watcher en foreground solo para HOPPER activo
  useEffect(() => {
    if (userRole !== userRoles.USER_HOPPER || !token || !isOnline) return;

    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;
        setLocation({ latitude, longitude });

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000,
            distanceInterval: 10,
          },
          async (loc) => {
            try {
              await sendLocationBatch(
                [
                  {
                    lat: loc.coords.latitude,
                    lon: loc.coords.longitude,
                    accuracy_m: loc.coords.accuracy ?? undefined,
                    speed_mps: loc.coords.speed ?? undefined,
                    heading_deg: loc.coords.heading ?? undefined,
                    ts_device: new Date(loc.timestamp).toISOString(),
                    source: 'fg',
                  },
                ],
                token ?? undefined
              );
            } catch {
              // silencio
            }
          }
        );
      } else {
        console.warn('Permiso de ubicación denegado');
        setLocation(null);
        clearLocation();
      }
    })();

    return () => {
      subscription?.remove();
    };
  }, [isOnline, userRole, token]);

  // Apagar si el permiso BG se revoca (al volver a la app)
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (s: AppStateStatus) => {
      if (s !== 'active') return;
      if (!isOnline || userRole !== userRoles.USER_HOPPER) return;
      const bg = await Location.getBackgroundPermissionsAsync();
      if (bg.status !== 'granted') {
        setIsOnline(false);
        try { await setMyPresence(false); } catch {}
        Alert.alert('Ubicación en 2º plano desactivada', 'Se apagó tu estado Activo.');
      }
    });
    return () => sub.remove();
  }, [isOnline, userRole]);

  // API para la UI: encender/apagar y persistir
  const setOnline = async (next: boolean) => {
    if (userRole !== userRoles.USER_HOPPER) {
      setIsOnline(false);
      return;
    }
    const prev = isOnline;
    setIsOnline(next); // optimista
    try {
      await setMyPresence(next);
    } catch (error) {
      console.log(error)
      setIsOnline(prev);
      Alert.alert('No se pudo actualizar tu estado', 'Intenta nuevamente.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken: handleSetToken,
        clearToken: handleClearToken,
        state,
        updatePayload,
        location,
        clearLocation,
        isOnline,
        setIsOnline, // legacy
        setOnline,   // usar en la UI
        userRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
