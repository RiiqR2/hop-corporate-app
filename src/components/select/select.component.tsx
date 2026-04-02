import { ColorValue, Pressable, View } from 'react-native';
import React, { Dispatch, SetStateAction } from 'react';
import { Colors } from '@/src/utils/constants/Colors';
import { Text } from '../text/text.component';
import Tooltip from '../tooltip/tooltip.component';
import { FormControl, FormControlErrorIcon, FormControlLabel, FormControlLabelText } from '../ui/form-control';
import { AlertCircleIcon, ChevronDownIcon, Icon } from '../ui/icon';
import {
  Select as GSelect,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from '../ui/select';

interface Option {
  label: string;
  value: string;
}

interface CustomFormControlProps {
  label: string;
  options: Option[];
  placeholder?: string;
  variant?: 'rounded';
  size?: 'sm' | 'md' | 'lg';
  onSelect: (value: string) => void;
  error?: string | false | undefined;
  touched?: boolean;
  color?: ColorValue;
  textColor?: string;
  customClassNames?: {
    formControl?: string;
    formControlLabel?: string;
    labelText?: string;
    select?: string;
    trigger?: string;
    input?: string;
    icon?: string;
    content?: string;
    item?: string;
  };
  disabled?: boolean;
  value: string;
  info?: string;
  setShowTooltip?: Dispatch<SetStateAction<boolean>>;
  showTooltip?: boolean;
  icon?: boolean;
}

export const Select = (props: CustomFormControlProps) => {
  const {
    label,
    options,
    placeholder = 'Seleccione una opción',
    variant = 'rounded',
    size = 'lg',
    onSelect,
    error,
    touched,
    customClassNames = {},
    value,
    disabled,
    info = '',
    setShowTooltip,
    showTooltip,
    color,
    textColor,
    icon = true,
  } = props;

  return (
    <FormControl className={customClassNames.formControl}>
      <FormControlLabel className={`${customClassNames.formControlLabel} gap-1`}>
        <FormControlLabelText className={`font-semibold text-lg ${error ? 'text-[#9A0000]' : 'text-[#10524B]'} ${customClassNames.labelText}`}>
          {label}
        </FormControlLabelText>
        {info?.length > 1 && (
          <Pressable className="w-full relative" onPress={() => setShowTooltip?.(true)}>
            <Icon as={AlertCircleIcon} color={Colors.PRIMARY} />
            {showTooltip && <Tooltip documentation={{ info }} setShowTooltip={() => setShowTooltip?.(false)} bgColor={color} textColor={textColor} />}
          </Pressable>
        )}
      </FormControlLabel>
      <GSelect onValueChange={onSelect} isDisabled={disabled}>
        <SelectTrigger
          variant={variant}
          size={size}
          className={error ? 'border-[#9A0000]' : ''}
          style={{
            height: 44,
            backgroundColor: props.disabled ? Colors.LIGHT_GRADIENT_1 : Colors.WHITE,
            borderColor: props.disabled ? Colors.LIGHT_GRADIENT_1 : error ? Colors.ERROR : Colors.PRIMARY,
          }}
          disabled={disabled}
        >
          <SelectInput placeholder={placeholder} className={`flex-1 ${error ? 'placeholder:text-[#9A0000]' : ''}`} value={value} />
          {icon && <SelectIcon className={`mr-3 ${customClassNames.icon}`} as={ChevronDownIcon} color={error ? Colors.ERROR : Colors.PRIMARY} />}
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent className={`pb-10 ${customClassNames.content}`}>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            {options.map(({ label, value }) => (
              <SelectItem key={value} label={label} value={value} className={customClassNames.item} />
            ))}
          </SelectContent>
        </SelectPortal>
      </GSelect>
      {touched && error && (
        <View className="mt-2 items-start">
          {!require && <FormControlErrorIcon as={AlertCircleIcon} color={Colors.ERROR} />}
          <Text textColor={Colors.ERROR} fontWeight={300} className="flex-1">
            {error}
          </Text>
        </View>
      )}
    </FormControl>
  );
};
