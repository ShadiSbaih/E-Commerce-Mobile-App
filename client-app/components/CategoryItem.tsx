import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryItemProps } from '@/constants/types';
import { colors, radius, spacing, typography } from '@/theme';
export default function CategoryItem({ item, isSelected, onPress }: CategoryItemProps) { return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Browse ${item.name}`} accessibilityState={{ selected: Boolean(isSelected) }} style={styles.wrap}><View style={[styles.icon, isSelected && styles.iconSelected]}><Ionicons name={(item.icon || 'grid-outline') as any} size={21} color={isSelected ? colors.primary : colors.textSecondary} /></View><Text style={[styles.name, isSelected && styles.nameSelected]} numberOfLines={1}>{item.name}</Text></Pressable>; }
const styles = StyleSheet.create({ wrap: { width: 72, alignItems: 'center', marginRight: spacing.md }, icon: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.surfaceSoft }, iconSelected: { backgroundColor: colors.nimbus200, borderWidth: 1, borderColor: colors.nimbus300 }, name: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, ...typography.caption }, nameSelected: { color: colors.textPrimary, fontWeight: '600' } });
