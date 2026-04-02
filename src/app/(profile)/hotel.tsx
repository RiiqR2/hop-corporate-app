import { ActivityIndicator, Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { router, useNavigation } from 'expo-router';
import { Danger, Location } from '@/assets/svg';
import { Container, Header, Input } from '@/src/components';
import { Button } from '@/src/components/button/button.component';
import { Text } from '@/src/components/text/text.component';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetFlatList,
} from '@/src/components/ui/actionsheet';
import { Badge } from '@/src/components/ui/badge';
import { Box } from '@/src/components/ui/box';
import { HStack } from '@/src/components/ui/hstack';
import { SearchIcon } from '@/src/components/ui/icon';
import { VStack } from '@/src/components/ui/vstack';
import { useAuth } from '@/src/context/auth.context';
import { checkEmptyFields, removeEmptyField } from '@/src/helpers/check-empty-fields';
import { useGetCoordinatesFromAddress, useMe, useRequestLocationPermission, useToast } from '@/src/hooks';
import { updateUser } from '@/src/services/auth.service';
import { keysToCheck } from '@/src/utils/constants/check-validations';
import { Colors } from '@/src/utils/constants/Colors';
import { AuthRoutesLink } from '@/src/utils/enum/auth.routes';
import { validationSchemaS3 } from '@/src/utils/schemas/register.schema';

export default function PersonalData() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useMe();

  const route = useRoute();
  const { state, updatePayload } = useAuth();
  const { requestLocationPermission } = useRequestLocationPermission({
    url: AuthRoutesLink.MAP,
    step: 3,
  });
  const { showToast } = useToast();
  const [showActionsheet, setShowActionsheet] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  const schema = validationSchemaS3(t);

  const { locations, setSelectedLocation, geocodeAddress } = useGetCoordinatesFromAddress();

  const handleSearch = (searchText: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);

    const timeout = setTimeout(() => {
      if (searchText.trim()) {
        geocodeAddress(searchText);
      }
    }, 3000);

    setSearchTimeout(timeout);
  };

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <Header
          title={t('profile.hotel.title', { ns: 'profile' })}
          edit={!isEditable}
          arrow
          onPressArrow={() => router.back()}
          onPressEdit={() => setIsEditable(true)}
        />
      ),
    });
  }, [navigator, isEditable]);

  const handleSubmit = async (values: { hotel_name: string }) => {
    setLoading(true);

    try {
      await updateUser(user?.id!, {
        hotel_name: values.hotel_name,
        ...(state.hotel_info.address &&
          state.hotel_info.latitude &&
          state.hotel_info.longitude && {
            hotel_location: {
              address: state.hotel_info.address,
              lat: state.hotel_info.latitude,
              lng: state.hotel_info.longitude,
            },
          }),
      });
      router.back();
    } catch {
      showToast({
        message: t('server_error', { ns: 'utils' }),
        action: 'error',
        duration: 3000,
        placement: 'bottom',
      });
    } finally {
      updatePayload({
        hotel_info: {
          address: '',
          latitude: '',
          longitude: '',
        },
      });
      setLoading(false);
    }
  };

  const [emptyFields, setEmptyFields] = useState<string[]>(() =>
    checkEmptyFields(user?.userInfo || {}, route.name === 'hotel' ? keysToCheck.filter((item) => ['hotel_name', 'hotel_location'].includes(item)) : keysToCheck)
  );

  return (
    <Container>
      {emptyFields.length > 0 ? (
        <Badge className="rounded-full p-2 gap-2 bg-[#E1F5F3] items-center justify-center">
          <Danger />
          <Text fontSize={14} fontWeight={600}>
            {t('profile.account.empty', { ns: 'profile' })}
          </Text>
        </Badge>
      ) : (
        <></>
      )}
      <Formik
        initialValues={{
          hotel_name: user?.userInfo.hotel_name || '',
          home_address: user?.userInfo.hotel_location?.address || state.hotel_info.address,
        }}
        validationSchema={schema}
        onSubmit={(values) => handleSubmit(values)}
      >
        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useEffect(() => {
            if (state.hotel_info.address) {
              setFieldValue('home_address', state.hotel_info.address);
            }
          }, [state.hotel_info.address]);

          return (
            <VStack className="mt-12 gap-4" style={styles.content}>
              <Box className="gap-4 mb-12">
                <Input
                  label={t('signup.step_3.hotel_name.label')}
                  onBlur={handleBlur('hotel_name')}
                  onChangeText={(text) => {
                    handleChange('hotel_name')(text);
                    removeEmptyField('hotel_name', setEmptyFields);
                  }}
                  placeholder=""
                  value={values.hotel_name}
                  error={(touched.hotel_name && errors.hotel_name) || emptyFields.find((item) => item === 'hotel_name')}
                  touched={touched.hotel_name}
                  isDisabled={!isEditable}
                  editable={isEditable}
                />

                <Input
                  label={t('signup.step_3.address.label')}
                  onBlur={handleBlur('home_address')}
                  onChangeText={(text) => {
                    handleChange('home_address')(text);
                    removeEmptyField('hotel_location', setEmptyFields);
                  }}
                  placeholder=""
                  value={values.home_address || state.hotel_info.address}
                  error={(touched.home_address && errors.home_address) || emptyFields.find((item) => item === 'hotel_location')}
                  touched={touched.home_address}
                  isDisabled={!isEditable}
                  onPress={() => setShowActionsheet(true)}
                  editable={false}
                  pressable={isEditable}
                  multiline={state.hotel_info.address.trim().length > 35 ? true : false}
                />

                {isEditable && (
                  <Pressable onPress={() => requestLocationPermission()}>
                    <HStack space="xs">
                      <Location color={Colors.DARK_GREEN} width={14} />
                      <Text fontWeight={400} fontSize={12} textColor={Colors.DARK_GREEN}>
                        {t('signup.step_1.mark_map', { ns: 'auth' })}
                      </Text>
                    </HStack>
                  </Pressable>
                )}
              </Box>

              {isEditable && (
                <Button onPress={() => handleSubmit()}>
                  {loading ? <ActivityIndicator color={Colors.WHITE} /> : t('profile.personal_data.button', { ns: 'profile' })}
                </Button>
              )}
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
                      </>
                    )}
                    contentContainerClassName="gap-4"
                    keyExtractor={(item: any) => item.id.toString()}
                  />
                </ActionsheetContent>
              </Actionsheet>
            </VStack>
          );
        }}
      </Formik>
    </Container>
  );
}

const styles = StyleSheet.create({
  formulary: {
    gap: 16,
  },
  mark_map: {
    color: Colors.DARK_GREEN,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    height: Dimensions.get('screen').height - 185,
  },
  search_bar_container: {
    width: '100%',
    marginBottom: 24,
    marginTop: 24,
  },
});
