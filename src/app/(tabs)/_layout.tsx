import { Animated, Platform, StyleSheet, View } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs } from 'expo-router';
import { Calendar, CalendarActive, Clock, ClockActive, Home, HomeActive, Profile, ProfileActive, Wallet, WalletActive } from '@/assets/svg';
import { TabBar } from '@/src/components/tabbar/tabbar.component';
import { useDrawer } from '@/src/context/drawer.context';
import { useMe, useSocket } from '@/src/hooks';
import { updateUserOne } from '@/src/services/auth.service';
import { Colors } from '@/src/utils/constants/Colors';
import { TabsRoutes } from '@/src/utils/enum/tabs.routes';

export default function TabLayout() {
  const { t } = useTranslation();
  const { isDrawerOpen } = useDrawer();
  const [fadeAnim] = useState(new Animated.Value(1));
  const [translateYAnim] = useState(new Animated.Value(0));
  const [paddingBottomAnim] = useState(new Animated.Value(100));
  const { user } = useMe();

  useEffect(() => {
    if (isDrawerOpen) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start();

      Animated.timing(translateYAnim, {
        toValue: isDrawerOpen ? 120 : 0,
        duration: 100,
        useNativeDriver: true,
      }).start();

      Animated.timing(paddingBottomAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();

      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start();

      Animated.timing(paddingBottomAnim, {
        toValue: 100,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [isDrawerOpen]);

  const socket = useSocket('http://192.168.1.10:3000/');

  useEffect(() => {
    if (!socket || !user?.id) return;

    const eventName = `user-${user.id}`;

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off(eventName);
    };
  }, [socket, user?.id]);

  useEffect(() => {
    if (!user) return;
    const registerForPushNotifications = async () => {
      try {
        if (Device.isDevice) {
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;

          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }

          if (finalStatus !== 'granted') {
            alert('No se concedieron permisos para notificaciones push');
            return;
          }

          const tokenData = await Notifications.getExpoPushTokenAsync();

          await updateUserOne(user.id!, {
            email: user.email,
            userNotificationToken: tokenData.data,
          });
        } else {
          alert('Debes usar un dispositivo físico para notificaciones push');
        }

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ Error en registerForPushNotifications:', error);
      }
    };

    registerForPushNotifications();
  }, [user]);

  useEffect(() => {
    const createAndroidChannel = async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('hop', {
          name: 'hop',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'notification',
        });
      }
    };

    createAndroidChannel();
  }, []);

  return (
    <View style={styles.tabbar_container}>
      <Tabs
        tabBar={(props) => {
          return (
            <Animated.View
              pointerEvents={isDrawerOpen ? 'none' : 'auto'}
              style={[
                styles.tabBarWrapper,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: translateYAnim }],
                },
                isDrawerOpen && styles.tabBarHidden,
              ]}
            >
              <TabBar {...props} />
            </Animated.View>
          );
        }}
      >
        <Tabs.Screen
          name={TabsRoutes.BOOKING}
          options={{
            tabBarLabel: t('tabbar.booking', { ns: 'utils' }),
            tabBarIcon: ({ color, focused }) => (focused ? <CalendarActive color={color} /> : <Calendar color={color} />),
          }}
        />
        <Tabs.Screen
          name={TabsRoutes.HISTORY}
          options={{
            tabBarLabel: t('tabbar.history', { ns: 'utils' }),
            tabBarIcon: ({ color, focused }) => (focused ? <ClockActive /> : <Clock color={color} />),
          }}
        />
        <Tabs.Screen
          name={TabsRoutes.HOME}
          options={{
            tabBarLabel: t('tabbar.home', { ns: 'utils' }),
            tabBarIcon: ({ color, focused }) => (focused ? <HomeActive color={color} /> : <Home color={color} />),
          }}
        />
        <Tabs.Screen
          name={TabsRoutes.PROFILE}
          options={{
            tabBarLabel: t('tabbar.profile', { ns: 'utils' }),
            tabBarIcon: ({ color, focused }) => (focused ? <ProfileActive color={color} /> : <Profile color={color} />),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name={TabsRoutes.WALLET}
          options={{
            tabBarLabel: t('tabbar.wallet', { ns: 'utils' }),
            tabBarIcon: ({ color, focused }) => (focused ? <WalletActive color={color} /> : <Wallet color={color} />),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar_container: {
    backgroundColor: Colors.WHITE,
    flex: 1,
  },
  tabBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  tabBarHidden: {
    opacity: 0,
  },
});
