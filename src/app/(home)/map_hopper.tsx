import { View, StyleSheet, Linking, Pressable } from 'react-native';
import { useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useSWR from 'swr';
import { router, useFocusEffect } from 'expo-router';
import { ArrowLeftRounded, Booking, Calendar, Clock, LocationFilled, Send } from '@/assets/svg';
import { EXPO_GOOGLE_MAPS } from '@/config';
import { LinearGradient, Loading } from '@/src/components';
import { Button as CustomButton } from '@/src/components/button/button.component';
import { Text } from '@/src/components/text/text.component';
import { Badge } from '@/src/components/ui/badge';
import { Box } from '@/src/components/ui/box';
import { Button } from '@/src/components/ui/button';
import { Center } from '@/src/components/ui/center';
import { Divider } from '@/src/components/ui/divider';
import { Fab, FabIcon } from '@/src/components/ui/fab';
import { HStack } from '@/src/components/ui/hstack';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@/src/components/ui/modal';
import { VStack } from '@/src/components/ui/vstack';
import { useAuth } from '@/src/context/auth.context';
import { formatTime, getFormattedTime } from '@/src/helpers/add-time';
import { formattedDate } from '@/src/helpers/parse-date';
import { travelType } from '@/src/helpers/parser-names';
import { paymentColor, paymentIcon, paymentTextColor } from '@/src/helpers/payment-status';
import { getGPSDirections, useMe } from '@/src/hooks';
import { getTravelById, getTravels, notifyDriverOnStartPoint, updateTravel } from '@/src/services/book.service';
import { Colors } from '@/src/utils/constants/Colors';
import { HomeRoutesLink } from '@/src/utils/enum/home.routes';
import { paymentStatus } from '@/src/utils/enum/payment.enum';
import { travelStatus } from '@/src/utils/enum/travel.enum';
import { BookingResponse } from '@/src/utils/interfaces/booking.interface';
import { formatCLP } from '@/src/utils/formatters/currency';

export default function MapHopper() {
  const { travel_id, confirmed: confirmedByParams, type } = useRoute().params as { travel_id: string; confirmed: string; type: string };
  const { user } = useMe();
  const insets = useSafeAreaInsets();
  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const { t } = useTranslation();
  const { handleGetDirections, route } = getGPSDirections();
  const { location } = useAuth();
  const { mutate } = useSWR(['/travels/bookings', 0], getTravels);
  const [confirmed, setConfirmed] = useState(confirmedByParams === 'true');
  const [startTravel, setStartTravel] = useState(false);
  const { data, mutate: mutateTravel } = useSWR(
    travel_id ? ['/travel/one', travel_id] : null,
    ([, id]) => getTravelById(id),
    {
      refreshInterval: 1000,
      revalidateOnMount: true,
    }
  );

  const { date, time } = formattedDate(data?.programedTo!);

  // --- Método de pago + selector ---
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH'>('CARD');
  const [isPaymentPickerOpen, setIsPaymentPickerOpen] = useState(false);
  const paymentLabel = paymentMethod === 'CARD' ? 'Tarjeta' : 'Efectivo';
  const paymentIconEmoji = paymentMethod === 'CARD' ? '💳' : '💵';
  // ---------------------------------

  useEffect(() => {
    const timeout = setTimeout(() => setIsButtonDisabled(false), 5000);
    return () => clearTimeout(timeout);
  }, [isInfoOpen]);

  const estimatedTime = getFormattedTime(data?.time!);

  useFocusEffect(
    useCallback(() => {
      setIsInfoOpen(true);
    }, [])
  );

  useEffect(() => {
    if (!data?.from || !data?.to) return;

    handleGetDirections(
      { latitude: data.from.lat, longitude: data.from.lng },
      { latitude: data.to.lat, longitude: data.to.lng }
    );
  }, [data?.from?.lat, data?.from?.lng, data?.to?.lat, data?.to?.lng]);

  const translatedTravelType = travelType(t);
  const Icon = paymentIcon[data?.paymentStatus as paymentStatus];
  const status = data?.status;

  const isPending = data?.paymentStatus === paymentStatus.PENDING;
  const isConfirmed = status !== 'REQUEST' && isInfoOpen && !type;
  const isRequest = status === 'REQUEST';
  const isFailed = data?.paymentStatus === 'CANCELLED';

  const goToConfirmation = () =>
    router.push({
      pathname: HomeRoutesLink.CONFIRMATION,
      params: {
        commission: data?.hopperCommission?.toFixed(0) || 0,
        schedule: String(data?.programedTo) || 0,
        travelId: data?.id || 0,
        role: user?.role,
        method: paymentMethod, // pasa el método elegido
      },
    });

  const openRoute = () =>
    Linking.openURL(
      `${EXPO_GOOGLE_MAPS}&origin=${location?.latitude},${location?.longitude}&destination=${data?.from.lat},${data?.from.lng}&travelmode=driving`
    );

  const endTravel = async () => {
    updateTravel(data?.id!, { status: travelStatus.END } as BookingResponse);
    mutate();
    router.replace({
      pathname: HomeRoutesLink.CONFIRMATION,
      params: { commission: data?.hopperCommission!, type: paymentStatus.FINISHED },
    });
  };

  const confirm_travel = async () => {
    try {
      await updateTravel(data?.id!, { status: travelStatus.ACCEPT, hopper: { id: user?.id } } as BookingResponse);
      mutateTravel();
      mutate();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Error en confirm_travel:', error);
    }
  };

  const notifyArrival = async () => {
    if (!data?.id) return;
    await notifyDriverOnStartPoint(data.id);
  };

  useEffect(() => {
    setConfirmed(confirmedByParams === 'true');
  }, [confirmedByParams]); 

  if (!data) {
    return (
      <LinearGradient>
        <Center>
          <Loading />
        </Center>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: type === 'see_route' ? data?.from.lat! : location?.latitude || 19.432608,
            longitude: type === 'see_route' ? data?.from.lng! : location?.longitude || -99.133209,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: confirmed ? location?.latitude || 0 : data?.from.lat!,
              longitude: confirmed ? location?.longitude || 0 : data?.from.lng!,
            }}
          />
          <Marker coordinate={{ latitude: data?.to.lat!, longitude: data?.to.lng! }} />
          {route?.length > 0 && (
            <Polyline
              coordinates={route.map(([longitude, latitude]: [longitude: string, latitude: string]) => ({ latitude, longitude }))}
              strokeColor={Colors.SECONDARY}
              strokeWidth={5}
            />
          )}
        </MapView>
      </>
      {!confirmed && (
        <Fab placement="top left" onPress={() => router.back()} className="bg-[#E3E1F5] w-[50px] h-[50px]" style={{ marginTop: insets.top }}>
          <FabIcon as={ArrowLeftRounded} width={30} />
        </Fab>
      )}

      {/* Info de viaje */}
      <Modal
        isOpen={isInfoOpen && !startTravel && !type}
        onClose={() => setIsInfoOpen(false)}
        style={{ paddingHorizontal: 16, position: 'absolute', top: -100 }}
      >
        <ModalContent className="rounded-[20px] bg-[#E3E1F5] w-[100%]">
          <ModalHeader className="flex-col">
            <Box className="flex-row items-center gap-2 justify-center w-full">
              <Booking width={28} height={28} />
              <Text fontSize={20} fontWeight={600}>{translatedTravelType[data?.type!]}</Text>
            </Box>
            <Box className="flex-row gap-2">
              <Badge className="gap-2 rounded-full items-center justify-center px-2" style={styles.badge}>
                <Calendar width={16} height={16} color={Colors.DARK_PURPLE} />
                <Text fontSize={14} fontWeight={600} textColor={Colors.DARK_PURPLE}>{date}</Text>
              </Badge>
              <Badge className="gap-2 rounded-full items-center justify-center px-2" style={styles.badge}>
                <Clock width={16} height={16} color={Colors.DARK_PURPLE} />
                <Text fontSize={14} fontWeight={600} textColor={Colors.DARK_PURPLE}>{time}</Text>
              </Badge>
            </Box>
          </ModalHeader>
          <ModalBody>
            <Box style={{ backgroundColor: Colors.WHITE }} className="mt-3 p-2 gap-2 rounded-[14px]">
              <VStack space="sm">
                <Text textColor={Colors.GRAY} fontWeight={300} fontSize={12}>
                  {t('home.map_home.first_sheet.fields.starting_point', { ns: 'home' })}
                </Text>
                <Box className="flex-row gap-2 items-center w-[90%]">
                  <Send />
                  <Text fontSize={16} fontWeight={400}>{data?.from.address}</Text>
                </Box>
              </VStack>
              <Divider className="mt-2" style={styles.divider} />
              <VStack space="sm">
                <Text textColor={Colors.GRAY} fontWeight={300} fontSize={12}>
                  {t('home.map_home.first_sheet.fields.destination_point', { ns: 'home' })}
                </Text>
                <Box className="flex-row gap-2 items-center">
                  <LocationFilled />
                  <Text fontSize={16} fontWeight={400}>{data?.to.address}</Text>
                </Box>
              </VStack>
            </Box>
            <HStack className="mt-4 items-center justify-between">
              <Text fontSize={14} fontWeight={400}>
                {t('home.map_home.first_sheet.fields.distance', { ns: 'home' })}:{' '}
                <Text fontSize={16} fontWeight={600}>{data?.distance}km</Text>
              </Text>
              <Badge
                className="rounded-full gap-1"
                style={{ backgroundColor: paymentColor[data?.paymentStatus as paymentStatus] }}
              >
                <Icon color={paymentTextColor[data?.paymentStatus!]} width={16} height={16} />
                <Text fontSize={16} fontWeight={600} textColor={paymentTextColor[data?.paymentStatus as paymentStatus]}>
                  ${formatCLP(Number(data?.price ?? 0))}
                </Text>
              </Badge>
            </HStack>
          </ModalBody>
          <ModalFooter className="flex-col">
            <Button
              variant="outline"
              style={styles.more_info}
              onPress={notifyArrival}
            >
              <Text textColor={Colors.SECONDARY} fontWeight={600} fontSize={16}>
                Notificar llegada
              </Text>
            </Button>

            <Button
              variant="outline"
              style={styles.more_info}
              onPress={() => {
                router.navigate({ pathname: '/(booking)/[id]', params: { id: data?.id!, fromBook: 'true' } });
                setIsInfoOpen(false);
              }}
            >
              <Text textColor={Colors.SECONDARY} fontWeight={600} fontSize={16}>
                {t('home.confirmation.more_info', { ns: 'home' })}
              </Text>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Selector de método de pago (celeste, sin fondos oscuros) */}
      <Modal
        isOpen={isPaymentPickerOpen}
        onClose={() => setIsPaymentPickerOpen(false)}
        style={{ paddingHorizontal: 16, position: 'absolute', top: -100 }}
      >
        <ModalContent className="rounded-[20px] w-[100%]" style={styles.modalCard}>
          <ModalHeader>
            <Text fontSize={18} fontWeight={700}>Selecciona método de pago</Text>
          </ModalHeader>


          <ModalBody className="gap-3">
            {/* Opción Tarjeta */}
            <Pressable
              onPress={() => { setPaymentMethod('CARD'); setIsPaymentPickerOpen(false); }}
              style={[
                styles.optionRow,
                paymentMethod === 'CARD' ? styles.optionRowActive : undefined,
              ]}
            >
              <Text style={styles.optionEmoji}>💳</Text>
              <Text style={styles.optionText}>Tarjeta</Text>
            </Pressable>

            {/* Opción Efectivo */}
            <Pressable
              onPress={() => { setPaymentMethod('CASH'); setIsPaymentPickerOpen(false); }}
              style={[
                styles.optionRow,
                paymentMethod === 'CASH' ? styles.optionRowActive : undefined,
              ]}
            >
              <Text style={styles.optionEmoji}>💵</Text>
              <Text style={styles.optionText}>Efectivo</Text>
            </Pressable>
          </ModalBody>
          <ModalFooter>
            <Pressable onPress={() => setIsPaymentPickerOpen(false)} style={styles.cancelLink}>
              <Text fontSize={16} fontWeight={600} textColor={Colors.GRAY}>Cancelar</Text>
            </Pressable>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {(isPending || isConfirmed || isRequest) && !type && (
        <VStack style={{ position: 'absolute', bottom: 40 }} className="justify-center items-center w-full gap-2 px-4">
          {(isPending || isFailed) && !isRequest && (
            <>
              {/* Fila: CTA principal + botón-chip (separados) */}
              <HStack className="w-full items-center gap-2">
                <Box style={{ flex: 1 }}>
                  <CustomButton
                    onPress={() => {
                      setIsInfoOpen(false);
                      goToConfirmation(); // usa el paymentMethod actual
                    }}
                    stretch
                  >
                    {t('modal_hopper.charge_travel', { ns: 'utils' })}
                  </CustomButton>
                </Box>

                {/* Botón-chip del método (separado del CTA) */}
                <Button
                  variant="ghost"
                  onPress={() => setIsPaymentPickerOpen(true)}
                  className="rounded-full px-3 h-[44px] bg-[#E3E1F5] border"
                  style={{ borderColor: '#dfd9f7' }}
                >
                  <HStack className="items-center gap-1">
                    <Text fontSize={16}>{paymentIconEmoji}</Text>
                    <Text fontSize={14} fontWeight={600}>{paymentLabel}</Text>
                    <Text fontSize={14}>▾</Text>
                  </HStack>
                </Button>
              </HStack>

              {/* Botón secundario existente */}
              <CustomButton onPress={openRoute} stretch type="outlined">
                {t('home.confirmation.go_to_route', { ns: 'home' })}
              </CustomButton>
            </>
          )}

          {isConfirmed && !isPending && data?.paymentStatus === paymentStatus.DONE && (
            <>
              <CustomButton
                onPress={() => {
                  setIsInfoOpen(false);
                  if (data?.paymentStatus === paymentStatus.DONE) {
                    setStartTravel(true);
                    return;
                  }
                  goToConfirmation();
                }}
                stretch
              >
                {t('home.confirmation.start', { ns: 'home' })}
              </CustomButton>

              <CustomButton onPress={openRoute} stretch type="outlined">
                {t('home.confirmation.go_to_route', { ns: 'home' })}
              </CustomButton>
            </>
          )}

          {isRequest && isPending && (
            <>
              <CustomButton onPress={confirm_travel} stretch>
                {t('modal_hopper.acceptTripButton', { ns: 'utils' })}
              </CustomButton>
              <CustomButton onPress={openRoute} stretch type="outlined">
                {t('home.confirmation.go_to_route', { ns: 'home' })}
              </CustomButton>
            </>
          )}
        </VStack>
      )}


      {startTravel && (
        <View style={[styles.actionSheet, { paddingBottom: insets.bottom + 12 }]}>
          <HStack className="justify-between">
            <Text fontSize={24} fontWeight={600} className="mb-6" textColor={Colors.DARK_PURPLE}>
              {formatTime(data?.time!)}
            </Text>
            <CustomButton
              onPress={() => {
                Linking.openURL(
                  `${EXPO_GOOGLE_MAPS}&origin=${data?.from.lat},${data?.from.lng}&destination=${data?.to.lat},${data?.to.lng}&travelmode=driving`
                );
              }}
              type="ghost"
              textClassName={{ textDecorationLine: 'underline' }}
            >
              {t('home.confirmation.go_to_finish_route', { ns: 'home' })}
            </CustomButton>
          </HStack>

          <VStack className="gap-5">
            <Text fontSize={16} fontWeight={400} textColor={Colors.GRAY}>
              {data?.distance!}km - {estimatedTime}
            </Text>

            <CustomButton onPress={endTravel} stretch disabled={isButtonDisabled} type={isButtonDisabled ? 'ghost' : ''}>
              {t('home.confirmation.end_travel', { ns: 'home' })}
            </CustomButton>
          </VStack>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  badge: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 4,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 40,
    marginTop: 12,
  },
  divider: { backgroundColor: Colors.PRIMARY },
  more_info: {
    borderColor: Colors.SECONDARY,
    minWidth: 230,
    borderRadius: 12,
    height: 44,
  },
  actionSheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0, zIndex: 10,
    paddingVertical: 28, backgroundColor: 'white',
    borderTopLeftRadius: 40, borderTopRightRadius: 40,
    paddingHorizontal: 30,
  },

  // --- Estilos del selector ---
  optionRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd6ed', // un borde suave
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionRowActive: {
    borderColor: Colors.SECONDARY,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  optionEmoji: { fontSize: 18, marginRight: 8 },
  optionText: { fontSize: 16, fontWeight: '700', color: '#0e0e3b' },
  cancelLink: { alignSelf: 'flex-end', paddingVertical: 6, paddingHorizontal: 4 },

  // --- Chip superpuesto dentro del CTA ---
  paymentChip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    height: 36,
    borderRadius: 999,
  },
  chipEmoji: { color: '#fff', fontSize: 15, marginRight: 4 },
  chipText: { color: '#fff', fontWeight: '700' },
  chipCaret: { color: '#fff', marginLeft: 4, opacity: 0.9 },

  modalCard: {
    backgroundColor: '#e4e1f5',     // celeste claro (como el fondo)
    borderRadius: 20,
    borderWidth: 2,                  // contorno definido
    borderColor: 'rgba(14, 0, 137, 0.35)', // verde-teal suave (ajústalo si tu Colors.SECONDARY es otro)
    shadowColor: '#000',             // separación del fondo
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,                    // Android
  },
  // ----------------------------------------
});
