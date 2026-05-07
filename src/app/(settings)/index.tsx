import { StyleSheet, Alert, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { router, useNavigation } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

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

import { getMyPresence, setMyPresence } from '@/src/services/presence.api';

export default function Settings() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useMe();

  const [notifEnabled, setNotifEnabled] = useState(!!user?.userNotificationToken);

  const { userRole, isOnline, setOnline, setIsOnline } = useAuth();
  const isHopper = userRole === userRoles.USER_HOPPER;

  const [showDisclosure, setShowDisclosure] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const handleNotificationSwitch = async () => {
    try {
      if (notifEnabled) {
        await updateUserOne(user?.id!, {
          email: user?.email,
          userNotificationToken: null,
        });
        setNotifEnabled(false);
        return;
      }

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

      await updateUserOne(user?.id!, {
        email: user?.email,
        userNotificationToken: tokenData.data,
      });

      setNotifEnabled(true);
    } catch (error) {
      console.error('Error al alternar notificaciones:', error);
    }
  };

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

  useFocusEffect(
    useCallback(() => {
      let alive = true;

      (async () => {
        try {
          if (!isHopper) {
            setIsOnline(false);
            return;
          }

          const presence = await getMyPresence();

          if (!alive || !presence) return;

          if (!presence.online) {
            setIsOnline(false);
            return;
          }

          const fg = await Location.getForegroundPermissionsAsync();
          const ok = fg.status === 'granted';

          if (ok) {
            setIsOnline(true);
          } else {
            setIsOnline(false);

            try {
              await setMyPresence(false);
            } catch {}
          }
        } catch {
          // Si falla /user/me, no alteramos estado local.
        }
      })();

      return () => {
        alive = false;
      };
    }, [isHopper, setIsOnline])
  );

  const handleLocationSwitch = () => {
    if (!isHopper) return;

    const next = !isOnline;

    if (!next) {
      void setOnline(false);
      return;
    }

    setShowDisclosure(true);
  };

  const onContinueDisclosure = useCallback(async () => {
    if (requesting) return;

    setRequesting(true);

    try {
      let fg = await Location.getForegroundPermissionsAsync();

      if (fg.status !== 'granted') {
        fg = await Location.requestForegroundPermissionsAsync();

        if (fg.status !== 'granted') {
          Alert.alert(
            'Permiso requerido',
            'Activa la ubicación mientras usas la app.'
          );

          setShowDisclosure(false);
          return;
        }
      }

      await setOnline(true);
      setShowDisclosure(false);
    } finally {
      setRequesting(false);
    }
  }, [requesting, setOnline]);

  return (
    <Container>
      <Box style={styles.box} className="items-start justify-center gap-4 mt-8">
        <HStack className="justify-between w-full">
          <Text fontSize={20} fontWeight={400} textColor={Colors.DARK_PURPLE}>
            {t('settings.activate_notification', { ns: 'utils' })}
          </Text>

          <Switch onToggleSwitch={handleNotificationSwitch} isOn={notifEnabled} />
        </HStack>

        <HStack />

        {isHopper && (
          <>
            <HStack className="justify-between w-full">
              <Text fontSize={20} fontWeight={400} textColor={Colors.DARK_PURPLE}>
                {t('settings.on_line', { ns: 'utils' })}
              </Text>

              <Switch onToggleSwitch={handleLocationSwitch} isOn={isOnline} />
            </HStack>

            <Text>
              {t('settings.shared_localization', { ns: 'utils' }) ||
                '(Compartir ubicación mientras usas la app)'}
            </Text>
          </>
        )}
      </Box>

      <BackgroundLocationDisclosure
        visible={Boolean(isHopper && showDisclosure)}
        onCancel={() => setShowDisclosure(false)}
        onContinue={() => {
          void onContinueDisclosure();
        }}
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