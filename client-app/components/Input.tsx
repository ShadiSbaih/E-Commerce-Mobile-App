import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

type InputProps = TextInputProps & { icon?: React.ReactNode; containerStyle?: ViewStyle };

export default function Input({ icon, containerStyle, onFocus, onBlur, ...props }: InputProps) {
  const [focused, setFocused] = React.useState(false);
  return <View style={[styles.container, focused && styles.focused, containerStyle]}>
    {icon}
    <TextInput
      {...props}
      accessibilityLabel={props.accessibilityLabel || props.placeholder}
      placeholderTextColor={colors.textDisabled}
      style={styles.input}
      onFocus={(event) => { setFocused(true); onFocus?.(event); }}
      onBlur={(event) => { setFocused(false); onBlur?.(event); }}
    />
  </View>;
}

const styles = StyleSheet.create({
  container: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: 'transparent', borderRadius: radius.md },
  focused: { borderColor: colors.nimbus500 },
  input: { flex: 1, paddingVertical: spacing.md, color: colors.textPrimary, ...typography.body },
});
