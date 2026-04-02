import { ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { router, useNavigation } from 'expo-router';
import { Container, Header, Button, Text } from '@/src/components';
import { Box } from '@/src/components/ui/box';
import { useAuth } from '@/src/context/auth.context';
import { useMe, useToast } from '@/src/hooks';
import { deleteUser } from '@/src/services/auth.service';
import { Colors } from '@/src/utils/constants/Colors';
import { AuthRoutesLink } from '@/src/utils/enum/auth.routes';

export default function DeleteAccount() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user } = useMe();
  const { clearToken } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <Header
          title={t('profile.delete_account.title', { ns: 'profile' })}
          arrow
          onPressArrow={() => router.back()}
        />
      ),
    });
  }, [navigation]);

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await deleteUser(user?.id!);
      clearToken();
      router.replace(AuthRoutesLink.SIGN_IN);
    } catch {
      showToast({
        message: t('server_error', { ns: 'utils' }),
        action: 'error',
        duration: 3000,
        placement: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Box className="mt-8 gap-8">
        <Text fontSize={16} fontWeight={400} textColor={Colors.DARK_GREEN}>
          {t('profile.delete_account.message', { ns: 'profile' })}
        </Text>
        <Button onPress={handleDeleteAccount} stretch disabled={loading}>
          {loading ? (
            <ActivityIndicator color={Colors.WHITE} />
          ) : (
            t('profile.delete_account.button', { ns: 'profile' })
          )}
        </Button>
      </Box>
    </Container>
  );
}
