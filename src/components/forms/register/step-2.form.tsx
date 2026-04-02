import { StyleSheet, View } from 'react-native';
import { Formik } from 'formik';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SvgUri } from 'react-native-svg';
import { cleanRut, formatRut } from 'rutlib';
import { API_URL } from '@/config';
import { Input } from '@/src/components/input/input.component';
import { Select } from '@/src/components/select/select.component';
import { StepControl } from '@/src/components/step-controls/step-control.component';
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
import { ChevronDownIcon, SearchIcon } from '@/src/components/ui/icon';
import { VStack } from '@/src/components/ui/vstack';
import { isValidRUT } from '@/src/helpers/validate-rut';
import { useBanks, useToast } from '@/src/hooks';
import { accountTypes } from '@/src/utils/constants/account.constants';
import { Colors } from '@/src/utils/constants/Colors';
import { UserInfo } from '@/src/utils/interfaces/auth.interface';
import { validationSchemaS1 } from '@/src/utils/schemas/register.schema';
import { RegisterType } from '@/src/utils/types/register.type';

type formProps = {
  payloadValues: RegisterType;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  payload: React.Dispatch<React.SetStateAction<{}>>;
  clearPayload: React.Dispatch<React.SetStateAction<{}>>;
  extraData: string;
  role: string;
};

export default function Step2(props: formProps) {
  const { setStep, payloadValues, payload } = props;
  const formikRef = useRef<any>(null);
  const { t } = useTranslation();
  const schema = validationSchemaS1(t);
  const [showActionsheet, setShowActionsheet] = React.useState(false);
  const [searchText, setSearchText] = useState<string>('');
  const [bankSelected, setBankSelected] = useState<{
    name: string;
    id: string;
  }>({
    name: '',
    id: '',
  });
  const [loading, setLoading] = useState(false);
  const { banks } = useBanks();
  const [rutError, setRutError] = useState('');
  const { showToast } = useToast();

  const handleInputChange = (text: string) => {
    setSearchText(text);
  };

  const filteredData = useCallback(() => {
    return banks?.filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()));
  }, [banks, searchText]);

  const handleClose = ({ name, id }: { name: string; id: string }) => {
    setShowActionsheet(false);
    setBankSelected({ name, id });
    if (formikRef.current) {
      formikRef.current?.setFieldValue('bank_name', {
        id: id,
        name: name
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

  const handleRegisterStep2 = async (values: Partial<UserInfo>) => {
    setLoading(true);
    try {
      const updatedValues = {
        ...values,
        bank_name: {
          id: bankSelected.id || payloadValues.userInfo.bank_name.id,
          name: bankSelected.name || payloadValues.userInfo.bank_name.name,
        },
        bank_account_holder: values.bank_account_holder,
        bank_account_rut: values.bank_account_rut || payloadValues.userInfo.bank_account_rut,
        bank_account_type: values.bank_account_type || payloadValues.userInfo.bank_account_type,
        bank_account: values.bank_account || payloadValues.userInfo.bank_account,
      };

      payload(updatedValues);

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
        {t('signup.step_2.title', { ns: 'auth' })}
      </Text>
      <Formik
        innerRef={formikRef}
        initialValues={{
          bank_account_holder: payloadValues.userInfo.bank_account_holder,
          bank_name: {
            id: payloadValues.userInfo.bank_name.id,
            name: payloadValues.userInfo.bank_name.name,
          },
          bank_account_rut: payloadValues.userInfo.bank_account_rut,
          bank_account_type: payloadValues.userInfo.bank_account_type,
          bank_account: payloadValues.userInfo.bank_account,
        }}
        validationSchema={schema}
        onSubmit={(values) => {
          if (!Boolean(rutError.length > 0)) {
            handleRegisterStep2({
              ...values,
              bank_name: {
                id: bankSelected.id || payloadValues.userInfo.bank_name.id,
                name: bankSelected.name || payloadValues.userInfo.bank_name.name,
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
            <VStack space="md" className="mt-[32px]">
              <Input
                label={t('signup.step_2.fields.accountHolder.label', {
                  ns: 'auth',
                })}
                onBlur={handleBlur('bank_account_holder')}
                onChangeText={handleChange('bank_account_holder')}
                placeholder=""
                value={values.bank_account_holder}
                error={touched.bank_account_holder && errors.bank_account_holder}
                touched={touched.bank_account_holder}
              />
              <Input
                label={t('signup.step_2.fields.bankName.label', { ns: 'auth' })}
                onBlur={handleBlur('bank_name.name')}
                onChangeText={handleChange('bank_name.name')}
                placeholder=""
                value={bankSelected.name || (payloadValues.userInfo.bank_name.name as any)}
                onPress={() => {
                  setShowActionsheet(true);
                }}
                icon={ChevronDownIcon}
                editable={false}
                pressable={true}
                rightIcon
                touched={!!touched.bank_name?.name}
                error={touched.bank_name?.name && typeof errors.bank_name?.name === 'string' ? errors.bank_name.name : undefined}
              />

              <Input
                label={t('signup.step_2.fields.accountNumber.label', {
                  ns: 'auth',
                })}
                onBlur={handleBlur('bank_account')}
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  if (text.trim().length > 20) {
                    return;
                  }
                  handleChange('bank_account')(numericText);
                }}
                placeholder=""
                value={values.bank_account}
                error={touched.bank_account && errors.bank_account}
                touched={touched.bank_account}
                keyboardType="number-pad"
              />

              <Select
                label={t('signup.step_2.fields.accountType.label', {
                  ns: 'auth',
                })}
                placeholder=""
                onSelect={handleChange('bank_account_type')}
                options={accountTypes.map((type) => ({
                  label: t(`validations.step_2.bank_account_type.${type.value}`),
                  value: type.value,
                }))}
                value={values.bank_account_type.length > 0 ? t(`validations.step_2.bank_account_type.${values.bank_account_type}`) : ''}
                touched={touched.bank_account_type}
                error={touched.bank_account_type && errors.bank_account_type}
              />

              <Input
                label={t('signup.step_2.fields.rut.label', {
                  ns: 'auth',
                })}
                onBlur={handleBlur('bank_account_rut')}
                onChangeText={(text) => {
                  if (text.length <= 12) {
                    handleChange('bank_account_rut')(text);
                  }
                }}
                placeholder=""
                value={values.bank_account_rut}
                error={(touched.bank_account_rut && errors.bank_account_rut) || rutError}
                touched={touched.bank_account_rut}
                maxLength={11}
                keyboardType="numbers-and-punctuation"
              />

              <StepControl
                handleBack={() => setStep(3)}
                handleNext={handleSubmit}
                textBack={t('signup.step_2.buttons.skip', {
                  ns: 'auth',
                })}
                textNext={t('signup.step_2.buttons.next', {
                  ns: 'auth',
                })}
                color={Colors.GRAY}
                vertical
                loading={loading}
              />
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
            <Input placeholder="Buscar banco" label="" onBlur={() => {}} onChangeText={handleInputChange} className="" icon={SearchIcon} rightIcon size="sm" />
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
  );
}

const styles = StyleSheet.create({
  formulary: {
    gap: 16,
    flexGrow: 1,
  },
  search_bar_container: {
    width: '100%',
    marginBottom: 24,
    marginTop: 24,
  },
});
