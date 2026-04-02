import { StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import React, { ReactNode } from 'react';
import { Text } from '@/src/components/text/text.component';
import { HStack } from '@/src/components/ui/hstack';
import { Colors } from '@/src/utils/constants/Colors';

interface NotBookingsProps {
  children: ReactNode;
  text: string;
  backgroundColor?: string;
  iconBackgroundColor?: string;
  textColor?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  iconContainerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fontSize?: number;
  fontWeight?: number;
}

export const NotBookings = ({
  children,
  text,
  backgroundColor = '#E1F5F3',
  iconBackgroundColor = '#9FE4DD',
  textColor = Colors.GRAY,
  className = '',
  style,
  contentStyle,
  iconContainerStyle,
  textStyle,
  fontSize = 16,
  fontWeight = 400,
}: NotBookingsProps) => {
  return (
    <HStack className={`mt-4 rounded-[20px] py-[14px]  ${className}`} style={[{ backgroundColor }, style]}>
      <HStack className="px-5 gap-3 items-center" style={contentStyle}>
        <View className="rounded-full p-2" style={[{ backgroundColor: iconBackgroundColor }, iconContainerStyle]}>
          {children}
        </View>
        <Text textColor={textColor} fontSize={fontSize} fontWeight={fontWeight} style={textStyle as any}>
          {text}
        </Text>
      </HStack>
    </HStack>
  );
};
