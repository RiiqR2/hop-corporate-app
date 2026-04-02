import { StyleSheet, View } from 'react-native';
import { Formik } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import { Input, LinearGradient } from '@/src/components';
import { Button } from '@/src/components/button/button.component';
import { KeyboardContainer } from '@/src/components/keyboard/keyboard.component';
import { Text } from '@/src/components/text/text.component';
import { Box } from '@/src/components/ui/box';
import { VStack } from '@/src/components/ui/vstack';
import { useAuth } from '@/src/context/auth.context';
import { useDrawer } from '@/src/context/drawer.context';
import { useMe } from '@/src/hooks';
import { resetPassword, updateUserData } from '@/src/services/user.service';
import { Colors } from '@/src/utils/constants/Colors';
import { AuthRoutesLink } from '@/src/utils/enum/auth.routes';
import validationSchema from '@/src/utils/schemas/new-password';

export default function NewPassword() {
  const { t } = useTranslation();
  const { token: tokenFromUrl, mode } = useLocalSearchParams() as {
    token?: string;
    mode?: string;
  };
  const isChangePasswordFlow = mode === 'change';
  const { token, clearToken } = useAuth();
  const { user } = useMe();
  const { setIsDrawerOpen } = useDrawer();

  const schema = validationSchema(t);

  const handleResetPassword = async (values: { password: string }) => {
    if (token) {
      await updateUserData(user?.id!, {
        password: values.password!,
        email: user?.email!,
      });
      clearToken();
      setIsDrawerOpen(false);
      router.dismissAll();
      router.replace(AuthRoutesLink.FINISH_RECOVER_PASSWORD);
      return;
    }

    if (!token && tokenFromUrl) {
      await resetPassword(values.password!, tokenFromUrl);
      router.replace(AuthRoutesLink.FINISH_RECOVER_PASSWORD);
    }
  };

  return (
    <LinearGradient>
      <KeyboardContainer>
        <View style={styles.container}>
          <VStack space="lg" className="items-center mb-9">
            <Text fontSize={28} fontWeight={600} textAlign="center" textColor={Colors.DARK_GREEN}>
              {t('new_password.create_new_password', { ns: 'auth' })}
            </Text>
            <Text fontSize={16} fontWeight={400} textAlign="center">
              {t('new_password.fill_fields_to_change_password', { ns: 'auth' })}
            </Text>
          </VStack>
          <Formik
            initialValues={{ password: '', confirmPassword: '' }}
            validationSchema={schema}
            onSubmit={(values) => {
              handleResetPassword(values);
            }}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <>
                <VStack space="lg">
                  <Box>
                    <Input
                      label={t('new_password.new_password_label')}
                      placeholder=""
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      value={values.password}
                      touched={touched.password}
                      error={touched.password && errors.password}
                      secureTextEntry
                      rightIcon
                    />
                  </Box>

                  <Input
                    label={t('new_password.confirm_password_label')}
                    placeholder=""
                    secureTextEntry
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    value={values.confirmPassword}
                    touched={touched.confirmPassword}
                    error={touched.confirmPassword && errors.confirmPassword}
                    rightIcon
                  />
                </VStack>
                <VStack space="lg" className="mt-28">
                  <Button onPress={() => handleSubmit()}>
                    {t('new_password.change_password_button', { ns: 'auth' })}
                  </Button>

                  {isChangePasswordFlow && (
                    <Button onPress={() => router.back()} type="ghost" variant="outline">
                      {t('new_password.cancel_button', { ns: 'auth' })}
                    </Button>
                  )}
                </VStack>
              </>
            )}
          </Formik>
        </View>
      </KeyboardContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingBottom: 24,
  },
  container: {
    paddingHorizontal: 16,
    flexGrow: 1,
    justifyContent: 'center',
  },
});
