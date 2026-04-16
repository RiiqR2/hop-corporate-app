import { Image, StyleSheet, View } from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { router } from 'expo-router';
import { AirplaneArrival, AvatarHopper, CalendarActive, ClockActive, DolarCircle, Room, UserSquare } from '@/assets/svg';
import { Button, Text } from '@/src/components';
import { Badge } from '@/src/components/ui/badge';
import { Box } from '@/src/components/ui/box';
import { Center } from '@/src/components/ui/center';
import { HStack } from '@/src/components/ui/hstack';
import { CloseCircleIcon, Icon } from '@/src/components/ui/icon';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/src/components/ui/modal';
import { VStack } from '@/src/components/ui/vstack';
import { formattedDate } from '@/src/helpers/parse-date';
import { vehicleName } from '@/src/helpers/parser-names';
import { getUserById } from '@/src/services/auth.service';
import { Colors } from '@/src/utils/constants/Colors';
import { HomeRoutesLink } from '@/src/utils/enum/home.routes';
import { paymentStatus } from '@/src/utils/enum/payment.enum';
import { travelTypeValues } from '@/src/utils/enum/travel.enum';
import { User } from '@/src/utils/interfaces/auth.interface';
import { TravelNotification } from '@/src/utils/interfaces/booking.notification.interface';
import { formatCLP } from '@/src/utils/formatters/currency';

export const ModalBook = (props: { isOpen: boolean; handleClose: VoidFunction; travel: TravelNotification; user: User }) => {
  const { handleClose, travel, user } = props;
  const { t } = useTranslation();
  const { data: userHopper } = useSWR('user/one', () => getUserById(travel?.metadata?.hopper.id));

  const { date, time } = formattedDate(travel?.metadata?.travel?.programedTo);

  const translatedVehicleName = vehicleName(t);

  return (
    <Center className="h-auto w-[100%] bg-slate-800">
      <Modal isOpen={true} onClose={() => handleClose()} style={{ paddingHorizontal: 16 }}>
        <ModalBackdrop />
        <ModalContent className="rounded-[20px] bg-[#E3E1F5] w-[100%]">
          <ModalHeader className="justify-end">
            <ModalCloseButton onPress={() => handleClose()} className="items-end">
              <Icon as={CloseCircleIcon} size="md" color={Colors.GRAY} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <VStack space="md" className="items-center gap-8">
              <Text fontSize={24} fontWeight={400} textAlign="center">
                {`${userHopper?.userInfo.firstName} ${userHopper?.userInfo.lastName}`}{' '}
                {t('home.map_home.fifty_sheet.accept_reservation', {
                  ns: 'home',
                })}
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
              <Box className="gap-2 w-full">
                <HStack
                  className="rounded-full py-2 px-6 items-center gap-2"
                  style={{
                    backgroundColor: Colors.WHITE,
                    height: 44,
                    width: '100%',
                  }}
                >
                  <Text fontSize={16} fontWeight={400}>
                    {translatedVehicleName[travel?.metadata?.travel?.vehicleType!]}
                  </Text>
                  <Text textColor={Colors.GRAY} fontWeight={400}>
                    {travel?.metadata?.travel?.totalPassengers} -{' '}
                    {Number(travel?.metadata?.travel?.totalPassengers) > 1
                      ? t('booking.card.passengers', { ns: 'booking' })
                      : t('booking.card.passenger', { ns: 'booking' })}
                  </Text>
                </HStack>
                <HStack
                  className="rounded-full py-2 px-6 items-center gap-2 w-full"
                  style={{
                    backgroundColor: Colors.WHITE,
                    height: 44,
                  }}
                >
                  <View className="w-[50%] flex-row items-center gap-2">
                    <CalendarActive width={28} height={28} />
                    <Text fontSize={16} fontWeight={400}>
                      {date ? date : ''}
                    </Text>
                  </View>
                  <View className="w-[50%] flex-row items-center gap-2">
                    <ClockActive width={28} height={28} />
                    <Text fontSize={16} fontWeight={400}>
                      {time ? time : ''}
                    </Text>
                  </View>
                </HStack>
                <HStack
                  className="rounded-full py-2 px-6 items-center gap-2"
                  style={{
                    backgroundColor: Colors.WHITE,
                    height: 44,
                  }}
                >
                  <HStack className="gap-2 items-center w-[50%]">
                    <UserSquare width={28} height={28} />
                    <Text fontSize={16} fontWeight={400}>
                      {travel?.metadata?.travel?.passengerName}
                    </Text>
                  </HStack>
                  {(travel?.metadata.travel.type === travelTypeValues.DROPOFF || 
                  travel?.metadata.travel.type === travelTypeValues.PROGRAMED ||
                  travel?.metadata.travel.type === travelTypeValues.INSTANT) && (
                    <HStack className="gap-2 items-center w-[50%]">
                      <Room width={28} height={28} />
                      <Text fontSize={16} fontWeight={400}>
                        {travel?.metadata?.travel?.passengerRoom}
                      </Text>
                    </HStack>
                  )}
                  {travel?.metadata.travel.type === travelTypeValues.PICKUP && (
                    <HStack className="gap-2 items-center w-[50%]">
                      <AirplaneArrival width={28} height={28} />
                      <Text fontSize={16} fontWeight={400}>
                        {travel?.metadata?.travel?.passengerFligth}
                      </Text>
                    </HStack>
                  )}
                </HStack>
                <HStack className="w-full justify-between items-center">
                  <Text fontSize={14} fontWeight={400} textColor={Colors.DARK_PURPLE}>
                    {t('home.map_home.fifty_sheet.value', { ns: 'home' })}
                  </Text>
                  <Badge style={styles.badge}>
                    <DolarCircle />
                    <Text fontSize={18} fontWeight={600} textColor={Colors.DARK_PURPLE}>
                      ${formatCLP(Number(travel?.metadata?.travel?.price ?? 0))}
                    </Text>
                  </Badge>
                </HStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter className="flex-col">
            <Box className="w-full gap-4">
              <Button
                onPress={() => {
                  handleClose();
                }}
                stretch
              >
                {t('home.confirmation.close', { ns: 'home' })}
              </Button>
              <Button
                onPress={() => {
                  handleClose();
                  router.navigate({
                    pathname: '/(booking)/[id]',
                    params: {
                      id: travel?.metadata?.travel?.id,
                      fromBook: 'true',
                    },
                  });
                }}
                textClassName={{
                  color: Colors.GRAY,
                }}
                type="ghost"
                stretch
              >
                {t('home.modal_hoppy.more_info', { ns: 'home' })}
              </Button>
            </Box>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Center>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 40,
  },
});
