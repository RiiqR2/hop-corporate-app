import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';
import React, { ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl } from 'react-native-gesture-handler';
import useSWR from 'swr';
import { router, useNavigation } from 'expo-router';
import { CalendarWhite, ClockCustom, DolarCircle, Routing, Ticket, UserSquare, CarIcon } from '@/assets/svg';
import { Header, NotBookings } from '@/src/components';
import { Text } from '@/src/components/text/text.component';
import { Badge } from '@/src/components/ui/badge';
import { Box } from '@/src/components/ui/box';
import { Card } from '@/src/components/ui/card';
import { HStack } from '@/src/components/ui/hstack';
import { CheckCircleIcon, CloseCircleIcon, Icon } from '@/src/components/ui/icon';
import { travelType } from '@/src/helpers/parser-names';
import { useMe } from '@/src/hooks';
import { getTravels } from '@/src/services/book.service';
import { Colors } from '@/src/utils/constants/Colors';
import { userRoles } from '@/src/utils/enum/role.enum';
import { travelTypeValues } from '@/src/utils/enum/travel.enum';
import { BookingResponse } from '@/src/utils/interfaces/booking.interface';
import { formatCLP } from '@/src/utils/formatters/currency';

export default function History() {
  const navigator = useNavigation();
  const { t } = useTranslation();
  const { user } = useMe();
  const [page, setPage] = useState(0);
  const [bookingDataPaginated, setBookingDataPaginated] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const lastProcessedPageRef = useRef<number | null>(null);

  const roleType = useMemo(
    () => (user?.role === userRoles.USER_HOPPER ? 'hopper' : 'passenger'),
    [user?.role]
  );

  const { data, isLoading, mutate } = useSWR(
    user?.id ? ['/travels/history', user.id, page] : null,
    async () => {
      const response = await getTravels(
        user?.id,
        roleType,
        false,
        true,
        page,
        10,
        null,
        'DESC'
      );
      return response;
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateOnMount: true,
    }
  );

  useEffect(() => {
    navigator.setOptions({
      header: () => <Header title={t('title', { ns: 'history' })} />,
      gestureEnabled: false,
    });
  }, [navigator, t]);

  const formattedDate = (date: Date) => ({
    date: dayjs(date).format('DD MMM. YYYY'),
    time: dayjs(date).format('HH:mm A'),
  });

  const statusTravelParser = (translate: TFunction): Record<any, string> => ({
    COMPLETED: translate('travel_status.completed', { ns: 'history' }),
    CANCELLED: translate('travel_status.cancelled', { ns: 'history' }),
    START: translate('travel_status.start', { ns: 'history' }),
    END: translate('travel_status.completed', { ns: 'history' }),
  });

  const travelStatusTranslated = statusTravelParser(t);
  const travelTranslated = travelType(t);

  const statusColor: { [key: string]: string } = {
    COMPLETED: Colors.VIOLET,
    CANCELLED: Colors.ERROR,
    START: Colors.YELLOW,
    END: Colors.VIOLET,
  };

  const iconStatus: { [key: string]: ReactElement } = {
    COMPLETED: <Icon as={CheckCircleIcon} color={Colors.VIOLET} width={16} height={16} />,
    END: <Icon as={CheckCircleIcon} color={Colors.VIOLET} width={16} height={16} />,
    CANCELLED: <Icon as={CloseCircleIcon} color={Colors.ERROR} width={16} height={16} />,
    START: <ClockCustom color={Colors.YELLOW} width={16} height={16} />,
  };

  useEffect(() => {
    if (!data?.result) return;

    // evita procesar dos veces la misma página por revalidaciones
    if (lastProcessedPageRef.current === page) return;
    lastProcessedPageRef.current = page;

    setBookingDataPaginated((prevData) => {
      const result = Array.isArray(data.result) ? data.result : [];

      // página 0: reemplaza la lista completa
      if (page === 0) {
        return result;
      }

      // páginas siguientes: agrega al final, sin duplicados
      const existingIds = new Set(prevData.map((item) => item.id));
      const newItems = result.filter((item: { id: string }) => !existingIds.has(item.id));

      return [...prevData, ...newItems];
    });

    setIsLoadingMore(false);
  }, [data?.result, page]);

  const handleEndReached = () => {
    if (isLoading || isRefreshing || isLoadingMore) return;
    if (!data?.pagination) return;

    const currentPage = data.pagination.page;
    const totalPages = data.pagination.totalPages;

    if (currentPage < totalPages - 1) {
      setIsLoadingMore(true);
      setPage((prev) => prev + 1);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setIsLoadingMore(false);
    lastProcessedPageRef.current = null;

    try {
      const response = await getTravels(
        user?.id,
        roleType,
        false,
        true,
        0,
        10,
        null,
        'DESC'
      );

      setBookingDataPaginated(Array.isArray(response?.result) ? response.result : []);
      setPage(0);

      await mutate(response, false);
    } catch (error) {
      console.error('Error al refrescar', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content} className="px-4 ">
        <FlatList
          data={bookingDataPaginated}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3"
          contentContainerStyle={{ paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[Colors.PRIMARY]}
            />
          }
          renderItem={({ item }: { item: BookingResponse }) => {
            const { date } = formattedDate(item.programedTo);

            const translatedStatus = travelTranslated[item.type as travelTypeValues] || item.type;
            const currentStatus = travelStatusTranslated[item.status] || item.status;
            const commission = item.passengerCommission;
            const hopperName = item?.hopper?.userInfo?.firstName + ' ' + item?.hopper?.userInfo?.lastName;

            return (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/(history)/[id]',
                    params: {
                      id: item.id,
                    },
                  })
                }
                disabled={user?.role === userRoles.USER_PASSENGER}
              >
                <Card variant="outline" style={styles.card}>
                  <HStack className="gap-1 items-center justify-between">
                    <Box>
                      <Text className="items-center gap-2" textColor={Colors.DARK_PURPLE} fontWeight={600} fontSize={20}>
                        {translatedStatus}
                      </Text>
                      <Text fontSize={12} fontWeight={400} textColor={Colors.GRAY}>
                        {date}
                      </Text>
                    </Box>
                    <Box className="flex-row gap-2 items-center">
                      <Text fontSize={14} fontWeight={600} textColor={statusColor[item.status]}>
                        {currentStatus}
                      </Text>
                      {iconStatus[item.status]}
                    </Box>
                  </HStack>

                  <HStack style={styles.card_description}>
                    <Box className="gap-1">
                      <Box className="flex-row gap-2 flex-wrap">
                        <Routing />
                        <Text fontSize={16} fontWeight={400} textColor={Colors.SECONDARY} className="w-[80%]">
                          {item.from.address.slice(0, 25)} - {item.to.address.slice(0, 25)}
                        </Text>
                      </Box>
                      <Box className="flex-row gap-2">
                        <CarIcon />
                        <Text fontSize={16} fontWeight={400} textColor={Colors.SECONDARY}>
                          {hopperName}
                        </Text>
                      </Box>
                      <Box className="flex-row gap-2">
                        <Ticket width={24} height={24} />
                        <Text fontSize={16} fontWeight={400} textColor={Colors.SECONDARY}>
                          Valor ${formatCLP(Number(item?.price ?? 0))}
                        </Text>
                      </Box>
                    </Box>
                  </HStack>
                </Card>
              </Pressable>
            );
          }}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isLoadingMore ? <ActivityIndicator color={Colors.PRIMARY} style={{ marginVertical: 16 }} /> : null
          }
          nestedScrollEnabled
          ListEmptyComponent={
            !isLoading ? (
              <NotBookings text={t('hopper.bookings.description', { ns: 'history' })}>
                <CalendarWhite />
              </NotBookings>
            ) : null
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  content: {
    flexGrow: 1,
  },
  bookings: {
    marginTop: 32,
    gap: 12,
  },
  card: {
    borderColor: Colors.PRIMARY,
    borderWidth: 2,
    borderRadius: 20,
  },
  card_description: {
    marginTop: 20,
    gap: 12,
    backgroundColor: Colors.LIGHT_GRADIENT_1,
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