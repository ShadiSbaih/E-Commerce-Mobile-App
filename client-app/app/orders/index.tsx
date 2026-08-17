import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    ScrollView,
    Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { COLORS, getStatusColor } from "@/constants";
import type { Order } from "@/constants/types";
import { formatDate } from "@/assets/assets";
import api from "@/constants/api";
import Toast from "react-native-toast-message";

export default function Orders() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // R17: Fetch one page of orders at a time (20 per page)
    const fetchOrders = async (pageNumber = 1) => {
        if (pageNumber === 1) setLoading(true);
        else setLoadingMore(true);
        try {
            const { data } = await api.get("/orders", {
                params: { page: pageNumber, limit: 20 },
            });
            if (data.success) {
                if (pageNumber === 1) setOrders(data.data);
                else setOrders(prev => [...prev, ...data.data]);
                setHasMore(
                    data.pagination
                        ? data.pagination.page < data.pagination.pages
                        : false,
                );
                setPage(pageNumber);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            Toast.show({
                type: "error",
                text1: "Failed to load orders",
                text2: "Please try again later.",
            });
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    return (
        <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
            <Header title="My Orders" showBack />

            {loading ? (
                <View className="items-center justify-center flex-1">
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : orders.length === 0 ? (
                <View className="items-center justify-center flex-1">
                    <Text className="text-lg text-secondary">No orders found</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ padding: 16 }}
                    onEndReached={() => {
                        if (!loadingMore && !loading && hasMore) fetchOrders(page + 1);
                    }}
                    onEndReachedThreshold={0.4}
                    ListFooterComponent={loadingMore ? (
                        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 12 }} />
                    ) : null}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            className="p-4 mb-4 bg-white border border-gray-100 shadow-sm rounded-xl"
                            onPress={() => router.push(`/orders/${item._id}`)}
                        >
                            <View className="flex-row justify-between mb-2">
                                <Text className="font-bold text-primary">
                                    Order #{item.orderNumber}
                                </Text>
                                <Text className="text-sm text-secondary">
                                    {formatDate(item.createdAt)}
                                </Text>
                            </View>

                            {/* Status Badges */}
                            <View className="flex-row gap-2 mb-3">
                                <View
                                    className={`px-2 py-1 rounded-full ${getStatusColor(item.orderStatus)}`}
                                >
                                    <Text className={`text-xs font-bold capitalize`}>
                                        {item.orderStatus}
                                    </Text>
                                </View>

                                <View
                                    className={`px-2 py-1 rounded-full ${item.paymentStatus === "paid"
                                        ? "bg-green-100"
                                        : "bg-gray-100"
                                        }`}
                                >
                                    <Text
                                        className={`text-xs font-bold capitalize ${item.paymentStatus === "paid"
                                            ? "text-green-700"
                                            : "text-gray-700"
                                            }`}
                                    >
                                        {item.paymentStatus}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-xs text-secondary">
                                    Payment Method:{" "}
                                    <Text className="font-medium capitalize text-primary">
                                        {item.paymentMethod}
                                    </Text>
                                </Text>
                            </View>

                            {/* Product Images */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                className="mb-3"
                            >
                                {item.items.map((prod: any, idx) => {
                                    const image = prod.product?.images?.[0];
                                    return (
                                        <View
                                            key={idx}
                                            className="p-1 mr-3 border border-gray-100 rounded-md bg-gray-50"
                                        >
                                            {image ? (
                                                <Image
                                                    source={{ uri: image }}
                                                    className="w-12 h-12 rounded-md"
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View className="items-center justify-center w-12 h-12 bg-gray-200 rounded-md">
                                                    <Ionicons
                                                        name="image-outline"
                                                        size={20}
                                                        color={COLORS.secondary}
                                                    />
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </ScrollView>

                            <View className="flex-row items-center justify-between pt-3 mt-2 border-t border-gray-100">
                                <Text className="text-secondary">
                                    Items: {item.items.length}
                                </Text>
                                <Text className="text-lg font-bold text-primary">
                                    ${item.totalAmount.toFixed(2)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
    );
}
