import { View, Image, TouchableOpacity, Text } from 'react-native'
import React from 'react'
import type { CartItem as CartItemType } from '@/Context/CartContext'
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants';

type CartItemProps = {
    item: CartItemType;
    onRemove?: () => void;
    onUpdateQuantity?: (newQty: number) => void;
};

export default function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
    const imageUrl = item.product.images?.[0] || 'https://placehold.co/400';

    return (
        <View className='flex-row p-3 mb-4 bg-white rounded-xl'>
            <View className='w-20 h-20 mr-3 overflow-hidden bg-gray-100 rounded-lg'>
                <Image source={{ uri: imageUrl }} className='w-full h-full' resizeMode='cover' />
            </View>

            <View className='justify-between flex-1'>
                <View className='flex-row items-start justify-between'>
                    <View>
                        <Text className='mb-1 text-sm font-medium text-primary'>{item.product.name}</Text>
                        <Text className='text-xs text-secondary'>Size: {item.size}</Text>
                    </View>

                    <TouchableOpacity onPress={onRemove}>
                        <Ionicons name="close-circle-outline" size={20} color="#FF4C3B" />
                    </TouchableOpacity>
                </View>

                {/* price and quantity controls */}
                <View className='flex-row items-center justify-between mt-2'>
                    <Text className='text-base font-bold text-primary'>${item.price.toFixed(2)}</Text>

                    <View className='flex-row items-center px-2 py-1 rounded bg-surface-full'>
                        <TouchableOpacity
                            onPress={() => onUpdateQuantity && onUpdateQuantity(Math.max(1, item.quantity - 1))}
                        >
                            <Ionicons name="remove-circle-outline" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                        <Text className='px-4 text-sm font-medium text-primary'>{item.quantity}</Text>
                        <TouchableOpacity onPress={() => onUpdateQuantity && onUpdateQuantity(item.quantity + 1)}>
                            <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                </View>



            </View>
        </View>
    )
}