import { ColorValue, Pressable, StyleSheet, View } from 'react-native';
import React, { Dispatch, SetStateAction } from 'react';
import { Colors } from '@/src/utils/constants/Colors';
import { Text } from '../text/text.component';

type TooltipProps = {
  documentation: any;
  setShowTooltip: Dispatch<SetStateAction<boolean>>;
  bgColor?: ColorValue;
  textColor?: string;
};

export default function Tooltip({ documentation, setShowTooltip, bgColor = '#4B5563', textColor = Colors.WHITE }: TooltipProps) {
  return (
    <Pressable style={[styles.tooltip, { backgroundColor: bgColor }]} onPress={() => setShowTooltip(false)}>
      <View style={[styles.tooltip_description, { borderTopColor: bgColor }]} />
      <Text textColor={textColor}>{documentation.info}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    left: -15,
    marginTop: 8,
    padding: 8,
    bottom: 28,
    backgroundColor: '#4B5563',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
    zIndex: 9999,
    width: 250,
  },
  tooltip_description: {
    position: 'absolute',
    left: 16,
    top: 52,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#4B5563',
  },
});
