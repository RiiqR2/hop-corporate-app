import { StyleSheet, GestureResponderEvent, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Colors } from '@/src/utils/constants/Colors';
import { Text } from '../text/text.component';

interface GradientButtonProps {
  children: any;
  onPress: (event: GestureResponderEvent) => void;
  colors?: any;
  style?: object;
  textClassName?: object;
  type?: string;
  loading?: boolean;
  stretch?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<GradientButtonProps> = ({
  children,
  onPress,
  colors = ['#07A999', '#134641'],
  style = {},
  textClassName = {},
  type,
  loading,
  stretch,
  disabled,
}) => {
  const width = stretch ? '100%' : 'auto';

  return (
    <>
      {type === 'ghost' ? (
        <Pressable onPress={onPress} style={[styles.ghost, style, { width }, disabled ? styles.disabled : {}]} disabled={disabled}>
          {loading ? (
            <ActivityIndicator color={Colors.WHITE} />
          ) : (
            <Text fontWeight={600} style={[styles.text_ghost, textClassName, disabled ? styles.text_disabled : {}]}>
              {children}
            </Text>
          )}
        </Pressable>
      ) : type === 'outlined' ? (
        <Pressable onPress={onPress} style={[styles.outlinedButton, style, { width }, disabled && { borderColor: Colors.GRAY }]} disabled={disabled}>
          {loading ? (
            <ActivityIndicator color={disabled ? Colors.GRAY : Colors.PRIMARY} />
          ) : (
            <Text fontWeight={600} style={[styles.outlinedText, textClassName]}>
              {children}
            </Text>
          )}
        </Pressable>
      ) : (
        <Pressable onPress={onPress} style={[styles.button, style, { width }]} disabled={disabled}>
          <LinearGradient colors={disabled ? [Colors.GRAY, Colors.GRAY] : colors} style={styles.gradient}>
            {loading ? (
              <ActivityIndicator color={Colors.WHITE} />
            ) : (
              <Text fontWeight={600} style={[styles.text, textClassName]}>
                {children}
              </Text>
            )}
          </LinearGradient>
        </Pressable>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  gradient: {
    minHeight: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  ghost: {
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  text_ghost: {
    color: Colors.DARK_GREEN,
    fontSize: 16,
    fontWeight: 600,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  disabled: {
    backgroundColor: Colors.GRAY,
    minHeight: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  text_disabled: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: 600,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  outlinedButton: {
    borderWidth: 2,
    borderColor: Colors.SECONDARY,
    backgroundColor: 'transparent',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlinedText: {
    color: Colors.DARK_GREEN,
    fontSize: 16,
  },
});
