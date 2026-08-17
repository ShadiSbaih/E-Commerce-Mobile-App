import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWishlist } from '@/Context/WishlistContext';
import Badge from './Badge';
import { colors, radius, spacing, typography } from '@/theme';

export default function ProductCard({ product }: { product: any }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product._id);
  const rating = product.ratings?.average ?? 0;
  const count = product.ratings?.count ?? 0;
  return <Link href={`/product/${product._id}`} asChild>
    <Pressable accessibilityRole="link" accessibilityLabel={`View ${product.name}`} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.images?.[0] ?? '' }} style={styles.image} resizeMode="cover" accessibilityLabel={product.name} />
        <Pressable accessibilityRole="button" accessibilityLabel={isLiked ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`} accessibilityState={{ selected: isLiked }} hitSlop={8} style={styles.favorite} onPress={(event) => { event.stopPropagation(); toggleWishlist(product); }}><Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={20} color={isLiked ? colors.nimbus500 : colors.textPrimary} /></Pressable>
        {product.isFeatured ? <View style={styles.badge}><Badge tone="highlight">Handmade pick</Badge></View> : null}
      </View>
      <View style={styles.details}><Text style={styles.title} numberOfLines={2}>{product.name}</Text><Text style={styles.shop} numberOfLines={1}>From an independent maker</Text><Text style={styles.price}>${Number(product.price).toFixed(2)}</Text>{count > 0 ? <View style={styles.rating}><Ionicons name="star" size={13} color={colors.warning} /><Text style={styles.ratingText}>{rating.toFixed(1)} · {count}</Text></View> : null}</View>
    </Pressable>
  </Link>;
}
const styles = StyleSheet.create({ card: { width: '48%', marginBottom: spacing['2xl'] }, imageWrap: { aspectRatio: 0.82, overflow: 'hidden', borderRadius: radius.md, backgroundColor: colors.surfaceMuted }, image: { width: '100%', height: '100%' }, favorite: { position: 'absolute', top: spacing.sm, right: spacing.sm, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: colors.white }, badge: { position: 'absolute', top: spacing.sm, left: spacing.sm }, details: { paddingTop: spacing.md }, title: { color: colors.textPrimary, ...typography.bodySmall, fontWeight: '600' }, shop: { color: colors.textMuted, ...typography.caption, marginTop: spacing.xs }, price: { color: colors.textPrimary, ...typography.body, fontWeight: '600', marginTop: spacing.xs }, rating: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs }, ratingText: { color: colors.textSecondary, ...typography.caption }, pressed: { opacity: 0.8 } });
