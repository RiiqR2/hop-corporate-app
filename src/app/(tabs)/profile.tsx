import React, { useEffect, useState, useRef } from 'react';
import { View, Pressable, StyleSheet, Linking, Modal, Animated, Easing, Platform, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { router } from 'expo-router';
import { Header } from '@/src/components';
import { Text } from '@/src/components/text/text.component';
import { Divider } from '@/src/components/ui/divider';
import { useAuth } from '@/src/context/auth.context';
import { useDrawer } from '@/src/context/drawer.context';
import { useMe } from '@/src/hooks';
import { updateUserOne } from '@/src/services/auth.service';
import { getTermsAndConditions, getUserDocumentation } from '@/src/services/user.service';
import { Colors } from '@/src/utils/constants/Colors';
import { AuthRoutesLink } from '@/src/utils/enum/auth.routes';
import { userRoles } from '@/src/utils/enum/role.enum';
import { ProfileRoutesLink } from '@/src/utils/enum/profile.routes';
import ProfileContent from '../(profile)/index';
import { setMyPresence } from '@/src/services/presence.api.ts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


function SettingsMenu({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { clearToken, setIsOnline, userRole } = useAuth();
  const { user } = useMe();


  const [mounted, setMounted] = useState(visible);
  const translateX = useRef(new Animated.Value(-320)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const handleLogout = async () => {
    try {
      if (userRole === userRoles.USER_HOPPER) {
        try {
          await setMyPresence(false);
        } catch {}
        setIsOnline(false);
      }

      await updateUserOne(user?.id!, {
        email: user?.email,
        userNotificationToken: null,
      });

      mutate(undefined);
      handleClose();
      clearToken();
      router.replace(AuthRoutesLink.SIGN_IN);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateX.setValue(-320);
      backdropOpacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateX, backdropOpacity]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -320,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setMounted(false);
        onClose();
      }
    });
  };

  if (!mounted) return null;


  const handleOpenTerms = async () => {
    const resp = await getTermsAndConditions();

    if (user?.role === userRoles.USER_HOPPER) {
      Linking.openURL(resp.hopperTermsConditions);
    } else {
      Linking.openURL(resp.hoppyTermsConditions);
    }
  };

  const handleDownloadContract = async () => {
    const resp = await getUserDocumentation(user?.id!);
    if (!resp?.userContract) return;

    Linking.openURL(resp.userContract);
  };

  return (
    <Modal visible={mounted} transparent animationType="none" statusBarTranslucent onRequestClose={handleClose}>
      <View style={styles.modalRoot}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
            },
          ]}
        />

        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <Animated.View
          style={[
            styles.drawerPanel,
            {
              paddingTop: Platform.OS === 'ios' ? insets.top + 16 : (StatusBar.currentHeight ?? 0) + 16,
              paddingBottom: insets.bottom + 8,
              transform: [{ translateX }],
            },
          ]}
        >
          
          <View className="p-5">
            <Pressable
              onPress={() => {
                handleClose();
                router.push('/(settings)/');
              }}
              className="p-2"
            >
              <Text textColor={Colors.DARK_GREEN} fontSize={20} fontWeight={400}>
                {t('profile.drawer.link.permissions', { ns: 'profile' })}
              </Text>
              <Divider className="my-1" orientation="horizontal" style={styles.divider} />
            </Pressable>

            <Pressable
              onPress={() => {
                handleClose();
                router.push({
                  pathname: AuthRoutesLink.NEW_PASSWORD,
                  params: { mode: 'change' },
                });
              }}
              className="p-2"
            >
              <Text textColor={Colors.DARK_GREEN} fontSize={20} fontWeight={400}>
                {t('profile.drawer.link.privacy', { ns: 'profile' })}
              </Text>
              <Divider className="my-1" style={styles.divider} />
            </Pressable>

            <Pressable
              onPress={() => {
                handleClose();
                router.push('/(settings)/report_issue');
              }}
              className="p-2"
            >
              <Text textColor={Colors.DARK_GREEN} fontSize={20} fontWeight={400}>
                {t('profile.drawer.link.report_issue', { ns: 'profile' })}
              </Text>
              <Divider className="my-1" style={styles.divider} />
            </Pressable>

            <Pressable onPress={handleOpenTerms} className="p-2">
              <Text textColor={Colors.DARK_GREEN} fontSize={20} fontWeight={400}>
                {t('profile.drawer.link.terms_conditions', { ns: 'profile' })}
              </Text>
              <Divider className="my-1" style={styles.divider} />
            </Pressable>

            <Pressable onPress={handleDownloadContract} className="p-2">
              <Text textColor={Colors.DARK_GREEN} fontSize={20} fontWeight={400}>
                {t('profile.drawer.link.contract', { ns: 'profile' })}
              </Text>
              <Divider className="my-1" style={styles.divider} />
            </Pressable>

            <Pressable
              onPress={() => {
                handleClose();
                router.push(ProfileRoutesLink.DELETE_ACCOUNT);
              }}
              className="p-2"
            >
              <Text textColor={Colors.DARK_GREEN} fontSize={20} fontWeight={400}>
                {t('profile.drawer.link.delete_account', { ns: 'profile' })}
              </Text>
              <Divider className="my-1" style={styles.divider} />
            </Pressable>
          </View>

          <View className="flex-1" />

          <View className="p-5">
            <Pressable onPress={handleLogout}>
              <Text textColor={Colors.DARK_GREEN} fontSize={20} fontWeight={400}>
                {t('profile.drawer.link.logout', { ns: 'profile' })}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { setIsDrawerOpen } = useDrawer();

  useEffect(() => {
    setIsDrawerOpen(isMenuOpen);
  }, [isMenuOpen, setIsDrawerOpen]);

  return (
    <View style={styles.container}>
      <Header
        title={t('profile.home.title', { ns: 'profile' })}
        menu
        onPressMenu={() => setIsMenuOpen(true)}
      />

      <ProfileContent />

      <SettingsMenu visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  drawerPanel: {
    width: '80%',
    height: '100%',
    backgroundColor: Colors.LIGHT_GRADIENT_1,
    zIndex: 2,
  },
  divider: {
    backgroundColor: Colors.PRIMARY,
    height: 1,
    width: '100%',
    marginTop: 12,
  },
});