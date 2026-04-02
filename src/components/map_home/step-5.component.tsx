import { Image } from 'react-native';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { router } from 'expo-router';
import { AvatarHopper, CalendarActive, ClockActive, ElectricCar, Sedan, Suv, Ticket, Van } from '@/assets/svg';
import { vehicleName } from '@/src/helpers/parser-names';
import { useMe } from '@/src/hooks';
import { getUserById } from '@/src/services/auth.service';
import { Colors } from '@/src/utils/constants/Colors';
import { HomeRoutesLink } from '@/src/utils/enum/home.routes';
import { paymentStatus } from '@/src/utils/enum/payment.enum';
import { BookingData } from '@/src/utils/interfaces/booking.interface';
import { Button } from '../button/button.component';
import { Text } from '../text/text.component';
import { Box } from '../ui/box';
import { HStack } from '../ui/hstack';
import { VStack } from '../ui/vstack';
import { formatCLP } from '@/src/utils/formatters/currency';

dayjs.extend(utc);

type VehicleIconMap = {
  [key: string]: JSX.Element;
};

export const Step5Booking = (props: { formattedDate: string; formattedTime: string; data: BookingData; date: string; travelId: string }) => {
  const { t } = useTranslation();

  const { data: userHopper } = useSWR('/user/one', () => getUserById(props.data.hopperId), {
    revalidateOnFocus: true,
  });

  const { user } = useMe();

  const { data, date: dateProgrammed } = props;

  const date = dayjs(data.programedTo);

  const TIME = date.format('DD MMM. YYYY');
  const HOUR = date.format('HH:mm');

  const vehicleTypeIcon = [
    {
      type: 'vans',
      name: 'Van',
      icon: <Van width={35} height={35} />,
    },
    {
      type: 'sedan',
      icon: <Sedan width={35} height={35} />,
    },
    {
      type: 'suv',
      icon: <Suv width={35} height={35} />,
    },
    {
      type: 'electric',
      icon: <ElectricCar width={35} height={35} />,
    },
  ];

  const vehicleIconMap = vehicleTypeIcon.reduce((acc, item) => {
    acc[item.type.toUpperCase()] = item.icon;
    return acc;
  }, {} as VehicleIconMap);

  const carType = data.carType.toUpperCase();
  const Icon = vehicleIconMap[carType] || null;

  const formattedDateFN = (date: Date | string) => ({
    date: dayjs(date).utc(true).format('DD MMM. YYYY'),
    time: dayjs(date).utc(true).format('HH:mm A'),
  });

  const { date: parsedFormattedDate, time } = formattedDateFN(data.programedTo ? data.programedTo : dateProgrammed);

  const translatedVehicleName = vehicleName(t);

  return (
    <VStack space="md" className="items-center gap-8">
      <Text fontSize={24} fontWeight={400} textAlign="center">
        {`${userHopper?.userInfo.firstName} ${userHopper?.userInfo.lastName}`} {t('home.map_home.fifty_sheet.accept_reservation', { ns: 'home' })}
      </Text>

      <VStack className="items-center gap-2">
        {userHopper?.userInfo.profilePic ? (
          <Image
            source={{
              uri: userHopper?.userInfo.profilePic,
            }}
            width={120}
            height={120}
            className="rounded-full"
          />
        ) : (
          <AvatarHopper width={120} height={120} />
        )}
      </VStack>
      <Box className="gap-2">
        <HStack
          className="rounded-full py-2 px-6 items-center gap-2"
          style={{
            backgroundColor: Colors.LIGHT_GRADIENT_1,
            height: 44,
            width: 300,
          }}
        >
          {Icon}
          <Text fontSize={16} fontWeight={400}>
            {translatedVehicleName[data?.carType!]}
          </Text>
          <Text textColor={Colors.GRAY} fontWeight={400}>
            {data.numberOfPassengers} -{' '}
            {Number(data.numberOfPassengers) > 1 ? t('booking.card.passengers', { ns: 'booking' }) : t('booking.card.passenger', { ns: 'booking' })}
          </Text>
        </HStack>
        <HStack
          className="rounded-full py-2 px-6 items-center gap-2"
          style={{
            backgroundColor: Colors.LIGHT_GRADIENT_1,
            height: 44,
            width: 300,
          }}
        >
          <CalendarActive width={28} height={28} />
          <Text fontSize={16} fontWeight={400}>
            {parsedFormattedDate ? parsedFormattedDate : TIME}
          </Text>
          <ClockActive width={28} height={28} />
          <Text fontSize={16} fontWeight={400}>
            {time ? time : HOUR}
          </Text>
        </HStack>
        <HStack
          className="rounded-full py-2 px-6 items-center gap-2"
          style={{
            backgroundColor: Colors.LIGHT_GRADIENT_1,
            height: 44,
            width: 300,
          }}
        >
          <Ticket width={35} height={35} />
          <Text fontSize={16} fontWeight={400}>
            {t('home.map_home.fifty_sheet.value', { ns: 'home' })}
          </Text>
          <Text textColor={Colors.GRAY} fontWeight={400}>
            ${formatCLP(Number(data?.price ?? 0))}
          </Text>
        </HStack>
      </Box>
      <Button
        onPress={() =>
          router.replace({
            pathname: HomeRoutesLink.CONFIRMATION,
            params: {
              commission: data.hoppyCommission,
              type: paymentStatus.FINISHED,
              role: user?.role,
              travelId: props.travelId,
            },
          })
        }
        stretch
      >
        {t('home.map_home.fourthy_sheet.confirm', { ns: 'home' })}
      </Button>
    </VStack>
  );
};
