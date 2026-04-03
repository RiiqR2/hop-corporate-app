import { StyleSheet } from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Booking, Calendar, Clock, DolarCircle, LocationFilled, People, Send, ShoppingBag } from '@/assets/svg';
import { Button } from '@/src/components/button/button.component';
import { Text } from '@/src/components/text/text.component';
import { Badge } from '@/src/components/ui/badge';
import { Box } from '@/src/components/ui/box';
import { Center } from '@/src/components/ui/center';
import { Divider } from '@/src/components/ui/divider';
import { CloseCircleIcon, Icon } from '@/src/components/ui/icon';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/src/components/ui/modal';
import { VStack } from '@/src/components/ui/vstack';
import { formattedDate } from '@/src/helpers/parse-date';
import { travelType } from '@/src/helpers/parser-names';
import { updateTravel } from '@/src/services/book.service';
import { Colors } from '@/src/utils/constants/Colors';
import { travelStatus, travelTypeValues } from '@/src/utils/enum/travel.enum';
import { User } from '@/src/utils/interfaces/auth.interface';
import { TravelNotification } from '@/src/utils/interfaces/booking.notification.interface';
import { formatCLP } from '@/src/utils/formatters/currency';

export const ModalBooking = ({ isOpen, handleClose, travel, user }: { isOpen: boolean; handleClose: () => void; travel: TravelNotification; user: User }) => {
  const { t } = useTranslation();
  const travelStatusTranslated = travelType(t);
  const translatedStatus = travelStatusTranslated[travel?.metadata.travel?.type as travelTypeValues] || travel?.metadata.travel?.type;

  const { date, time } = formattedDate(travel?.metadata?.travel?.programedTo);

  return (
    <Center className="h-auto w-[100%] bg-slate-800">
      <Modal isOpen={isOpen} onClose={() => handleClose()} style={{ paddingHorizontal: 16 }}>
        <ModalBackdrop />
        <ModalContent className="rounded-[20px] bg-[#E1F5F3] w-[100%]">
          <ModalHeader>
            <Text fontSize={18} fontWeight={400} textColor={Colors.GRAY}>
              {t('booking.modal_hopper.modalTitle', { ns: 'booking' })}
            </Text>
            <ModalCloseButton onPress={() => handleClose()}>
              <Icon as={CloseCircleIcon} size="md" color={Colors.GRAY} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Box className="mt-4 flex-row gap-2 items-center">
              <Booking width={28} height={28} />
              <Text fontSize={20} fontWeight={600}>
                {translatedStatus}
              </Text>
            </Box>
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
            <Box style={{ backgroundColor: Colors.WHITE }} className="mt-3 p-2 gap-2 rounded-[14px]">
              <VStack space="sm">
                <Text textColor={Colors.GRAY} fontWeight={300} fontSize={12}>
                  {t('booking.modal_hopper.departurePoint', { ns: 'booking' })}
                </Text>
                <Box className="flex-row gap-2 items-center w-[90%]">
                  <Send />
                  <Text fontSize={16} fontWeight={400}>
                    {travel?.metadata?.travel?.from?.address}
                  </Text>
                </Box>
              </VStack>
              <Divider className="mt-2" style={styles.divider} />
              <VStack space="sm">
                <Text textColor={Colors.GRAY} fontWeight={300} fontSize={12}>
                  {t('booking.modal_hopper.destination', { ns: 'booking' })}
                </Text>
                <Box className="flex-row gap-2 items-center w-[90%]">
                  <LocationFilled />
                  <Text fontSize={16} fontWeight={400}>
                    {travel?.metadata?.travel?.to?.address}
                  </Text>
                </Box>
              </VStack>
            </Box>
            <VStack className="mt-4">
              <Box className="flex-row gap-2 items-center">
                <People width={16} height={16} />
                <Text textColor={Colors.DARK_PURPLE} fontSize={18} fontWeight={400}>
                  {/* {travel?.metadata.travel.totalPassengers} Pasajeros */}
                  {t('booking.modal_hopper.passengers', { ns: 'booking', count: Number(travel?.metadata?.travel?.totalPassengers || 0) })}
                </Text>
              </Box>
              <Box className="flex-row gap-2 items-center">
                <ShoppingBag width={16} height={16} />
                <Text textColor={Colors.DARK_PURPLE} fontSize={18} fontWeight={400}>
                  {t('booking.modal_hopper.suitcases', { ns: 'booking', count: Number(travel?.metadata?.travel?.totalSuitCases || 0) })}
                </Text>
              </Box>
              <Box className="flex-row gap-2 items-center">
                <DolarCircle width={16} height={16} />
                <Text textColor={Colors.DARK_PURPLE} fontSize={18} fontWeight={400}>
                  {/* Valor del viaje ${travel?.metadata.travel.price?.toFixed(2)} */}
                  {t('booking.modal_hopper.tripValue', { ns: 'booking', amount: formatCLP(Number(travel?.metadata?.travel?.price ?? 0))})}
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter className="flex-col">
            <Button
              onPress={() => {
                handleClose();
                updateTravel(travel?.metadata?.travel?.id, {
                  status: travelStatus.ACCEPT,
                  hopper: {
                    id: user.id,
                  },
                });
              }}
              stretch
            >
              {t('booking.modal_hopper.acceptTripButton', { ns: 'booking' })}
            </Button>
            <Button
              type="ghost"
              style={{
                backgroundColor: Colors.ERROR,
                minHeight: 40,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={handleClose}
              stretch
              textClassName={{
                color: Colors.WHITE,
              }}
            >
              {t('booking.modal_hopper.rejectTripButton', { ns: 'booking' })}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Center>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  badge: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 4,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 40,
    marginTop: 12,
  },
  divider: {
    backgroundColor: Colors.PRIMARY,
  },
});
