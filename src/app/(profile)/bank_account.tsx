import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Formik } from 'formik';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SvgUri } from 'react-native-svg';
import { cleanRut, formatRut } from 'rutlib';
import useSWR from 'swr';
import { router, useNavigation } from 'expo-router';
import { Danger } from '@/assets/svg';
import { API_URL } from '@/config';
import { Container, Header, Input, Select, Switch } from '@/src/components';
import { Button } from '@/src/components/button/button.component';
import { Text } from '@/src/components/text/text.component';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetFlatList,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/src/components/ui/actionsheet';
import { Badge } from '@/src/components/ui/badge';
import { Box } from '@/src/components/ui/box';
import { HStack } from '@/src/components/ui/hstack';
import { ChevronDownIcon, SearchIcon } from '@/src/components/ui/icon';
import { VStack } from '@/src/components/ui/vstack';
import { checkEmptyFields, removeEmptyField } from '@/src/helpers/check-empty-fields';
import { isValidRUT } from '@/src/helpers/validate-rut';
import { useMe, useToast } from '@/src/hooks';
import { updateUser } from '@/src/services/auth.service';
import { getBanks } from '@/src/services/bank.service';
import { accountTypes } from '@/src/utils/constants/account.constants';
import { keysToCheck } from '@/src/utils/constants/check-validations';
import { Colors } from '@/src/utils/constants/Colors';
import { UserInfo } from '@/src/utils/interfaces/auth.interface';
import { validationSchemaS1 } from '@/src/utils/schemas/register.schema';

export default function BankAccount() {
  const navigation = useNavigation();
  const [isEditable, setIsEditable] = useState(false);
  const { t } = useTranslation();
  const schema = validationSchemaS1(t);
  const formikRef = useRef<any>(null);
  const [rutError, setRutError] = useState('');

  const { data } = useSWR('/banks', getBanks);
  const { user } = useMe();
  const route = useRoute();

  const [loading, setLoading] = useState(false);
  const [ToggleSwitch, setToggleSwitch] = useState(false);
  const [showActionsheet, setShowActionsheet] = React.useState(false);
  const [searchText, setSearchText] = useState<string>('');
  const [bankSelected, setBankSelected] = useState<{
    name: string;
    id: string;
  }>({
    name: '',
    id: '',
  });

  const { showToast } = useToast();

  const handleInputChange = (text: string) => {
    setSearchText(text);
  };

  const filteredData = useCallback(() => {
    return data?.filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()));
  }, [data, searchText]);

  const handleClose = ({ name, id }: { name: string; id: string }) => {
    setShowActionsheet(false);
    setBankSelected({ name, id });
    if (formikRef.current) {
      formikRef.current?.setFieldValue('bank_name', {
        id: id,
        name: name,
      });
    }
    setSearchText('');
  };

  const Item: React.FC<{ title: string; image: string; id: string }> = useCallback(({ title, image, id }) => {
    return (
      <ActionsheetItem onPress={() => handleClose({ name: title, id: id })} className="h-12 p-2 items-center gap-2">
        <SvgUri uri={`${API_URL.replace('/api', '/')}${image}`} width={40} height={40} />
        <ActionsheetItemText className="text-xl">{title}</ActionsheetItemText>
      </ActionsheetItem>
    );
  }, []);

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <Header
          title={t('profile.account.title', { ns: 'profile' })}
          edit={!isEditable}
          arrow
          onPressArrow={() => router.back()}
          onPressEdit={() => setIsEditable(true)}
        />
      ),
    });
  }, [navigator, isEditable]);

  const handleSubmit = async (values: Partial<UserInfo>) => {
    setLoading(true);
    try {
      await updateUser(user?.id!, {
        bank_account: values.bank_account,
        bank_account_holder: values.bank_account_holder,
        bank_account_rut: values.bank_account_rut,
        bank_account_type: values.bank_account_type,
        bank_name: {
          id: values.bank_name?.id! || user?.userInfo.bank_name?.id!,
          name: values.bank_name?.name! || user?.userInfo.bank_name?.name!,
        },
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
      setLoading(false);
    }
  };

  const [emptyFields, setEmptyFields] = useState<string[]>(() =>
    checkEmptyFields(
      user?.userInfo || {},
      keysToCheck.filter((item) => (route.name === 'bank_account' ? item !== 'hotel_name' && item !== 'hotel_location' : true))
    )
  );

  return (
    <Container>
      <View style={styles.formulary} className="pb-4">
        <Formik
          innerRef={formikRef}
          initialValues={{
            bank_account_holder: user?.userInfo.bank_account_holder || '',
            bank_name: {
              name: user?.userInfo.bank_name?.name || '',
              id: user?.userInfo.bank_name?.id || '',
            },
            bank_account_rut: user?.userInfo.bank_account_rut || '',
            bank_account_type: user?.userInfo.bank_account_type || '',
            bank_account: user?.userInfo.bank_account || '',
          }}
          validationSchema={schema}
          onSubmit={(values) => {
            if (!Boolean(rutError.length > 0)) {
              handleSubmit({
                ...values,
                bank_account_rut: cleanRut(values.bank_account_rut),
                bank_name: {
                  id: bankSelected.id,
                  name: bankSelected.name,
                },
              });
            }
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useEffect(() => {
              const cleanedRUT = cleanRut(values.bank_account_rut);
              const formattedRUT = cleanedRUT.length > 7 ? formatRut(values.bank_account_rut) : values.bank_account_rut;

              setFieldValue('bank_account_rut', formattedRUT);

              const isValid = isValidRUT(values.bank_account_rut);

              if (!isValid) {
                setRutError(
                  t('validations.signup.rut.validate', {
                    ns: 'auth',
                  })
                );
              } else {
                setRutError('');
              }
            }, [values.bank_account_rut, setRutError]);

            return (
              <VStack className="flex-1 justify-between mt-[32px]">
                <Box className="gap-4">
                  {emptyFields.length > 0 && (
                    <Badge className="rounded-full p-2 gap-2 bg-[#E1F5F3] items-center justify-center">
                      <Danger />
                      <Text fontSize={14} fontWeight={600}>
                        {t('profile.account.empty', {
                          ns: 'profile',
                        })}
                      </Text>
                    </Badge>
                  )}
                  {isEditable && (
                    <HStack className="items-center gap-2">
                      <Switch isOn={ToggleSwitch} onToggleSwitch={setToggleSwitch} />
                      <Text fontSize={16} fontWeight={400}>
                        {t('profile.account.switch', {
                          ns: 'profile',
                        })}
                      </Text>
                    </HStack>
                  )}
                  <Input
                    label={t('signup.step_2.fields.accountHolder.label', {
                      ns: 'auth',
                    })}
                    onBlur={handleBlur('bank_account_holder')}
                    onChangeText={(text) => {
                      handleChange('bank_account_holder')(text);
                      removeEmptyField('bank_account_holder', setEmptyFields);
                    }}
                    placeholder=""
                    value={values.bank_account_holder}
                    error={(touched.bank_account_holder && errors.bank_account_holder) || emptyFields.find((item) => item === 'bank_account_holder')}
                    touched={touched.bank_account_holder}
                    isDisabled={!ToggleSwitch}
                    editable={ToggleSwitch}
                  />
                  <Input
                    label={t('signup.step_2.fields.bankName.label', {
                      ns: 'auth',
                    })}
                    onBlur={handleBlur('bank_name')}
                    onChangeText={(text) => {
                      handleChange('bank_name')(text);
                      removeEmptyField('bank_name', setEmptyFields);
                    }}
                    placeholder=""
                    value={bankSelected.name || values.bank_name.name}
                    touched={!!touched.bank_name?.name}
                    error={touched.bank_name?.name && typeof errors.bank_name?.name === 'string' ? errors.bank_name.name : undefined}
                    editable={false}
                    pressable={ToggleSwitch}
                    onPress={() => setShowActionsheet(true)}
                    icon={ChevronDownIcon}
                    rightIcon
                    isDisabled={!ToggleSwitch}
                  />
                  <Input
                    label={t('signup.step_2.fields.accountNumber.label', {
                      ns: 'auth',
                    })}
                    onBlur={handleBlur('bank_account')}
                    onChangeText={(text) => {
                      handleChange('bank_account')(text);
                      removeEmptyField('bank_account', setEmptyFields);
                    }}
                    placeholder=""
                    value={values.bank_account}
                    error={(touched.bank_account && errors.bank_account) || emptyFields.find((item) => item === 'bank_account')}
                    touched={touched.bank_account}
                    keyboardType="number-pad"
                    isDisabled={!isEditable}
                    editable={isEditable}
                  />
                  <Select
                    label={t('signup.step_2.fields.accountType.label', {
                      ns: 'auth',
                    })}
                    placeholder={t('signup.step_2.fields.accountType.placeholder', {
                      ns: 'auth',
                    })}
                    onSelect={(val) => {
                      handleChange('bank_account_type')(val);
                      removeEmptyField('bank_account_type', setEmptyFields);
                    }}
                    options={accountTypes.map((type) => ({
                      label: t(`validations.step_2.bank_account_type.${type.value}`),
                      value: type.value,
                    }))}
                    value={values.bank_account_type.length > 0 ? t(`validations.step_2.bank_account_type.${values.bank_account_type}`) : ''}
                    touched={touched.bank_account_type}
                    error={(touched.bank_account_type && errors.bank_account_type) || emptyFields.find((item) => item === 'bank_account_type')}
                    disabled={!isEditable}
                  />
                  <Input
                    label={t('signup.step_2.fields.rut.label', {
                      ns: 'auth',
                    })}
                    onBlur={handleBlur('bank_account_rut')}
                    onChangeText={(text) => {
                      handleChange('bank_account_rut')(text);
                      removeEmptyField('bank_account_rut', setEmptyFields);
                    }}
                    placeholder=""
                    value={values.bank_account_rut}
                    error={(touched.bank_account_rut && errors.bank_account_rut) || emptyFields.find((item) => item === 'bank_account_rut')}
                    touched={touched.bank_account_rut}
                    isDisabled={!isEditable}
                    editable={isEditable}
                  />
                </Box>
                {isEditable && (
                  <Button onPress={() => handleSubmit()}>
                    {loading ? (
                      <ActivityIndicator color={Colors.WHITE} />
                    ) : (
                      t('profile.personal_data.button', {
                        ns: 'profile',
                      })
                    )}
                  </Button>
                )}
              </VStack>
            );
          }}
        </Formik>
        <Actionsheet isOpen={showActionsheet} onClose={() => setShowActionsheet(false)} snapPoints={[70]}>
          <ActionsheetBackdrop />
          <ActionsheetContent className="pb-10">
            <ActionsheetDragIndicatorWrapper>
              <ActionsheetDragIndicator />
            </ActionsheetDragIndicatorWrapper>
            <View style={styles.search_bar_container}>
              <Input
                placeholder="Buscar banco"
                label=""
                onBlur={() => {}}
                onChangeText={handleInputChange}
                className=""
                icon={SearchIcon}
                rightIcon
                size="sm"
              />
            </View>
            <ActionsheetFlatList
              data={filteredData()}
              renderItem={({ item }: any) => <Item id={item.id} title={item.name} image={item.image} />}
              contentContainerClassName="gap-4"
              keyExtractor={(item: any) => item.id.toString()}
            />
          </ActionsheetContent>
        </Actionsheet>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  formulary: {
    gap: 16,
    flex: 1,
    height: Dimensions.get('screen').height - 120,
    justifyContent: 'space-between',
  },
  search_bar_container: {
    width: '100%',
    marginBottom: 24,
    marginTop: 24,
  },
});
