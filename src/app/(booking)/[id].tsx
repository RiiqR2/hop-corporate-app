import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { router, useNavigation } from 'expo-router';
import {
  AirplaneArrival,
  AirplaneOutlined,
  Calendar,
  Clock,
  DolarCircle,
  Luggage,
  ProfileActive,
  Room,
  Send,
  WarningHexa,
} from '@/assets/svg';
import { Container, Header } from '@/src/components';
import { Button } from '@/src/components/button/button.component';
import BookingEditForm from '@/src/components/forms/booking/booking-edit.form';
import { Text } from '@/src/components/text/text.component';
import { Badge } from '@/src/components/ui/badge';
import { Box } from '@/src/components/ui/box';
import { Center } from '@/src/components/ui/center';
import { Divider } from '@/src/components/ui/divider';
import { HStack } from '@/src/components/ui/hstack';
import { VStack } from '@/src/components/ui/vstack';
import { formattedDate } from '@/src/helpers/parse-date';
import { travelType, vehicleName } from '@/src/helpers/parser-names';
import { payment, paymentColor, paymentIcon, paymentTextColor } from '@/src/helpers/payment-status';
import { getShortcuts, getShortcutsHopper } from '@/src/helpers/shortcuts';
import { useMe, useTravelBookings, useTravelById, useUser } from '@/src/hooks';
import { sendWhatsAppLinkTravel, updateTravel } from '@/src/services/book.service';
import { Colors } from '@/src/utils/constants/Colors';
import { HomeRoutesLink } from '@/src/utils/enum/home.routes';
import { userRoles } from '@/src/utils/enum/role.enum';
import { travelStatus, travelTypeValues } from '@/src/utils/enum/travel.enum';
import { formatCLP } from '@/src/utils/formatters/currency';

export default function Booking() {
  const navigator = useNavigation();
  const { t } = useTranslation();
  const { id, fromBook } = useRoute().params as { id: string; fromBook: boolean };
  const { user } = useMe();
  const { travel, mutate: mutateTravel } = useTravelById(id);

  const { mutateBookings } = useTravelBookings();
  const { user: userHoppy } = useUser(travel?.hoppy.id!);

  const travelTranslated = travelType(t);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isEditable, setIsEditable] = useState(false);
  const handleHover = (id: number, isHovered: boolean) => {
    setHoveredIndex(isHovered ? id : null);
  };
  
  useEffect(() => {
    navigator.setOptions({
      header: () => (
        <Header
          title={travelTranslated[travel?.type as travelTypeValues]}
          arrow
          onPressArrow={() => router.back()}
          edit={user?.role === userRoles.USER_HOPPY && !isEditable && travel?.type !== travelTypeValues.PROGRAMED && travel?.type !== travelTypeValues.INSTANT}
          onPressEdit={() => setIsEditable(true)}
        />
      ),
    });
  }, [navigator, travel, isEditable]);

  const handleSubmitLink = async (id: string) => {
    try {
      const result = await sendWhatsAppLinkTravel(id);
      return result;
    } catch {
      throw new Error('Error al enviar los datos al Back-End...');
    }
  };

  const { date, time } = formattedDate(travel?.programedTo || new Date());

  const shortcuts = getShortcuts(travel);
  const shortcutsHopper = getShortcutsHopper(travel, userHoppy);

  const shouldIncludeItem = (item: { icon: any }) => {
    const type = travel?.type;

    const isAirplaneIcon = item.icon === AirplaneArrival || item.icon === AirplaneOutlined;
    const isRoomIcon = item.icon === Room;

    if (isAirplaneIcon && type !== travelTypeValues.PICKUP) {
      return false;
    }

    if (isRoomIcon && !(type === travelTypeValues.DROPOFF || type === travelTypeValues.PROGRAMED || type === travelTypeValues.INSTANT)) {
      return false;
    }

    return true;
  };
  const filteredShortcuts = shortcuts.filter(shouldIncludeItem);
  const filteredShortcutsHopper = shortcutsHopper.filter(shouldIncludeItem);

  const Icon = paymentIcon[travel?.paymentStatus!];

  if (!travel) {
    return (
      <Center>
        <ActivityIndicator color={Colors.PRIMARY} />
      </Center>
    );
  }

  const translatedVehicles = vehicleName(t);
  const translatedPaymentStatus = payment(t);

  const message =
    user?.role === userRoles.USER_HOPPER
      ? t('message.driverMessage', {
          ns: 'utils',
          contactNumber: `${travel?.hopper?.userInfo?.countryCode} ${travel?.hopper?.userInfo.phone}`,
          name: travel?.hopper?.userInfo?.firstName,
          date: `${date} - ${time}`,
          carType: translatedVehicles[travel?.vehicleType!],
          fromAddress: travel?.from?.address,
          toAddress: travel?.to.address,
        })
      : t('message.reservationMessage', {
          ns: 'utils',
          contactNumber: `${travel?.hopper?.userInfo?.countryCode} ${travel?.hopper?.userInfo.phone}`,
          name: travel?.hopper?.userInfo?.firstName,
          date: `${date} - ${time}`,
          carType: translatedVehicles[travel?.vehicleType!],
          fromAddress: travel?.from?.address,
          toAddress: travel?.to.address,
        });

  return (
    <Container>
      {!isEditable ? (
        <>
          <Box className="flex-row gap-2">
            <Badge className="gap-2 rounded-full items-center justify-center px-2" style={styles.badge}>
              <Calendar width={16} height={16} color={Colors.DARK_PURPLE} />
              <Text fontSize={14} fontWeight={600} textColor={Colors.DARK_PURPLE}>
                {date}
              </Text>
            </Badge>
            <Badge className="gap-2 rounded-full items-center justify-center px-2" style={styles.badge}>
              <Clock width={16} height={16} color={Colors.DARK_PURPLE} />
              <Text fontSize={14} fontWeight={600} textColor={Colors.DARK_PURPLE}>
                {time}
              </Text>
            </Badge>
          </Box>
          {user?.role !== userRoles.USER_HOPPER && (
            <HStack space="md" className="mt-8 items-start">
              <Box className="gap-2 justify-between">
                <Text fontSize={20} fontWeight={600}>
                  {translatedVehicles[travel?.vehicleType!]}
                </Text>
                <VStack className="mt-2 gap-2">
                  <Box className="flex-row">
                    <ProfileActive width={16} height={16} />
                    <Text fontSize={14} fontWeight={400} textColor={Colors.GRAY}>
                      {travel?.totalPassengers}{' '}
                      {Number(travel?.totalPassengers) > 1
                        ? t('booking.card.passengers', {
                            ns: 'booking',
                          })
                        : t('booking.card.passenger', {
                            ns: 'booking',
                          })}
                    </Text>
                  </Box>
                  <Box className="flex-row">
                    <Luggage />
                    <Text fontSize={14} fontWeight={400} textColor={Colors.GRAY}>
                      {travel?.totalSuitCases}{' '}
                      {Number(travel?.totalSuitCases) > 1
                        ? t('booking.card.luggages', {
                            ns: 'booking',
                          })
                        : t('booking.card.luggage', {
                            ns: 'booking',
                          })}
                    </Text>
                  </Box>
                </VStack>
              </Box>
            </HStack>
          )}
          {user?.role === userRoles.USER_HOPPER && (
            <View className="gap-5">
              <VStack className="mt-6 gap-3 border border-[#E1F5F3] p-2 rounded-[20px]">
                <Box>
                  <Text fontSize={12} fontWeight={300} textColor={Colors.GRAY}>
                    {t('booking.modal_hopper.departurePoint', { ns: 'booking' })}
                  </Text>
                  <HStack className="items-center gap-2 w-[90%]">
                    <Send />
                    <Text fontSize={16} fontWeight={400}>
                      {travel?.from?.address}
                    </Text>
                  </HStack>
                </Box>
                <Divider style={styles.divider_light} />
                <Box>
                  <Text fontSize={12} fontWeight={300} textColor={Colors.GRAY}>
                    {t('booking.modal_hopper.destination', { ns: 'booking' })}
                  </Text>
                  <HStack className="items-center gap-2">
                    <Send />
                    <VStack>
                      <Text fontSize={16} fontWeight={400}>
                        {travel?.to?.address}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </VStack>
              {user.role === userRoles.USER_HOPPER && travel?.reducedMobility && (
                <HStack space="md">
                  <View className="rounded-full bg-[#7a5ce7] w-6 h-6 items-center justify-center">
                    <WarningHexa />
                  </View>

                  <Text>
                    {t('home.map_home.third_sheet.accessibility', {
                      ns: 'home',
                    })}
                  </Text>
                </HStack>
              )}
            </View>
          )}
          <View style={styles.panel}>
            {(user?.role !== userRoles.USER_HOPPER ? filteredShortcuts : filteredShortcutsHopper).map(({ name, icon: IconItem }, i) => {
              return (
                <React.Fragment key={i}>
                  <Pressable key={name}>
                    <HStack
                      className="items-center justify-between px-4 w-full rounded-2xl"
                      style={{
                        backgroundColor: hoveredIndex === i ? Colors.SECONDARY : 'transparent',
                        paddingVertical: 8,
                      }}
                      onTouchStart={() => handleHover(i, true)}
                      onTouchEnd={() => handleHover(i, false)}
                    >
                      <Box className="flex-row gap-2 items-center w-[80%]">
                        <View style={styles.link_icon}>{IconItem && <IconItem width={16} height={16} color={Colors.SECONDARY} />}</View>
                        <Text textColor={Colors.DARK_PURPLE} fontWeight={400} fontSize={16}>
                          {name}
                        </Text>
                      </Box>
                    </HStack>
                  </Pressable>
                  {i !== (user?.role !== userRoles.USER_HOPPER ? filteredShortcuts : shortcutsHopper).length - 1 && <Divider style={styles.divider} />}
                </React.Fragment>
              );
            })}
          </View>
          {user?.role === userRoles.USER_HOPPER ? (
            <>
              <Text fontSize={16} fontWeight={400} textColor={Colors.PRIMARY} className="mt-2" onPress={() => handleSubmitLink(travel?.id)} underline>
                {t('booking.modal_hopper.sendLink', { ns: 'booking' })}
              </Text>
              <HStack className="mt-8 justify-between items-center">
                <Text fontSize={18} fontWeight={400}>
                  {t('booking.modal_hopper.paymentState', { ns: 'booking' })}
                </Text>
                <Badge
                  className="rounded-full gap-1"
                  style={{
                    backgroundColor: paymentColor[travel?.paymentStatus!],
                  }}
                >
                  <Icon
                    // @ts-ignore
                    color={paymentTextColor[travel?.paymentStatus!]}
                  />
                  <Text fontSize={18} fontWeight={600} textColor={paymentTextColor[travel?.paymentStatus!]}>
                    {translatedPaymentStatus[travel?.paymentStatus!]}
                  </Text>
                </Badge>
              </HStack>
              <Box className="mt-8 gap-2">
                {user.role === userRoles.USER_HOPPER && (
                  <Button
                    onPress={() =>
                      router.push({
                        pathname: HomeRoutesLink.MAP_HOPPER,
                        params: {
                          travel: JSON.stringify(travel),
                          type: 'see_route',
                        },
                      })
                    }
                    stretch
                  >
                    {t('booking.modal_hopper.see_route', { ns: 'booking' })}
                  </Button>
                )}
                <Button
                  onPress={async () => {
                    try {
                      await updateTravel(id, {
                        status: travelStatus.CANCELLED,
                        hopper: {
                          id: user?.id,
                        },
                      });
                      mutateBookings();
                      mutateTravel();
                      if (Boolean(fromBook)) {
                        router.replace('/(tabs)/');
                        return;
                      }

                      router.back();
                    } catch (error) {
                      // eslint-disable-next-line no-console
                      console.error('Error al cancelar el viaje:', error);
                    }
                  }}
                  type="ghost"
                  stretch
                  textClassName={{
                    color: '#8e8e8e',
                  }}
                >
                  {t('booking.modal_hopper.cancel', { ns: 'booking' })}
                </Button>
              </Box>
            </>
          ) : (
            <>
              <HStack className="mt-8 justify-around items-center">
                <Text fontSize={18} fontWeight={400} style={{ width: '50%' }}>
                  {t('booking.card.commission', {
                    ns: 'booking',
                  })}{' '}
                </Text>
                <Badge className="rounded-full bg-[#9FE4DD] gap-1">
                  <DolarCircle />
                  <Text fontSize={18} fontWeight={600} textColor={Colors.DARK_PURPLE}>
                    {formatCLP(Number(travel?.hoppyCommission ?? 0))}
                  </Text>
                </Badge>
              </HStack>
              <VStack className="mt-8 gap-4">
                <Button
                  onPress={() => {
                    const url = `https://wa.me/${travel?.passengerContactCountryCode + travel?.passengerContact}?text=${encodeURIComponent(message)}`;
                    Linking.openURL(url);
                  }}
                  stretch
                >
                  {t('booking.card.button', {
                    ns: 'booking',
                  })}
                </Button>
                <Button
                  onPress={async () => {
                    try {
                      await updateTravel(id, {
                        status: travelStatus.CANCELLED,
                        hoppy: {
                          id: user?.id,
                        },
                      });
                      mutateBookings();
                      mutateTravel();
                      if (Boolean(fromBook)) {
                        router.replace('/(tabs)/');
                        return;
                      }

                      router.back();
                    } catch (error) {
                      // eslint-disable-next-line no-console
                      console.error('Error al cancelar el viaje:', error);
                    }
                  }}
                  type="ghost"
                  stretch
                  textClassName={{
                    color: '#8e8e8e',
                  }}
                >
                  {t('booking.card.cancel', {
                    ns: 'booking',
                  })}
                </Button>
              </VStack>
            </>
          )}
        </>
      ) : (
        <BookingEditForm formattedDate={date} formattedTime={time} data={travel!} id={id} user={user!} />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 4,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 40,
    marginTop: 12,
  },
  panel: {
    backgroundColor: Colors.LIGHT_GRADIENT_1,
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 40,
    gap: 12,
  },
  link_icon: {
    alignSelf: 'flex-start',
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 50,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: Colors.PRIMARY,
  },
  divider_light: {
    height: 1,
    width: '100%',
    backgroundColor: Colors.LIGHT_GRADIENT_1,
  },
});
