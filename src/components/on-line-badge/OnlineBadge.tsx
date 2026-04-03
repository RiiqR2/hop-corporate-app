import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, TextStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/src/utils/constants/Colors';

type Props = {
  active: boolean;
  /** 'dot' = puntito compacto; 'pill' = píldora con texto */
  variant?: 'dot' | 'pill';
  /** Texto para la píldora; si no se pasa, usa “Activo/Inactivo” */
  label?: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  /** tamaño del punto (dot). Default 12 */
  size?: number;
};

export default function OnlineBadge({
  active,
  variant = 'dot',
  label,
  onPress,
  style,
  textStyle,
  size = 12,
}: Props) {
  // Colores de marca con fallback
  const brand = (Colors as any)?.PRIMARY ?? '#7a5ce7';
  const danger = (Colors as any)?.DANGER ?? '#E11D48';   // rojo elegante
  const fg = active ? brand : danger;
  const bg = active ? 'rgba(122,92,231,0.12)' : 'rgba(225,29,72,0.12)';

  if (variant === 'dot') {
    const radius = size / 2;
    const outline = Math.max(1, Math.floor(size * 0.1));
    const Dot = (
      <View
        style={[
          styles.dotContainer,
          { width: size, height: size, borderRadius: radius },
          style,
        ]}
        accessibilityLabel={active ? 'Estado: Activo' : 'Estado: Inactivo'}
        accessibilityRole="image"
      >
        <Svg width={size} height={size}>
          {/* anillo suave */}
          <Circle cx={radius} cy={radius} r={radius} fill={bg} />
          {/* núcleo */}
          <Circle cx={radius} cy={radius} r={radius - outline} fill={fg} />
        </Svg>
      </View>
    );
    return onPress ? <Pressable onPress={onPress}>{Dot}</Pressable> : Dot;
  }

  // variant === 'pill'
  const Pill = (
    <View
      style={[
        styles.pill,
        { backgroundColor: bg, borderColor: fg },
        style,
      ]}
      accessibilityLabel={(label ?? (active ? 'Activo' : 'Inactivo')) + (active ? ', activado' : ', desactivado')}
      accessibilityRole="text"
    >
      <Svg width={10} height={10} style={{ marginRight: 8 }}>
        <Circle cx={5} cy={5} r={5} fill={fg} />
      </Svg>
      <Text style={[styles.pillText, { color: fg }, textStyle]}>
        {label ?? (active ? 'Activo' : 'Inactivo')}
      </Text>
    </View>
  );

  return onPress ? <Pressable onPress={onPress}>{Pill}</Pressable> : Pill;
}

const styles = StyleSheet.create({
  dotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: {
    fontWeight: '600',
    includeFontPadding: false,
  },
});
