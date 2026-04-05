import { Linking, StyleSheet, View } from 'react-native';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { Button } from '@/src/components/button/button.component';
import { VStack } from '@/src/components/ui/vstack';
import { getTermsAndConditions } from '@/src/services/user.service';
import { Colors } from '@/src/utils/constants/Colors';
import { AuthRoutesLink } from '@/src/utils/enum/auth.routes';
import { userRoles } from '@/src/utils/enum/role.enum';
import { Text } from '../../text/text.component';
import { Checkbox, CheckboxIcon, CheckboxIndicator } from '../../ui/checkbox';
import { HStack } from '../../ui/hstack';
import { CheckIcon } from '../../ui/icon';
import TermsScreen from '../../register/TermsScreen';
import { createUser, login } from '@/src/services/auth.service';
import { useAuth } from '@/src/context/auth.context';
import { RegisterType } from '@/src/utils/types/register.type';
import { useToast } from '@/src/hooks';

type Step4Props = {
  payloadValues: RegisterType;
  clearPayload: React.Dispatch<React.SetStateAction<{} | null>>;
};

export default function Step4(props: Step4Props) {
  const { payloadValues, clearPayload } = props;
  const { t } = useTranslation();
  const { setToken, clearLocation } = useAuth();
  const { showToast } = useToast();

  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const storeTokens = async (token: string, refreshToken: string) => {
    const tokenData = JSON.stringify({ token, refreshToken });
    setToken(tokenData);
  };

  const handleTermsAndConditions = async () => {
    try {
      const resp = await getTermsAndConditions();

      if (payloadValues?.role === userRoles.USER_HOPPER) {
        Linking.openURL(resp.hopperTermsConditions);
      } else {
        Linking.openURL(resp.hoppyTermsConditions);
      }
    } catch (error) {
      console.error('Error al abrir términos y condiciones:', error);
      showToast({
        message: t('server_error', { ns: 'utils' }),
        action: 'error',
        duration: 3000,
        placement: 'bottom',
      });
    }
  };

  const handleFinishRegister = async () => {
    if (!checked || loading) return;

    setLoading(true);

    try {
      await createUser({
        email: payloadValues.email,
        password: payloadValues.password,
        role: payloadValues.role,
        userInfo: {
          rut: payloadValues.userInfo?.rut || '',
          firstName: payloadValues.userInfo?.firstName || '',
          lastName: payloadValues.userInfo?.lastName || '',
          home_address: {
            address: payloadValues.userInfo?.user_address?.address || '',
            lat: payloadValues.userInfo?.user_address?.latitude || 0,
            lng: payloadValues.userInfo?.user_address?.longitude || 0,
          },
          phone: payloadValues.phone || '',
          countryCode: payloadValues.countryCode || '',
          reference_code:
            payloadValues.reference_code ||
            payloadValues.userInfo?.reference_code ||
            '',
          hotel_name: payloadValues.userInfo?.hotel_address?.name || '',
          hotel_location: {
            address: payloadValues.userInfo?.hotel_address?.address || '',
            lat: payloadValues.userInfo?.hotel_address?.latitude || 0,
            lng: payloadValues.userInfo?.hotel_address?.longitude || 0,
          },
        },
      });

      const response = await login({
        email: payloadValues.email,
        password: payloadValues.password,
      });

      await storeTokens(response.access_token, response.refresh_token);

      clearPayload(null);
      clearLocation();

      router.replace(AuthRoutesLink.FINISH_ONBOARDING);
    } catch (error) {
      console.error('Error al registrar usuario:', error);

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
    <View style={styles.formulary} className="pb-4">
      <Text className="text-lg mb-4">{t('signup.step_4.title')}</Text>

      <Formik initialValues={{}} onSubmit={() => {}}>
        {() => (
          <VStack
            space="lg"
            className="flex-1 justify-between w-full items-center"
            style={{
              flex: 1,
              height: 400,
            }}
          >
            <View style={styles.termsContainer}>
              <TermsScreen />
            </View>

            <HStack className="w-full mb-6">
              <Checkbox
                value="true"
                size="md"
                isChecked={checked}
                onChange={(value) => setChecked(Boolean(value))}
                isInvalid={false}
                isDisabled={loading}
                className="items-center justify-center"
              >
                <CheckboxIndicator
                  style={{
                    backgroundColor: checked ? Colors.DARK_PURPLE : 'white',
                    borderColor: checked ? 'transparent' : Colors.DARK_PURPLE,
                  }}
                >
                  <CheckboxIcon as={CheckIcon} />
                </CheckboxIndicator>

                <Text>
                  <Trans
                    i18nKey="signup.terms"
                    components={{
                      custom: (
                        <Text
                          onPress={handleTermsAndConditions}
                          textColor={Colors.BLACK}
                          fontWeight={600}
                        />
                      ),
                      text: <Text />,
                    }}
                  />
                </Text>
              </Checkbox>
            </HStack>

            <Button
              onPress={handleFinishRegister}
              disabled={!checked || loading}
              loading={loading}
            >
              {t('signup.step_4.register')}
            </Button>
          </VStack>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  formulary: {
    gap: 16,
    flex: 1,
  },
  termsContainer: {
    borderWidth: 1,
    borderColor: Colors.DARK_PURPLE,
    borderRadius: 10,
    padding: 12,
    maxHeight: 250,
    backgroundColor: '#F9F9F9',
  },
});