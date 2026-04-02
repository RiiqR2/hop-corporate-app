import { StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { router, useNavigation } from 'expo-router';
import { InfoCircle } from '@/assets/svg';
import { Container, Header } from '@/src/components';
import Switch from '@/src/components/switch/switch.comonent';
import { Text } from '@/src/components/text/text.component';
import { Box } from '@/src/components/ui/box';
import { HStack } from '@/src/components/ui/hstack';
import { Icon } from '@/src/components/ui/icon';
import { useMe, useToast } from '@/src/hooks';
import { updateUserOne } from '@/src/services/auth.service';
import { Colors } from '@/src/utils/constants/Colors';
import { AuthRoutesLink } from '@/src/utils/enum/auth.routes';

export default function AccountState() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user } = useMe();
  const { showToast } = useToast();

  const [toggleSwitch, setToggleSwitch] = useState(user?.isActive!);

  useEffect(() => {
    navigation.setOptions({
      header: () => <Header title={t('settings.account_state', { ns: 'utils' })} arrow onPressArrow={() => router.back()} />,
    });
  }, [navigation]);

  const handleDeactivateAccount = async () => {
    try {
      await updateUserOne(user?.id!, {
        isActive: false,
        email: user?.email,
      });

      router.replace(AuthRoutesLink.SIGN_IN);
    } catch {
      showToast({
        message: t('server_error', { ns: 'utils' }),
        action: 'error',
        duration: 3000,
        placement: 'bottom',
      });
    }
  };

  return (
    <Container>
      <Box style={styles.box} className="items-start justify-center gap-4 mt-8">
        <HStack className="justify-between w-full">
          <Text fontSize={20} fontWeight={400} textColor={Colors.DARK_GREEN}>
            {t('settings.account_active', { ns: 'utils' })}
          </Text>
          <Switch
            onToggleSwitch={() => {
              setToggleSwitch(!toggleSwitch);
              handleDeactivateAccount();
            }}
            isOn={toggleSwitch}
          />
        </HStack>
      </Box>
      <HStack className="mt-8 gap-2 items-start">
        <Icon as={InfoCircle} />
        <Text className="w-[90%]">{t('settings.deactivate_account', { ns: 'utils' })}</Text>
      </HStack>
    </Container>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: Colors.LIGHT_GRADIENT_1,
    borderRadius: 40,
    paddingHorizontal: 40,
    paddingVertical: 15.5,
  },
  divider: {
    backgroundColor: Colors.PRIMARY,
    height: 1,
    width: '100%',
  },
});
