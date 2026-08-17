import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Image, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { COLORS } from "@/constants";
import type { Order, Product } from "@/constants/types";
import api from "@/constants/api";
import Toast from "react-native-toast-message";

export default function OrderDetails() {
    const { id } = useLocalSearchParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrderDetails = useCallback(async () => {
        try {
            // R9: interceptor attaches token automatically
            const { data } = await api.get(`/orders/${id}`);
            if (data.success) setOrder(data.data);
        } catch (error) {
            console.error("Error fetching order details:", error);
            Toast.show({
                type: "error",
                text1: "Failed to load order details",
                text2: "Please try again later.",
            });
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    if (loading) {
        return (
            <SafeAreaView className="items-center justify-center flex-1 bg-surface">
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView className="items-center justify-center flex-1 bg-surface">
                <Text>Order not found</Text>
            </SafeAreaView>
        );
    }

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const ORDER_STEPS = [
        { title: "Order Placed", date: formatDate(order.createdAt), completed: true },
        { title: "Processing", date: "", completed: ['processing', 'shipped', 'delivered'].includes(order.orderStatus) },
        { title: "Shipped", date: "", completed: ['shipped', 'delivered'].includes(order.orderStatus) },
        { title: "Delivered", date: "", completed: order.orderStatus === 'delivered' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
            <Header title={`Order #${order.orderNumber}`} showBack />

            <ScrollView className="flex-1 px-4 pt-4">
                {/* Order Status */}
                <View className="p-4 mb-4 bg-white border border-border rounded-xl">
                    <Text className="mb-4 text-lg font-bold text-primary">Order Status</Text>

                    {ORDER_STEPS.map((step, index) => (
                        <View key={index} className="flex-row mb-4 last:mb-0">
                            <View className="items-center mr-4">
                                <View className={`w-3 h-3 rounded-full ${step.completed ? 'bg-primary' : 'bg-gray-300'}`} />
                                {index !== ORDER_STEPS.length - 1 && (
                                    <View className={`w-0.5 h-full ${step.completed ? 'bg-primary' : 'bg-gray-300'} absolute top-3`} />
                                )}
                            </View>
                            <View className="pb-4">
                                <Text className={`font-bold ${step.completed ? 'text-primary' : 'text-disabled'}`}>{step.title}</Text>
                                {step.date ? <Text className="text-xs text-secondary">{step.date}</Text> : null}
                            </View>
                        </View>
                    ))}
                </View>

                {/* Items */}
                <View className="p-4 mb-4 bg-white border border-border rounded-xl">
                    <Text className="mb-4 text-lg font-bold text-primary">Products</Text>
                    {order.items.map((item: any, index: number) => {

                        const productData = item.product as Product;
                        const image = productData?.images?.[0];

                        return (
                            <View key={index} className={`flex-row ${index !== order.items.length - 1 && 'border-b border-border pb-4 mb-4'}`}>
                                {image && <Image source={{ uri: image }} className="w-16 h-16 bg-surface-muted rounded-lg" resizeMode="contain" />}
                                <View className="justify-center flex-1 ml-3">
                                    <Text className="font-medium text-primary" numberOfLines={1}>{item.name}</Text>
                                    <Text className="text-xs text-secondary">Size: {item.size}</Text>
                                    <View className="flex-row items-center justify-between mt-2">
                                        <Text className="font-bold text-primary">${item.price}</Text>
                                        <Text className="text-xs text-secondary">Qty: {item.quantity}</Text>
                                    </View>
                                </View>
                            </View>
                        )
                    })}
                </View>

                {/* Shipping Details */}
                <View className="p-4 mb-4 bg-white border border-border rounded-xl">
                    <Text className="mb-2 text-lg font-bold text-primary">Shipping Details</Text>
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="location-outline" size={20} color={COLORS.secondary} />
                        <Text className="flex-1 ml-2 text-secondary">
                            {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.zipCode}, {order.shippingAddress?.country}
                        </Text>
                    </View>
                </View>

                {/* Payment Summary */}
                <View className="p-4 mb-8 bg-white border border-border rounded-xl">
                    <Text className="mb-4 text-lg font-bold text-primary">Payment Summary</Text>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-secondary">Payment Method</Text>
                        <Text className="font-medium capitalize text-primary">{order.paymentMethod}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-secondary">Payment Status</Text>
                        <Text className={`font-medium capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' : order.paymentStatus === 'failed' ? 'text-red-600' : 'text-orange-500'}`}>
                            {order.paymentStatus}
                        </Text>
                    </View>
                    <View className="h-px my-2 bg-surface-muted" />
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-secondary">Subtotal</Text>
                        <Text className="font-medium text-primary">${order.subtotal.toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-secondary">Shipping</Text>
                        <Text className="font-medium text-primary">${order.shippingCost.toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-secondary">Tax</Text>
                        <Text className="font-medium text-primary">${order.tax.toFixed(2)}</Text>
                    </View>
                    <View className="h-px my-2 bg-surface-muted" />
                    <View className="flex-row justify-between">
                        <Text className="text-lg font-bold text-primary">Total</Text>
                        <Text className="text-lg font-bold text-primary">${order.totalAmount.toFixed(2)}</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
