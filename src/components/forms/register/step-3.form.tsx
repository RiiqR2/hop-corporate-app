import { Pressable, StyleSheet, View } from 'react-native';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Location } from '@/assets/svg';
import Input from '@/src/components/input/input.component';
import { StepControl } from '@/src/components/step-controls/step-control.component';
import { Text } from '@/src/components/text/text.component';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetFlatList,
} from '@/src/components/ui/actionsheet';
import { Box } from '@/src/components/ui/box';
import { HStack } from '@/src/components/ui/hstack';
import { SearchIcon } from '@/src/components/ui/icon';
import { VStack } from '@/src/components/ui/vstack';
import { useAuth } from '@/src/context/auth.context';
import { useGetCoordinatesFromAddress, useRequestLocationPermission, useToast } from '@/src/hooks';
import { Colors } from '@/src/utils/constants/Colors';
import { AuthRoutesLink } from '@/src/utils/enum/auth.routes';
import { UserInfo } from '@/src/utils/interfaces/auth.interface';
import { validationSchemaS3 } from '@/src/utils/schemas/register.schema';
import { RegisterType } from '@/src/utils/types/register.type';

type formProps = {
  payloadValues: RegisterType;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  payload: React.Dispatch<React.SetStateAction<{}>>;
  extraData: string;
  role: string;
};

export default function Step3(props: formProps) {
  const { setStep, payloadValues, payload } = props;
  const { t } = useTranslation();
  const { state, updatePayload } = useAuth();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const [showActionsheet, setShowActionsheet] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const { locations, setSelectedLocation, geocodeAddress } = useGetCoordinatesFromAddress();

  const persistedReferenceCode = (payloadValues as any)?.reference_code || '';
  const persistedHotelName =
    (payloadValues as any)?.hotel_address?.hotel_name ||
    payloadValues.userInfo?.hotel_address?.name ||
    '';
  const persistedHotelAddress =
    payloadValues.userInfo?.hotel_address?.address || state.hotel_info.address;

  const schema = validationSchemaS3(t);

  const { requestLocationPermission } = useRequestLocationPermission({
    url: AuthRoutesLink.MAP,
    step: 3,
  });

  const handleSearch = (searchText: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);

    const timeout = setTimeout(() => {
      if (searchText.trim()) {
        geocodeAddress(searchText);
      }
    }, 3000);

    setSearchTimeout(timeout);
  };

  const handleRegisterStep3 = async (values: Partial<UserInfo>) => {
    setLoading(true);

    try {
      payload({
        ...payloadValues,
        reference_code: values.reference_code || '',
        hotel_address: {
          ...(payloadValues as any)?.hotel_address,
          hotel_name: values.hotel_name || '',
          address: state.hotel_info.address,
          latitude: state.hotel_info.latitude,
          longitude: state.hotel_info.longitude,
        },
      });

      setStep(3);
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
    <View style={styles.formulary} className="pb-4">
      <Text fontSize={16} fontWeight={400}>
        {t('signup.step_3.title')}
      </Text>

      <Formik
        initialValues={{
          reference_code: persistedReferenceCode,
          hotel_name: persistedHotelName,
          home_address: persistedHotelAddress,
        }}
        validationSchema={schema}
        onSubmit={(values) => {
          handleRegisterStep3({
            reference_code: values.reference_code,
            hotel_name: values.hotel_name,
            hotel_location: {
              address: state.hotel_info.address,
              lat: state.hotel_info.latitude,
              lng: state.hotel_info.longitude,
            },
          });
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => {
          useEffect(() => {
            if (state.hotel_info.address) {
              setFieldValue('home_address', state.hotel_info.address);
            }
          }, [state.hotel_info.address, setFieldValue]);

          return (
            <>
              <VStack space="lg" className="justify-between flex-1 mt-[32px]">
                <Box className="gap-4 mb-12">
                  <Input
                    label={t('signup.step_3.reference_code')}
                    onBlur={handleBlur('reference_code')}
                    onChangeText={handleChange('reference_code')}
                    placeholder="EF6746AA63"
                    value={values.reference_code}
                    error={touched.reference_code && errors.reference_code}
                    touched={touched.reference_code}
                  />

                  <Input
                    label={t('signup.step_3.hotel_name.label')}
                    onBlur={handleBlur('hotel_name')}
                    onChangeText={handleChange('hotel_name')}
                    placeholder=""
                    value={values.hotel_name}
                    error={touched.hotel_name && errors.hotel_name}
                    touched={touched.hotel_name}
                  />

                  <Input
                    label={t('signup.step_3.address.label', { ns: 'auth' })}
                    onBlur={handleBlur('home_address')}
                    onChangeText={(val: string) => {
                      setFieldValue('home_address', val);

                      if (val.trim() === '') {
                        updatePayload({
                          hotel_info: {
                            ...state.hotel_info,
                            home_address: '',
                            latitude: '',
                            longitude: '',
                          },
                        });
                      }
                    }}
                    placeholder=""
                    value={values.home_address ? values.home_address : String(state.hotel_info.address)}
                    error={touched?.home_address && errors?.home_address}
                    touched={touched.home_address}
                    stretch
                    onPress={() => setShowActionsheet(true)}
                    editable={false}
                    pressable={true}
                    multiline={state.hotel_info.address.trim().length > 35}
                  />

                  <Pressable onPress={() => requestLocationPermission()}>
                    <HStack space="xs">
                      <Location color={Colors.PRIMARY} width={14} />
                      <Text className="text-xs font-medium" style={styles.mark_map}>
                        {t('signup.step_1.mark_map', { ns: 'auth' })}
                      </Text>
                    </HStack>
                  </Pressable>
                </Box>

                <StepControl
                  handleBack={() => null}
                  handleNext={handleSubmit}
                  loading={loading}
                  textBack={t('')}
                  textNext={t('signup.step_2.buttons.next', { ns: 'auth' })}
                  color={Colors.GRAY}
                  vertical
                />
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
                      <Pressable
                        onPress={() => {
                          setSelectedLocation(item);
                          setFieldValue('home_address', `${item.name}.`);
                          updatePayload({
                            hotel_info: {
                              latitude: item.latitude,
                              longitude: item.longitude,
                              address: `${item.name}.`,
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
    paddingBottom: 120,
    flex: 1,
  },
  mark_map: {
    color: Colors.DARK_PURPLE,
  },
  search_bar_container: {
    width: '100%',
    marginBottom: 24,
    marginTop: 24,
  },
});