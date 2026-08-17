import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

type ButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'banner';
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

export default function Button({ children, onPress, variant = 'primary', disabled, loading, accessibilityLabel, style }: ButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: Boolean(disabled || loading), busy: Boolean(loading) }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [styles.base, styles[variant], (disabled || loading) && styles.disabled, pressed && styles.pressed, style]}
    >
      {loading ? <ActivityIndicator color={isPrimary ? colors.white : colors.primary} /> : <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel]}>{children}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, borderRadius: radius.md },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.nimbus200 },
  banner: { backgroundColor: colors.white },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.borderStrong },
  label: { ...typography.body, fontWeight: '600' },
  primaryLabel: { color: colors.white },
  secondaryLabel: { color: colors.primary },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
});
