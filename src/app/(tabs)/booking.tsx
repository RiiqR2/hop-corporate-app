import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native-gesture-handler';
import useSWR from 'swr';
import { router, useNavigation } from 'expo-router';
import { Calendar, CalendarWhite, Notification, NotificationActive, Routing, Ticket, UserSquare } from '@/assets/svg';
import { Header, NotBookings } from '@/src/components';
import { Button } from '@/src/components/button/button.component';
import { Text } from '@/src/components/text/text.component';
import { Badge } from '@/src/components/ui/badge';
import { Box } from '@/src/components/ui/box';
import { Card } from '@/src/components/ui/card';
import { HStack } from '@/src/components/ui/hstack';
import { ChevronRightIcon, Icon } from '@/src/components/ui/icon';
import { VStack } from '@/src/components/ui/vstack';
import { travelType, vehicleName } from '@/src/helpers/parser-names';
import { travelStatusColor, travelStatusTranslated } from '@/src/helpers/payment-status';
import { useMe } from '@/src/hooks';
import { getTravels } from '@/src/services/book.service';
import { getNotifications } from '@/src/services/notification.service';
import { Colors } from '@/src/utils/constants/Colors';
import { userRoles } from '@/src/utils/enum/role.enum';
import { travelStatus, travelTypeValues } from '@/src/utils/enum/travel.enum';
import { BookingResponse } from '@/src/utils/interfaces/booking.interface';
import { formatCLP } from '@/src/utils/formatters/currency';
dayjs.extend(utc);

export default function Booking() {
  const navigator = useNavigation();
  const { t } = useTranslation();
  const { user } = useMe();
  const [page, setPage] = useState(0);
  const [appendMode, setAppendMode] = useState(false);

  const roleType = user?.role === userRoles.USER_HOPPER ? 'hopper' : 'hoppy';
  const status = user?.role === userRoles.USER_HOPPER ? travelStatus.ACCEPT : undefined;

  const { data, isLoading } = useSWR(['/travels/booking', page], () => getTravels(user?.id, roleType, true, false, page, 10, status), {
    refreshInterval: 1000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true,
  });

  const [bookingDataPaginated, setBookingDataPaginated] = useState<any[]>(data?.result || []);

  const { data: notifications } = useSWR('/notifications/', () => getNotifications(user?.id!), {
    revalidateOnMount: true,
    errorRetryInterval: 5000,
  });

  const hasUnseenNotifications = notifications?.result.some((notification) => notification.seen) ?? false;

  useEffect(() => {
    if (data?.result) {
      if (appendMode && page > 0) {
        setBookingDataPaginated((prevData) => {
          const newItems = data.result.filter((newItem: { id: string }) => !prevData.some((existingItem) => existingItem.id === newItem.id));
          return [...prevData, ...newItems];
        });
        return;
      }

      setBookingDataPaginated(data.result);
    }
  }, [appendMode, data?.result, page]);

  useEffect(() => {
    setPage(0);
    setBookingDataPaginated([]);
  }, [user?.id, roleType]);

  const handlePrevPage = () => {
    if (page > 0) {
      setAppendMode(false);
      setPage((prevPage) => prevPage - 1);
    }
  };

  const handleNextPage = () => {
    if (data?.pagination && page < data.pagination.totalPages - 1) {
      setAppendMode(false);
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleEndReached = () => {
    if (isLoading) {
      return;
    }

    if (data?.pagination && page < data.pagination.totalPages - 1) {
      setAppendMode(true);
      setPage((prevPage) => prevPage + 1);
    }
  };

  const statusTravelType = travelType(t);
  const translatedVehicleName = vehicleName(t);

  const renderItem = ({ item }: { item: BookingResponse }) => {
    const { date, time } = formattedDate(item.programedTo);
    const translatedTravelStatus = travelStatusTranslated(t);
    const travelType = statusTravelType[item.type as travelTypeValues] || item.type;
    const vehicle = translatedVehicleName[item.vehicleType];
    const message = t('message.reservationMessage', {
      ns: 'utils',
      name: item?.hopper?.userInfo?.firstName,
      contactNumber: `${item?.hopper?.userInfo?.countryCode} ${item.hopper?.userInfo.phone}`,
      date: `${date} - ${time}`,
      carType: vehicle,
      fromAddress: item?.from?.address,
      toAddress: item.to.address,
    });

    return (
      <View className="relative py-4">
        {(item.status === travelStatus.ACCEPT || item.status === travelStatus.REQUEST) && (
          <Badge
            className="rounded-full absolute gap-1 self-start top-1 right-4 z-10"
            style={{
              backgroundColor: travelStatusColor[item.status as travelStatus],
            }}
          >
            <Text fontSize={10}>{translatedTravelStatus[item.status as travelStatus]}</Text>
          </Badge>
        )}
        <Card variant="outline" style={styles.card} key={item.id}>
          <HStack className="gap-1 items-center justify-between">
            <Box>
              <Text className="items-center gap-2" textColor={Colors.DARK_PURPLE} fontWeight={600} fontSize={20}>
                {travelType}
              </Text>
              <Text fontSize={12} fontWeight={400} textColor={Colors.GRAY}>
                {vehicle} - {item.totalPassengers}{' '}
                {Number(item.totalPassengers) > 1
                  ? t('booking.card.passengers', {
                      ns: 'booking',
                    })
                  : t('booking.card.passenger', {
                      ns: 'booking',
                    })}
              </Text>
            </Box>
            <VStack>
              <Box className="flex-row gap-2 items-center">
                <Calendar width={16} />
                <Text fontSize={14} fontWeight={400} textColor={Colors.DARK_PURPLE}>
                  {date}
                </Text>
              </Box>
              <Text fontWeight={400} fontSize={14} textColor={Colors.DARK_PURPLE} textAlign="right">
                {time}
              </Text>
            </VStack>
          </HStack>
          <HStack style={styles.card_description}>
            <Box className="gap-1">
              <Box className="flex-row gap-2 flex-wrap">
                <Routing width={18} height={18} />
                <Text fontSize={14} fontWeight={400} textColor={Colors.SECONDARY} className="w-[80%]">
                  {item.from.address} - {item.to.address}
                </Text>
              </Box>
              <Box className="flex-row gap-2">
                <UserSquare width={18} height={18} />
                <Text fontSize={14} fontWeight={400} textColor={Colors.SECONDARY}>
                  {item.passengerName}
                </Text>
              </Box>
              <Box className="flex-row gap-2">
                <Ticket width={18} height={18} />
                <Text fontSize={14} fontWeight={400} textColor={Colors.SECONDARY}>
                  ${formatCLP(Number(item?.price ?? 0))}
                </Text>
              </Box>
            </Box>
          </HStack>
          <HStack className="mt-4 justify-between">
            <Button
              onPress={() => {
                const url = `https://wa.me/${item.passengerContactCountryCode + item.passengerContact}?text=${encodeURIComponent(message)}`;
                Linking.openURL(url);
              }}
            >
              {t('booking.card.button', { ns: 'booking' })}
            </Button>
            <Pressable
              className="w-[40px] h-[40px] bg-[#9FE4DD] rounded-xl items-center justify-center"
              onPress={() =>
                router.push({
                  pathname: '/(booking)/[id]',
                  params: { id: item.id },
                })
              }
            >
              <Icon as={ChevronRightIcon} style={{ width: 24, height: 24 }} color={Colors.SECONDARY} />
            </Pressable>
          </HStack>
        </Card>
      </View>
    );
  };

  useEffect(() => {
    navigator.setOptions({
      header: () => (
        <Header
          title={t('booking.title', { ns: 'booking' })}
          icon={hasUnseenNotifications ? <NotificationActive /> : <Notification />}
          onPressIcon={() => router.push('/notification/')}
        />
      ),
    });
  }, [navigator, hasUnseenNotifications]);

  const formattedDate = (date: Date) => ({
    date: dayjs(date).utc(false).format('DD MMM. YYYY'),
    time: dayjs(date).utc(false).format('HH:mm A'),
  });

  return (
    <View style={styles.container}>
      <View style={styles.content} className="px-4 ">
        <FlatList
          data={bookingDataPaginated}
          renderItem={renderItem}
          keyExtractor={(item: { id: string }) => item.id.toString()}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150, gap: 12 }}
          ListFooterComponent={isLoading ? <ActivityIndicator /> : null}
          nestedScrollEnabled
          ListEmptyComponent={
            <NotBookings
              text={t('booking.hopper.bookings.description', {
                ns: 'booking',
              })}
            >
              <CalendarWhite />
            </NotBookings>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 32,
    gap: 16,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  bookings: {
    marginTop: 32,
    gap: 12,
  },
  card: {
    borderWidth: 0,
    borderRadius: 20,
    backgroundColor: Colors.LIGHT_GRADIENT_1,
  },
  card_description: {
    marginTop: 20,
    gap: 12,
    backgroundColor: Colors.WHITE,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  badge: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 40,
    marginTop: 12,
  },
});
