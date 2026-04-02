import { Pressable, StyleSheet, View } from 'react-native';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native-gesture-handler';
import useSWR from 'swr';
import { router, useNavigation } from 'expo-router';
import { ArrowLeftFilled, ArrowRightFilled } from '@/assets/svg';
import { Container, Header, Text } from '@/src/components';
import { Badge } from '@/src/components/ui/badge';
import { Box } from '@/src/components/ui/box';
import { HStack } from '@/src/components/ui/hstack';
import { VStack } from '@/src/components/ui/vstack';
import { travelType } from '@/src/helpers/parser-names';
import { paymentColor, paymentIcon, paymentTextColor } from '@/src/helpers/payment-status';
import { scaleSize } from '@/src/helpers/scale-size';
import { getComissions, getTravels } from '@/src/services/book.service';
import { Colors } from '@/src/utils/constants/Colors';
import { ProfileRoutesLink } from '@/src/utils/enum/profile.routes';
import { userRoles } from '@/src/utils/enum/role.enum';
import { travelStatus, travelTypeValues } from '@/src/utils/enum/travel.enum';
import { BookingResponse } from '@/src/utils/interfaces/booking.interface';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
/* eslint-disable import/order */
import localeData from 'dayjs/plugin/localeData';
import { getLocales } from 'expo-localization';
import { paymentStatus } from '@/src/utils/enum/payment.enum';
import { BarChart, barDataItem } from 'react-native-gifted-charts';
import { useMe } from '@/src/hooks';

dayjs.extend(localeData);
const language = getLocales()[0].languageCode || 'es';
dayjs.locale(language);

const formattedDate = (date: Date) => ({
  date: dayjs(date).utc(false).format('DD MMM. YYYY'),
  time: dayjs(date).utc(false).format('HH:mm A'),
});

export default function Wallet() {
  const { t } = useTranslation();
  const navigator = useNavigation();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [page, setPage] = useState(0);
  const [bookingDataPaginated, setBookingDataPaginated] = useState<any[]>([]);

  const { user } = useMe();

  const { data: userComissions, mutate } = useSWR('/user/comissions', () => getComissions(user?.id!, currentYear, currentMonth + 1));

  const { data, isLoading } = useSWR(['/travels/bookings/wallet', page], () =>
    getTravels(user?.id, user?.role === userRoles.USER_HOPPER ? 'hopper' : 'hoppy', false, true, page, 10, travelStatus.END)
  );

  const handleMonthChange = async (direction: 'prev' | 'next') => {
    let newMonth = currentMonth + (direction === 'next' ? 1 : -1);
    let newYear = currentYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);

    await getComissions(user?.id!, newYear, newMonth + 1);
    mutate();
  };

  const chartData: barDataItem[] =
    userComissions?.week?.map((item: { weekStart: string; weekEnd: string; totalCommission: string }) => {
      const start = dayjs(item.weekStart).format('DD');
      const end = dayjs(item.weekEnd).format('DD');

      return {
        value: parseFloat(item.totalCommission) || 0,
        label: `${start} - ${end}`,
        frontColor: Colors.PRIMARY,
      };
    }) ?? [];

  const total = userComissions?.month.totalCommission || 0;
  const sections = 5;
  const step = Math.ceil(total / sections);
  const maxValue = step * sections;

  const yAxisLabelTexts = Array.from({ length: sections + 1 }, (_, i) => `${((step * i) / 1000).toFixed(0)}k`);

  const renderItem = useCallback(({ item }: { item: BookingResponse }) => {
    const { date, time } = formattedDate(item.programedTo);
    const status = travelType(t);
    const translatedStatus = status[item.type as travelTypeValues] || item.type;
    const Icon = paymentIcon[item.paymentStatus as paymentStatus];

    return (
      <HStack style={styles.item} key={item.id} className="justify-between items-center mt-3">
        <VStack>
          <Text fontSize={20} fontWeight={600} textColor={Colors.DARK_GREEN}>
            {translatedStatus}
          </Text>
          <Text fontSize={14} fontWeight={400} textColor={Colors.DARK_GREEN}>
            {date} - {time}
          </Text>
        </VStack>
        <Badge
          style={{
            backgroundColor: paymentColor[item.paymentStatus as paymentStatus],
          }}
          className="rounded-full gap-2"
        >
          <Icon
            // @ts-ignore
            color={paymentTextColor[item.paymentStatus as paymentStatus]}
            width={24}
            height={24}
          />
          <Text fontSize={14} fontWeight={400} textColor={Colors.DARK_GREEN}>
            ${user?.role === userRoles.USER_HOPPER ? Number(item.hopperCommission).toFixed(2) : Number(item.hoppyCommission).toFixed(2)}
          </Text>
        </Badge>
      </HStack>
    );
  }, []);

  const handleEndReached = () => {
    if (data?.pagination && data.pagination.page < data.pagination.totalPages - 1) {
      setPage(page + 1);
    }
  };

  useEffect(() => {
    navigator.setOptions({
      header: () => <Header title={t('title', { ns: 'wallet' })} menu onPressMenu={() => router.push(ProfileRoutesLink.BANK_ACCOUNT)} />,
    });
  }, []);

  useEffect(() => {
    if (data?.result) {
      setPage(0);
    }
  }, [data?.result]);

  useEffect(() => {
    if (data?.result) {
      setBookingDataPaginated((prevData) => {
        const newData = [...prevData];
        data.result.forEach((newItem: { id: string }) => {
          const existingItemIndex = newData.findIndex((existingItem) => existingItem.id === newItem.id);

          if (existingItemIndex !== -1) {
            newData[existingItemIndex] = newItem;
          } else {
            newData.push(newItem);
          }
        });

        const updatedData = newData.filter((item) => data.result.some((newItem: { id: string }) => newItem.id === item.id));

        return updatedData;
      });
    }
  }, [data?.result]);

  return (
    <Container>
      <View style={{ flex: 1 }} collapsable={false}>
        <Box className="mt-7 flex-row justify-between">
          <Pressable onPress={() => handleMonthChange('prev')}>
            <ArrowLeftFilled />
          </Pressable>

          <Text fontSize={20} fontWeight={600} textColor={Colors.DARK_GREEN} transform="capitalize">
            {`${dayjs().month(currentMonth).format('MMMM')} ${currentYear}`}
          </Text>

          <Pressable onPress={() => handleMonthChange('next')}>
            <ArrowRightFilled />
          </Pressable>
        </Box>
        <Box className="mt-6">
          <Text textAlign="center" fontSize={16} fontWeight={400} textColor={Colors.DARK_GREEN}>
            {t('total', { ns: 'wallet' })}
          </Text>
        </Box>
        <VStack className="items-center mt-7">
          <Text fontSize={32} fontWeight={600} textColor={Colors.DARK_GREEN}>
            ${userComissions?.month.totalCommission}
          </Text>
        </VStack>
        <View className="">
          <BarChart
            data={chartData}
            barWidth={30}
            spacing={40}
            noOfSections={5}
            maxValue={maxValue}
            isAnimated
            yAxisTextStyle={{ color: Colors.DARK_GREEN }}
            xAxisLabelTextStyle={{ color: Colors.DARK_GREEN }}
            yAxisLabelTexts={yAxisLabelTexts}
            lineBehindBars={false}
            color={Colors.PRIMARY}
            hideRules={true}
            leftShiftForTooltip={2}
            parentWidth={300}
            adjustToWidth
            width={scaleSize(315)}
            renderTooltip={(props: { value: string }) => (
              <View style={styles.tooltipContainer}>
                <View style={styles.tooltipArrow} />
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>${props.value || 0}</Text>
                </View>
              </View>
            )}
          />
        </View>
      </View>
      <Box className="mt-6">
        <Text fontSize={18} fontWeight={400} textColor={Colors.DARK_GREEN}>
          {t('last_comissions', { ns: 'wallet' })}
        </Text>
        <FlatList
          data={bookingDataPaginated}
          renderItem={renderItem}
          keyExtractor={(item: { id: string }) => item.id.toString()}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150, gap: 12 }}
          ListFooterComponent={isLoading ? <Text>Loading more...</Text> : <></>}
          nestedScrollEnabled
        />
      </Box>
    </Container>
  );
}

const styles = StyleSheet.create({
  item: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.SECONDARY,
    backgroundColor: Colors.LIGHT_GRADIENT_1,
    padding: 10,
  },
  tooltipContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    left: 35,
  },

  tooltip: {
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.DARK_GREEN,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },

  tooltipArrow: {
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: Colors.DARK_GREEN,
    marginRight: -1,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  tooltipText: {
    color: Colors.DARK_GREEN,
    fontSize: 14,
  },
});
