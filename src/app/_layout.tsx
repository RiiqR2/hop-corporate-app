import '@/global.css';
import 'react-native-reanimated';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useFonts } from 'expo-font';
import { getLocales } from 'expo-localization';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
//import * as Sentry from 'sentry-expo';
import { SWRConfig } from 'swr';
import { Stack, useRouter, usePathname } from 'expo-router';
//import { EXPO_SENTRY_URL_DEV } from '@/config';
import { GluestackUIProvider } from '@/src/components/ui/gluestack-ui-provider';
import { AuthProvider } from '@/src/context/auth.context';
import { DrawerProvider } from '@/src/context/drawer.context';
import { AuthRoutesLink } from '@/src/utils/enum/auth.routes';
import { userRoles } from '@/src/utils/enum/role.enum';
import { useMe } from '../hooks';
import { initializeI18next } from '../utils/i18n/i18next';
import { Platform } from 'react-native';

//ubicación
import * as Location from 'expo-location';
// Este import define el task en background (NO lo borres)
import '@/src/location/background-task';

SplashScreen.preventAutoHideAsync();

// Sentry.init({
//   dsn: EXPO_SENTRY_URL_DEV,
//   enableInExpoDevelopment: true,
//   debug: __DEV__,
// });

// Debe coincidir con el nombre usado en src/location/background-task.ts
const LOCATION_TASK = 'HOP_LOCATION_TASK';

/** Arranca/para el tracking según sesión + permisos */
function LocationGate({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [permsGranted, setPermsGranted] = useState<boolean>(false);

  // Pide/valida permisos sólo con sesión iniciada
  useEffect(() => {
    if (!isAuthenticated) {
      setPermsGranted(false);
      return;
    }

    let cancelled = false;
    (async () => {
      // foreground
      const fg = await Location.getForegroundPermissionsAsync();
      let ok = fg.status === 'granted';
      if (!ok) {
        const r = await Location.requestForegroundPermissionsAsync();
        ok = r.status === 'granted';
      }

      // background (Android)
      if (ok) {
        const bg = await Location.getBackgroundPermissionsAsync();
        if (bg.status !== 'granted') {
          const r = await Location.requestBackgroundPermissionsAsync();
          ok = r.status === 'granted';
        }
      }

      if (!cancelled) setPermsGranted(ok);
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Start/stop del servicio según sesión + permisos
  useEffect(() => {
    (async () => {
      const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);

      if (isAuthenticated && permsGranted) {
        if (!started) {
          await Location.startLocationUpdatesAsync(LOCATION_TASK, {
            accuracy: Location.Accuracy.High,
            distanceInterval: 25,   // ajusta a tu caso
            timeInterval: 15000,    // ms
            pausesUpdatesAutomatically: false,
            showsBackgroundLocationIndicator: true,
            activityType: Location.ActivityType.AutomotiveNavigation,
            // Requisito Android para background
            foregroundService: Platform.OS === 'android'
              ? {
                  notificationTitle: 'Hop en línea',
                  notificationBody: 'Compartiendo tu ubicación para asignaciones',
                }
              : undefined,
          });
          console.log('[bg] started with iOS-safe options');
        }
      } else {
        if (started) await Location.stopLocationUpdatesAsync(LOCATION_TASK);
      }
    })();
  }, [isAuthenticated, permsGranted]);

  return null;
}

export default function RootLayout() {
  const pathname = usePathname();
  const [token, setToken] = useState<{ token: string; refreshToken?: string } | null>({
    token: '',
    refreshToken: '',
  });
  const { user, isLoading } = useMe();

  const [loaded] = useFonts({
    'Outfit-Black': require('../../assets/fonts/Outfit-Black.ttf'),
    'Outfit-Bold': require('../../assets/fonts/Outfit-Bold.ttf'),
    'Outfit-ExtraBold': require('../../assets/fonts/Outfit-ExtraBold.ttf'),
    'Outfit-ExtraLight': require('../../assets/fonts/Outfit-ExtraLight.ttf'),
    'Outfit-Light': require('../../assets/fonts/Outfit-Light.ttf'),
    'Outfit-Medium': require('../../assets/fonts/Outfit-Medium.ttf'),
    'Outfit-Regular': require('../../assets/fonts/Outfit-Regular.ttf'),
    'Outfit-Thin': require('../../assets/fonts/Outfit-Thin.ttf'),
    'Outfit-SemiBold': require('../../assets/fonts/Outfit-SemiBold.ttf'),
  });

  const [hasRedirected, setHasRedirected] = useState(false);
  const router = useRouter();

  const onboardingStep = user?.role === userRoles.USER_HOPPER ? 5 : 4;
  const publicRoutes = ['/', '/sign-up', '/sign-in', '/recovery-password', '/new-password', '/map', '/onboarding', '/finish-onboarding', '/validation', '/finish-recover-password'];

  // === Auth gate + Splash ===
  useEffect(() => {
    const checkAuth = async () => {
      const stored = await AsyncStorage.getItem('auth_token');

      if (!stored && !publicRoutes.includes(pathname as AuthRoutesLink)) {
        if (!hasRedirected) {
          setHasRedirected(true);
          router.replace(AuthRoutesLink.SIGN_IN);
        }
        await SplashScreen.hideAsync();
        return;
      }

      if (user) {
        if (!hasRedirected) {
          setHasRedirected(true);
          if (user.isVerified && user.status === "ACTIVE") {
            router.replace('/(tabs)/');
          } else if (!user.isVerified && user.status != "ACTIVE") {
            router.replace({
              pathname: AuthRoutesLink.SIGN_UP,
              params: { step: onboardingStep, user_type: user.role },
            });
          } else if (user.status != "ACTIVE") {
            router.replace(AuthRoutesLink.WAITING_VALIDATION);
          }
        }
        await SplashScreen.hideAsync();
        return;
      }

      await SplashScreen.hideAsync();
    };

    if (loaded && !isLoading) {
      checkAuth();
    }
  }, [loaded, isLoading, user, hasRedirected, router, pathname, onboardingStep]);

  // === i18n + token restore ===
  useEffect(() => {
    const language = getLocales()[0].languageCode;

    const setupI18n = async () => {
      await initializeI18next(language ?? 'es');
    };

    const loadToken = async () => {
      try {
        const saved = await AsyncStorage.getItem('auth_token');
        if (!saved) { setToken(null); return; }

        let parsed: { token: string; refreshToken?: string } | null = null;
        try {
          const obj = JSON.parse(saved);
          if (obj && typeof obj === 'object' && typeof obj.token === 'string') {
            parsed = { token: obj.token, refreshToken: obj.refreshToken };
          } else {
            parsed = { token: String(saved) };
          }
        } catch {
          parsed = { token: saved };
        }

        setToken(parsed);
      } catch (e) {
        console.warn('[auth] loadToken error:', (e as Error)?.message);
        setToken(null);
      }
    };

    loadToken();
    setupI18n();
  }, []);

  // Fallback: si en 3s no se ocultó el splash, ocúltalo igual
  useEffect(() => {
    const t = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  // === autenticación “verdadera” para el LocationGate ===
  const isAuthenticated = useMemo(
    () => Boolean(token?.token),
    [token]
  );

  if (!loaded) return null;

  return (
    <AuthProvider>
      {/* Gate de ubicación: solo inicia si hay sesión */}
      <LocationGate isAuthenticated={isAuthenticated} />

      <SWRConfig
        value={{
          provider: () => new Map(),
          isVisible: () => true,
          initFocus(callback) {
            let appState = AppState.currentState;
            const onAppStateChange = (nextAppState: AppStateStatus) => {
              if (appState.match(/inactive|background/) && nextAppState === 'active') {
                callback();
              }
              appState = nextAppState;
            };
            const sub = AppState.addEventListener('change', onAppStateChange);
            return () => sub.remove();
          },
          initReconnect(callback) {
            const unsubscribe = NetInfo.addEventListener((state) => {
              if (state.isConnected && state.isInternetReachable) callback();
            });
            return () => unsubscribe();
          },
        }}
      >
        <GestureHandlerRootView>
          <GluestackUIProvider mode="light">
            <DrawerProvider>
              <Stack screenOptions={{ headerShown: false }}>
                {Boolean(token?.token)
                  ? <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  : <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                }
                <Stack.Screen name="+not-found" />
                <Stack.Screen name="error" />
              </Stack>
              <StatusBar style="auto" />
            </DrawerProvider>
          </GluestackUIProvider>
        </GestureHandlerRootView>
      </SWRConfig>
    </AuthProvider>
  );
}
