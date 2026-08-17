import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl, Modal, TouchableWithoutFeedback, FlatList } from "react-native";
import { COLORS, getStatusColor } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import type { Order } from "@/constants/types";
import api from "@/constants/api";
import Toast from "react-native-toast-message";

const STATUSES = ["placed", "processing", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = typeof STATUSES[number];

export default function AdminOrders() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);

    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [updating, setUpdating] = useState(false);

    const fetchOrders = async () => {
        try {
            // R9: interceptor attaches token automatically
            const { data } = await api.get("/orders/admin/all");
            if (data.success) setOrders(data.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
            Toast.show({ type: "error", text1: "Error", text2: "Failed to fetch orders" });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);
    const onRefresh = () => { setRefreshing(true); fetchOrders(); };

    const openStatusModal = (order: Order) => {
        setSelectedOrder(order);
        setStatusModalVisible(true);
    };

    const updateStatus = async (newStatus: OrderStatus) => {
        if (!selectedOrder) return;
        setUpdating(true);
        try {
            // R9: interceptor attaches token automatically
            const { data } = await api.put(`/orders/${selectedOrder._id}/status`, { orderStatus: newStatus });
            if (data.success) {
                Toast.show({ type: "success", text1: "Updated", text2: "Order status updated successfully" });
                setStatusModalVisible(false);
                fetchOrders();
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            Toast.show({ type: "error", text1: "Error", text2: "Failed to update order status" });
        } finally {
            setUpdating(false);
        }
    };

    if (loading && !refreshing) {
        return (
            <View className="items-center justify-center flex-1 bg-surface">
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-surface">
            <ScrollView
                className="flex-1 p-4"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {orders.length === 0 ? (
                    <View className="items-center justify-center flex-1 mt-20">
                        <Text className="text-secondary">No orders found</Text>
                    </View>
                ) : (
                    orders.map((order: Order) => (
                        <View key={order._id} className="p-4 mb-4 bg-white border border-border rounded-xl">
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-sm font-medium text-disabled">Order #{order.orderNumber}</Text>
                                <Text className="text-xs text-secondary">{new Date(order.createdAt).toLocaleDateString()}</Text>
                            </View>

                            <View className="p-3 mb-3 rounded-lg bg-surface">
                                <Text className="mb-1 text-xs font-bold text-secondary">CUSTOMER</Text>
                                <Text className="font-medium text-primary">{(order as any).user?.name || 'Unknown User'}</Text>
                                <Text className="text-xs text-secondary">{(order as any).user?.email || 'No email'}</Text>
                            </View>

                            <View className="p-3 mb-3 rounded-lg bg-surface">
                                <Text className="mb-1 text-xs font-bold text-secondary">SHIPPING ADDRESS</Text>
                                <Text className="text-xs text-primary">{order.shippingAddress?.street}, {order.shippingAddress?.city}</Text>
                                <Text className="text-xs text-primary">{order.shippingAddress?.state}, {order.shippingAddress?.zipCode}, {order.shippingAddress?.country}</Text>
                            </View>

                            <View className="mb-3">
                                <Text className="mb-2 text-xs font-bold text-secondary">ITEMS</Text>
                                {order.items.map((item: any) => (
                                    <View key={item._id} className="flex-row justify-between mb-1">
                                        <Text className="flex-1 text-xs text-secondary">
                                            {item.quantity}x {item.product?.name || item.name}
                                            {item.size && <Text className="text-disabled"> ({item.size})</Text>}
                                        </Text>
                                        <Text className="text-xs font-bold text-secondary">${item.price.toFixed(2)}</Text>
                                    </View>
                                ))}
                            </View>

                            <View className="flex-row items-center justify-between pt-3 mt-2 border-t border-border">
                                <Text className="text-lg font-bold text-primary">${order.totalAmount.toFixed(2)}</Text>
                                <TouchableOpacity
                                    onPress={() => openStatusModal(order)}
                                    className={`flex-row items-center px-4 py-2 rounded-full ${getStatusColor(order.orderStatus)}`}
                                >
                                    <Text className="mr-2 text-xs font-bold tracking-wide uppercase">{order.orderStatus}</Text>
                                    <Ionicons name="pencil" size={12} color="black" style={{ opacity: 0.5 }} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* STATUS MODAL */}
            <Modal visible={statusModalVisible} animationType="fade" transparent>
                <TouchableWithoutFeedback onPress={() => setStatusModalVisible(false)}>
                    <View className="justify-end flex-1 bg-black/50">
                        <View className="bg-white rounded-t-2xl p-4 max-h-[60%]">
                            <View className="flex-row items-center justify-between pb-4 mb-4 border-b border-border">
                                <Text className="text-lg font-bold text-primary">Update Order Status</Text>
                                <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                                    <Ionicons name="close" size={24} color={COLORS.secondary} />
                                </TouchableOpacity>
                            </View>

                            {updating ? (
                                <View className="py-8">
                                    <ActivityIndicator size="large" color={COLORS.primary} />
                                    <Text className="mt-2 text-center text-secondary">Updating status...</Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={STATUSES}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            className={`p-4 rounded-xl mb-2 flex-row justify-between items-center ${selectedOrder?.orderStatus === item ? "bg-primary/10" : "bg-surface"}`}
                                            onPress={() => updateStatus(item)}
                                        >
                                            <Text className={`font-medium capitalize ${selectedOrder?.orderStatus === item ? "text-primary font-bold" : "text-secondary"}`}>
                                                {item}
                                            </Text>
                                            {selectedOrder?.orderStatus === item && (
                                                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                                            )}
                                        </TouchableOpacity>
                                    )}
                                />
                            )}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}
