import { View, Image, TouchableOpacity, Text } from 'react-native'
import React from 'react'
import { CartItem } from '@/constants/types'
import { Ionicons } from '@expo/vector-icons';

export default function CartItem({ item, onRemove, onUpdateQuantity }: CartItem) {
    const imageURl = item.product.images[0]?.url || 'https://placehold.co/400';

    return (
        <View className='flex-row p-3 mb-4 bg-white rounded-xl'>
            <View className='w-20 h-20 mr-3 overflow-hidden bg-gray-100 rounded-lg'>
                <Image source={{ uri: imageURl }} className='w-full h-full' resizeMode='cover' />
            </View>

            <View className='justify-between flex-1'>
                <View className='flex-row items-start justify-between'>
                    <View>
                        <Text className='mb-1 text-sm font-medium text-primary'>{item.product.name}</Text>
                        <Text className='text-xs text-secondary'>Size: {item.size}</Text>
                    </View>

                    <TouchableOpacity>
                        <Ionicons name="close-circle-outline" size={20} color="#FF4C3B" onPress={() => onRemove} />
                    </TouchableOpacity>
                </View>

                {/* price and quantity controls */}
                <View className='flex-row items-center justify-between mt-2'>
                    <Text className='text-base font-bold text-primary'>${item.price.toFixed(2)}</Text>
                </View>

                <View className='flex-row items-center px-2 rounded bg-surface-full oy-1'>
                    <TouchableOpacity onPress={() => onUpdateQuantity && onUpdateQuantity(item.quantity - 1)}>
                        <Ionicons name="remove-circle-outline" size={20} color="#FF4C3B" />
                    </TouchableOpacity>
                    <Text className='px-4 text-sm font-medium text-primary'>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => onUpdateQuantity && onUpdateQuantity(item.quantity + 1)}>
                        <Ionicons name="add-circle-outline" size={20} color="#FF4C3B" />
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    )
}