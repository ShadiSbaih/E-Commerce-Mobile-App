import React, { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import CategoryItem from '@/components/CategoryItem';
import ProductCard from '@/components/ProductCard';
import SectionHeader from '@/components/SectionHeader';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import Skeleton from '@/components/Skeleton';
import { BANNERS } from '@/assets/assets';
import { CATEGORIES } from '@/constants';
import { Product } from '@/constants/types';
import api from '@/constants/api';
import Toast from 'react-native-toast-message';
import { colors, radius, spacing, typography } from '@/theme';

export default function Home() {
  const router = useRouter();
  const [categories, setCategories] = React.useState<any[]>([{ id: 'all', name: 'All', icon: 'grid-outline' }, ...CATEGORIES]);
  const [products, setProducts] = React.useState<Product[]>([]); const [selectedCategory, setSelectedCategory] = React.useState(''); const [loading, setLoading] = React.useState(true);
  const fetchCategories = async () => { try { const { data } = await api.get('/categories'); if (data.success && data.data.length) setCategories([{ id: 'all', name: 'All', icon: 'grid-outline' }, ...data.data]); } catch { /* retain curated fallback */ } };
  const fetchProducts = async (category = selectedCategory) => { setLoading(true); try { const { data } = await api.get('/products', { params: category ? { category } : {} }); setProducts(data.data); } catch { Toast.show({ type: 'error', text1: "We couldn't load these products.", text2: 'Check your connection and try again.' }); } finally { setLoading(false); } };
  // The initial marketplace request intentionally runs once; later requests are driven by category selection.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchCategories(); fetchProducts(); }, []);
  const chooseCategory = (name: string) => { const category = name === 'All' ? '' : name; setSelectedCategory(category); fetchProducts(category); };
  return <SafeAreaView style={styles.safe} edges={['top']}><Header showCart showLogo /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.bannerScroller}><View style={styles.banner}>{BANNERS.slice(0, 1).map((banner, index) => <React.Fragment key={index}><Image source={{ uri: banner.image }} style={styles.bannerImage} resizeMode="cover" /><View style={styles.bannerText}><Text style={styles.eyebrow}>FROM INDEPENDENT MAKERS</Text><Text style={styles.bannerTitle}>{banner.title}</Text><Text style={styles.bannerSubtitle}>{banner.subtitle}</Text><Button variant="secondary" onPress={() => router.push('/shop')}>Explore picks</Button></View></React.Fragment>)}</View></ScrollView>
    <View style={styles.section}><SectionHeader title="Browse by category" /><ScrollView horizontal showsHorizontalScrollIndicator={false}>{categories.map((category) => <CategoryItem key={category.id || category._id} item={category} isSelected={category.name === 'All' ? !selectedCategory : selectedCategory === category.name} onPress={() => chooseCategory(category.name)} />)}</ScrollView></View>
    <View style={styles.section}><SectionHeader title={selectedCategory ? `${selectedCategory} finds` : 'Thoughtfully chosen'} actionLabel="See all" onAction={() => router.push({ pathname: '/shop', params: selectedCategory ? { category: selectedCategory } : {} })} />{loading ? <View style={styles.grid}>{[0, 1, 2, 3].map(item => <View key={item} style={styles.skeletonCard}><Skeleton style={styles.skeletonImage} /><Skeleton style={styles.skeletonLine} /><Skeleton style={styles.skeletonShort} /></View>)}</View> : products.length ? <View style={styles.grid}>{products.slice(0, 6).map(product => <ProductCard key={product._id} product={product} />)}</View> : <EmptyState title="Nothing here yet" description="Try another category to find more from independent makers." actionLabel="Browse all" onAction={() => chooseCategory('All')} icon="search-outline" />}</View>
    <View style={styles.story}><Text style={styles.storyTitle}>Made for your space.</Text><Text style={styles.storyText}>Fresh finds from independent shops, chosen to be useful, personal, and a little unexpected.</Text><Button variant="secondary" onPress={() => router.push('/shop')}>Discover shops</Button></View>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, content: { paddingBottom: 112 }, bannerScroller: { marginBottom: spacing['3xl'] }, banner: { height: 278, marginHorizontal: spacing.lg, overflow: 'hidden', borderRadius: radius.lg, backgroundColor: colors.nimbus200 }, bannerImage: { width: '100%', height: '100%', opacity: 0.32 }, bannerText: { position: 'absolute', left: spacing.xl, right: spacing.xl, bottom: spacing.xl, gap: spacing.sm, alignItems: 'flex-start' }, eyebrow: { color: colors.textSecondary, ...typography.caption, letterSpacing: 0.8 }, bannerTitle: { color: colors.primary, ...typography.h1 }, bannerSubtitle: { color: colors.textSecondary, ...typography.bodySmall, maxWidth: '75%', marginBottom: spacing.sm }, section: { marginHorizontal: spacing.lg, marginBottom: spacing['3xl'] }, grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }, skeletonCard: { width: '48%', gap: spacing.sm, marginBottom: spacing['2xl'] }, skeletonImage: { width: '100%', aspectRatio: 0.82 }, skeletonLine: { width: '85%', height: 14 }, skeletonShort: { width: '45%', height: 14 }, story: { marginHorizontal: spacing.lg, padding: spacing.xl, gap: spacing.md, backgroundColor: colors.nimbus200, borderRadius: radius.lg }, storyTitle: { color: colors.primary, ...typography.h2 }, storyText: { color: colors.textSecondary, ...typography.bodySmall } });
