import {  Text, TouchableOpacity,  View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants'
import { CategoryItemProps } from '@/constants/types'

export default function CategoryItem({ item, isSelected, onPress }: CategoryItemProps) {
    return (
        <TouchableOpacity onPress={onPress} className='items-center mr-4'>
            <View className={`w-14 h-14 rounded-full items-center justify-center mb-2 ${isSelected ?'bg-primary': 'bg-surface'} `}>
                <Ionicons name={item.icon as any} size={24} color={isSelected ? '#fff' : COLORS.primary} />
             
             </View>
               <Text className={`mt-2 text-sm font-medium text-center ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                    {item.name}
                </Text>

        </TouchableOpacity>
    )
}