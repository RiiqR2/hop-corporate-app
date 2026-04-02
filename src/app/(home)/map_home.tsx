import { View, Image, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MapView, { Marker } from 'react-native-maps';
import { router } from 'expo-router';
import { AssetsImages } from '@/assets/images';
import { ArrowLeftRounded, LocationFilled } from '@/assets/svg';
import { Input, Step1Booking, Step2Booking, Step2BookingPickup, Step3Booking, Step4Booking, Step5Booking } from '@/src/components';
import { Button } from '@/src/components/button/button.component';
import { BottomSheet } from '@/src/components/sheet/sheet.component';
import { Text } from '@/src/components/text/text.component';
import { Fab, FabIcon } from '@/src/components/ui/fab';
import { VStack } from '@/src/components/ui/vstack';
import { useAuth } from '@/src/context/auth.context';
import { useGetAddressFromCoordinates, useMe } from '@/src/hooks';
import { Colors } from '@/src/utils/constants/Colors';
import { travelTypeValues } from '@/src/utils/enum/travel.enum';
dayjs.extend(customParseFormat);

export default function MapHome() {
  
  const params = useRoute().params as { type: string };
  const route = useRoute().params as { time: string; date: string };
  const { address, getAddress, selectedLocation } = useGetAddressFromCoordinates();
  const { location } = useAuth();
  const { t } = useTranslation();
  const { user } = useMe();

  const [stepper, setStepper] = useState(1);
  const [openBottomSheet, setOpenBottomSheet] = useState(false);

  const formattedDate = dayjs(route.date).format('DD MMM. YYYY');
  const formattedTime = dayjs(route.time).format('HH:mm');
  const nowPlus5Minutes = dayjs().add(5, 'minute');
  const scheduledDateTime = dayjs(`${route.date} ${route.time}`, 'YYYY-MM-DD HH:mm');

  let type = params.type ?? travelTypeValues.PROGRAMED;
  if (scheduledDateTime.isBefore(nowPlus5Minutes)) {
    type = travelTypeValues.INSTANT;
  }

  const AIRPORT_CHILE = {
    name: 'Aeropuerto',
    latitude: -33.392777777778,
    longitude: -70.785555555556,
  };

  const [bookingData, setBookingData] = useState({
    type: type,
    destination: {
      latitude: selectedLocation?.latitude || null,
      longitude: selectedLocation?.longitude || null,
      address: address || '',
    },
    currentLocation: {
      latitude: location?.latitude || null,
      longitude: location?.longitude || null,
      address: user?.userInfo.hotel_name,
    },
    fullName: '',
    contact: '',
    roomNumber: '',
    numberOfPassengers: 1,
    numberOfLuggages: 0,
    vehicleType: '',
    reducedMobility: false,
    programedTo: '',
    flightNumber: '',
    airline: '',
    carType: '',
    time: 1,
    distance: 1,
    price: 0,
    hoppyCommission: 0,
    countryCode: '',
    hopperId: '',
    id: '',
  });

  useEffect(() => {
    if (selectedLocation?.latitude && selectedLocation?.longitude) return;

    if (type === travelTypeValues.PICKUP) {
      setBookingData((prevData) => ({
        ...prevData,
        currentLocation: {
          latitude: AIRPORT_CHILE.latitude,
          longitude: AIRPORT_CHILE.longitude,
          address: AIRPORT_CHILE.name,
        },
        destination: {
          latitude: user?.userInfo.hotel_location?.lat || null,
          longitude: user?.userInfo.hotel_location?.lng || null,
          address: user?.userInfo.hotel_name || '',
        },
      }));
    } else if (type === travelTypeValues.DROPOFF) {
      setBookingData((prevData) => ({
        ...prevData,
        currentLocation: {
          latitude: user?.userInfo.hotel_location?.lat || null,
          longitude: user?.userInfo.hotel_location?.lng || null,
          address: user?.userInfo.hotel_name,
        },
        destination: {
          latitude: AIRPORT_CHILE.latitude,
          longitude: AIRPORT_CHILE.longitude,
          address: AIRPORT_CHILE.name,
        },
      }));
    } else if (type === travelTypeValues.PROGRAMED) {
      setBookingData((prevData) => ({
        ...prevData,
        currentLocation: {
          latitude: user?.userInfo.hotel_location?.lat || null,
          longitude: user?.userInfo.hotel_location?.lng || null,
          address: user?.userInfo.hotel_name,
        },
      }));
    } else if (type === travelTypeValues.INSTANT) {
      setBookingData((prevData) => ({
        ...prevData,
        currentLocation: {
          latitude: user?.userInfo.hotel_location?.lat || null,
          longitude: user?.userInfo.hotel_location?.lng || null,
          address: user?.userInfo.hotel_name,
        },
      }));
    }
  }, []);

  useEffect(() => {
    if (!selectedLocation) return;
    setBookingData((prev) => ({
      ...prev,
      destination: {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        address: address || '',
      },
    }));
  }, [selectedLocation, address]);

  const mapRegion = useCallback(() => {
    if (!location) return undefined;
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
  }, [location]);

  const onPressMap = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    getAddress(latitude, longitude);
  };

  const handlePressBack = () => {
    if (openBottomSheet) {
      setOpenBottomSheet(false);
      return;
    }

    if (stepper === 1) {
      router.back();
    } else {
      setStepper(stepper - 1);
    }
  };

  const steps: Record<number, React.ReactElement | React.ReactElement[]> = {
    1: (
      <Step1Booking
        formattedDate={formattedDate}
        formattedTime={formattedTime}
        showActionSheet={openBottomSheet}
        setShowActionSheet={setOpenBottomSheet}
        updateBookingData={setBookingData}
        setStepper={setStepper}
        data={bookingData}
      />
    ),
    2:
      params.type === travelTypeValues.PICKUP ? (
        <Step2BookingPickup setStepper={setStepper} updateBookingData={setBookingData} data={bookingData} />
      ) : (
        <Step2Booking setStepper={setStepper} updateBookingData={setBookingData} data={bookingData} />
      ),
    3: <Step3Booking setStepper={setStepper} updateBookingData={setBookingData} data={bookingData} date={route.time} />,
    4: (
      <Step4Booking
        formattedDate={formattedDate}
        formattedTime={formattedTime}
        setStepper={setStepper}
        updateBookingData={setBookingData}
        data={bookingData}
        date={route.time}
      />
    ),
    5: <Step5Booking formattedDate={formattedDate} formattedTime={formattedTime} data={bookingData} date={route.time} />,
  };

  return (
    <View className="flex-1">
      <StatusBar hidden />
      {!(stepper > 3) && (
        <Fab placement="top left" onPress={() => handlePressBack()} style={styles.fab} className="bg-[#E1F5F3] w-[50px] h-[50px]">
          <FabIcon as={ArrowLeftRounded} width={30} />
        </Fab>
      )}
      <View className="flex-1">
        <>
          <MapView style={styles.map} showsUserLocation={true} initialRegion={mapRegion()} onPress={onPressMap}>
            {selectedLocation && (
              <Marker
                coordinate={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                }}
              >
                <View className="w-[30px] h-[30px]">
                  <Image source={AssetsImages.marker_icon} className="w-full h-full" />
                </View>
              </Marker>
            )}
          </MapView>
          {!openBottomSheet ? (
            <BottomSheet content={steps[stepper]} isOpen={true} setIsOpen={() => {}} snapPoints={['85%', '85%', '90%']} />
          ) : (
            <View style={styles.actionSheet}>
              <Text fontSize={24} fontWeight={400} className="mb-6">
                {t('signup.step_1.mark_map', { ns: 'auth' })}
              </Text>
              <VStack className="gap-5">
                <Input
                  label=""
                  value={address ?? ''}
                  editable={false}
                  placeholder={t('signup.step_1.select_map', {
                    ns: 'auth',
                  })}
                  onChangeText={() => {}}
                  onBlur={() => {}}
                  icon={LocationFilled}
                  leftIcon
                />

                <Button
                  onPress={() => {
                    setOpenBottomSheet(false);
                  }}
                >
                  {t('signup.step_1.confirm_address', { ns: 'auth' })}
                </Button>
              </VStack>
            </View>
          )}
        </>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  markerContainer: {
    position: 'absolute',
    bottom: 100,
    left: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  actionSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingVertical: 28,
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
  },
  fab: {
    marginTop: 32,
  },
  badge: {
    backgroundColor: Colors.PRIMARY,
  },
  divider: {
    backgroundColor: Colors.PRIMARY,
  },
  location_container: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: Colors.LIGHT_GRADIENT_1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mark_map: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingVertical: 28,
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    height: 244,
  },
});
