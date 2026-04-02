// src/app/settings/index.tsx
import { StyleSheet, Alert, Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { router, useNavigation } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native'; // ⬅️ agregado
import { Container, Header, Switch } from '@/src/components';
import { Text } from '@/src/components/text/text.component';
import { Box } from '@/src/components/ui/box';
import { HStack } from '@/src/components/ui/hstack';
import { useMe } from '@/src/hooks';
import { updateUserOne } from '@/src/services/auth.service';
import { Colors } from '@/src/utils/constants/Colors';
import { useAuth } from '@/src/context/auth.context';
import { userRoles } from '@/src/utils/enum/role.enum';
import BackgroundLocationDisclosure from '@/src/components/settings/BackgroundLocationDisclosure';

// ⬅️ servicio para leer/guardar estado de ubicación en /user/me
import { getMyPresence, setMyPresence } from '@/src/services/presence.api';

export default function Settings() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useMe();

  // ===== Notificaciones (SIN CAMBIOS) =====
  const [notifEnabled, setNotifEnabled] = useState(!!user?.userNotificationToken);

  const handleNotificationSwitch = async () => {
    try {
      if (notifEnabled) {
        await updateUserOne(user?.id!, { email: user?.email, userNotificationToken: null });
        setNotifEnabled(false);
      } else {
        const { status } = await Notifications.getPermissionsAsync();
        let finalStatus = status;
        if (status !== 'granted') {
          finalStatus = (await Notifications.requestPermissionsAsync()).status;
        }
        if (finalStatus !== 'granted') {
          Alert.alert('Permiso denegado para notificaciones');
          return;
        }
        const tokenData = await Notifications.getExpoPushTokenAsync();
        await updateUserOne(user?.id!, { email: user?.email, userNotificationToken: tokenData.data });
        setNotifEnabled(true);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al alternar notificaciones:', error);
    }
  };
  // ========================================

  // BG location (AuthContext)
  const { userRole, isOnline, setOnline, setIsOnline } = useAuth();
  const isHopper = userRole === userRoles.USER_HOPPER;

  // Modal divulgación
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [requesting, setRequesting] = useState(false);

  // Header
  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <Header
          title={t('settings.title', { ns: 'utils' })}
          arrow
          onPressArrow={() => router.back()}
        />
      ),
    });
  }, [navigation, t]);

  // === Sincroniza estado de ubicación desde API al enfocar Ajustes ===
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        try {
          if (!isHopper) {
            setIsOnline(false);
            return;
          }

          const presence = await getMyPresence(); // GET /user/me → { online }
          if (!alive || !presence) return;

          if (!presence.online) {
            // backend OFF → apaga local
            setIsOnline(false);
            return;
          }

          // backend ON → verifica permisos locales
          const [fg, bg] = await Promise.all([
            Location.getForegroundPermissionsAsync(),
            Location.getBackgroundPermissionsAsync(),
          ]);
          const ok = fg.status === 'granted' && bg.status === 'granted';

          if (ok) {
            setIsOnline(true);
          } else {
            // falta permiso → apaga local y sincroniza backend a OFF
            setIsOnline(false);
            try { await setMyPresence(false); } catch {}
          }
        } catch {
          // si falla /user/me, no alteramos estado local
        }
      })();

      return () => { alive = false; };
    }, [isHopper, setIsOnline])
  );

  // Handler del switch "Activo"
  const handleLocationSwitch = () => {
    if (!isHopper) return;
    const next = !isOnline;

    if (!next) {
      // Apagar directamente y persistir (AuthContext ya hace PATCH /user/me)
      void setOnline(false);
      return;
    }

    // Encender → mostrar divulgación y luego pedir permisos
    setShowDisclosure(true);
  };

  // Flujo de permisos cuando el usuario pulsa "Continuar" en el modal
  const onContinueDisclosure = useCallback(async () => {
    if (requesting) return;
    setRequesting(true);
    try {
      // 1) Foreground primero
      let fg = await Location.getForegroundPermissionsAsync();
      if (fg.status !== 'granted') {
        fg = await Location.requestForegroundPermissionsAsync();
        if (fg.status !== 'granted') {
          Alert.alert('Permiso requerido', 'Activa la ubicación “Mientras se usa la app”.');
          setShowDisclosure(false);
          return;
        }
      }
      // 2) Background (Android 11+ puede llevar a Ajustes)
      let bg = await Location.getBackgroundPermissionsAsync();
      if (bg.status !== 'granted') {
        try { bg = await Location.requestBackgroundPermissionsAsync(); } catch {}
      }
      if (bg.status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Para compartir ubicación en segundo plano, elige “Permitir siempre” en Ajustes.'
        );
        if (Platform.OS === 'android') Linking.openSettings().catch(() => {});
        setShowDisclosure(false);
        return;
      }
      // 3) Todo ok → encender (persistirá vía AuthContext.setOnline)
      await setOnline(true);
      setShowDisclosure(false);
    } finally {
      setRequesting(false);
    }
  }, [requesting, setOnline]);

  return (
    <Container>
      <Box style={styles.box} className="items-start justify-center gap-4 mt-8">
        {/* ===== Notificaciones (igual que antes) ===== */}
        <HStack className="justify-between w-full">
          <Text fontSize={20} fontWeight={400} textColor={Colors.DARK_GREEN}>
            {t('settings.activate_notification', { ns: 'utils' })}
          </Text>
          <Switch onToggleSwitch={handleNotificationSwitch} isOn={notifEnabled} />
        </HStack>
        {/* =========================================== */}

        <HStack />

        {/* ===== Estado de ubicación (HOPPER) ===== */}
        {isHopper && (
          <>
            <HStack className="justify-between w-full">
              <Text fontSize={20} fontWeight={400} textColor={Colors.DARK_GREEN}>
                {t('settings.on_line', { ns: 'utils' }) /* "Activo" */}
              </Text>
              <Switch onToggleSwitch={handleLocationSwitch} isOn={isOnline} />
            </HStack>
            <Text>{t('settings.shared_localization', { ns: 'utils' }) /* "(Compartir ubicación en 2º plano)" */}</Text>
          </>
        )}
        {/* ======================================== */}
      </Box>

      {/* Modal de divulgación: solo HOPPER */}
      <BackgroundLocationDisclosure
        visible={Boolean(isHopper && showDisclosure)}
        onCancel={() => { setShowDisclosure(false); }}
        onContinue={() => { void onContinueDisclosure(); }}
        onOpenSettings={() => Linking.openSettings().catch(() => {})}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: Colors.LIGHT_GRADIENT_1,
    borderRadius: 40,
    paddingHorizontal: 40,
    paddingVertical: 30,
  },
});
