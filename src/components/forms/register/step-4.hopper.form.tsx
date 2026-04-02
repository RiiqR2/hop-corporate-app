import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cleanRut } from 'rutlib';
import { Button } from '@/src/components/button/button.component';
import { Select } from '@/src/components/select/select.component';
import { Text } from '@/src/components/text/text.component';
import { VStack } from '@/src/components/ui/vstack';
import { useAuth } from '@/src/context/auth.context';
import capitalizeWords from '@/src/helpers/capitalize-words';
import { vehicleName } from '@/src/helpers/parser-names';
import { useToast } from '@/src/hooks';
import { createUser, getUserLogged, login, updateUserDocuments, updateVehicleUser } from '@/src/services/auth.service';
import { Colors } from '@/src/utils/constants/Colors';
import { translateVehicles } from '@/src/utils/constants/vehicles.constants';
import { userRoles } from '@/src/utils/enum/role.enum';
import { validationSchemaS4 } from '@/src/utils/schemas/register.schema';
import { RegisterType } from '@/src/utils/types/register.type';
import axios from 'axios';

type formProps = {
  payloadValues: RegisterType;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  payload: React.Dispatch<React.SetStateAction<{}>>;
  clearPayload: React.Dispatch<React.SetStateAction<{}>>;
  extraData: string;
  role: string;
};

export default function Step4Hopper(props: formProps) {
  const { setStep, clearPayload, payloadValues } = props;
  const { t } = useTranslation();
  const { setToken, clearLocation } = useAuth();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const schema = validationSchemaS4(t);

  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [showTooltipA, setShowTooltipA] = useState(false);
  const [showTooltipB, setShowTooltipB] = useState(false);
  const storeTokens = async (token: string, refreshToken: string) => {
    const payload = { token, refreshToken };
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    await Promise.resolve(setToken(JSON.stringify(payload)));
    return true;
  };


  const handleRegisterStep4 = async (values: { type: string; passengers: string; accessibility: string; luggageSpace: string; specialLuggage: string }) => {
    setLoading(true);

    try {
      await createUser({
        email: payloadValues.email,
        password: payloadValues.password,
        role: payloadValues.role,
        userInfo: {
          rut: payloadValues.userInfo.rut,
          firstName: payloadValues.userInfo.firstName,
          lastName: payloadValues.userInfo.lastName,
          phone: payloadValues.phone,
          countryCode: payloadValues.countryCode,
          bank_account_holder: payloadValues.userInfo.bank_account_holder,
          bank_account_rut: cleanRut(payloadValues.userInfo.bank_account_rut),
          bank_account_type: payloadValues.userInfo.bank_account_type,
          bank_account: payloadValues.userInfo.bank_account,
          bank_name: payloadValues.userInfo.bank_name,
          home_address: {
            lat: payloadValues.userInfo.user_address.latitude,
            lng: payloadValues.userInfo.user_address.longitude,
            address: payloadValues.userInfo.user_address.address,
          },
        },
        bank_name: payloadValues.userInfo.bank_name,
      });

      const response = await login({
        email: payloadValues.email,
        password: payloadValues.password,
      });

      await storeTokens(response.access_token, response.refresh_token);

      const user = await getUserLogged();

      if (user.role === userRoles.USER_HOPPER) {
        await updateUserDocuments(user.id, {
          vehiclePictures: payloadValues.vehicleDocs.vehicle_picture,
          identificationPictures: payloadValues.vehicleDocs.identification_picture,
          seremiDecree: payloadValues.vehicleDocs.seremi,
          driverResume: payloadValues.vehicleDocs.curriculum_vitae,
          circulationPermit: payloadValues.vehicleDocs.permission,
          passengerInsurance: payloadValues.vehicleDocs.secure,
        });

        await updateVehicleUser(user.id, {
          type: selectedVehicle,
          passengers: values.passengers,
          suitcases: values.luggageSpace.replace('+', ''),
          specialLuggage: values.specialLuggage.toLocaleLowerCase() === 'si' ? true : false,
          accessibility: values.accessibility.toLocaleLowerCase() === 'si' ? true : false,
        });
      }

      clearPayload({});
      clearLocation();

      setStep(5);
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

  const translatedVehicles = translateVehicles(t);
  const translatedVehicleName = vehicleName(t);

  return (
    <Formik
      initialValues={{
        type: '',
        passengers: '',
        accessibility: '',
        luggageSpace: '',
        specialLuggage: '',
      }}
      onSubmit={handleRegisterStep4}
      validationSchema={schema}
    >
      {({ handleSubmit, setFieldValue, values, touched, errors }) => {
        return (
          <Pressable onPress={() => setShowTooltipA(false)}>
            <View style={styles.formulary} className="pb-4">
              <Text fontSize={16} fontWeight={400}>
                {t('signup.step_4_hopper.title')}
              </Text>

              <VStack space="lg">
                <Select
                  label={t('signup.step_4_hopper.fields.type.label')}
                  placeholder={t('signup.step_4_hopper.fields.type.placeholder')}
                  onSelect={(val) => {
                    setFieldValue('type', val);
                    setSelectedVehicle(val);
                  }}
                  options={translatedVehicles.map((item) => ({
                    value: item.type,
                    label: item.value,
                  }))}
                  value={translatedVehicleName[selectedVehicle]}
                  error={touched.type && errors.type}
                  touched={touched.type}
                />

                <Select
                  label={t('signup.step_4_hopper.fields.passengers.label')}
                  placeholder=""
                  onSelect={(val) => setFieldValue('passengers', val)}
                  options={Array.from({ length: 10 }, (_, i) => ({
                    label: `${i + 1}`,
                    value: `${i + 1}`,
                  }))}
                  value={values.passengers}
                  error={touched.passengers && errors.passengers}
                  touched={touched.passengers}
                />

                <Select
                  label={t('signup.step_4_hopper.fields.accessibility.label')}
                  placeholder=""
                  onSelect={(val) => setFieldValue('accessibility', val)}
                  options={[
                    {
                      label: t('vehicles.yes', { ns: 'utils' }),
                      value: t('vehicles.yes', { ns: 'utils' }),
                    },
                    {
                      label: t('vehicles.no', { ns: 'utils' }),
                      value: t('vehicles.no', { ns: 'utils' }),
                    },
                  ]}
                  value={capitalizeWords(values.accessibility)}
                  info={t('accessibility', { ns: 'utils' })}
                  setShowTooltip={setShowTooltipA}
                  showTooltip={showTooltipA}
                  color={Colors.LIGHT_GRADIENT_1}
                  textColor={Colors.BLACK}
                  error={touched.accessibility && errors.accessibility}
                  touched={touched.accessibility}
                />

                <Select
                  label={t('signup.step_4_hopper.fields.luggage_space.label')}
                  placeholder=""
                  onSelect={(val) => setFieldValue('luggageSpace', val)}
                  options={[
                    {
                      label: t('vehicles.low_bags', { ns: 'utils' }),
                      value: '1-3',
                    },
                    {
                      label: t('vehicles.high_bags', { ns: 'utils' }),
                      value: '4+',
                    },
                  ]}
                  value={capitalizeWords(values.luggageSpace)}
                  error={touched.luggageSpace && errors.luggageSpace}
                  touched={touched.luggageSpace}
                />

                <Select
                  label={t('signup.step_4_hopper.fields.luggage_special.label')}
                  placeholder=""
                  onSelect={(val) => setFieldValue('specialLuggage', val)}
                  options={[
                    {
                      label: t('vehicles.yes', { ns: 'utils' }),
                      value: t('vehicles.yes', { ns: 'utils' }),
                    },
                    {
                      label: t('vehicles.no', { ns: 'utils' }),
                      value: t('vehicles.no', { ns: 'utils' }),
                    },
                  ]}
                  value={capitalizeWords(values.specialLuggage)}
                  info={t('special_luggage', { ns: 'utils' })}
                  setShowTooltip={setShowTooltipB}
                  showTooltip={showTooltipB}
                  color={Colors.LIGHT_GRADIENT_1}
                  textColor={Colors.BLACK}
                  error={touched.specialLuggage && errors.specialLuggage}
                  touched={touched.specialLuggage}
                />
              </VStack>

              <Button onPress={() => handleSubmit()}>{loading ? <ActivityIndicator color={Colors.WHITE} /> : t('signup.step_2.buttons.next')}</Button>
            </View>
          </Pressable>
        );
      }}
    </Formik>
  );
}

const styles = StyleSheet.create({
  formulary: {
    gap: 16,
    paddingBottom: 120,
    flex: 1,
  },
  mark_map: {
    color: Colors.PRIMARY,
  },
});
