import React from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCart } from '@/Context/CartContext'
import { View } from 'react-native'

export default function TabLayout() {
    const insets = useSafeAreaInsets()

    const { cartItems } = useCart();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: "#cdcde0",
                tabBarShowLabel: false,

                tabBarStyle: {
                    backgroundColor: "#FFF",
                    borderTopColor: COLORS.border,
                    borderTopWidth: 1,

                    height: 64 + insets.bottom,
                    paddingTop: 10,
                    paddingBottom: insets.bottom,

                    // مهم
                    position: "absolute",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "home" : "home-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="cart"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        < View className='relative'>
                            <Ionicons
                                name={focused ? "cart" : "cart-outline"}
                                size={24}
                                color={color}
                            />
                            {cartItems.length > 0 && (
                                <View className='absolute items-center justify-center rounded-full -top-2 -right-2 bg-accent size-3'>
                                    <Ionicons name="ellipse" size={6} color="white" className='absolute -top-2 -right-2' />
                                </View>
                            )}
                        </ View>
                    ),
                }}
            />

            <Tabs.Screen
                name="favorites"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "heart" : "heart-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "person" : "person-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    )
}