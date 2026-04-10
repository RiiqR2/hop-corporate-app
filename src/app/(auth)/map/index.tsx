import { View, StyleSheet, TouchableWithoutFeedback, Keyboard, Image, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import MapView, { Marker, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AssetsImages } from '@/assets/images';
import { ArrowLeftRounded, LocationFilled } from '@/assets/svg';
import { Text, Input } from '@/src/components';
import { Button } from '@/src/components/button/button.component';
import { Fab, FabIcon } from '@/src/components/ui/fab';
import { VStack } from '@/src/components/ui/vstack';
import { useAuth } from '@/src/context/auth.context';
import { useGetAddressFromCoordinates } from '@/src/hooks';
import { Colors } from '@/src/utils/constants/Colors';

const DEFAULT_REGION: Region = {
  latitude: -33.4489,
  longitude: -70.6693,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapSheet() {
  const { address, getAddress, selectedLocation } = useGetAddressFromCoordinates();
  const { state, updatePayload } = useAuth();
  const { step } = useRoute().params as unknown as { step: string };
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [isLoaded, setIsLoaded] = useState(false);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const hasInitializedRef = useRef(false);

  const initialCoordinates = useMemo(() => {
    const source = step === '3' ? state.hotel_info : state.user_info;
    const hasCoordinates =
      Number.isFinite(source.latitude) &&
      Number.isFinite(source.longitude) &&
      source.latitude !== 0 &&
      source.longitude !== 0;

    if (!hasCoordinates) {
      return null;
    }

    return {
      latitude: Number(source.latitude),
      longitude: Number(source.longitude),
    };
  }, [state.hotel_info, state.user_info, step]);

  const onPressMap = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    getAddress(latitude, longitude);
  };

  const onConfirmData = () => {
    const latitude = selectedLocation?.latitude ?? region.latitude;
    const longitude = selectedLocation?.longitude ?? region.longitude;

    const newPayload = {
      address: address || '',
      latitude,
      longitude,
    };

    updatePayload(
      step === '3'
        ? {
            hotel_info: newPayload,
          }
        : {
            user_info: newPayload,
          }
    );

    router.back();
  };

  useEffect(() => {
    if (hasInitializedRef.current) return;

    hasInitializedRef.current = true;
    let isMounted = true;

    const loadMap = async () => {
      try {
        if (initialCoordinates) {
          const newRegion = {
            ...DEFAULT_REGION,
            ...initialCoordinates,
          };

          if (isMounted) {
            setRegion(newRegion);
            setIsLoaded(true);
          }

          await getAddress(initialCoordinates.latitude, initialCoordinates.longitude);
          return;
        }

        const fgPermission = await Location.getForegroundPermissionsAsync();
        const permission =
          fgPermission.status === 'granted' ? fgPermission : await Location.requestForegroundPermissionsAsync();

        if (permission.status === 'granted') {
          const currentPosition = await Location.getCurrentPositionAsync({});
          if (isMounted) {
            const newRegion = {
              ...DEFAULT_REGION,
              latitude: currentPosition.coords.latitude,
              longitude: currentPosition.coords.longitude,
            };
            setRegion(newRegion);
          }
          await getAddress(currentPosition.coords.latitude, currentPosition.coords.longitude);
        }
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    };

    loadMap();

    return () => {
      isMounted = false;
    };
  }, [getAddress, initialCoordinates]);

  return (
    <View className="flex-1">
      <StatusBar hidden />
      <Fab placement="top left" onPress={() => router.back()} className="bg-[#E3E1F5] w-[50px] h-[50px]">
        <FabIcon as={ArrowLeftRounded} width={30} />
      </Fab>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View className="flex-1">
          {isLoaded ? (
            <MapView style={styles.map} showsUserLocation={true} initialRegion={region} onPress={onPressMap}>
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
          ) : (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator color={Colors.WHITE} />
            </View>
          )}
          <View style={[styles.actionSheet, { paddingBottom: insets.bottom + 24 }]}>
            <Text fontSize={24} fontWeight={400} className="mb-6">
              {t('signup.step_1.mark_map', { ns: 'auth' })}
            </Text>
            <VStack className="gap-5">
              <Input
                label=""
                value={address ?? ''}
                editable={false}
                placeholder={t('signup.step_1.select_map', { ns: 'auth' })}
                onChangeText={() => {}}
                onBlur={() => {}}
                icon={LocationFilled}
                leftIcon
              />

              <Button onPress={onConfirmData}>{t('signup.step_1.confirm_address', { ns: 'auth' })}</Button>
            </VStack>
          </View>
        </View>
      </TouchableWithoutFeedback>
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
});
