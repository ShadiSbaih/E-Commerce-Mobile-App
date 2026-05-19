import { View, TouchableOpacity, Text, Image } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { HeaderProps } from '@/constants/types'
import { COLORS } from '@/constants';
import { useRouter } from 'expo-router';


export default function Header({ title, showBack, showCart, showSearch, showMenu, showLogo }: HeaderProps) {
    const router = useRouter();
    const cartItemCount = 3; // This should ideally come from your app's state or context
    return (
        <View className='flex-row items-center justify-between px-4 py-3 bg-white'>
            {/* Header left side */}
            <View className='flex-row items-center flex-1 '>
                
                {showBack && (
                    <TouchableOpacity className='mr-3' onPress={() => router.back()}>
                        <Ionicons name="arrow-back-outline" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                )}

                {showMenu && (
                    <TouchableOpacity className='mr-3'>
                        <Ionicons name="menu-outline" size={28} color={COLORS.primary} />
                    </TouchableOpacity>
                )}

                {showLogo ? (
                    <View className='flex-1'>
                        <Image source={require('@/assets/logo.png')} style={{ width: "100%", height: 24 }} resizeMode="contain" />
                    </View>
                ) : title && (
                    <Text className='flex-1 mr-8 text-xl font-bold text-center text-primary'>{title}</Text>
                )}
                
                {(!title && !showSearch) && <View className='flex-1' />}
                
            </View>

            {/* Header right side */}
            <View className='flex-row items-center gap-4'>
                {showSearch && (
                    <TouchableOpacity>
                        <Ionicons name="search-outline" size={28} color={COLORS.primary} />
                    </TouchableOpacity>
                )}
                
                {
                    showCart && (
                        <TouchableOpacity onPress={() => router.push('/(tabs)/cart')}>
                            <View className='relative'>
                                <Ionicons name="bag-outline" size={28} color={COLORS.primary} />
                                <View className='absolute items-center justify-center w-5 h-5 rounded-full bg-accent -top-2 -right-2'>
                                    <Text className='text-xs font-bold text-white'>{cartItemCount}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )
                }

            </View>
        </View>
    )
}