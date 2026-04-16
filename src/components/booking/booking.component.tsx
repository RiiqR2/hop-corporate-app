import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { router } from 'expo-router';
import { CalendarActive, Routing, UserSquare, Booking as BookingSVG, CalendarWhite } from '@/assets/svg';
import { formattedDate } from '@/src/helpers/parse-date';
import { travelType } from '@/src/helpers/parser-names';
import { travelStatusColor, travelStatusTranslated } from '@/src/helpers/payment-status';
import { useMe } from '@/src/hooks';
import { getTravels } from '@/src/services/book.service';
import { Colors } from '@/src/utils/constants/Colors';
import { userRoles } from '@/src/utils/enum/role.enum';
import { travelStatus, travelTypeValues } from '@/src/utils/enum/travel.enum';
import Advice from '../hopper/advice.component';
import { NotBookings } from '../notBookings/notBookings.component';
import { Text } from '../text/text.component';
import { Badge } from '../ui/badge';
import { Box } from '../ui/box';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { VStack } from '../ui/vstack';

export const Booking = () => {
  const { t } = useTranslation();

  const { user } = useMe();

  const [page, setPage] = useState(0);
  const [bookingDataPaginated, setBookingDataPaginated] = useState<any[]>([]);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const roleType = 'passenger';

  const { data, isLoading } = useSWR(
    user?.id ? ['/travels/bookings', user.id, page] : null,
    () => getTravels(user!.id, roleType, true, false, page),
    {
      refreshInterval: 1000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateOnMount: true,
      keepPreviousData: true,
    }
  );

  useEffect(() => {
    if (!data?.result) return;

    setBookingDataPaginated((prevData) => {
      // si estamos en página 0, reemplazamos la data completa
      if (page === 0) {
        return data.result;
      }

      // si es página siguiente, agregamos evitando duplicados
      const existingIds = new Set(prevData.map((item) => item.id));
      const newItems = data.result.filter((item: { id: string }) => !existingIds.has(item.id));

      return [...prevData, ...newItems];
    });

    setIsFetchingNextPage(false);
  }, [data?.result, page]);

  const handleEndReached = () => {
    if (!data?.pagination || isFetchingNextPage || isLoading) return;

    const currentPage = data.pagination.page;
    const totalPages = data.pagination.totalPages;

    if (currentPage < totalPages - 1) {
      setIsFetchingNextPage(true);
      setPage((prev) => prev + 1);
    }
  };

  const translatedStatusTravel = travelType(t);

  return (
    <View style={styles.bookings}>
      <Text fontSize={18} fontWeight={400} textColor={Colors.DARK_PURPLE}>
        {t('home.booking.title', { ns: 'home' })}
      </Text>
      <FlatList
        data={bookingDataPaginated}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 12,
        }}
        contentContainerClassName={!Boolean(bookingDataPaginated.length > 1) ? 'flex-1' : ''}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: any) => {
          const { date, time } = formattedDate(item.programedTo);
          const translatedTravelStatus = travelStatusTranslated(t);

          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(booking)/[id]',
                  params: { id: item.id },
                })
              }
              className="min-w-[350] relative py-4"
            >
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
              <Card variant="outline" style={styles.card}>
                <HStack className="gap-1 items-center">
                  <CalendarActive width={16} height={16} />
                  <Text className="items-center gap-2" textColor={Colors.SECONDARY} fontWeight={600} fontSize={14}>
                    {date} - {time}
                  </Text>
                </HStack>
                <HStack style={styles.card_description}>
                  <BookingSVG />
                  <Box className="gap-1 ">
                    <Text fontSize={20} fontWeight={600} textColor={Colors.DARK_PURPLE}>
                      {translatedStatusTravel[item.type as travelTypeValues]}
                    </Text>
                    <Box className="flex-row gap-2 shrink-1 max-w-[250] pr-2">
                      <Routing />
                      <Text fontSize={16} fontWeight={400}>
                        {item.from.address.slice(0, 25)} - {item.to.address.slice(0, 25)}
                      </Text>
                    </Box>
                    <Box className="flex-row gap-2">
                      <UserSquare />
                      <Text fontSize={16} fontWeight={400}>
                        {item.passengerName}
                      </Text>
                    </Box>
                  </Box>
                </HStack>
              </Card>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          !isLoading ? (
            <VStack className="flex-1">
              <NotBookings
                text={t('home.hopper.bookings.description', { ns: 'home' })}
                style={{
                  justifyContent: 'center',
                }}
                textStyle={{ paddingVertical: 10 }}
              >
                <CalendarWhite />
              </NotBookings>
              <Advice />
            </VStack>
          ) : null
        }
      />
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
