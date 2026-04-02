import { ActivityIndicator, Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { Formik } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { Location } from '@/assets/svg';
import { Button } from '@/src/components/button/button.component';
import Input from '@/src/components/input/input.component';
import { PhoneNumber } from '@/src/components/phone-number/phone-number.component';
import { Text } from '@/src/components/text/text.component';
import { Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetDragIndicator, ActionsheetFlatList } from '@/src/components/ui/actionsheet';
import { Box } from '@/src/components/ui/box';
import { HStack } from '@/src/components/ui/hstack';
import { SearchIcon } from '@/src/components/ui/icon';
import { ActionsheetDragIndicatorWrapper } from '@/src/components/ui/select/select-actionsheet';
import { VStack } from '@/src/components/ui/vstack';
import { useAuth } from '@/src/context/auth.context';
import { useGetCoordinatesFromAddress, useRequestLocationPermission, useToast } from '@/src/hooks';
import { verifyEmail } from '@/src/services/auth.service';
import { Colors } from '@/src/utils/constants/Colors';
import { AuthRoutesLink } from '@/src/utils/enum/auth.routes';
import { validationSchema } from '@/src/utils/schemas/register.schema';
import { RegisterType } from '@/src/utils/types/register.type';
import { cleanRut, formatRut } from 'rutlib';
import { isValidRUT } from '@/src/helpers/validate-rut';

type formProps = {
  payloadValues: RegisterType;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  payload: React.Dispatch<React.SetStateAction<{}>>;
  setId: React.Dispatch<React.SetStateAction<string>>;
  role: string;
  extraData: string;
  clearPayload: React.Dispatch<React.SetStateAction<{}>>;
};

export default function Step1(props: formProps) {
  const { setStep, payload } = props;
  const { t } = useTranslation();
  const { state, updatePayload } = useAuth();
  const { showToast } = useToast();
  const { requestLocationPermission } = useRequestLocationPermission({
    url: AuthRoutesLink.MAP,
    step: 1,
  });
  const { locations, setSelectedLocation, geocodeAddress } = useGetCoordinatesFromAddress();
  const formikRef = useRef<any>(null);
  const [showActionsheet, setShowActionsheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const schema = validationSchema(t);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [rutError, setRutError] = useState('');

  const handleSearch = (searchText: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);

    const timeout = setTimeout(() => {
      if (searchText.trim()) {
        geocodeAddress(searchText);
      }
    }, 3000);

    setSearchTimeout(timeout);
  };

  const handleRegisterUser = async (values: { email: string; firstName: string; lastName: string; rut: string; password: string; contact: string; countryCode: string }) => {
    setLoading(true);
    Keyboard.dismiss();
    try {
      const data = await verifyEmail(values.email);

      if (data.existEmail) {
        showToast({
          message: t('signup.step_1.email_exists', { ns: 'auth' }),
          action: 'error',
          duration: 3000,
          placement: 'bottom',
        });

        return;
      }

      payload({
        ...props.payloadValues,
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.contact,
        countryCode: values.countryCode,
        rut: values.rut,
        userInfo: {
          home_address: {
            address: state.user_info.address,
            lat: state.user_info.latitude,
            lng: state.user_info.longitude,
          },
        },
      });
      setStep(2);
    } catch {
      showToast({
        message: t('server_error', { ns: 'utils' }),
        action: 'error',
        duration: 3000,
        placement: 'bottom',
      });
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.formulary} className="pb-4">
      <Text fontSize={16} fontWeight={400}>
        {t('signup.step_1.title', { ns: 'auth' })}
      </Text>
      <Formik
        innerRef={formikRef}
        initialValues={{
          firstName: '',
          lastName: '',
          rut: '',
          email: '',
          password: '',
          address: state.user_info.address,
          contact: '',
          countryCode: '+56',
        }}
        validationSchema={schema}
        onSubmit={(values) => {
          if (!Boolean(rutError.length > 0)) {
            handleRegisterUser(values);
          }
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useEffect(() => {
            if (state.user_info.address) {
              setFieldValue('address', state.user_info.address);
            }
          }, [state.user_info.address]);


          useEffect(() => {
            if (values.rut) {
              const cleanedRUT = cleanRut(values.rut);
              const formattedRUT = cleanedRUT.length > 7 ? formatRut(values.rut) : values.rut;
              setFieldValue('rut', formattedRUT);
              const isValid = isValidRUT(values.rut);
              if (!isValid) {
                setRutError(
                  t('validations.signup.rut.validate', {
                    ns: 'auth',
                  })
                );
              } else {
                setRutError('');
              } 
            }
          }, [values.rut, setRutError]);

          return (
            <>
              <VStack space="md">
                <Input
                  label={t('signup.step_1.name.label', { ns: 'auth' })}
                  onBlur={handleBlur('firstName')}
                  onChangeText={handleChange('firstName')}
                  placeholder=""
                  value={values.firstName}
                  error={touched.firstName && errors.firstName}
                  touched={touched.firstName}
                  autoCapitalize="words"
                />
                <Input
                  label={t('signup.step_1.last_name.label', { ns: 'auth' })}
                  onBlur={handleBlur('lastName')}
                  onChangeText={handleChange('lastName')}
                  placeholder=""
                  value={values.lastName}
                  error={touched.lastName && errors.lastName}
                  touched={touched.lastName}
                  autoCapitalize="words"
                />

                <Input
                  label={t('signup.step_1.rut.label', {
                    ns: 'auth',
                  })}
                  onBlur={handleBlur('rut')}
                  onChangeText={(text) => {
                    if (text.length <= 12) {
                      handleChange('rut')(text);
                    }
                  }}
                  placeholder=""
                  value={values.rut} 
                  error={(touched.rut && errors.rut) || rutError}
                  touched={touched.rut}
                  maxLength={11}
                  keyboardType="numbers-and-punctuation"
                />

                <PhoneNumber
                  label={t('signup.step_1.phone.label', { ns: 'auth' })}
                  onBlur={handleBlur('contact')}
                  onChangeText={(text: string) => {
                    const numericText = text.replace(/[^0-9]/g, '');
                    handleChange('contact')(numericText);
                  }}
                  value={values.contact}
                  placeholder=""
                  error={touched.contact && errors.contact}
                  touched={touched.contact}
                  keyboardType="number-pad"
                  handleChangeCode={handleChange('countryCode')}
                  phoneNumber={`${values.countryCode}`}
                />

                <Input
                  label={t('signup.step_1.email.label', { ns: 'auth' })}
                  onBlur={handleBlur('email')}
                  onChangeText={handleChange('email')}
                  placeholder=""
                  value={values.email}
                  error={touched.email && errors.email}
                  touched={touched.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Input
                  label={t('signup.step_1.password.label', { ns: 'auth' })}
                  placeholder=""
                  secureTextEntry
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  touched={touched.password}
                  error={touched.password && errors.password}
                  rightIcon
                />

                <Box className="gap-4 ">
                  <Input
                    label={t('signup.step_1.address.label', { ns: 'auth' })}
                    onBlur={handleBlur('address')}
                    onChangeText={(val: string) => {
                      setFieldValue('address', val);

                      if (val.trim() === '') {
                        updatePayload({
                          user_info: {
                            ...state.user_info,
                            address: '',
                            latitude: '',
                            longitude: '',
                          },
                        });
                      }
                    }}
                    placeholder=""
                    value={values.address ? values.address : String(state.user_info.address)}
                    error={touched?.address && errors?.address}
                    touched={touched?.address}
                    stretch
                    onPress={() => setShowActionsheet(true)}
                    editable={false}
                    pressable={true}
                    multiline={state.user_info.address.trim().length > 25 ? true : false}
                  />

                  <Pressable onPress={() => requestLocationPermission()}>
                    <HStack space="xs">
                      <Location color={Colors.DARK_GREEN} width={14} />
                      <Text fontSize={14} fontWeight={500} textColor={Colors.DARK_GREEN}>
                        {t('signup.step_1.mark_map', { ns: 'auth' })}
                      </Text>
                    </HStack>
                  </Pressable>
                </Box>
                <VStack className="mt-[24px] gap-5 w-full items-center">
                  <Button style={{ alignSelf: 'center' }} onPress={() => handleSubmit()}>
                    {loading ? <ActivityIndicator color={Colors.WHITE} /> : t('signup.step_1.next', { ns: 'auth' })}
                  </Button>
                  <Text fontSize={14} fontWeight={300} textColor={Colors.BLACK}>
                    {t('signup.step_1.already_have_account', { ns: 'auth' })}{' '}
                    <Text fontSize={14} fontWeight={600} onPress={() => router.push(AuthRoutesLink.SIGN_IN)}>
                      {t('signup.step_1.sign_in', { ns: 'auth' })}
                    </Text>
                  </Text>
                </VStack>
              </VStack>
              <Actionsheet isOpen={showActionsheet} onClose={() => setShowActionsheet(false)} snapPoints={[70]}>
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
                            setFieldValue('address', `${item.name.split(',')[0]},${item.name.split(',')[1]}.`);
                            updatePayload({
                              user_info: {
                                latitude: item.latitude,
                                longitude: item.longitude,
                                address: `${item.name.split(',')[0]},${item.name.split(',')[1]}.`,
                              },
                            });
                            setShowActionsheet(false);
                          }}
                          className="py-2.5 px-4 border-b border-[#9FE4DD] bg-white rounded-lg mb-2.5"
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
        }}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  formulary: {
    gap: 16,
    flex: 1,
  },
  search_bar_container: {
    width: '100%',
    marginBottom: 24,
    marginTop: 24,
  },
});
