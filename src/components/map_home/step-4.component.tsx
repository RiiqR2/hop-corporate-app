import { StyleSheet, View} from 'react-native';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { WaitingHopper } from '@/assets/svg';
import { useSocket } from '@/src/hooks';
import { getTravelById, updateTravel } from '@/src/services/book.service';
import { Colors } from '@/src/utils/constants/Colors';
import { travelStatus } from '@/src/utils/enum/travel.enum';
import { BookingData } from '@/src/utils/interfaces/booking.interface';
import { TravelNotification } from '@/src/utils/interfaces/booking.notification.interface';
import { Button } from '../button/button.component';
import { Text } from '../text/text.component';
import { Box } from '../ui/box';
import { VStack } from '../ui/vstack';
import { formatCLP } from '@/src/utils/formatters/currency';

type CombinedType = Pick<TravelNotification, 'metadata'> & {
  hopper: { id: string };
};

export const Step4Booking = (props: {
  formattedTime: string;
  formattedDate: string;
  setStepper: React.Dispatch<React.SetStateAction<number>>;
  data: BookingData;
  updateBookingData: React.Dispatch<React.SetStateAction<any>>;
  date: string;
}) => {
  const { setStepper, data, updateBookingData } = props;
  const { t } = useTranslation();

  const travelId = data.id;

  const socket = useSocket('http://192.168.1.10:3000/');

  useEffect(() => {
    if (!socket || !travelId) return;

    const eventName = `travel-${travelId}`;

    if (!socket.connected) {
      socket.connect();
    }

    socket.on(eventName, (message: CombinedType) => {
      if (message.metadata.travel.status !== travelStatus.REQUEST) {
        updateBookingData((prevState: BookingData) => ({
          ...prevState,
          hopperId: message.hopper.id,
        }));
      }
    });
  }, [socket, travelId]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getTravelById(travelId);

      if (response.status !== travelStatus.REQUEST) {
        setStepper(5);
        updateBookingData((prevState: BookingData) => ({
          ...prevState,
          hopperId: response.hopper.id,
          travelId: travelId
        }));
      }
    };

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, [travelId]);

  return (
    <VStack space="md" className="items-center gap-8 px-4">
      <Box className="items-center gap-8 mt-4">
        <Text fontSize={24} fontWeight={400} textAlign="center">
          {t('home.map_home.fourthy_sheet.title', { ns: 'home' })}
        </Text>

        <WaitingHopper width={200} height={200} />
        <Text fontSize={20} fontWeight={400} textColor={Colors.GRAY} textAlign="center">
          {t('home.map_home.third_sheet.text', { ns: 'home' })}
        </Text>
      </Box>
      <Box className="w-full gap-4 mt-4">
        <Button
          onPress={() => {
            router.back();
          }}
          stretch
        >
          {t('home.map_home.third_sheet.search', { ns: 'home' })}
        </Button>
        <Button
          onPress={() => {
            updateTravel(travelId, {
              status: travelStatus.CANCELLED,
            });
            router.back();
          }}
          type="ghost"
          stretch
          textClassName={{
            color: Colors.GRAY,
          }}
        >
          {t('home.map_home.third_sheet.cancel', { ns: 'home' })}
        </Button>
          <Box className="items-center mt-2">
            <View style={styles.middleElement}>
              <Text fontSize={32} textColor={Colors.DARK_PURPLE} fontWeight={600}>
                $ {formatCLP(Number(data?.price ?? 0))}
              </Text>
            </View>
          </Box>
      </Box>
    </VStack>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  container: {
    alignItems: 'center',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 48,
  },
  middleElement: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.SECONDARY,
    borderWidth: 6,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    zIndex: 10,
  },
  middleElementTwo: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  middleText: {
    fontSize: 32,
    fontWeight: 600,
    color: Colors.DARK_PURPLE,
  },
});
