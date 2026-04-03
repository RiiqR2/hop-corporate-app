import { StyleSheet, View, Animated, Easing } from 'react-native';
import { useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useSWR from 'swr';
import { router } from 'expo-router';
import { Round, RoundError, RoundSuccess } from '@/assets/svg';
import { LinearGradient } from '@/src/components';
import { Button } from '@/src/components/button/button.component';
import { Text } from '@/src/components/text/text.component';
import { VStack } from '@/src/components/ui/vstack';
import { scaleSize } from '@/src/helpers/scale-size';
import { useMe } from '@/src/hooks';
import { getMercadoPagoPayment, getTravelById, cashPayment } from '@/src/services/book.service';
import { Colors } from '@/src/utils/constants/Colors';
import { paymentStatus } from '@/src/utils/enum/payment.enum';
import { userRoles } from '@/src/utils/enum/role.enum';
import { i18NextType } from '@/src/utils/types/i18n.type';
import { paymentMethod } from '@/src/utils/enum/payment-method.enum';
import { formatCLP } from '@/src/utils/formatters/currency';

export const getPaymentStatusMessage = (status: paymentStatus, t: i18NextType, gateway: string): string => {
  const statusMessages = {
    [paymentStatus.PENDING]: t('home.confirmation.pending', { ns: 'home' }),
    [paymentStatus.DONE]: t('home.confirmation.success', { ns: 'home' }),
    [paymentStatus.CANCELLED]: t('home.confirmation.fail', { ns: 'home' }),
    [paymentStatus.FINISHED]: t('home.confirmation.finished', { ns: 'home', gateway: gateway }),
  };

  return statusMessages[status] ?? '';
};

export default function Confirmation() {
  const params = useRoute().params as {
    commission: number;
    title: string;
    subtitle: string;
    type: paymentStatus;
    role: userRoles;
    schedule: string;
    travelId: string;
    end: string;
    method: paymentMethod;
  };
  const [paymentId, setPaymentId] = useState('');
  const { user } = useMe();

  const { t } = useTranslation();
  const rotation = useRef(new Animated.Value(0)).current;
  const { data } = useSWR('/travel/one', () => getTravelById(params?.travelId || ''), {
    revalidateOnMount: true,
    refreshInterval: 5000,
  });
  const gateway = data?.paymentGateway === 'mercadopago' ? 'Mercado Pago' : 'Transbank';
  const message = getPaymentStatusMessage(params.type ? params.type : data?.paymentStatus!, t, gateway);

  const formattedDate = dayjs(params.schedule).format('D MMM YYYY, HH:mm[h]');

  const commission = user?.role === userRoles.USER_HOPPER ? data?.hopperCommission : data?.hoppyCommission;
  const formattedCommission = formatCLP(Number(commission ?? 0));


  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const animatedStyle = {
    transform: [{ rotate: rotateInterpolate }],
  };

  const renderButtons = () => {
    const goHome = () => router.back();

    switch (data?.paymentStatus) {
      case paymentStatus.PENDING:
        return (
          <View>
            <Button onPress={goHome} stretch>
              {t(`home.confirmation.cancel`, { ns: 'home' })}
            </Button>
          </View>
        );
      case paymentStatus.DONE:
        return (
          <View>
            <Button onPress={goHome} stretch>
              {t('home.confirmation.accept', { ns: 'home' })}
            </Button>
          </View>
        );

      case paymentStatus.CANCELLED:
        return (
          <>
            <Button
              onPress={async () => {
                await getMercadoPagoPayment(data?.id!).then((res) => setPaymentId(res.id));
              }}
              stretch
            >
              {t(`home.confirmation.try`, { ns: 'home' })}
            </Button>
            <Button onPress={goHome} stretch type="ghost">
              {t(`home.confirmation.cancel_travel`, { ns: 'home' })}
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  const insets = useSafeAreaInsets();

  const priceColor = params.type === paymentStatus.FINISHED ? Colors.DARK_PURPLE : data?.paymentStatus === paymentStatus.CANCELLED ? Colors.ERROR : Colors.GRAY;

  const PaymentStatusComponent = {
    [paymentStatus.PENDING]: (
      <Animated.View style={[animatedStyle]}>
        <Round width={scaleSize(260)} />
      </Animated.View>
    ),
    [paymentStatus.CANCELLED]: (
      <View className="p-4">
        <RoundError width={scaleSize(300)} />
      </View>
    ),
    [paymentStatus.DONE]: (
      <View className="p-4">
        <RoundSuccess width={scaleSize(350)} />
      </View>
    ),
  };

  useEffect(() => {
    const startAnimation = () => {
      rotation.setValue(0);
      Animated.timing(rotation, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => startAnimation());
    };

    startAnimation();

    return () => rotation.stopAnimation();
  }, [rotation]);

  useEffect(() => {
    if (!data?.id) return;

    (async () => {
      try {
        let res;
        if (params.method == paymentMethod.CASH) {
          res = await cashPayment(data.id)
          setPaymentId(res.id);
        } else {
          res = await getMercadoPagoPayment(data.id);
          setPaymentId(res.id);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('Error en getMercadoPagoPayment:', error);
      }
    })();
  }, [data?.id]);

  return (
    <LinearGradient style={[styles.wrapper, { paddingTop: insets.top + 24 }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <VStack space="lg" className="items-center mb-9 mx-[16px]">
          <Text fontSize={28} fontWeight={600} textColor={Colors.DARK_PURPLE} textAlign="center">
            {params.role === userRoles.USER_HOPPY ? t('home.confirmation.title', { ns: 'home' }) : message}
          </Text>
        </VStack>

        <View style={styles.centerContainer}>
          {params.type === paymentStatus?.FINISHED ? (
            <>
              <View style={styles.middleElement}>
                <Text fontSize={32} textColor={Colors.DARK_PURPLE} fontWeight={600}>
                  $ {(user?.role === userRoles.USER_HOPPER ? formatCLP(Number(data?.hopperCommission)) : formatCLP(Number(data?.hoppyCommission))) || '0'}
                </Text>
              </View>
            </>
          ) : (
            <VStack style={styles.middleElementTwo}>
              <Text fontSize={18} textColor={priceColor} fontWeight={500}>
                {t('home.confirmation.value_of_travel', { ns: 'home' })}
              </Text>
              <Text fontSize={48} textColor={priceColor} fontWeight={600}>
                ${formatCLP(Number(data?.price ?? 0))}
              </Text>
            </VStack>
          )}

          {params.type === paymentStatus?.FINISHED && (
            <Animated.View style={[animatedStyle]}>
              <Round width={scaleSize(260)} />
            </Animated.View>
          )}
          {params.type !== paymentStatus?.FINISHED && PaymentStatusComponent[data?.paymentStatus as keyof typeof PaymentStatusComponent]}
        </View>

        <VStack className="items-center">
          <Text className="mt-8" fontSize={14} fontWeight={400}>
            {formattedDate}
          </Text>
          {paymentId && (
            <Text textColor={Colors.GRAY} fontSize={12} fontWeight={400}>
              #{paymentId}
            </Text>
          )}
        </VStack>

        <VStack space="lg" className="pt-12 w-full mb-4" style={{ paddingHorizontal: 16 }}>
          {params.type === paymentStatus?.FINISHED ? (
            <>
              <Button
                onPress={() =>
                  router.replace({
                    pathname: '/(tabs)/wallet',
                    params: { step: 4 },
                  })
                }
                stretch
              >
                {t('home.confirmation.go_payments', { ns: 'home' })}
              </Button>
              <Button
                onPress={() => {
                  router.replace({
                    pathname: '/(tabs)',
                    params: { step: 4 },
                  });
                  router.dismissAll();
                }}
                type="ghost"
              >
                {t('home.confirmation.go_home', { ns: 'home' })}
              </Button>
            </>
          ) : (
            renderButtons()
          )}
        </VStack>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  container: {
    alignItems: 'center',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 48,
  },
  middleElement: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.SECONDARY,
    borderWidth: 6,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    zIndex: 10,
  },
  middleElementTwo: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  middleText: {
    fontSize: 32,
    fontWeight: 600,
    color: Colors.DARK_PURPLE,
  },
});
