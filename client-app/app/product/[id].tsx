import { View, Text, ActivityIndicator, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Product } from '@/constants/types';
import { useCart } from '@/Context/CartContext';
import { useWishlist } from '@/Context/WishlistContext';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import Toast from "react-native-toast-message";
import api from '@/constants/api';


const { width } = Dimensions.get('window');

export default function ProductDetails() {
    const { id } = useLocalSearchParams(); // Get the product ID from the route parameters
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    const { addToCart, cartItems, itemCount } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const insets = useSafeAreaInsets();

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/products/${id}`);
            if (data.success) {
                setProduct(data.data);
            }

        } catch (error) {
            console.error("Error fetching product:", error);
            Toast.show({
                type: 'error',
                text1: 'Failed to load product',
                text2: 'Please try again later.',
            });
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <SafeAreaView className='items-center justify-center flex-1'>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        )
    }

    if (!product) {
        return (
            <SafeAreaView className='items-center justify-center flex-1'>
                <Text className='text-lg text-gray-600'>Product not found</Text>
            </SafeAreaView>
        )
    }

    const isLiked = isInWishlist(product._id);

    const handleAddToCart = () => {
        if (!selectedSize) {
            Toast.show({
                type: 'info',
                text1: 'No size selected',
                text2: 'Please select a size before adding to cart.',
                text1Style: { fontSize: 20, fontWeight: 700, color: "black", textAlign: "left" },
                text2Style: { fontSize: 14, color: "black", textAlign: "left" },
            });
            return;
        }
        addToCart(product, selectedSize || "");
    }

    return (
        <View className='flex-1 bg-white'>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* images carousel */}
                <View className='relative h-[450px] bg-gray-100 mb-4' >
                    <ScrollView horizontal pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                            const slide = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width)
                            setActiveImageIndex(slide)
                        }}>
                        {product.images?.map((img, index) => (
                            <Image key={index}
                                source={{ uri: img }}
                                style={{ width: width, height: 450 }}
                                resizeMode="cover" />
                        ))}

                    </ScrollView>
                    {/* Header Actions */}

                    <View
                        className='absolute z-10 flex-row items-center justify-between left-4 right-4'
                        style={{ top: insets.top + 16 }}
                    >
                        <TouchableOpacity className='items-center justify-center rounded-full size-14 bg-white/85' onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={26} color={COLORS.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity className='items-center justify-center rounded-full size-14 bg-white/85' onPress={() => toggleWishlist(product)}>
                            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={26} color={COLORS.accent} />
                        </TouchableOpacity>
                    </View>
                    {/* Pagination dots  */}
                    <View className='absolute left-0 right-0 flex-row items-center justify-center gap-2 bottom-4'>
                        {product.images?.map((_, index) => (
                            <View key={index} className={`h-2 rounded-full${index === activeImageIndex ? ' w-6 bg-primary' : ' w-2 bg-gray-300'
                                }`} />

                        ))}
                    </View>
                </View>
                {/* Product info */}
                <View className='px-5 pb-10'>
                    <View className='flex-row items-start justify-between'>
                        <Text className='mr-4 text-[22px] font-semibold leading-7 text-primary'>
                            {product.name}
                        </Text>
                        <View>
                            <Ionicons name="star" size={18} color="#FFD700" />
                            <Text className='ml-1 text-sm font-bold '>{product.ratings.average.toFixed(1)}</Text>
                            <Text className='ml-1 text-xs text-secondary'>({product.ratings.count})</Text>
                        </View>
                    </View>

                    {/* price */}
                    <Text className='mb-6 text-2xl font-bold text-primary'>${product.price.toFixed(2)}</Text>

                    {/* sizes */}
                    {
                        product.sizes && product.sizes.length > 0 && (
                            <>
                                <Text className='mb-3 text-base font-bold text-primary'>Size</Text>
                                <View className='flex-row flex-wrap gap-3 mb-6'>
                                    {product.sizes.map((size) => (
                                        <TouchableOpacity key={size}
                                            className={` size-14 items-center justify-center rounded-full border ${selectedSize === size ? 'border-primary bg-primary' : 'border-gray-100 bg-white'
                                                } p-4`}
                                            onPress={() => setSelectedSize(size)}
                                        >
                                            <Text className={`text-base font-bold ${selectedSize === size ? 'text-white' : 'text-gray-500'
                                                }`}>
                                                {size}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )
                    }
                    {/* description */}
                    <Text className='mb-2 text-base font-bold text-primary'>Description</Text>
                    <Text className='mb-6 leading-6 text-secondary'>{product.description}</Text>

                </View>

            </ScrollView>
            {/* Footer */}
            <View className='absolute bottom-0 left-0 right-0 flex-row p-4 bg-white border-t border-gray-100'>

                <TouchableOpacity
                    onPress={handleAddToCart}
                    className='flex-row items-center justify-center w-4/5 py-4 rounded-full shadow-lg bg-primary ' style={{ marginBottom: insets.bottom }}
                >
                    <Ionicons name="bag-outline" size={20} color="white" />
                    <Text className='ml-2 text-base font-bold text-white'>Add to Cart</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push("/(tabs)/cart")}
                    className='relative flex-row justify-center w-1/5 py-3 '
                >
                    <Ionicons name="cart-outline" size={24} />
                    <View className='absolute z-10 flex-row justify-center bg-black rounded-full top-2 right-4 size-4'>
                        <Text className='font-font text-white text-[9px]'>{itemCount}</Text>
                    </View>

                </TouchableOpacity>
            </View>

        </View>
    )
}