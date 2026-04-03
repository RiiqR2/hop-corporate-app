import { Pressable, StyleSheet, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native-gesture-handler';
import useSWR from 'swr';
import { router } from 'expo-router';
import { Booking, Calendar, CalendarActive, Location, MessageActive, Routing, UserSquare } from '@/assets/svg';
import { formattedDate } from '@/src/helpers/parse-date';
import { travelType } from '@/src/helpers/parser-names';
import { paymentColor, paymentIcon, paymentTextColor } from '@/src/helpers/payment-status';
import { useMe } from '@/src/hooks';
import { getTravels } from '@/src/services/book.service';
import { Colors } from '@/src/utils/constants/Colors';
import { HomeRoutesLink } from '@/src/utils/enum/home.routes';
import { paymentStatus } from '@/src/utils/enum/payment.enum';
import { userRoles } from '@/src/utils/enum/role.enum';
import { travelStatus, travelTypeValues } from '@/src/utils/enum/travel.enum';
import { BookingResponseNotification } from '@/src/utils/interfaces/booking.interface';
import { Text } from '../text/text.component';
import { Badge } from '../ui/badge';
import { Box } from '../ui/box';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { VStack } from '../ui/vstack';
import Advice from './advice.component';
import { formatCLP } from '@/src/utils/formatters/currency';

export const BookingsHopper = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [selectedTab, setSelectedTab] = useState<'bookings' | 'requests'>('bookings');

  const [bookingDataPaginated, setBookingDataPaginated] = useState<any[]>([]);

  const { user } = useMe();


  const roleType = user?.role === userRoles.USER_HOPPER ? 'hopper' : 'hoppy';
  const status = selectedTab === 'requests' ? travelStatus.REQUEST : undefined;
  const type = selectedTab === 'bookings' ? roleType : undefined;

  const { data: travel, mutate } = useSWR(['/travels/bookings', page], () => getTravels(user?.id, type, true, false, page, 10, status, 'ASC'), {
    refreshInterval: 5000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true,
  });

  useEffect(() => {
    if (travel?.result) {
      setPage(0);
    }

    mutate();
  }, [travel?.result, selectedTab, mutate]);

  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (Boolean(travel?.result?.length) && travel) {
      setBookingDataPaginated((prevData) => {
        if (isFirstLoad.current) {
          isFirstLoad.current = false;
          return [...travel.result];
        }

        const newData = [...prevData];
        travel.result.forEach((newItem: { id: string }) => {
          const existingItemIndex = newData.findIndex((existingItem) => existingItem.id === newItem.id);

          if (existingItemIndex !== -1) {
            newData[existingItemIndex] = newItem;
          } else {
            newData.push(newItem);
          }
        });

        return [...newData];
      });
    } else {
      setBookingDataPaginated([]);
    }
  }, [travel?.result, selectedTab]);

  useEffect(() => {
    setBookingDataPaginated([]);
  }, [selectedTab]);

  const handleEndReached = () => {
    if (travel?.pagination && travel.pagination.page < travel.pagination.totalPages - 1) {
      setPage(page + 1);
    }
  };

  const translatedStatus = travelType(t);

  return (
    <View className="mt-6">
      <HStack className="gap-4 mb-4">
        <Pressable
          onPress={() => {
            setSelectedTab('bookings');
            mutate();
          }}
        >
          <Text fontSize={16} fontWeight={selectedTab === 'bookings' ? 700 : 400} textColor={selectedTab === 'bookings' ? Colors.DARK_PURPLE : Colors.GRAY}>
            {t('home.hopper.bookings.title', { ns: 'home' })}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setSelectedTab('requests');
            mutate();
          }}
        >
          <Text fontSize={16} fontWeight={selectedTab === 'requests' ? 700 : 400} textColor={selectedTab === 'requests' ? Colors.DARK_PURPLE : Colors.GRAY}>
            {t('home.hopper.bookings_request.title', { ns: 'home' })}
          </Text>
        </Pressable>
      </HStack>
      {bookingDataPaginated?.length > 0 ? (
        <FlatList
          data={bookingDataPaginated}
          horizontal
          keyExtractor={(item, index) => index.toString()}
          className="mt-4"
          contentContainerClassName="gap-2"
          showsHorizontalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          renderItem={({ item, index }: { item: BookingResponseNotification; index: number }) => {
            const { date, time } = formattedDate(item?.programedTo);
            const Icon = paymentIcon[item.paymentStatus as paymentStatus];

            return (
              <Pressable
                className="min-w-[350]"
                key={index}
                onPress={() =>
                  router.push({
                    pathname: HomeRoutesLink.MAP_HOPPER,
                    params: {
                      travel_id: item.id,
                    },
                  })
                }
              >
                <Card variant="outline" style={styles.card}>
                  <HStack className="gap-1 items-center">
                    <CalendarActive width={16} height={16} />
                    <Text className="items-center gap-2" textColor={Colors.SECONDARY} fontWeight={600} fontSize={14}>
                      {date} - {time}
                    </Text>
                  </HStack>
                  <VStack className="mt-2 gap-2">
                    <Box className="gap-2 flex-row items-center">
                      <Booking />
                      <Text fontSize={20} fontWeight={600} textColor={Colors.DARK_PURPLE}>
                        {translatedStatus[item.type as travelTypeValues]}
                      </Text>
                    </Box>
                    <Box className="flex-row gap-2 shrink-1 max-w-[250] pr-2">
                      <Routing />
                      <Text fontSize={16} textColor={Colors.GRAY} fontWeight={400} numberOfLines={1} maxLength={25}>
                        {item.from.address?.slice(0, 25)} - {item.to.address?.slice(0, 25)}
                      </Text>
                    </Box>
                    <Box className="flex-row gap-2">
                      <UserSquare />
                      <Text fontSize={16} textColor={Colors.GRAY} fontWeight={400}>
                        {item.passengerName}
                      </Text>
                    </Box>
                    <Box className="flex-row gap-2">
                      <MessageActive />
                      <Text fontSize={16} textColor={Colors.GRAY} fontWeight={400}>
                        {item.passengerContactCountryCode} {item.passengerContact}
                      </Text>
                    </Box>
                    <HStack className="justify-between">
                      <Box className="flex-row items-center gap-2">
                        <Location color={Colors.SECONDARY} />
                        <Text textColor={Colors.SECONDARY} underline fontSize={14}>
                          {t('booking.modal_hopper.at_point', { ns: 'booking' })}
                        </Text>
                      </Box>
                      <Badge
                        className="rounded-full gap-1"
                        style={{
                          backgroundColor: paymentColor[item.paymentStatus as paymentStatus],
                        }}
                      >
                        <Icon
                          // @ts-ignore
                          color={paymentTextColor[item.paymentStatus as paymentStatus]}
                          width={16}
                          height={16}
                        />
                        <Text fontSize={16} fontWeight={600} textColor={paymentTextColor[item.paymentStatus as paymentStatus]}>
                          ${formatCLP(Number(item?.price ?? 0))}
                        </Text>
                      </Badge>
                    </HStack>
                  </VStack>
                </Card>
              </Pressable>
            );
          }}
        />
      ) : (
        <>
          <Box className="mt-4 rounded-[20px] py-[14px] bg-[#E1F5F3]">
            <HStack className="px-5 gap-3 items-center">
              <View className="bg-[#9FE4DD] rounded-full p-2">
                <Calendar />
              </View>
              <Text textColor={Colors.GRAY} fontSize={16} fontWeight={400}>
                {selectedTab === 'bookings'
                  ? t('home.hopper.bookings.description', { ns: 'home' })
                  : t('home.hopper.bookings_request.description', { ns: 'home' })}
              </Text>
            </HStack>
          </Box>
          <Advice />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bookings: {
    marginTop: 32,
    gap: 12,
  },
  card: {
    borderColor: Colors.PRIMARY,
    borderWidth: 2,
    borderRadius: 20,
    flex: 1,
  },
  card_description: {
    marginTop: 20,
    gap: 12,
  },
});
