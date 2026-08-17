import React, { useEffect } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import { BANNERS } from '@/assets/assets';
import Button from '@/components/Button';
import CategoryItem from '@/components/CategoryItem';
import EmptyState from '@/components/EmptyState';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import SectionHeader from '@/components/SectionHeader';
import Skeleton from '@/components/Skeleton';
import { CATEGORIES } from '@/constants';
import api from '@/constants/api';
import { Product } from '@/constants/types';
import { colors, radius, spacing, typography } from '@/theme';

const ALL_CATEGORY = { id: 'all', name: 'All', icon: 'grid-outline' };

export default function Home() {
  const router = useRouter();
  const { width: viewportWidth } = useWindowDimensions();
  const bannerRef = React.useRef<ScrollView>(null);
  const [activeBanner, setActiveBanner] = React.useState(0);
  const [categories, setCategories] = React.useState<any[]>([
    ALL_CATEGORY,
    ...CATEGORIES,
  ]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  const bannerPageWidth = Math.max(viewportWidth, 1);
  const bannerCardWidth = Math.max(
    bannerPageWidth - spacing.lg * 2,
    1,
  );

  const fetchCategories = React.useCallback(async () => {
    try {
      const { data } = await api.get('/categories');
      if (data.success && data.data.length) {
        setCategories([ALL_CATEGORY, ...data.data]);
      }
    } catch {
      // Keep the curated category fallback when the API is unavailable.
    }
  }, []);

  const fetchProducts = React.useCallback(async (category = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', {
        params: category ? { category } : {},
      });
      setProducts(data.data);
    } catch {
      Toast.show({
        type: 'error',
        text1: "We couldn't load these products.",
        text2: 'Check your connection and try again.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // The initial marketplace request intentionally runs once; later requests
  // are driven by category selection.
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  useEffect(() => {
    if (BANNERS.length < 2) return;

    const timer = setInterval(() => {
      setActiveBanner((current) => {
        const next = (current + 1) % BANNERS.length;
        bannerRef.current?.scrollTo({
          x: next * bannerPageWidth,
          animated: true,
        });
        return next;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [bannerPageWidth]);

  const handleBannerScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const next = Math.round(
      event.nativeEvent.contentOffset.x / bannerPageWidth,
    );
    if (next >= 0 && next < BANNERS.length && next !== activeBanner) {
      setActiveBanner(next);
    }
  };

  const chooseCategory = (name: string) => {
    const category = name === 'All' ? '' : name;
    setSelectedCategory(category);
    fetchProducts(category);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header showCart showLogo />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.carousel}>
          <ScrollView
            ref={bannerRef}
            horizontal
            pagingEnabled
            snapToInterval={bannerPageWidth}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onScroll={handleBannerScroll}
            scrollEventThrottle={16}
          >
            {BANNERS.map((banner) => (
              <View
                key={banner.id}
                style={[styles.bannerPage, { width: bannerPageWidth }]}
              >
                <View style={[styles.banner, { width: bannerCardWidth }]}>
                  <Image
                    source={{ uri: banner.image }}
                    style={styles.bannerImage}
                    resizeMode="cover"
                    accessibilityLabel={banner.title}
                  />
                  <View style={styles.bannerScrim} />
                  <View style={styles.bannerText}>
                    <Text style={styles.eyebrow}>FROM INDEPENDENT MAKERS</Text>
                    <Text style={styles.bannerTitle}>{banner.title}</Text>
                    <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                    <Button
                      variant="banner"
                      style={styles.exploreButton}
                      onPress={() => router.push('/shop')}
                    >
                      Explore picks
                    </Button>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.pagination} pointerEvents="none">
            {BANNERS.map((banner, index) => (
              <View
                key={banner.id}
                style={[
                  styles.paginationDot,
                  index === activeBanner && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.categorySection]}>
          <SectionHeader title="Browse by category" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <CategoryItem
                key={category.id || category._id}
                item={category}
                isSelected={
                  category.name === 'All'
                    ? !selectedCategory
                    : selectedCategory === category.name
                }
                onPress={() => chooseCategory(category.name)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title={
              selectedCategory
                ? `${selectedCategory} finds`
                : 'Thoughtfully chosen'
            }
            actionLabel="See all"
            onAction={() =>
              router.push({
                pathname: '/shop',
                params: selectedCategory ? { category: selectedCategory } : {},
              })
            }
          />

          {loading ? (
            <View style={styles.grid}>
              {[0, 1, 2, 3].map((item) => (
                <View key={item} style={styles.skeletonCard}>
                  <Skeleton style={styles.skeletonImage} />
                  <Skeleton style={styles.skeletonLine} />
                  <Skeleton style={styles.skeletonShort} />
                </View>
              ))}
            </View>
          ) : products.length ? (
            <View style={styles.grid}>
              {products.slice(0, 6).map((product) => (
                <View key={product._id} style={styles.productCell}>
                  <ProductCard product={product} style={styles.productCard} />
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              title="Nothing here yet"
              description="Try another category to find more from independent makers."
              actionLabel="Browse all"
              onAction={() => chooseCategory('All')}
              icon="search-outline"
            />
          )}
        </View>

        <View style={styles.story}>
          <Text style={styles.storyTitle}>Made for your space.</Text>
          <Text style={styles.storyText}>
            Fresh finds from independent shops, chosen to be useful, personal,
            and a little unexpected.
          </Text>
          <Button variant="secondary" onPress={() => router.push('/shop')}>
            Discover shops
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 112,
  },
  carousel: {
    height: 278,
    marginBottom: spacing['3xl'],
    position: 'relative',
  },
  bannerPage: {
    alignItems: 'center',
  },
  banner: {
    height: 278,
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: colors.nimbus200,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.44)',
  },
  bannerText: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    // Keep the CTA above the pagination dots on narrow screens.
    bottom: spacing['2xl'],
    gap: spacing.sm,
    alignItems: 'flex-start',
    zIndex: 2,
  },
  exploreButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.white,
    elevation: 3,
  },
  eyebrow: {
    color: colors.white,
    ...typography.caption,
    letterSpacing: 0.8,
  },
  bannerTitle: {
    color: colors.white,
    ...typography.h1,
  },
  bannerSubtitle: {
    color: colors.white,
    ...typography.bodySmall,
    marginBottom: spacing.sm,
  },
  pagination: {
    position: 'absolute',
    right: spacing['2xl'],
    bottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    zIndex: 3,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  paginationDotActive: {
    width: 18,
    backgroundColor: colors.white,
  },
  section: {
    marginHorizontal: spacing.xs,
    marginBottom: spacing['3xl'],
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productCell: {
    width: '48%',
  },
  productCard: {
    width: '100%',
  },
  skeletonCard: {
    width: '48%',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  skeletonImage: {
    width: '100%',
    aspectRatio: 0.82,
  },
  skeletonLine: {
    width: '85%',
    height: 14,
  },
  skeletonShort: {
    width: '45%',
    height: 14,
  },
  story: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.nimbus200,
    borderRadius: radius.lg,
  },
  storyTitle: {
    color: colors.primary,
    ...typography.h2,
  },
  storyText: {
    color: colors.textSecondary,
    ...typography.bodySmall,
  },
});
