import { ActivityIndicator, Animated, FlatList, Modal, Pressable, TextInput, TouchableOpacity, View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Product } from '@/constants/types';
import Toast from 'react-native-toast-message';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import BrandLoader from '@/components/BrandLoader';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CATEGORIES } from '@/constants';
import ProductCard from '@/components/ProductCard';
import api from '@/constants/api';
import { colors, radius, spacing, typography } from '@/theme';

type PriceRange = 'all' | 'under50' | '50to100' | 'over100';

type QueryFilters = {
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: boolean;
};

const PRICE_RANGES: { key: PriceRange; label: string; minPrice?: number; maxPrice?: number }[] = [
    { key: 'all', label: 'All prices' },
    { key: 'under50', label: 'Under $50', maxPrice: 50 },
    { key: '50to100', label: '$50 - $100', minPrice: 50, maxPrice: 100 },
    { key: 'over100', label: 'Over $100', minPrice: 100 },
];

const getQueryFilters = (range: PriceRange, featured: boolean): QueryFilters => {
    const selectedRange = PRICE_RANGES.find((item) => item.key === range);
    return {
        ...(selectedRange?.minPrice !== undefined ? { minPrice: selectedRange.minPrice } : {}),
        ...(selectedRange?.maxPrice !== undefined ? { maxPrice: selectedRange.maxPrice } : {}),
        ...(featured ? { isFeatured: true } : {}),
    };
};

export default function Shop() {
    const params = useLocalSearchParams<{ category?: string; search?: string }>();
    const { width: viewportWidth } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const gridPadding = 12;
    const gridGap = 8;
    const cardWidth = Math.max((viewportWidth - gridPadding * 2 - gridGap) / 2, 0);

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filterOpen, setFilterOpen] = useState(false);
    const [priceRange, setPriceRange] = useState<PriceRange>('all');
    const [featuredOnly, setFeaturedOnly] = useState(false);
    const [draftPriceRange, setDraftPriceRange] = useState<PriceRange>('all');
    const [draftFeaturedOnly, setDraftFeaturedOnly] = useState(false);
    const sheetProgress = React.useRef(new Animated.Value(0)).current;

    const [selectedCategory, setSelectedCategory] = useState<string>(
        params.category ? String(params.category) : ""
    );
    const [searchQuery, setSearchQuery] = useState<string>(
        params.search ? String(params.search) : ""
    );

    // R20: useCallback prevents a new function reference on every render.
    // Parameters for category/search/page are passed explicitly so the
    // function body never captures stale closure values.
    const fetchProducts = useCallback(async (pageNumber = 1, category = '', search = '', filters: QueryFilters = {}) => {
        if (pageNumber === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const queryParams: Record<string, string | number> = { page: pageNumber, limit: 10 };
            if (category) queryParams.category = category;
            if (search) queryParams.search = search;
            if (filters.minPrice !== undefined) queryParams.minPrice = filters.minPrice;
            if (filters.maxPrice !== undefined) queryParams.maxPrice = filters.maxPrice;
            if (filters.isFeatured !== undefined) queryParams.isFeatured = filters.isFeatured ? 'true' : 'false';

            const { data } = await api.get('/products', {
                params: queryParams,
                // Shop renders its own initial and pagination loading states so
                // scrolling never gets covered by the app-wide loader.
                skipGlobalLoading: true,
            });

            if (pageNumber === 1) setProducts(data.data);
            else setProducts(prev => [...prev, ...data.data]);

            setHasMore(data.pagination.page < data.pagination.pages);
            setPage(pageNumber);
        } catch (error) {
            console.error("Error fetching products:", error);
            Toast.show({
                type: 'error',
                text1: 'Failed to load products',
                text2: 'Please try again later.',
            });
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    const handleSearchSubmit = () => {
        setPage(1);
        fetchProducts(1, selectedCategory, searchQuery, getQueryFilters(priceRange, featuredOnly));
    };

    const handleCategorySelect = (catName: string) => {
        const newCat = selectedCategory === catName ? "" : catName;
        setSelectedCategory(newCat);
        setPage(1);
        fetchProducts(1, newCat, searchQuery, getQueryFilters(priceRange, featuredOnly));
    };

    const loadMore = () => {
        if (!loadingMore && !loading && hasMore) {
            fetchProducts(page + 1, selectedCategory, searchQuery, getQueryFilters(priceRange, featuredOnly));
        }
    };

    const openFilters = () => {
        setDraftPriceRange(priceRange);
        setDraftFeaturedOnly(featuredOnly);
        setFilterOpen(true);
        sheetProgress.setValue(0);
        requestAnimationFrame(() => {
            Animated.timing(sheetProgress, {
                toValue: 1,
                duration: 260,
                useNativeDriver: true,
            }).start();
        });
    };

    const closeFilters = () => {
        Animated.timing(sheetProgress, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => setFilterOpen(false));
    };

    const applyFilters = () => {
        setPriceRange(draftPriceRange);
        setFeaturedOnly(draftFeaturedOnly);
        setPage(1);
        closeFilters();
    };

    const resetFilters = () => {
        setDraftPriceRange('all');
        setDraftFeaturedOnly(false);
        setPriceRange('all');
        setFeaturedOnly(false);
        setPage(1);
        closeFilters();
    };

    const [categoriesList, setCategoriesList] = useState<any[]>([
        { id: 0, name: "All" },
        ...CATEGORIES,
    ]);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get("/categories", { skipGlobalLoading: true });
            if (data.success && data.data.length > 0) {
                setCategoriesList([{ id: 0, name: "All" }, ...data.data]);
            }
        } catch {
            console.warn("Using fallback static categories in Shop");
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const initialCategory = params.category ? String(params.category) : "";
        const initialSearch = params.search ? String(params.search) : "";
        setSelectedCategory(initialCategory);
        setSearchQuery(initialSearch);
        fetchProducts(1, initialCategory, initialSearch, getQueryFilters(priceRange, featuredOnly));
    }, [params.category, params.search, fetchProducts, priceRange, featuredOnly]);

    return (
        <SafeAreaView className='flex-1 bg-surface' edges={['top']}>
            <Header title="Shop" showBack showCart />

            <View className='mx-4 my-2 mb-2'>
                <View className='flex-row gap-2'>
                    <View className='flex-row items-center flex-1 bg-white border border-border rounded-xl px-3'>
                        <Ionicons name="search" size={20} color={COLORS.secondary} />
                        <TextInput
                            placeholder='Search Products'
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearchSubmit}
                            returnKeyType='search'
                            placeholderTextColor={COLORS.secondary}
                            className='flex-1 px-3 py-3 text-primary'
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => { setSearchQuery(""); fetchProducts(1, selectedCategory, "", getQueryFilters(priceRange, featuredOnly)); }}>
                                <Ionicons name="close-circle" size={18} color={COLORS.secondary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Open filters"
                        onPress={openFilters}
                        className='items-center justify-center bg-primary px-4 rounded-xl'
                    >
                        <Ionicons name="options-outline" size={22} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Category Pills horizontal bar */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className='mt-3 flex-row'>
                    {categoriesList.map((cat) => {
                        const isSelected = cat.name === "All" ? !selectedCategory : selectedCategory === cat.name;
                        return (
                            <TouchableOpacity
                                key={String(cat._id ?? cat.id ?? cat.name)}
                                onPress={() => handleCategorySelect(cat.name === "All" ? "" : cat.name)}
                                className={`px-4 py-2 mr-2 rounded-full border ${
                                    isSelected
                                        ? 'bg-primary border-primary'
                                        : 'bg-white border-border'
                                }`}
                            >
                                <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-primary'}`}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {loading ? (
                <View className='items-center justify-center flex-1'>
                    <BrandLoader label="Loading products" />
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    contentContainerStyle={{ paddingHorizontal: gridPadding, paddingBottom: 100, paddingTop: 4 }}
                    columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 24 }}
                    renderItem={({ item }) => (
                        <View style={{ width: cardWidth }}>
                            <ProductCard product={item} style={styles.shopCard} />
                        </View>
                    )}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loadingMore ? (
                            <View className='py-4'>
                                <ActivityIndicator size="small" color={COLORS.primary} />
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        !loading ? (
                            <View className='items-center justify-center flex-1 py-20'>
                                <Ionicons name="cube-outline" size={48} color={COLORS.secondary} />
                                <Text className='mt-2 text-center text-secondary font-medium'>No products found.</Text>
                            </View>
                        ) : null
                    }
                />
            )}

            <Modal
                visible={filterOpen}
                transparent
                animationType="none"
                statusBarTranslucent
                onRequestClose={closeFilters}
            >
                <View style={styles.modalRoot}>
                    <Animated.View
                        style={[
                            StyleSheet.absoluteFillObject,
                            styles.backdrop,
                            {
                                opacity: sheetProgress.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 1],
                                }),
                            },
                        ]}
                    >
                        <Pressable style={StyleSheet.absoluteFillObject} onPress={closeFilters} />
                    </Animated.View>

                    <Animated.View
                        style={[
                            styles.sheet,
                            { paddingBottom: spacing.lg + insets.bottom },
                            {
                                transform: [
                                    {
                                        translateY: sheetProgress.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [520, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <View style={styles.sheetHandle} />
                        <View style={styles.sheetHeader}>
                            <View>
                                <Text style={styles.sheetTitle}>Filter products</Text>
                            </View>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Close filters"
                                hitSlop={10}
                                onPress={closeFilters}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={20} color={colors.textPrimary} />
                            </Pressable>
                        </View>

                        <Text style={styles.filterLabel}>Price range</Text>
                        <View style={styles.filterOptions}>
                            {PRICE_RANGES.map((range) => {
                                const selected = draftPriceRange === range.key;
                                return (
                                    <Pressable
                                        key={range.key}
                                        accessibilityRole="radio"
                                        accessibilityState={{ selected }}
                                        onPress={() => setDraftPriceRange(range.key)}
                                        style={[styles.filterOption, selected && styles.filterOptionSelected]}
                                    >
                                        <Text style={[styles.filterOptionText, selected && styles.filterOptionTextSelected]}>
                                            {range.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <Pressable
                            accessibilityRole="switch"
                            accessibilityState={{ checked: draftFeaturedOnly }}
                            onPress={() => setDraftFeaturedOnly((value) => !value)}
                            style={styles.featuredOption}
                        >
                            <View style={styles.featuredCopy}>
                                <Text style={styles.featuredTitle}>Handmade picks only</Text>
                                <Text style={styles.featuredSubtitle}>Show selected Nimbus products.</Text>
                            </View>
                            <View style={[styles.switch, draftFeaturedOnly && styles.switchActive]}>
                                <View style={[styles.switchThumb, draftFeaturedOnly && styles.switchThumbActive]} />
                            </View>
                        </Pressable>

                        <View style={styles.sheetActions}>
                            <Pressable
                                accessibilityRole="button"
                                onPress={resetFilters}
                                style={styles.resetButton}
                            >
                                <Text style={styles.resetButtonText}>Reset</Text>
                            </Pressable>
                            <Pressable
                                accessibilityRole="button"
                                onPress={applyFilters}
                                style={styles.applyButton}
                            >
                                <Text style={styles.applyButtonText}>Apply filters</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    shopCard: {
        width: '100%',
        marginBottom: 0,
        minWidth: 0,
    },
    modalRoot: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        backgroundColor: 'rgba(15, 23, 42, 0.42)',
    },
    sheet: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.16,
        shadowRadius: 12,
        elevation: 12,
    },
    sheetHandle: {
        alignSelf: 'center',
        width: 44,
        height: 4,
        borderRadius: radius.full,
        backgroundColor: colors.borderStrong,
        marginBottom: spacing.lg,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    sheetTitle: {
        color: colors.textPrimary,
        ...typography.h3,
    },
    sheetSubtitle: {
        color: colors.textMuted,
        ...typography.caption,
        marginTop: spacing.xs,
    },
    closeButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.full,
        backgroundColor: colors.surfaceSoft,
    },
    filterLabel: {
        color: colors.textPrimary,
        ...typography.bodySmall,
        fontWeight: '700',
        marginBottom: spacing.sm,
    },
    filterOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    filterOption: {
        width: '48%',
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
    },
    filterOptionSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary,
    },
    filterOptionText: {
        color: colors.textSecondary,
        ...typography.bodySmall,
        fontWeight: '600',
    },
    filterOptionTextSelected: {
        color: colors.white,
    },
    featuredOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        marginBottom: spacing.xl,
    },
    featuredCopy: {
        flex: 1,
        minWidth: 0,
    },
    featuredTitle: {
        color: colors.textPrimary,
        ...typography.bodySmall,
        fontWeight: '700',
    },
    featuredSubtitle: {
        color: colors.textMuted,
        ...typography.caption,
        marginTop: 2,
    },
    switch: {
        width: 46,
        height: 26,
        justifyContent: 'center',
        paddingHorizontal: 3,
        borderRadius: radius.full,
        backgroundColor: colors.borderStrong,
    },
    switchActive: {
        backgroundColor: colors.nimbus500,
    },
    switchThumb: {
        width: 20,
        height: 20,
        borderRadius: radius.full,
        backgroundColor: colors.white,
    },
    switchThumbActive: {
        alignSelf: 'flex-end',
    },
    sheetActions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    resetButton: {
        flex: 1,
        minHeight: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.borderStrong,
        borderRadius: radius.md,
    },
    resetButtonText: {
        color: colors.textPrimary,
        ...typography.bodySmall,
        fontWeight: '700',
    },
    applyButton: {
        flex: 2,
        minHeight: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.md,
        backgroundColor: colors.primary,
    },
    applyButtonText: {
        color: colors.white,
        ...typography.bodySmall,
        fontWeight: '700',
    },
});
