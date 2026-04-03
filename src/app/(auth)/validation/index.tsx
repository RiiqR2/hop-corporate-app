import { StyleSheet, View, Image } from 'react-native';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { AssetsImages } from '@/assets/images';
import { Hop } from '@/assets/svg';
import { LinearGradient, Text } from '@/src/components';
import { VStack } from '@/src/components/ui/vstack';
import { useMe } from '@/src/hooks';
import { Colors } from '@/src/utils/constants/Colors';

export default function FinishOnboarding() {
  const { t } = useTranslation();
  const { user } = useMe();

  useEffect(() => {
    if (user?.status == "ACTIVE") {
      router.replace('/(tabs)');
    }
  }, [user?.status]);

  return (
    <LinearGradient>
      <View style={[styles.container]}>
        <VStack space="lg" className="items-center mb-9">
          <Hop color={Colors.SECONDARY} />
          <Text fontSize={28} fontWeight={600} textColor={Colors.DARK_PURPLE} textAlign="center">
            {t('home.waiting_validation.account_review', { ns: 'home' })}
          </Text>
        </VStack>
        <Image source={AssetsImages.waitingValidation} />
        <VStack space="lg" className="mt-28">
          <Text fontSize={14} fontWeight={400} textAlign="center">
            {t('home.waiting_validation.review_info', { ns: 'home' })}
          </Text>
        </VStack>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flexGrow: 1,
    // justifyContent: "space-between",
    alignItems: 'center',
  },
});
