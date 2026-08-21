import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl, Image, Alert, Modal, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";
// import { dummyProducts } from "@/assets/assets";
import { useAuth } from "@clerk/expo";
import api from "@/constants/api";
import Toast from "react-native-toast-message";

export default function AdminProducts() {
    const { getToken } = useAuth();
    const getTokenRef = useRef(getToken);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [products, setProducts] = useState([]);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    useEffect(() => {
        getTokenRef.current = getToken;
    }, [getToken]);

    const fetchProducts = useCallback(async () => {
        try {
            const token = await getTokenRef.current();
            const { data } = await api.get("/products",
                {
                    params: { limit: 100 },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to fetch products"
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProducts();
    };

    const performDelete = async (id: string) => {
        try {
            const token = await getToken();
            const { data } = await api.delete(`/products/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (data.success) {
                Toast.show({
                    type: "success",
                    text1: "Deleted",
                    text2: "Product deleted successfully"
                });
                fetchProducts();
            }
        } catch {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to delete product"
            });
        }
    };

    const deleteProduct = (id: string) => {
        if (Platform.OS === "web") {
            setDeleteTarget(id);
            return;
        }

        Alert.alert(
            "Delete Product",
            "Are you sure you want to delete this product?",
            [
                { text: "Cancel", style: "cancel" as const },
                {
                    text: "Delete",
                    style: "destructive" as const,
                    onPress: () => performDelete(id)
                }
            ]
        );
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
            <View className="flex-row items-center justify-between p-4 bg-white border border-border">
                <Text className="text-lg font-semibold text-primary">Total Products ({products.length})</Text>
                <TouchableOpacity
                    onPress={() => router.push("/admin/products/add")}
                    className="flex-row items-center px-4 py-2 bg-primary rounded-full"
                >
                    <Ionicons name="add" size={20} color="white" />
                    <Text className="ml-1 font-medium text-white">Add Product</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 p-2"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {products.length === 0 ? (
                    <View className="items-center justify-center flex-1 mt-20">
                        <Text className="text-secondary">No products found</Text>
                    </View>
                ) : (
                    products.map((product: any) => (
                        <View key={product._id} className="flex-row items-center p-3 mb-3 bg-white border border-border rounded-lg">
                            <Image
                                source={{ uri: product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/150' }}
                                className="w-16 h-16 mr-3 bg-surface-muted rounded-lg"
                                resizeMode="cover"
                            />

                            <View className="flex-1">
                                <Text className="text-base font-bold text-primary" numberOfLines={1}>{product.name}</Text>
                                <Text className="mb-1 text-xs text-secondary" numberOfLines={1}>Category : {product.category || 'Others'}</Text>
                                <Text className="mb-1 text-xs text-secondary" numberOfLines={1}>Stock : {product.stock}</Text>
                                <Text className="mb-1 text-xs text-secondary" numberOfLines={1}>Sizes : {product.sizes.join(", ")}</Text>
                                <Text className="font-bold text-primary">${product.price.toFixed(2)}</Text>
                            </View>

                            <View className="flex-row items-center">
                                <TouchableOpacity
                                    onPress={() => router.push(`/admin/products/edit/${product._id}`)}
                                    className="p-2 mr-2 rounded-full bg-slate-50"
                                >
                                    <Ionicons name="create-outline" size={18} color="#333333" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => deleteProduct(product._id)}
                                    className="p-2 rounded-full bg-surface"
                                >
                                    <Ionicons name="trash-outline" size={18} color="#333333" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            <Modal
                visible={deleteTarget !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setDeleteTarget(null)}
            >
                <View className="items-center justify-center flex-1 px-6 bg-black/50">
                    <View className="w-full max-w-md p-6 bg-white rounded-2xl">
                        <Text className="mb-2 text-lg font-bold text-primary">
                            Delete Product?
                        </Text>
                        <Text className="mb-6 text-secondary">
                            This action cannot be undone.
                        </Text>
                        <View className="flex-row justify-end gap-3">
                            <Pressable
                                onPress={() => setDeleteTarget(null)}
                                className="px-4 py-3 rounded-lg bg-surface"
                            >
                                <Text className="font-semibold text-primary">Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={async () => {
                                    if (!deleteTarget) return;
                                    const id = deleteTarget;
                                    setDeleteTarget(null);
                                    await performDelete(id);
                                }}
                                className="px-4 py-3 bg-red-500 rounded-lg"
                            >
                                <Text className="font-semibold text-white">Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
