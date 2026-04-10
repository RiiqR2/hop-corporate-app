import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import axiosInstance from '@/src/axios/axios.config';

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

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const clearLocation = () => {
    setState({
      user_info: { address: '', latitude: 0, longitude: 0 },
      hotel_info: { address: '', latitude: 0, longitude: 0 },
    });
    setLocation(null);
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
      setUserRole(null);
      setLocation(null);
      setState({
        user_info: { address: '', latitude: 0, longitude: 0 },
        hotel_info: { address: '', latitude: 0, longitude: 0 },
      });
    } catch (error) {
      console.error('Error al limpiar datos:', error);
    }
  };

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

  const handleSetToken = async (newToken: string) => {
    await AsyncStorage.setItem('auth_token', JSON.stringify({ token: newToken }));
    setToken(newToken);

    try {
      const me = await axiosInstance.get('/user/logged').then((r) => r.data);
      setUserRole(me?.role ?? null);
    } catch {
      await handleClearToken();
    }
  };

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          if (isMounted) setLocation(null);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        if (isMounted) {
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      } catch (error) {
        console.error('Error obteniendo ubicación actual:', error);
        if (isMounted) setLocation(null);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [token]);

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