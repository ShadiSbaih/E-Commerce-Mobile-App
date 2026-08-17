import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export default function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return <View style={styles.row}><Text style={styles.title}>{title}</Text>{actionLabel && onAction ? <Pressable accessibilityRole="button" accessibilityLabel={actionLabel} hitSlop={10} onPress={onAction}><Text style={styles.action}>{actionLabel}</Text></Pressable> : null}</View>;
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }, title: { color: colors.textPrimary, ...typography.h3 }, action: { color: colors.textSecondary, ...typography.bodySmall, fontWeight: '600' } });
