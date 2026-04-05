import { Linking, NativeEventEmitter, NativeModules, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { MetaMapRNSdk } from 'react-native-expo-metamap-sdk';
import { router } from 'expo-router';
import { CircleArrowRight } from '@/assets/svg';
import { METAMAP_API_KEY, METAMAP_FLOW_ID } from '@/config';
import { Button } from '@/src/components/button/button.component';
import { VStack } from '@/src/components/ui/vstack';
import { checkAndRequestPermissions } from '@/src/helpers/check-permissions';
import { useMe } from '@/src/hooks';
import { getTermsAndConditions } from '@/src/services/user.service';
import { sendWebhookData } from '@/src/services/validation.service';
import { Colors } from '@/src/utils/constants/Colors';
import { AuthRoutesLink } from '@/src/utils/enum/auth.routes';
import { userRoles } from '@/src/utils/enum/role.enum';
import { Text } from '../../text/text.component';
import { Checkbox, CheckboxIcon, CheckboxIndicator } from '../../ui/checkbox';
import { HStack } from '../../ui/hstack';
import { CheckIcon } from '../../ui/icon';
import TermsScreen from '../../register/TermsScreen';
interface VerificationResult {
  identityId?: string;
  verificationId?: string;
  status: 'success' | 'failed' | 'pending' | 'canceled';
}

export default function Step4() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [checked, setChecked] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult>({
    status: 'pending',
  });

  const { t } = useTranslation();
  const { user } = useMe();

  useEffect(() => {
    const MetaMapVerifyResult = new NativeEventEmitter(NativeModules.MetaMapRNSdk);

    const successListener = MetaMapVerifyResult.addListener('verificationSuccess', (data) => {
      handleVerificationSuccess(data);
    });

    const cancelListener = MetaMapVerifyResult.addListener('verificationCanceled', (data) => {
      handleVerificationCanceled(data);
    });

    return () => {
      successListener.remove();
      cancelListener.remove();
    };
  }, []);

  const handleVerificationSuccess = async (data: any) => {
    try {
      const result: VerificationResult = {
        identityId: data.identityId || '',
        verificationId: data.verificationId || Date.now().toString(),
        status: 'success',
      };

      await AsyncStorage.setItem('metamap_verification', JSON.stringify(result));
      setVerificationResult(result);
      setIsDone(true);
      setIsVerifying(false);

      if (user?.id) {
        await sendWebhookData({
          event: 'verification.completed',
          verification: {
            id: result.verificationId || '',
            status: 'completed',
            result: {
              details: data.details || {},
              decision: 'approved',
            },
            verificationType: 'identity',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          user: {
            id: user.id,
          },
        });
      }
    } catch {
      setVerificationError('Error al guardar los datos de verificación');
    }
  };

  const handleVerificationCanceled = async (data: any) => {
    try {
      const result: VerificationResult = {
        status: 'canceled',
      };

      await AsyncStorage.setItem('metamap_verification', JSON.stringify(result));
      setVerificationResult(result);
      setIsVerifying(false);
      setVerificationError('La verificación fue cancelada');

      if (user?.id) {
        await sendWebhookData({
          event: 'verification.canceled',
          verification: {
            id: data.verificationId || Date.now().toString(),
            status: 'canceled',
            result: {
              details: {},
              decision: 'canceled',
            },
            verificationType: 'identity',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          user: {
            id: user.id,
          },
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al procesar verificación cancelada:', error);
    }
  };

  const startVerification = () => {
    try {
      setIsVerifying(true);
      setVerificationError(null);
      checkAndRequestPermissions();

      const metadata = { userId: user?.id };

      MetaMapRNSdk.showFlow(METAMAP_API_KEY, METAMAP_FLOW_ID, metadata);
    } catch {
      setVerificationError('No se pudo iniciar la verificación');
      setIsVerifying(false);
    }
  };

  const handleTermsAndConditions = async () => {
    const resp = await getTermsAndConditions();

    if (user?.role === userRoles.USER_HOPPER) {
      Linking.openURL(resp.hopperTermsConditions);
    } else {
      Linking.openURL(resp.hoppyTermsConditions);
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

          <View
            style={{
              borderWidth: 1,
              borderColor: Colors.DARK_PURPLE,
              borderRadius: 10,
              padding: 12,
              maxHeight: 250, // puedes aumentar si quieres mostrar más texto visible
              backgroundColor: '#F9F9F9',
            }}
          >
          <TermsScreen/>
          </View>

            <HStack className="w-full mb-6">
              <Checkbox
                value="true"
                size="md"
                isChecked={checked}
                onChange={setChecked}
                isInvalid={false}
                isDisabled={false}
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
                    components={{ custom: <Text onPress={handleTermsAndConditions} textColor={Colors.BLACK} fontWeight={600} />, text: <Text /> }}
                  />
                </Text>
              </Checkbox>
            </HStack>
            <Button
              onPress={async () => {
                try {
                  router.replace(AuthRoutesLink.WAITING_VALIDATION);
                } catch (error) {
                  console.error('Error al registrar usuario:', error);
                  setVerificationError('Ocurrió un error al registrar la información.');
                }
              }}
              disabled={!Boolean(checked)}
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
});
