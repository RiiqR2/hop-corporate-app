import { Animated, Pressable, StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MapView, { Marker } from 'react-native-maps';
import useSWR from 'swr';
import { router, useNavigation } from 'expo-router';
import { Notification, NotificationActive } from '@/assets/svg';
import { Balance, Booking, BookingsHopper, Container, Header, LinearGradient, Loading, ModalBooking, Services, TakeABooking, Void } from '@/src/components';
import { ModalBook } from '@/src/components/modal/modal_booking/modal-book-acepted.component';
import { Center } from '@/src/components/ui/center';
import { ChevronDownIcon, ChevronUpIcon, Icon } from '@/src/components/ui/icon';
import { VStack } from '@/src/components/ui/vstack';
import { useAuth } from '@/src/context/auth.context';
import { useDrawer } from '@/src/context/drawer.context';
import capitalizeWords from '@/src/helpers/capitalize-words';
import { checkEmptyFields } from '@/src/helpers/check-empty-fields';
import { useMe, useSocket } from '@/src/hooks';
import { getNotifications } from '@/src/services/notification.service';
import { keysToCheck } from '@/src/utils/constants/check-validations';
import { Colors } from '@/src/utils/constants/Colors';
import { AuthRoutesLink } from '@/src/utils/enum/auth.routes';
import { userRoles } from '@/src/utils/enum/role.enum';
import { notificationTypeValues, TravelNotification } from '@/src/utils/interfaces/booking.notification.interface';

import OnlineBadge from '@/src/components/on-line-badge/OnlineBadge';


export default function HomeScreen() {
  const navigator = useNavigation();
  const { t } = useTranslation();
  const { location } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [travelData, setTravelData] = useState<TravelNotification>();
  const { user } = useMe();

  const [showHoppyModal, setShowHoppyModal] = useState(false);
  const { setIsDrawerOpen } = useDrawer();
  const { data: notifications } = useSWR('/notifications/', () => getNotifications(user?.id!), {
    revalidateOnMount: true,
    errorRetryInterval: 5000,
  });

  const hasUnseenNotifications = notifications?.result.some((notification) => notification.seen) ?? false;

  useEffect(() => {
    navigator.setOptions({
      header: () => (
        <Header
          title={`${t('home.header', { ns: 'home' })} ${capitalizeWords(user?.userInfo?.firstName || '')}!`}
          icon={hasUnseenNotifications ? <NotificationActive /> : <Notification />}
          onPressIcon={() => router.push('/notification')}
        />
      ),
      headerShown: Boolean(user),
    });
    setIsDrawerOpen(false);
  }, [navigator, user, setIsDrawerOpen, hasUnseenNotifications]);

  const emptyFields =
    user &&
    checkEmptyFields(
      user?.userInfo,
      keysToCheck.filter((item) => (user?.role === userRoles.USER_HOPPER ? item !== 'hotel_name' && item !== 'hotel_location' : true))
    );

  const height = useState(new Animated.Value(400))[0];
  const toggleContainer = () => {
    setIsOpen(!isOpen);

    Animated.timing(height, {
      toValue: isOpen ? 60 : 400,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const socket = useSocket('http://192.168.1.4:3000/');

  useEffect(() => {
    if (!socket || !user?.id) return;

    const eventName = `user-${user.id}`;

    if (!socket.connected) {
      socket.connect();
    }

    socket.on(eventName, (message: TravelNotification) => {
      if (message.type.includes('CANCELLED') || message.type.includes("PAYMENT")) return;
      if (message.type === notificationTypeValues.HOPPER_ACCEPT_TRAVEL && user.role === userRoles.USER_PASSENGER) {
        setShowHoppyModal(true);
        setTravelData(message);
        return;
      }
      setIsModalOpen(true);
      setTravelData(message);
    });

    return () => {
      socket.off(eventName);
    };
  }, [socket, user?.id]);

  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", user?.role)

  const renderContent =
    user?.role === userRoles.USER_PASSENGER ? (
      <Container extraHeight={true} style={{ borderBottomStartRadius: 20 }}>
        <Balance id={user?.id} />
        <TakeABooking />
        <Services />
        <Booking />
      </Container>
    ) : (
      <Animated.View style={[styles.animated_container, { height: height }]}>
        <Container extraHeight={false} style={{ borderBottomStartRadius: 20 }}>
          <VStack className="mt-4">
            <Balance id={user?.id!} />
            {emptyFields && (
              <View style={{}}>
                {emptyFields?.length > 0 && <Void />}
                {emptyFields?.length === 0 && <BookingsHopper />}
              </View>
            )}
          </VStack>
        </Container>
        <Pressable onPress={toggleContainer} style={styles.arrow}>
          {isOpen ? <Icon as={ChevronUpIcon} /> : <Icon as={ChevronDownIcon} />}
        </Pressable>
      </Animated.View>
    );

  const handleClose = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (user && user.status != "ACTIVE") {
      router.replace(AuthRoutesLink.WAITING_VALIDATION);
    }
  }, [user?.status]);

  useEffect(() => {
    if (!user) {
      setIsDrawerOpen(true);
    }
  }, [user, setIsDrawerOpen]);

  if (!user) {
    return (
      <LinearGradient>
        <Center>
          <Loading />
        </Center>
      </LinearGradient>
    );
  }

  return (
    <View className="flex-1">
      {renderContent}
      {user?.role === userRoles.USER_HOPPER && (
        <MapView
          style={styles.map}
          showsUserLocation={true}
          initialRegion={{
            latitude: location?.latitude || 0,
            longitude: location?.longitude || 0,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: location?.latitude || 0,
              longitude: location?.longitude || 0,
            }}
          />
        </MapView>
      )}
      {isModalOpen && user!.role === userRoles.USER_HOPPER && <ModalBooking isOpen={isModalOpen} handleClose={handleClose} travel={travelData!} user={user} />}
      {showHoppyModal && user?.role! === userRoles.USER_PASSENGER && (
        <ModalBook isOpen={showHoppyModal} handleClose={() => setShowHoppyModal(false)} travel={travelData!} user={user} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  arrow: {
    position: 'absolute',
    bottom: -20,
    right: 0,
    backgroundColor: Colors.WHITE,
    padding: 5,
    alignItems: 'center',
    borderBottomEndRadius: 8,
    borderBottomStartRadius: 8,
    width: 80,
  },
  animated_container: {
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  map: {
    flex: 1,
    width: '100%',
  },
});
