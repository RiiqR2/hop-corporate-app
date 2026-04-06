import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { CalendarActive, ClockActive, ProfileActive, Avatar, AvatarHopper, Car, CourtHouse, Danger, WalletActive } from '@/assets/svg';
import { Container } from '@/src/components';
import { Text } from '@/src/components/text/text.component';
import { Box } from '@/src/components/ui/box';
import { Divider } from '@/src/components/ui/divider';
import { HStack } from '@/src/components/ui/hstack';
import { ChevronRightIcon, Icon } from '@/src/components/ui/icon';
import capitalizeWords from '@/src/helpers/capitalize-words';
import { checkEmptyFields } from '@/src/helpers/check-empty-fields';
import { useMe } from '@/src/hooks';
import * as checkValidations from '@/src/utils/constants/check-validations';
import { Colors } from '@/src/utils/constants/Colors';
import { ProfileRoutesLink } from '@/src/utils/enum/profile.routes';
import { userRoles } from '@/src/utils/enum/role.enum';
import { TabsRoutesLink } from '@/src/utils/enum/tabs.routes';

export default function Profile() {
  const { user } = useMe();

  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);






  const emptyFields = checkEmptyFields(
    user?.userInfo!,
    checkValidations.keysToCheck.filter((item) => (user?.role === userRoles.USER_HOPPER ? item !== 'hotel_name' && item !== 'hotel_location' : true))
  );

  const hotelFields = ['hotel_name', 'hotel_location'];

  const isHotelDataMissing = hotelFields.every((field) => emptyFields.includes(field));

  const shortcuts = [
    {
      icon: ProfileActive,
      name: t('profile.home.shortcuts.personal_data', { ns: 'profile' }),
      to: ProfileRoutesLink.PERSONAL_DATA,
    },
    {
      icon: Car,
      name: t('profile.home.shortcuts.vehicle', { ns: 'profile' }),
      to: ProfileRoutesLink.VEHICLE_DATA,
    },
    {
      icon: isHotelDataMissing ? Danger : CourtHouse,
      name: t('profile.home.shortcuts.hotel', { ns: 'profile' }),
      to: ProfileRoutesLink.HOTEL,
    },
    {
      icon: CalendarActive,
      name: t('profile.home.shortcuts.reservations', { ns: 'profile' }),
      to: TabsRoutesLink.BOOKING,
    },
    {
      icon: ClockActive,
      name: t('profile.home.shortcuts.history', { ns: 'profile' }),
      to: TabsRoutesLink.HISTORY,
    }
  ];

  const handleHover = (id: number, isHovered: boolean) => {
    setHoveredIndex(isHovered ? id : null);
  };

  const filteredShortcuts = shortcuts.filter((item) => {
    if (user?.role === userRoles.USER_HOPPER && item.icon === CourtHouse) {
      return false;
    }
    if (user?.role === userRoles.USER_PASSENGER && item.icon === Car) {
      return false;
    }
    return true;
  });

  return (
    <Container>
      <Box className="justify-center items-center">
        {user?.userInfo.profilePic ? (
          <Image
            source={{
              uri: user?.userInfo.profilePic,
            }}
            width={185}
            height={185}
            className="rounded-full"
          />
        ) : user?.role === userRoles.USER_HOPPER ? (
          <AvatarHopper width={185} height={185} />
        ) : (
          <Avatar width={185} height={185} />
        )}
        <Text fontSize={24} fontWeight={400} textColor={Colors.DARK_PURPLE} className="mt-2">
          {capitalizeWords(user?.userInfo.firstName || '')} {capitalizeWords(user?.userInfo.lastName || '')}
        </Text>
        {user?.userInfo?.user_code && user.userInfo.user_code !== "" && user.role === userRoles.USER_PASSENGER
          ? (
            <Text textColor={Colors.SECONDARY} fontWeight={600} fontSize={20}>
              {user.userInfo.user_code}
            </Text>
          )
          : null}
        <Text textColor={Colors.SECONDARY} fontWeight={600} fontSize={20}>
          {user?.role === userRoles.USER_HOPPER ? 'Conductor' : 'Coordinador'}
        </Text>
      </Box>
      <View style={styles.panel}>
        {filteredShortcuts.map(({ name, icon: IconItem, to }: { name: string; icon: any; to?: any }, i) => {
          return (
            <React.Fragment key={name}>
              <Pressable onPress={() => router.push(to)} disabled={!to} key={name}>
                <HStack
                  className="items-center justify-between px-4 w-full rounded-2xl"
                  style={{
                    backgroundColor: hoveredIndex === i ? Colors.SECONDARY : 'transparent',
                    paddingVertical: 8,
                  }}
                  onTouchStart={() => handleHover(i, true)}
                  onTouchEnd={() => handleHover(i, false)}
                >
                  <Box className="flex-row gap-2 items-center">
                    <View style={styles.link_icon}>
                      <IconItem width={16} height={16} color={Colors.SECONDARY} />
                    </View>
                    <Text textColor={Colors.DARK_PURPLE} fontWeight={400} fontSize={16}>
                      {name}
                    </Text>
                  </Box>
                  <Icon as={ChevronRightIcon} color={Colors.DARK_PURPLE} width={12} height={12} />
                </HStack>
              </Pressable>
              {i !== 4 && <Divider style={styles.divider} />}
            </React.Fragment>
          );
        })}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: Colors.LIGHT_GRADIENT_1,
    marginTop: 80,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 40,
    gap: 12,
  },
  link_icon: {
    alignSelf: 'flex-start',
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 50,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: Colors.PRIMARY,
  },
  skeleton_image: {
    width: 185,
    height: 185,
  },
});
