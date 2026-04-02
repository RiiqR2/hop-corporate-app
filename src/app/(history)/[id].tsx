import { StyleSheet, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { router, useNavigation } from 'expo-router';
import { ProfileActive, ReserveFilled, Routing } from '@/assets/svg';
import { Container, Header } from '@/src/components';
import { Text } from '@/src/components/text/text.component';
import { Badge } from '@/src/components/ui/badge';
import { Box } from '@/src/components/ui/box';
import { HStack } from '@/src/components/ui/hstack';
import { VStack } from '@/src/components/ui/vstack';
import { formattedDate } from '@/src/helpers/parse-date';
import { travelType } from '@/src/helpers/parser-names';
import { useMe } from '@/src/hooks';
import { getTravelById } from '@/src/services/book.service';
import { Colors } from '@/src/utils/constants/Colors';
import { userRoles } from '@/src/utils/enum/role.enum';
import { travelTypeValues } from '@/src/utils/enum/travel.enum';
import { formatCLP } from '@/src/utils/formatters/currency';

export default function History() {
  const { id } = useRoute().params as { id: string };
  const navigator = useNavigation();
  const { t } = useTranslation();
  const { user } = useMe();
  const { data } = useSWR('/travel/one', () => getTravelById(id), {
    revalidateOnMount: true,
  });

  const travelTranslated = travelType(t);

  const translatedStatus = travelTranslated[data?.type as travelTypeValues] || data?.type;

  useEffect(() => {
    navigator.setOptions({
      header: () => <Header title={translatedStatus ?? ''} arrow onPressArrow={() => router.back()} />,
      gestureEnabled: false,
    });
  }, [navigator, translatedStatus, id]);

  const { date, time } = formattedDate(data?.programedTo!);

  return (
    <Container>
      <Text textColor={Colors.DARK_GREEN} fontSize={18} fontWeight={600}>
        {date} - {time}
      </Text>
      <HStack style={styles.card_description}>
        <Box className="gap-1">
          <Box className="flex-row gap-2 flex-wrap">
            <Routing />
            <Text fontSize={16} fontWeight={400} className="w-[80%]">
              {data?.from.address} - {data?.to.address}
            </Text>
          </Box>
          <Box className="flex-row gap-2">
            <ProfileActive />
            <Text fontSize={16} fontWeight={400}>
              {data?.passengerName}
            </Text>
          </Box>
          <Box className="flex-row gap-2">
            <ReserveFilled width={24} height={24} />
            <Text fontSize={16} fontWeight={400}>
              {`${data?.hopper?.userInfo.firstName ?? ''} ${data?.hopper?.userInfo.lastName ?? ''}`}
            </Text>
          </Box>
        </Box>
      </HStack>
      <VStack className="mt-8 gap-2">
        <Text textColor={Colors.DARK_GREEN} fontSize={18} fontWeight={400}>
          {t('service_detail', { ns: 'history' })}
        </Text>
        <Badge className="bg-[#E1F5F3] rounded-md justify-between">
          <Text fontSize={16} fontWeight={400} textColor={Colors.DARK_GREEN}>
            {t('trip_value', { ns: 'history' })}
          </Text>
          <Text fontSize={16} fontWeight={400} textColor={Colors.DARK_GREEN}>
            $ {formatCLP(Number(data?.price ?? 0))}
          </Text>
        </Badge>
        <Badge className="bg-[#E1F5F3] rounded-md justify-between">
          <Text fontSize={16} fontWeight={400} textColor={Colors.DARK_GREEN}>
            {t('service_fees', { ns: 'history' })}
          </Text>
          <Text fontSize={16} fontWeight={400} textColor={Colors.DARK_GREEN}>
            -{((data?.appCommission || 0) + (data?.hoppyCommission || 0)).toFixed(2)}
          </Text>
        </Badge>
        <Badge className="bg-[#E1F5F3] rounded-md justify-between">
          <Text fontSize={16} fontWeight={400} textColor={Colors.DARK_GREEN}>
            {t('tolls', { ns: 'history' })}
          </Text>
          <Text fontSize={16} fontWeight={400} textColor={Colors.DARK_GREEN}>
            ${data?.tollsCommission?.toFixed(2) ?? 0}
          </Text>
        </Badge>
      </VStack>
      <View className="h-auto bg-[#9FE4DD] mt-6 rounded-full flex-row justify-between py-1 px-2 items-center">
        <Text fontSize={20} fontWeight={400} textColor={Colors.DARK_GREEN}>
          {t('net_earnings', { ns: 'history' })}
        </Text>
        <Text fontSize={28} fontWeight={600} textColor={Colors.DARK_GREEN}>
          ${user?.role === userRoles.USER_HOPPER ? (data?.hopperCommission?.toFixed(2) ?? 0) : (data?.hoppyCommission?.toFixed(2) ?? 0)}
        </Text>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  card_description: {
    marginTop: 20,
    gap: 12,
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
});
