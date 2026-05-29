import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { COLORS, getStatusColor } from "@/constants";
// import { dummyAdminStats } from "@/assets/assets";
import { useAuth } from "@clerk/expo";
import api from "@/constants/api";
import Toast from "react-native-toast-message";

export default function AdminDashboard() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: []
    });

    const fetchStats = async () => {
        try {
            const token = await getToken();
            const { data } = api.get("/admin/stats", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (data.success) {
                setStats(data.data);
            }
        }
        catch (err) {
            console.error("Error fetching admin stats:", err);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to fetch stats"
            });
        }
        finally {
            setLoading(false);
            setRefreshing(false);
        }

    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    if (loading && !refreshing) {
        return (
            <View className="items-center justify-center flex-1 bg-surface">
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 p-4 bg-surface"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View className="mb-8">
                <Text className="mb-4 text-2xl font-bold tracking-tight text-primary">Overview</Text>
                <View className="flex-row flex-wrap justify-between">
                    <StatCard label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} />
                    <StatCard label="Total Orders" value={stats.totalOrders.toString()} />
                    <StatCard label="Products" value={stats.totalProducts.toString()} />
                    <StatCard label="Users" value={stats.totalUsers.toString()} />
                </View>
            </View>

            <View className="mb-6">
                <Text className="mb-4 text-2xl font-bold tracking-tight text-primary">Recent Orders</Text>
                {stats.recentOrders.length === 0 ? (
                    <View className="items-center p-6 bg-white border border-gray-100 rounded-2xl">
                        <Text className="text-secondary">No recent orders</Text>
                    </View>
                ) : (
                    stats.recentOrders.map((order: any) => (
                        <View key={order._id} className="p-5 mb-3 bg-white border border-gray-100 rounded-2xl">
                            <View className="flex-row items-center justify-between mb-3">
                                <View>
                                    <Text className="text-base font-bold text-primary">Total Products : {order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)}</Text>
                                    <Text className="mt-1 text-xs text-secondary">{new Date(order.createdAt).toLocaleDateString()}</Text>
                                </View>
                                <View className={`px-3 py-1.5 rounded-full ${getStatusColor(order.orderStatus)}`}>
                                    <Text className="text-[10px] font-bold uppercase">{order.orderStatus}</Text>
                                </View>
                            </View>
                            <View className="pb-2">
                                {order.items.map((item: any) => (
                                    <Text key={item._id} className="mt-1 text-xs text-secondary">{item.name} x {item.quantity}</Text>
                                ))}
                            </View>

                            <View className="h-[1px] bg-gray-100 mb-3" />

                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <View className="items-center justify-center w-8 h-8 mr-2 bg-gray-100 rounded-full">
                                        <Text className="text-xs font-bold text-primary">
                                            {(order.user?.name || '?').charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text className="text-sm text-secondary">{order.user?.name || 'Unknown User'}</Text>
                                </View>
                                <Text className="text-lg font-bold text-primary">${order.totalAmount.toFixed(2)}</Text>
                            </View>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const StatCard = ({ label, value }: { label: string, value: string }) => (
    <View className="bg-white p-5 rounded-2xl border border-gray-100 w-[48%] mb-4 justify-center">
        <Text className="mb-1 text-xl font-bold text-primary">{value}</Text>
        <Text className="text-xs font-medium tracking-wide uppercase text-secondary">{label}</Text>
    </View>
);
