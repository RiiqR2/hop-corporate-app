import { StyleSheet, View, Animated, Easing } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { Hop, Round } from '@/assets/svg';
import { scaleSize } from '@/src/helpers/scale-size';
import { Colors } from '@/src/utils/constants/Colors';

export const Loading = () => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      rotation.setValue(0);
      Animated.timing(rotation, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => startAnimation());
    };

    startAnimation();

    return () => rotation.stopAnimation();
  }, [rotation]);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const animatedStyle = {
    transform: [{ rotate: rotateInterpolate }],
  };
  return (
    <View style={styles.centerContainer}>
      <View style={styles.middleElement}>
        <Hop color={Colors.DARK_GREEN} width={90} />
      </View>

      <Animated.View style={[animatedStyle]}>
        <Round width={scaleSize(180)} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleElement: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
