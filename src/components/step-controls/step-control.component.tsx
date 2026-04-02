import { ActivityIndicator } from 'react-native';
import React from 'react';
import { ArrowLeftRounded } from '@/assets/svg';
import { Colors } from '@/src/utils/constants/Colors';
import { Button } from '../button/button.component';
import { HStack } from '../ui/hstack';
import { VStack } from '../ui/vstack';

type StepProps = {
  handleBack: () => void;
  handleNext: () => void;
  textBack: string;
  textNext: string;
  loading?: boolean;
  vertical?: boolean;
  color?: string;
};

export const StepControl = (props: StepProps) => {
  const { handleBack, handleNext, textNext, loading, vertical } = props;

  {
    return vertical ? (
      <VStack className="justify-center gap-3 mt-[50px]">
        <Button onPress={handleNext} loading={loading}>
          {loading ? <ActivityIndicator color={Colors.WHITE} /> : textNext}
        </Button>
      </VStack>
    ) : (
      <HStack className="justify-between mt-[50px]">
        <Button type="ghost" onPress={handleBack}>
          <ArrowLeftRounded color={Colors.GRAY} />
        </Button>
        <Button onPress={handleNext} loading={loading}>
          {textNext}
        </Button>
      </HStack>
    );
  }
};
