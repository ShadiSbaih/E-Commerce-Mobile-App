import React from 'react'
import { Stack, Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants'

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            headerShown: false, tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: "#cdcde0", tabBarShowLabel: false,
            tabBarStyle: { marginBottom: 48, backgroundColor: "#FFF", borderTopColor: COLORS.border, borderTopWidth: 1, height: 64, paddingTop: 10 }
        }}>
            <Tabs.Screen name="index" options={{
                tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
            }} />
            <Tabs.Screen name="cart" options={{
                tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "cart" : "cart-outline"} size={24} color={color} />
            }} />
            <Tabs.Screen name="favorites" options={{
                tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "heart" : "heart-outline"} size={24} color={color} />
            }} />
            <Tabs.Screen name="profile" options={{
                tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
            }} />
        </Tabs>
    )
}