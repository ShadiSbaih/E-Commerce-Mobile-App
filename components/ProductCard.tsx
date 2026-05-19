import { View, TouchableOpacity, Image, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants';
import { useWishlist } from '@/Context/WishlistContext';

export default function ProductCard({ product }: { product: any }) {
    const { isInWishlist, toggleWishlist } = useWishlist();
    const isLiked = isInWishlist(product._id);
    return (
        <Link href={`/product/${product._id}`} asChild>
            <TouchableOpacity className='w-[48%] mb-4 bg-white rounded-lg overflow-hidden '>
                <View className='relative w-full h-56 bg-gray-100'>
                    <Image source={{ uri: product.images[0] ??"" }}
                        className='w-full h-full' resizeMode="cover" />

                    {/* Favorite icon   */}
                    <TouchableOpacity className='absolute z-10 p-2 bg-white rounded-full shadow-sm top-2 right-2' onPress={(e) => {e.stopPropagation() toggleWishlist(product)}}>
                        <Ionicons name={`${isLiked ? 'heart' : 'heart-outline'}`} size={24} color={`${isLiked ? COLORS.accent : COLORS.primary}`} />
                    </TouchableOpacity>

                    {/* is Featured */}
                    {product.isFeatured && (
                        <View className='absolute top-0 left-0 z-10 px-2 py-1 rounded-bl-lg bg-accent'>
                            <Text className='text-xs font-bold text-white'>Featured</Text>
                        </View>
                    )}
                </View>
                {/* Product details */}
                <View className='p-3'>
                    <View className='flex-row items-center mb-1'>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text className='ml-1 text-sm text-gray-600'>{product.ratings.average.toFixed(1)} ({product.ratings.count})</Text>
                    </View>
                    <Text className='mb-1 text-sm font-medium text-primary' numberOfLines={1}>{product.name}</Text>
                    <View >
                        <Text className='text-base font-bold text-pretty'>${product.price.toFixed(2)}</Text>
                    </View>

                </View>
            </TouchableOpacity>
        </Link>
    )
}