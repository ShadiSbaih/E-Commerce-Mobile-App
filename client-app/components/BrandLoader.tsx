import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

type BrandLoaderProps = {
  size?: number;
  label?: string;
};

export default function BrandLoader({ size = 96, label = 'Loading' }: BrandLoaderProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [progress]);

  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.58, 1],
  });
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1],
  });

  return (
    <View style={styles.container} accessibilityLabel={label}>
      <Animated.Image
        source={require('@/assets/brand/nimbus-mark-transparent.png')}
        resizeMode="contain"
        style={[styles.mark, { width: size, height: size, opacity, transform: [{ scale }] }]}
      />
      <View style={styles.dots}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotMiddle]} />
        <View style={styles.dot} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  mark: {
    tintColor: colors.primary,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.nimbus400,
  },
  dotMiddle: {
    backgroundColor: colors.nimbus500,
  },
  label: {
    color: colors.textMuted,
    ...typography.caption,
  },
});
