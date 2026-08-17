import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius } from '@/theme';
export default function Skeleton({ style }: { style?: ViewStyle }) { return <View accessibilityLabel="Loading" style={[styles.base, style]} />; }
const styles = StyleSheet.create({ base: { backgroundColor: colors.surfaceMuted, borderRadius: radius.md } });
