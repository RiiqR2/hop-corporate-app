import { View, Pressable, Keyboard, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
//import * as Sentry from 'sentry-expo';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { CalendarActive, ClockActive, LocationFilled, Send } from '@/assets/svg';
import { Input, Select } from '@/src/components';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetFlatList,
} from '@/src/components/ui/actionsheet';
import { SearchIcon } from '@/src/components/ui/icon';
import { useGetCoordinatesFromAddress, useMe, useToast } from '@/src/hooks';
import { getFrecuentAddress } from '@/src/services/book.service';
import { getFixedDestinations, FixedDestination } from '@/src/services/fixed-destination.service';
import { Colors } from '@/src/utils/constants/Colors';
import { BookingData } from '@/src/utils/interfaces/booking.interface';
import { Button } from '../button/button.component';
import { Calendar } from '../calendar/calendar.component';
import { Text } from '../text/text.component';
import { Badge, BadgeIcon } from '../ui/badge';
import { Box } from '../ui/box';
import { Divider } from '../ui/divider';
import { HStack } from '../ui/hstack';
import { VStack } from '../ui/vstack';

dayjs.extend(customParseFormat);
type Step1BookingProps = {
  formattedTime: string;
  formattedDate: string;
  showActionSheet: boolean;
  setShowActionSheet: React.Dispatch<React.SetStateAction<boolean>>;
  setStepper: React.Dispatch<React.SetStateAction<number>>;
  updateBookingData: any;
  data: BookingData;
};

export const Step1Booking = (props: Step1BookingProps) => {
  const { formattedDate, formattedTime, setShowActionSheet, setStepper, data: dataFormulary, updateBookingData } = props;
  const params = useRoute().params as {
    type: string;
  };

  const { showToast } = useToast();

  const { t } = useTranslation();

  const { user } = useMe();

  const { data: frecuentTravel } = useSWR('/user/frecuent_travel', () => getFrecuentAddress(user?.id!));

  const { locations, setSelectedLocation, geocodeAddress } = useGetCoordinatesFromAddress();

  const [addressName, setAddressName] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [type, setType] = useState<'date' | 'time'>('date');
  const [showCalendar, setShowCalendar] = useState(false);


  const isFromOffice = params.type === 'FROM_OFFICE';
  const isToOffice = params.type === 'TO_OFFICE';
  const isProgrammed = params.type === 'PROGRAMED';
  const isInstant = params.type === 'INSTANT';
  const fixedTypes = ['FROM_OFFICE', 'TO_OFFICE'];

  const [fixedTravelOptions, setFixedTravelOptions] = useState<FixedDestination[]>([]);
  const [selectedFixedDestination, setSelectedFixedDestination] = useState<FixedDestination | null>(null);
  let selectedDescription = selectedFixedDestination?.description || '';
  const selectOptions = fixedTravelOptions.map((dest) => ({
    label: dest.name?? "",
    value: dest.id?? "",
  }));
  const getCurrentPlusFiveMinutes = () =>
    dayjs().add(5, 'minute').second(0).millisecond(0).toDate();


  useEffect(() => {
    if (!fixedTypes.includes(params.type)) return;
    const fetchOptions = async () => {
      try {
        const data = await getFixedDestinations(params.type);
        setFixedTravelOptions(data);
      } catch {
        //Sentry.Native.captureException(err);
      }
    };
    fetchOptions();
  }, [params.type]);

  useEffect(() => {
  if (dataFormulary?.destination?.address && fixedTravelOptions.length > 0) {
    const selected = fixedTravelOptions.find(dest => dest.address === dataFormulary.destination.address);
    if (selected) {
      setSelectedFixedDestination(selected);
    }
  }
}, [fixedTravelOptions, dataFormulary?.destination?.address]);



  useEffect(() => {
    if (!fixedTypes.includes(params.type)) return;

    const syncDateTimeWithNow = () => {
      const nextTime = getCurrentPlusFiveMinutes();
      setDate(nextTime);
      setTime(nextTime);
      updateBookingData((prev: BookingData) => ({
        ...prev,
        programedTo: dayjs(nextTime).format('YYYY-MM-DD HH:mm:ss'),
      }));
    };

    syncDateTimeWithNow();
    const intervalId = setInterval(syncDateTimeWithNow, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [params.type, updateBookingData]);

  const openDatePicker = () => {
    setShowCalendar(true);
    setType('date');
  };

  const openTimePicker = () => {
    setShowCalendar(true);
    setType('time');
  };

  const handleDateChange = (selectedDate: Date) => {
    if (type === 'date') {
      setDate(selectedDate);
    } else if (type === 'time') {
      setTime(selectedDate);
    }

    updateBookingData((prev: BookingData) => ({
      ...prev,
      programedTo: dayjs(selectedDate).format('YYYY-MM-DD HH:mm:ss'),
    }));
  };

  const formattedDatePickup = date ? dayjs(date).format('DD/MM/YYYY') : '';
  const formattedTimePickup = time ? dayjs(time).format('HH:mm') : '';

  useEffect(() => {
    if (dataFormulary?.programedTo) {
      const parsedDate = dayjs(dataFormulary.programedTo).toDate();
      setDate(parsedDate);
      setTime(parsedDate);
    }
  }, [dataFormulary?.programedTo]);

  useEffect(() => {
    if (
      params.type === "PICKUP" &&
      fixedTravelOptions.length > 0
    ) {
      const selected = fixedTravelOptions[0];
      setSelectedFixedDestination(selected); // opcional si querés que quede marcado

      setAddressLocation({
        latitude: fixedTravelOptions[0]?.latitude?.toString()?? "",
        longitude: fixedTravelOptions[0]?.longitude?.toString()?? "",
      });

      setAddressName(fixedTravelOptions[0]?.name?? "");
      updateBookingData((prev: BookingData) => ({
        ...prev,
        fixedDestinationId: fixedTravelOptions[0]?.id,
        currentLocation: {
          latitude: Number(selected?.latitude),
          longitude: Number(selected?.longitude),
          address: selected.name,
        },
      }));
    }
  }, [fixedTravelOptions, params.type]);

  const [showAddressActionsheet, setShowAddressActionsheet] = useState(false);
  const [typeOfAddress, setTypeOfAddress] = useState<'current' | 'destinity'>('current');
  const [addressLocation, setAddressLocation] = useState<{
    latitude: string;
    longitude: string;
  }>({
    latitude: '',
    longitude: '',
  });
  const [destinityLocation, setDestinityLocation] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: 0,
    longitude: 0,
  });
  const [destinityAddress, setDestinityAddress] = useState('');

  const handleSearch = (searchText: string) => {
    if (searchText.trim()) {
      geocodeAddress(searchText);
    }
  };

  const programmedDateFormmated = `${formattedDate} ${formattedTime}`;
  const cleanedDateString = programmedDateFormmated.replace('.', '');
  const programmedDateFormatted = dayjs(cleanedDateString, 'DD MMM YYYY HH:mm');

  const handleNextStep = () => {
    const now = new Date();
    let programedDate = new Date(dataFormulary.programedTo);
    if (!dataFormulary.programedTo && programmedDateFormatted) {
      programedDate = programmedDateFormatted as any;
    }
    const nowMinus5Min = new Date(now.getTime() - 5 * 60 * 1000);
    if (programedDate < nowMinus5Min) {
      showToast({
        message: t('schedule_error', { ns: 'utils' }),
        action: 'error',
        duration: 3000,
        placement: 'bottom',
      });
      return;
    }
    updateBookingData((prev: BookingData) => {
      const current = prev.currentLocation ?? {};
      const destination = prev.destination ?? {};
      let nextCurrentLocation = current;

      if (isFromOffice) {
        nextCurrentLocation = {
          latitude: current.latitude ?? Number(user?.company?.companyLocation?.lat ?? user?.userInfo.hotel_location?.lat ?? 0),
          longitude: current.longitude ?? Number(user?.company?.companyLocation?.lng ?? user?.userInfo.hotel_location?.lng ?? 0),
          address: current.address ?? user?.company?.name ?? user?.userInfo.hotel_name ?? '',
        };
      } else {
        nextCurrentLocation = {
          latitude: addressName? Number(addressLocation.latitude): (current.latitude ?? null),
          longitude: addressName? Number(addressLocation.longitude): (current.longitude ?? null),
          address: addressName? addressName: (current.address ?? ''),
        };
      }
      return {
        ...prev,
        currentLocation: nextCurrentLocation,
        destination,
      };
    });

    setStepper(2);
  };

  const setCurrentLocation = () => {
    updateBookingData((prev: BookingData) => {
      const current = prev.currentLocation ?? {};

      return {
        ...prev,
        currentLocation: {
          latitude: addressName
            ? Number(addressLocation.latitude)
            : (current.latitude ?? null),
          longitude: addressName
            ? Number(addressLocation.longitude)
            : (current.longitude ?? null),
          address: addressName
            ? addressName
            : (current.address ?? ''),
        },
      };
    });
  };

  const setDestinationLocation = () => {
    updateBookingData((prev: BookingData) => {
      const destination = prev.destination ?? {};
      return {
        ...prev,
        destination: {
          latitude: destinityAddress.length > 1 ? destinityLocation.latitude : (destination.latitude ?? Number(dataFormulary?.destination.latitude)),
          longitude: destinityAddress.length > 1 ? destinityLocation.longitude : (destination.longitude ?? Number(dataFormulary?.destination.longitude)),
          address: destinityAddress.length > 1 ? destinityAddress : (destination.address ?? Number(dataFormulary?.destination.address)),
        },
      };
    });
  };

  const isDestinationValid = Boolean(dataFormulary.destination?.address?.length || destinityAddress.length > 1);

  const dates = Boolean(date || formattedDate);
  const times = Boolean(time || formattedTime);

  useEffect(() => {
    if (!addressLocation || !addressName) return;
    updateBookingData((prev: BookingData) => ({
      ...prev,
      currentLocation: {
        latitude: Number(addressLocation.latitude),
        longitude: Number(addressLocation.longitude),
        address: addressName,
      },
    }));
  }, [addressLocation, addressName]);

  useEffect(() => {
    if (!destinityLocation || !destinityAddress) return;
    updateBookingData((prev: BookingData) => ({
      ...prev,
      destination: {
        latitude: destinityLocation.latitude,
        longitude: destinityLocation.longitude,
        address: destinityAddress,
      },
    }));
  }, [destinityLocation, destinityAddress]);

  const handleSelectDestination = (value: string) => {
    const destination = fixedTravelOptions.find((dest) => dest.id === value);
    if (destination) {
      setSelectedFixedDestination(destination);
      setDestinityAddress(destination.address || "");
      setDestinityLocation({
        latitude: Number(destination.latitude),
        longitude: Number(destination.longitude),
      });
      updateBookingData((prev: BookingData) => ({
        ...prev,
        fixedDestinationId: destination.id,
        destination: {
          latitude: destination.latitude,
          longitude: destination.longitude,
          address: destination.address,
        },
      }));
    }
  };


  return (
    <>
      <Pressable
        style={{
          backgroundColor: Colors.WHITE,
          paddingHorizontal: 16,
        }}
        onPress={() => Keyboard.dismiss()}
      >
        <Text fontSize={24} fontWeight={400}>
          {t('home.map_home.first_sheet.title', { ns: 'home' })}
        </Text>

        {!Boolean(params.type?.length) && (
          <HStack space="md" className="mt-6">
            <Badge style={styles.badge} className="rounded-full gap-1">
              <BadgeIcon as={CalendarActive} />
              <Text fontSize={12} fontWeight={400} textColor={Colors.DARK_PURPLE}>
                {formattedDate}
              </Text>
            </Badge>
            <Badge style={styles.badge} className="rounded-full gap-1">
              <ClockActive height={16} width={16} />

              <Text fontSize={12} fontWeight={400} textColor={Colors.DARK_PURPLE}>
                {formattedTime}
              </Text>
            </Badge>
          </HStack>
        )}
        <VStack space="md" className="mt-6">
          {Boolean(params.type?.length) && (
            <HStack style={styles.hour} className="gap-2">
              <Input
                label=""
                onBlur={() => {}}
                onChangeText={() => {}}
                placeholder="DD/MM/AAAA"
                leftIcon
                icon={CalendarActive}
                stretch
                onPress={openDatePicker}
                editable={false}
                pressable
                value={formattedDatePickup}
              />
              <Input
                label=""
                onBlur={() => {}}
                onChangeText={() => {}}
                placeholder="HH : MM"
                leftIcon
                icon={ClockActive}
                stretch
                onPress={openTimePicker}
                editable={false}
                pressable
                value={formattedTimePickup}
              />
            </HStack>
          )}
          <Input
            label=""
            onBlur={() => {}}
            onChangeText={() => {}}
            placeholder={t('home.map_home.first_sheet.fields.starting_point', {
              ns: 'home',
            })}
            leftIcon
            icon={Send}
            value={addressName || dataFormulary.currentLocation.address || ''}
            editable={false}
            pressable={!isFromOffice}
            onPress={() => {
              if (isFromOffice) return;
              setShowAddressActionsheet(true);
              setTypeOfAddress('current');
            }}
            multiline={Boolean((addressName || dataFormulary.currentLocation.address || '').trim().length > 25)}
          />

          {isToOffice ? (
            <Input
              label=""
              onBlur={() => {}}
              onChangeText={() => {}}
              placeholder={t('home.map_home.first_sheet.fields.destination', {
                ns: 'home',
              })}
              leftIcon
              icon={LocationFilled}
              value={dataFormulary?.destination.address || ''}
              editable={false}
              pressable={false}
              multiline={Boolean((dataFormulary?.destination.address || '').trim().length > 25)}
            />
          ) : (
            <Input
              label=""
              onBlur={() => {}}
              onChangeText={() => {}}
              placeholder={t('home.map_home.first_sheet.fields.destination', {
                ns: 'home',
              })}
              leftIcon
              icon={LocationFilled}
              value={destinityAddress || dataFormulary?.destination.address || ''}
              editable={false}
              pressable={true}
              onPress={() => {
                setShowAddressActionsheet(true);
                setTypeOfAddress('destinity');
              }}
              multiline={Boolean((destinityAddress || dataFormulary?.destination.address || '').trim().length > 25)}
            />
          )}

        </VStack>

        {!fixedTypes.includes(params.type) ? (
          <><View className="mt-6">
            <Text fontSize={16} fontWeight={400} textColor={Colors.DARK_PURPLE}>
              {t('home.map_home.first_sheet.usual_destinations', {
                ns: 'home',
              })}
            </Text>
            {frecuentTravel?.mostFrequentTo
              .filter((item: { address: string; lat: string; lng: string; }) => item.address)
              .map((item: { address: string; lat: string; lng: string; }, i: number) => (
                <Pressable
                  key={i}
                  onPress={() => {
                    setDestinityLocation({
                      latitude: Number(item.lat),
                      longitude: Number(item.lng),
                    });
                    setDestinityAddress(item.address);
                  } }
                >
                  <HStack space="md" className="mt-4 p-2">
                    <ClockActive width={20} height={20} />
                    <Box className="gap-2">
                      <Text fontSize={16} fontWeight={400}>
                        {item.address.slice(0, 30)} {item.address.length > 30 ? '...' : ''}
                      </Text>
                    </Box>
                  </HStack>
                  <Divider className="mt-2" style={styles.divider} />
                </Pressable>
              ))}
          </View>
          <Pressable className="flex-row gap-2 items-center mt-6 mb-6" onPress={() => setShowActionSheet(true)}>
              <View style={styles.location_container}>
                <LocationFilled />
              </View>
              <Text fontSize={16} fontWeight={400}>
                {t('home.map_home.first_sheet.mark_map', { ns: 'home' })}
              </Text>
            </Pressable></>
        ) : (
           <View className="mt-6"></View>
        )
        }
        <Button onPress={() => handleNextStep()} stretch disabled={!(isDestinationValid && times && dates)}>
          {t('home.next', { ns: 'home' })}
        </Button>
        { selectedFixedDestination?.description? (
          <View className="w-full rounded-[20px] mt-6 p-[20px] justify-center border-[#2EC4B5] border-[1px]">
            <HStack className="gap-3 items-center rounded-full">
              <Box className="flex-1 gap-2">
                <Text textColor={Colors.SECONDARY} fontSize={18} fontWeight={600}>
                  { t('home.fixed_travel.description_tittle', { ns: 'home' })}
                </Text>
                <Text textColor={Colors.GRAY} fontSize={16} fontWeight={400}>
                  { selectedDescription }
                </Text>
              </Box>
            </HStack>
          </View>
        ):
        (
          <View></View>
        )}
      </Pressable>
      {showCalendar && (
        <Calendar
          type={type}
          isVisible={true}
          onClose={() => setShowCalendar(false)}
          onDateChange={handleDateChange}
          date={type === 'date' ? date || new Date() : time || new Date()}
          minimumDate={new Date()}
        />
      )}
      <Actionsheet isOpen={showAddressActionsheet} onClose={() => setShowAddressActionsheet(false)} snapPoints={[70]}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="pb-10">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <View style={styles.search_bar_container}>
            <Input
              placeholder={t('map_sheet', { ns: 'utils' })}
              label=""
              onBlur={() => {}}
              onChangeText={handleSearch}
              className=""
              icon={SearchIcon}
              rightIcon
              size="sm"
            />
          </View>
          <ActionsheetFlatList
            data={locations}
            renderItem={({ item }: any) => (
              <>
                <Pressable
                  onPress={() => {
                    setSelectedLocation(item);

                    if (typeOfAddress === 'current') {
                      const formattedAddress = `${item.name.split(',')[0]},${item.name.split(',')[1]}.`;

                      setAddressLocation(item);
                      setAddressName(formattedAddress);

                      updateBookingData((prev: BookingData) => ({
                        ...prev,
                        currentLocation: {
                          latitude: Number(item.latitude),
                          longitude: Number(item.longitude),
                          address: formattedAddress,
                        },
                      }));
                    } else {
                      const formattedAddress = `${item.name.split(',')[0]},${item.name.split(',')[1]}.`;

                      setDestinityLocation({
                        latitude: Number(item.latitude),
                        longitude: Number(item.longitude),
                      });
                      setDestinityAddress(formattedAddress);

                      updateBookingData((prev: BookingData) => ({
                        ...prev,
                        destination: {
                          latitude: Number(item.latitude),
                          longitude: Number(item.longitude),
                          address: formattedAddress,
                        },
                      }));
                    }

                    setShowAddressActionsheet(false);
                  }}
                  className="py-2.5 px-4 border-b border-[#C6C2FA] bg-white rounded-lg mb-2.5"
                >
                  <Box className="gap-4">
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '500',
                        color: '#333',
                      }}
                    >
                      {item.name}
                    </Text>
                  </Box>
                </Pressable>
              </>
            )}
            contentContainerClassName="gap-4"
            keyExtractor={(item: any) => item.id.toString()}
          />
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
};

const styles = StyleSheet.create({
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
  hour: {
    marginTop: 12,
  },
  search_bar_container: {
    width: '100%',
    marginBottom: 24,
    marginTop: 24,
  },
});
