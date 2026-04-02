import { View } from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarHopper } from '@/assets/svg';
import { useMe } from '@/src/hooks';
import { Colors } from '@/src/utils/constants/Colors';
import { userRoles } from '@/src/utils/enum/role.enum';
import { Text } from '../text/text.component';
import { Box } from '../ui/box';
import { HStack } from '../ui/hstack';

export default function Advice() {
  const { t } = useTranslation();
  const { user } = useMe();

  return (
    <View className="w-full rounded-[20px] mt-6 p-[20px] justify-center border-[#2EC4B5] border-[1px]">
      <HStack className="gap-3 items-center rounded-full">
        <View>{user?.role === userRoles.USER_HOPPER ? <AvatarHopper width={92} height={92} /> : <Avatar width={92} height={92} />}</View>
        <Box className="flex-1 gap-2">
          <Text textColor={Colors.SECONDARY} fontSize={18} fontWeight={600}>
            {user?.role === userRoles.USER_HOPPER ? t('home.hopper.advice.title', { ns: 'home' }) : t('home.hoppy.title', { ns: 'home' })}
          </Text>
          <Text textColor={Colors.GRAY} fontSize={16} fontWeight={400}>
            {user?.role === userRoles.USER_HOPPER ? t('home.hopper.advice.description', { ns: 'home' }) : t('home.hoppy.description', { ns: 'home' })}
          </Text>
        </Box>
      </HStack>
    </View>
  );
}
