import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Button from './Button';
import { colors, spacing, typography } from '@/theme';

export default function EmptyState({ title, description, actionLabel, onAction, icon = 'sparkles-outline' }: { title: string; description: string; actionLabel?: string; onAction?: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  return <View style={styles.container} accessibilityRole="summary"><Ionicons name={icon} size={32} color={colors.nimbus500} /><Text style={styles.title}>{title}</Text><Text style={styles.description}>{description}</Text>{actionLabel && onAction ? <Button variant="secondary" onPress={onAction}>{actionLabel}</Button> : null}</View>;
}
const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing['3xl'], gap: spacing.md }, title: { color: colors.textPrimary, textAlign: 'center', ...typography.h3 }, description: { color: colors.textSecondary, textAlign: 'center', ...typography.bodySmall, marginBottom: spacing.md } });
