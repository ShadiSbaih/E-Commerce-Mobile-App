import { ActivityIndicator, FlatList, TextInput, TouchableOpacity, View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Product } from '@/constants/types';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants';
import ProductCard from '@/components/ProductCard';
import api from '@/constants/api';

export default function Shop() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchProducts = async (pageNumber = 1) => {
        if (pageNumber === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const queryParams: any = { page: pageNumber, limit: 10 };

            const { data } = await api.get('/products', { params: queryParams })

            if (pageNumber === 1) {
                setProducts(data.data)
            } else {
                setProducts(prev => [...prev, ...data.data])
            }

            setHasMore(data.pagination.page < data.pagination.pages)
            setPage(pageNumber)
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
    }

    const loadMore = () => {
        if (!loadingMore && !loading && hasMore) {
            fetchProducts(page + 1);
        }
    }

    useEffect(() => {
        fetchProducts(1);
    }, [])

    return (
        <SafeAreaView className='flex-1 bg-surface' edges={['top']}>
            <Header title="Shop" showBack showCart />

            <View className='flex-row gap-2 mx-4 my-2 mb-3'>
                <View className='flex-row items-center flex-1 bg-white border border-gray-100 rounded-xl'>
                    <Ionicons name="search" size={20} color={COLORS.secondary} className='ml-4' />
                    <TextInput
                        placeholder='Search Products'
                        returnKeyType='search'
                        placeholderTextColor={COLORS.secondary}
                        className='flex-1 px-4 py-3 ml-1 text-primary'
                    />
                </View>

                {/* filter icon */}
                <TouchableOpacity className='items-center justify-center bg-gray-800 size-12 rounded-xl'>
                    <Ionicons name="options-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className='items-center justify-center flex-1'>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                    columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
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
                                <Text className='text-center text-primary'>No products found.</Text> {/* <-- REQUIRED IMPORTING Text */}
                            </View>
                        ) : null
                    }
                />
            )}
        </SafeAreaView>
    )
}