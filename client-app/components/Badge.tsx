import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

export default function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'highlight' | 'success' }) {
  return <View style={[styles.base, styles[tone]]}><Text style={[styles.text, tone === 'success' && styles.successText]}>{children}</Text></View>;
}
const styles = StyleSheet.create({
  base: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  neutral: { backgroundColor: colors.surfaceSoft }, highlight: { backgroundColor: colors.nimbus200 }, success: { backgroundColor: '#E5F1EC' },
  text: { color: colors.textSecondary, ...typography.caption }, successText: { color: colors.success },
});
