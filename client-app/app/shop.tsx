import { ActivityIndicator, FlatList, TextInput, TouchableOpacity, View, Text, ScrollView } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Product } from '@/constants/types';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import BrandLoader from '@/components/BrandLoader';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CATEGORIES } from '@/constants';
import ProductCard from '@/components/ProductCard';
import api from '@/constants/api';

export default function Shop() {
    const params = useLocalSearchParams<{ category?: string; search?: string }>();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [selectedCategory, setSelectedCategory] = useState<string>(
        params.category ? String(params.category) : ""
    );
    const [searchQuery, setSearchQuery] = useState<string>(
        params.search ? String(params.search) : ""
    );

    // R20: useCallback prevents a new function reference on every render.
    // Parameters for category/search/page are passed explicitly so the
    // function body never captures stale closure values.
    const fetchProducts = useCallback(async (pageNumber = 1, category = selectedCategory, search = searchQuery) => {
        if (pageNumber === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const queryParams: Record<string, string | number> = { page: pageNumber, limit: 10 };
            if (category) queryParams.category = category;
            if (search) queryParams.search = search;

            const { data } = await api.get('/products', { params: queryParams });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearchSubmit = () => {
        setPage(1);
        fetchProducts(1, selectedCategory, searchQuery);
    };

    const handleCategorySelect = (catName: string) => {
        const newCat = selectedCategory === catName ? "" : catName;
        setSelectedCategory(newCat);
        setPage(1);
        fetchProducts(1, newCat, searchQuery);
    };

    const loadMore = () => {
        if (!loadingMore && !loading && hasMore) {
            fetchProducts(page + 1);
        }
    };

    const [categoriesList, setCategoriesList] = useState<any[]>([
        { id: 0, name: "All" },
        ...CATEGORIES,
    ]);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get("/categories");
            if (data.success && data.data.length > 0) {
                setCategoriesList([{ id: 0, name: "All" }, ...data.data]);
            }
        } catch (error) {
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
        fetchProducts(1, initialCategory, initialSearch);
    }, [params.category, params.search]);

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
                            <TouchableOpacity onPress={() => { setSearchQuery(""); fetchProducts(1, selectedCategory, ""); }}>
                                <Ionicons name="close-circle" size={18} color={COLORS.secondary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={handleSearchSubmit}
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
                    contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 100, paddingTop: 4 }}
                    columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 8 }}
                    renderItem={({ item }) => (
                        <ProductCard product={item} />
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
        </SafeAreaView>
    );
}
