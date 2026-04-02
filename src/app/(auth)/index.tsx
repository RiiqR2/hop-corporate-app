import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { Hop } from '@/assets/svg';
import { LinearGradient } from '@/src/components';
import { Button } from '@/src/components/button/button.component';
import { Text } from '@/src/components/text/text.component';
import { VStack } from '@/src/components/ui/vstack';
import { useAuth } from '@/src/context/auth.context';
import { Colors } from '@/src/utils/constants/Colors';
import { AuthRoutesLink } from '@/src/utils/enum/auth.routes';

export default function Entry() {
  const { t } = useTranslation();
  const { token } = useAuth();

  useEffect(() => {
    if (!token?.length) return;
    router.replace('/(tabs)');
  }, [token]);

  return (
    <>
      <StatusBar translucent style="light" />
      <LinearGradient colors={[Colors.SECONDARY, Colors.PRIMARY]}>
        <VStack className="justify-center self-center items-center max-w-[270px]">
          <Hop width={200} height={200} color={Colors.WHITE} />
          <Text fontSize={20} fontWeight={600} textAlign="center" textColor={Colors.WHITE_SECONDARY}>
            {t('entry.title', { ns: 'auth' })}
          </Text>
        </VStack>
        <VStack space="lg" className="mt-auto mb-20 items-center">
          <Button onPress={() => router.push(AuthRoutesLink.SIGN_IN)}>{t('entry.signInButton', { ns: 'auth' })}</Button>
          <Button type="ghost" onPress={() => router.replace(AuthRoutesLink.ONBOARDING)}>
            {t('entry.signUpButton', { ns: 'auth' })}
          </Button>
        </VStack>
      </LinearGradient>
    </>
  );
}
