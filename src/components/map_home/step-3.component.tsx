import { Keyboard, Pressable, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { carOptions } from '@/src/helpers/car-options';
import { useGetRouteTime, useMe, useToast } from '@/src/hooks';
import { createTravel } from '@/src/services/book.service';
import { Colors } from '@/src/utils/constants/Colors';
import { travelStatus, travelTypeValues } from '@/src/utils/enum/travel.enum';
import { BookingData } from '@/src/utils/interfaces/booking.interface';
import { i18NextType } from '@/src/utils/types/i18n.type';
import { Switch } from '../switch/switch.component';
import { Text } from '../text/text.component';
import { Box } from '../ui/box';
import { Divider } from '../ui/divider';
import { HStack } from '../ui/hstack';
import { VStack } from '../ui/vstack';
import { paymentMethod } from '@/src/utils/enum/payment-method.enum';
import { formatCLP } from '@/src/utils/formatters/currency';
dayjs.extend(utc);
dayjs.extend(timezone);

export const Step3Booking = (props: { setStepper: React.Dispatch<React.SetStateAction<number>>; updateBookingData: any; data: BookingData; date: string }) => {
  const { updateBookingData, data: dataPayload } = props;

  const { user } = useMe();

  const [isLoading, setIsLoading] = useState(false);
  const { route: routeTime } = useGetRouteTime(
    [dataPayload?.currentLocation.latitude || 0, dataPayload?.currentLocation.longitude || 0],
    [dataPayload?.destination.latitude || 0, dataPayload?.destination.longitude || 0]
  );

  const { showToast } = useToast();

  const { t } = useTranslation();
  const { setStepper, date } = props;
  const [toggleSwitch, setToggleSwitch] = useState(dataPayload?.reducedMobility);

  const canChargeToCompany = user?.company?.chargeToRoom === true;

  // Check "cargo a la habitación"
  const [chargeToRoom, setChargeToRoom] = useState(!!dataPayload?.chargeToRoom);

  const filterCarsByPassengers = (passengerCount: number, t: i18NextType) => {
    return carOptions(t).filter((car) => {
      if (passengerCount <= 3) return true;
      if (passengerCount > 3 && passengerCount <= 5) return car.value !== 'ELECTRIC';
      return car.value === 'VANS';
    });
  };

  const options = filterCarsByPassengers(dataPayload.numberOfPassengers, t);
  const parsedDate = dayjs.utc(date).toISOString();

  const convertToDate = (dateString: string) => {
    return dayjs(dateString).utc(true).toDate();
  };

  const handleBookHopper = async (carType: string) => {
    setIsLoading(true);

    try {
      const response = await createTravel({
        from: {
          lat: dataPayload.currentLocation.latitude!,
          lng: dataPayload.currentLocation.longitude!,
          address: dataPayload.currentLocation.address!,
        },
        to: {
          lat: dataPayload.destination.latitude!,
          lng: dataPayload.destination.longitude!,
          address: dataPayload.destination.address!,
        },
        distance: routeTime?.distance,
        time: routeTime?.duration,
        vehicleType: carType,
        programedTo: dataPayload.programedTo ? convertToDate(dataPayload.programedTo) : convertToDate(parsedDate),
        status: travelStatus.REQUEST,
        passengerName: dataPayload.fullName,
        passengerContact: dataPayload.contact,
        passengerRoom: dataPayload.roomNumber,
        passengerContactCountryCode: dataPayload.countryCode,
        totalPassengers: dataPayload.numberOfPassengers.toString(),
        totalSuitCases: dataPayload.numberOfLuggages.toString(),
        passengerAirline: dataPayload.airline,
        passengerFligth: dataPayload.flightNumber,
        paymentMethod: dataPayload.chargeToRoom? paymentMethod.COMPANY_CHARGE: paymentMethod.CARD,
        passenger: {
          id: user?.id!,
        },
        fixedDestination: {
          id: dataPayload?.fixedDestinationId,
        },
        type: dataPayload.type as travelTypeValues,
        companyId: user?.company? user.company.id: null
      });

      updateBookingData((prevState: BookingData) => ({
        ...prevState,
        carType: carType,
        price: response.price,
        hoppyCommission: response.hoppyCommission,
        id: response.id,
      }));

      setStepper(4);
    } catch {
      showToast({
        message: t('server_error', { ns: 'utils' }),
        action: 'error',
        duration: 3000,
        placement: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Pressable
      style={{
        backgroundColor: Colors.WHITE,
        paddingHorizontal: 16,
      }}
      onPress={() => Keyboard.dismiss()}
    >
      {canChargeToCompany && (
        <VStack space="sm" className="mt-6 mb-6">
          <Text fontSize={24} fontWeight={400}>
            {t('home.map_home.third_sheet.payment.seccion_tittle', { ns: 'home' })}
          </Text>

          <HStack space="md" className="mt-4 items-center">
            <Pressable
              hitSlop={8}
              onPress={() => {
                setChargeToRoom(!chargeToRoom);
                updateBookingData((prev: BookingData) => ({
                  ...prev,
                  chargeToRoom: !chargeToRoom,
                }));
              }}
            >
              <Box
                style={[
                  styles.checkbox,
                  chargeToRoom && {
                    backgroundColor: Colors.SECONDARY,
                    borderColor: Colors.PRIMARY,
                  },
                ]}
              >
                {chargeToRoom && <Text style={styles.checkboxTick}>✓</Text>}
              </Box>
            </Pressable>

            <Text fontSize={12} fontWeight={300}>
              {t('home.map_home.third_sheet.payment.check_tittle', { ns: 'home' })}
            </Text>
          </HStack>
        </VStack>
      )}
      <Text fontSize={24} fontWeight={400} className='mt-6'>
        {t('home.map_home.third_sheet.title', { ns: 'home' })}
      </Text>

      <Box className="flex-row mt-6 items-center gap-2 mb-6">
        <Switch
          isOn={toggleSwitch}
          onToggleSwitch={() => {
            setToggleSwitch(!toggleSwitch);
            updateBookingData((prevState: any) => ({
              ...prevState,
              reducedMobility: !toggleSwitch,
            }));
          }}
        />
        <Text fontSize={12} fontWeight={300}>
          {t('home.map_home.third_sheet.accessibility', {
            ns: 'home',
          })}
        </Text>
      </Box>
      <VStack space="md" className="mb-6">
        {options.map(({ name, icon: Icon, value }) => (
          <Pressable
            onPress={() => {
              handleBookHopper(value);
            }}
            disabled={isLoading}
            key={name}
          >
            <HStack space="md" className="items-center">
              <Icon height={85} width={86} />
              <VStack space="md">
                <Text fontSize={20} fontWeight={400} textColor={Colors.DARK_PURPLE}>
                  {name}
                </Text>
              </VStack>
            </HStack>
            <Divider style={[styles.divider, { backgroundColor: Colors.LIGHT_GRADIENT_1 }]} className="mt-2" />
          </Pressable>
        ))}
      </VStack>

    </Pressable>
  );
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: Colors.PRIMARY,
  },
checkbox: {
  width: 40,
  height: 30,
  borderRadius: 8,          // puntas redondeadas
  borderWidth: 1.5,         // borde más definido
  borderColor: Colors.LIGHT_GRAY, // borde suave cuando está apagado
  backgroundColor: Colors.WHITE,
  alignItems: 'center',
  justifyContent: 'center',
  // sutil sombra para imitar el “glow” del switch
  shadowColor: '#000',
  shadowOpacity: 10,
  shadowRadius: 0.5,
  shadowOffset: { width: 0, height: 0 },
  elevation: 1,
},
checkboxTick: {
  fontSize: 18,            // acorde al nuevo tamaño
  lineHeight: 18,
  color: Colors.PRIMARY,
  fontWeight: '700',
},
});
