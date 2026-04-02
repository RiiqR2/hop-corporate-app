import { StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { router, useNavigation } from 'expo-router';
import { Container, Header, Select } from '@/src/components';
import { VStack } from '@/src/components/ui/vstack';
import capitalizeWords from '@/src/helpers/capitalize-words';
import { vehicleName } from '@/src/helpers/parser-names';
import { useMe } from '@/src/hooks';
import { getVehicleData } from '@/src/services/user.service';
import { vehicles } from '@/src/utils/constants/vehicles.constants';

export default function VehicleData() {
  const { t } = useTranslation();

  const { user } = useMe();

  const { data } = useSWR(`/user-vehicle/user/${user?.id!}`, async () => getVehicleData(user?.id!), {
    revalidateOnFocus: true,
    refreshInterval: 5,
  });

  const navigation = useNavigation();
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  const [formValues, setFormValues] = useState({
    passengers: '',
    luggageSpace: '',
    specialLuggage: '',
    accessibility: '',
  });

  useEffect(() => {
    navigation.setOptions({
      header: () => <Header title={t('profile.vehicle.title', { ns: 'profile' })} arrow onPressArrow={() => router.back()} />,
    });
  }, [navigator]);

  const translatedVehicleName = vehicleName(t);

  return (
    <Container>
      <VStack space="lg" style={styles.formulary} className="flex-1">
        <>
          <Select
            label={t('signup.step_4_hopper.fields.type.label')}
            placeholder={t('signup.step_4_hopper.fields.type.placeholder')}
            onSelect={(val) => {
              setSelectedVehicle(val);
            }}
            options={vehicles.map((item) => ({
              value: item.type,
              label: item.value,
            }))}
            value={translatedVehicleName[data?.type!]}
            disabled={false}
            icon={false}
          />
          <Select
            label={t('signup.step_4_hopper.fields.passengers.label')}
            placeholder=""
            onSelect={(val) => setFormValues((prev) => ({ ...prev, passengers: val }))}
            options={[
              { label: '1', value: '1' },
              { label: '2', value: '2' },
              { label: '3', value: '3' },
              { label: '4', value: '4' },
              { label: '5', value: '5' },
              { label: '6', value: '6' },
              { label: '7', value: '7' },
            ]}
            value={selectedVehicle ? formValues.passengers : String(data?.passengers)}
            disabled={false}
            icon={false}
          />
          <Select
            label={t('signup.step_4_hopper.fields.accessibility.label')}
            placeholder=""
            onSelect={(val) => setFormValues((prev) => ({ ...prev, accessibility: val }))}
            options={[
              { label: 'Si', value: 'si' },
              { label: 'No', value: 'no' },
            ]}
            value={selectedVehicle ? capitalizeWords(formValues.accessibility) : data?.accessibility ? 'Si' : 'No'}
            info={t('accessibility', { ns: 'utils' })}
            setShowTooltip={setShowTooltip}
            showTooltip={showTooltip}
            disabled={false}
            icon={false}
          />
          <Select
            label={t('signup.step_4_hopper.fields.luggage_space.label')}
            placeholder=""
            onSelect={(val) => setFormValues((prev) => ({ ...prev, luggageSpace: val }))}
            options={[
              { label: '1-3 bultos', value: '1-3' },
              { label: '4+ bultos', value: '4+' },
            ]}
            value={selectedVehicle ? capitalizeWords(formValues.luggageSpace) : data?.suitcases ? 'Si' : 'No'}
            disabled={false}
            icon={false}
          />
          <Select
            label={t('signup.step_4_hopper.fields.luggage_special.label')}
            placeholder=""
            onSelect={(val) => setFormValues((prev) => ({ ...prev, specialLuggage: val }))}
            options={[
              { label: 'Si', value: 'si' },
              { label: 'No', value: 'no' },
            ]}
            value={selectedVehicle ? capitalizeWords(formValues.specialLuggage) : data?.specialLuggage ? 'Si' : 'No'}
            disabled={false}
            icon={false}
          />
        </>
      </VStack>
    </Container>
  );
}

const styles = StyleSheet.create({
  formulary: {
    marginTop: 28,
  },
});
