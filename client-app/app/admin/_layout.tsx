import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import { useUser } from "@clerk/expo";
// import { dummyUser } from "@/assets/assets";

export default function AdminLayout() {
    const { user, isLoaded } = useUser()
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && (!user || user.publicMetadata?.role !== "admin")) {
            router.replace("/(tabs)");
        }
    }, [isLoaded, router, user]);

    if (!isLoaded) {
        return (
            <View className="items-center justify-center flex-1 bg-surface">
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!user || user.publicMetadata?.role !== "admin") return null;

    return (
        <Tabs
            screenOptions={{
                headerStyle: {
                    backgroundColor: "#fff",
                },
                headerTintColor: COLORS.primary,
                headerTitleStyle: {
                    fontWeight: "bold",
                },
                headerShadowVisible: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: "gray",
                headerRight: () => (
                    <TouchableOpacity
                        onPress={() => router.replace("/(tabs)")}
                        className="flex-row items-center mr-4"
                    >
                        <Ionicons name="log-out-outline" size={24} color={COLORS.primary} />
                        <Text className="ml-1 font-medium text-primary">Exit</Text>
                    </TouchableOpacity>
                ),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Admin Dashboard",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid-outline" size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="products"
                options={{
                    title: "Products",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cube-outline" size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: "Orders",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="receipt-outline" size={size} color={color} />
                    )
                }}
            />
        </Tabs>
    );
}
