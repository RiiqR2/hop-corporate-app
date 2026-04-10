import { StyleSheet, View } from "react-native";
import dayjs from "dayjs";
import React, { Fragment, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { FlatList } from "react-native-gesture-handler";
import useSWR from "swr";
import { router, useNavigation } from "expo-router";
import { AvatarHopper, CalendarWhite } from "@/assets/svg";
import { Container, Header, NotBookings } from "@/src/components";
import { Text } from "@/src/components/text/text.component";
import { Box } from "@/src/components/ui/box";
import { Divider } from "@/src/components/ui/divider";
import { HStack } from "@/src/components/ui/hstack";
import { VStack } from "@/src/components/ui/vstack";
import { useMe } from "@/src/hooks";
import { getNotifications, markNotificationsAsSeen } from "@/src/services/notification.service";
import { Colors } from "@/src/utils/constants/Colors";
import { userRoles } from "@/src/utils/enum/role.enum";
import { notificationTypeValues } from "@/src/utils/interfaces/booking.notification.interface";
import { TravelNotification } from "@/src/utils/interfaces/notification.interface";
import { formatCLP } from '@/src/utils/formatters/currency';

export const HopperNotificationMessages = (): Record<notificationTypeValues, (data?: { name?: string; price?: number }) => JSX.Element> => ({
  [notificationTypeValues.DEPOSIT_RECEIVED]: (data) => (
    <Text>
      <Trans
        i18nKey="notifications_text.DEPOSIT_RECEIVED"
        ns="utils"
        components={{ custom: <Text textColor={Colors.VIOLET} fontWeight={600} /> }}
        values={{ price: formatCLP(data?.price) }}
      />
    </Text>
  ),
  [notificationTypeValues.HOPPER_CANCELLED]: (data) => (
    <Trans
      i18nKey="notifications_text.HOPPER_CANCELLED"
      ns="utils"
      components={{ custom: <Text fontWeight={600} /> }}
      values={{ name: data?.name }}
    />
  ),
  [notificationTypeValues.HOPPY_CANCELLED]: (data) => (
    <Trans
      i18nKey="notifications_text.HOPPY_CANCELLED"
      ns="utils"
      components={{ custom: <Text fontWeight={600} /> }}
      values={{ name: data?.name }}
    />
  ),
  [notificationTypeValues.USER_COMPLETE_TRAVEL]: (data) => (
    <Trans
      i18nKey="notifications_text.USER_COMPLETE_TRAVEL"
      ns="utils"
      components={{ custom: <Text fontWeight={600} /> }}
      values={{ name: data?.name }}
    />
  ),
  [notificationTypeValues.HOPPER_ACCEPT_TRAVEL]: (data) => (
    <Trans
      i18nKey="notifications_text.HOPPER_ACCEPT_TRAVEL"
      ns="utils"
      components={{ custom: <Text fontWeight={600} /> }}
      values={{ name: data?.name }}
    />
  ),
  [notificationTypeValues.COMMISSIONS]: () => (
    <Trans
      i18nKey="notifications_text.COMMISSIONS"
      ns="utils"
      components={{ custom: <Text fontWeight={600} /> }}
      values={{}}
    />),
  [notificationTypeValues.HOPPER_IN_SITE]: (data) => (
    <Trans
      i18nKey="notifications_text.HOPPER_IN_SITE"
      ns="utils"
      components={{ custom: <Text fontWeight={600} /> }}
      values={{ name: data?.name }}
    />
  ),
  [notificationTypeValues.TRAVEL_CHANGE]: () => (
    <Trans
      i18nKey="notifications_text.TRAVEL_CHANGE"
      ns="utils"
      components={{ custom: <Text fontWeight={600} /> }}
      values={{}}
    />),
  [notificationTypeValues.NEW_TRAVEL]: (data) => (
    <Trans
      i18nKey="notifications_text.NEW_TRAVEL"
      ns="utils"
      components={{ custom: <Text fontWeight={600} /> }}
      values={{ name: data?.name }}
    />
  ),
  [notificationTypeValues.TRAVEL_REASSIGNED]: (data) => (
    <Trans
      i18nKey="notifications_text.NEW_TRAVEL"
      ns="utils"
      components={{ custom: <Text fontWeight={600} /> }}
      values={{ name: data?.name }}
    />
  ),
  [notificationTypeValues.TRAVEL_ASSIGNED]: (data) => (
    <Trans
      i18nKey="notifications_text.NEW_TRAVEL"
      ns="utils"
      components={{ custom: <Text fontWeight={600} /> }}
      values={{ name: data?.name }}
    />
  ),
});


export const getNotificationMessage = (
  type: notificationTypeValues,
  data?: { name?: string, price: number },
): JSX.Element => {
  const translatedMessage = HopperNotificationMessages();
  const messageGenerator = translatedMessage[type];
  return messageGenerator ? messageGenerator(data) : <Text>Tienes una nueva notificación.</Text>;
};

export default function Notifications() {
  const navigator = useNavigation();
  const { t } = useTranslation();
  const { user } = useMe();
  const [page, setPage] = useState(0);
  const [notificationDataPaginated, setNotificationDataPaginated] = useState<
    any[]
  >([]);
  const { data } = useSWR(
    ["/notifications/", page],
    () => getNotifications(user?.id!),
    {
      refreshInterval: 1000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateOnMount: true,
    }
  );

  useEffect(() => {
    if (data?.result) {
      setPage(0);
    }
  }, [data?.result]);

  useEffect(() => {
    if (data?.result) {
      setNotificationDataPaginated((prevData) => {
        const newData = [...prevData];
        data.result.forEach((newItem) => {
          const existingItemIndex = newData.findIndex(
            (existingItem) => existingItem.id === newItem.id
          );

          if (existingItemIndex !== -1) {
            newData[existingItemIndex] = newItem;
          } else {
            newData.push(newItem);
          }
        });

        return newData;
      });
    }
  }, [data?.result]);

  const handleEndReached = () => {
    if (
      data?.pagination &&
      data.pagination.page < data.pagination.totalPages - 1
    ) {
      setPage(page + 1);
    }
  };

  useEffect(() => {
    navigator.setOptions({
      header: () => (
        <Header
          title={t('notifications.title', { ns: 'utils' })}
          arrow
          onPressArrow={() => router.back()}
        />
      ),
    });
  }, [navigator]);

  useEffect(() => {
    const ids = notificationDataPaginated.map((notification) => notification.id);
    (async () => markNotificationsAsSeen(ids))();
  }, [notificationDataPaginated]);


  return (
    <Container>
      <VStack space="md" style={styles.content} className="gap-5">
        <FlatList
          data={notificationDataPaginated}
          keyExtractor={(_, index) => index.toString()}
          contentContainerClassName="gap-5"
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          nestedScrollEnabled
          renderItem={({ item, index }: { item: TravelNotification, index: number }) => {
            const { type, created_at, metadata } = item;

            const hopper_name = `${metadata?.hopper?.userInfo?.firstName ?? ''} ${metadata?.hopper?.userInfo?.lastName ?? ''}`;
            const hoppy_name = `${metadata?.hoppy?.userInfo?.firstName ?? ''} ${metadata?.hoppy?.userInfo?.lastName ?? ''}`;
            const name = user?.role === userRoles.USER_HOPPER ? hoppy_name : hopper_name;
            const formattedDate = dayjs(created_at).format("DD/MM/YYYY");

            return (
              <>
                <HStack className="items-start space-x-4 gap-3">
                  <View className="rounded-full bg-[#E3E1F5]">
                    <AvatarHopper
                      width={38}
                      height={38}
                      color="#059669"
                    />
                  </View>
                  <Box className="flex-1 gap-1">
                    <Text
                      textColor={Colors.DARK_PURPLE}
                      fontWeight={400}
                      fontSize={14}
                    >
                      {getNotificationMessage(type, { name: name, price: item?.metadata?.payment })}
                    </Text>
                    <Text
                      fontSize={10}
                      fontWeight={300}
                      textColor={Colors.GRAY}
                    >
                      {formattedDate}
                    </Text>
                  </Box>
                </HStack>
                {index !== notificationDataPaginated.length - 1 && (
                  <Divider style={styles.divider} />
                )}
              </>
            );
          }}
          ListEmptyComponent={() => (
            <NotBookings
              text={t("notification_empty", { ns: "utils" })}
              style={{
                justifyContent: "center",
              }}
              textStyle={{ paddingVertical: 10 }}
            >
              <CalendarWhite />
            </NotBookings>)}
        />
      </VStack>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 36,
  },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: Colors.PRIMARY,
    marginTop: 12,
  },
  delete_notification: {
    width: 14,
    height: 14,
  },
});
