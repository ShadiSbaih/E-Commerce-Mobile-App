import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View, Switch, Image, ActivityIndicator, Platform, Modal, FlatList, TouchableWithoutFeedback } from "react-native";
import Toast from 'react-native-toast-message';
import { COLORS, CATEGORIES } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@clerk/expo";
import api from "@/constants/api";

export default function EditProduct() {
    const { getToken } = useAuth();
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [category, setCategory] = useState("");
    const [sizes, setSizes] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);

    // Image State
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<string[]>([]);

    const fetchProduct = useCallback(async () => {
            try {
                const { data } = await api.get(`/products/${id}`, {
                    headers: {
                        Authorization: `Bearer ${await getToken()}`,
                    },
                });
                if (data.success) {
                    const product = data.data;

                    setName(product.name);
                    setDescription(product.description || "");
                    setPrice(product.price.toString());
                    setStock(product.stock.toString());
                    setCategory(typeof product.category === 'object' ? product.category.name : product.category);
                    setIsFeatured(product.isFeatured);
                    if (product.sizes) setSizes(Array.isArray(product.sizes) ? product.sizes.join(", ") : product.sizes);

                    if (product.images && Array.isArray(product.images)) {
                        setExistingImages(product.images);
                    } else if (product.images) {
                        setExistingImages([product.images]);
                    }
                }

            } catch (error: any) {
                console.error("Failed to fetch product:", error);
                Toast.show({
                    type: 'error',
                    text1: 'Failed to Fetch Product',
                    text2: error.response?.data?.message || "Something went wrong"
                });
                router.back();
            } finally {
                setLoading(false);
            }
    }, [getToken, id, router]);

    useEffect(() => {
        if (id) fetchProduct();
    }, [fetchProduct, id]);

    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 5 - (existingImages.length + newImages.length),
            quality: 0.8,
        });

        if (!result.canceled) {
            const uris = result.assets.map((asset) => asset.uri);
            setNewImages([...newImages, ...uris]);
        }
    };

    const removeExistingImage = (index: number) => {
        const updated = [...existingImages];
        updated.splice(index, 1);
        setExistingImages(updated);
    };

    const removeNewImage = (index: number) => {
        const updated = [...newImages];
        updated.splice(index, 1);
        setNewImages(updated);
    };

    const handleSubmit = async () => {
        if (!name || !price || sizes.length < 1) {
            Toast.show({
                type: 'error',
                text1: 'Missing Fields',
                text2: 'Please fill in all required fields'
            });
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
             const token = await getToken();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("stock", stock);
            formData.append("category", category);
            formData.append("isFeatured", String(isFeatured));
            formData.append("sizes", sizes);

            // Append existing images
            existingImages.forEach((img) => {
                formData.append("existingImages", img);
            });

            // Append new images
            for (const [i, uri] of newImages.entries()) {
                const filename = `new-image-${i}.jpg`;
                if (Platform.OS === "web") {
                    const blob = await (await fetch(uri)).blob();
                    formData.append("images", new File([blob], filename, { type: "image/jpeg" }));
                } else {
                    formData.append("images", { uri, name: filename, type: "image/jpeg" } as any);
                }
            }

            const { data } = await api.put(`/products/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            if (data.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Product Updated',
                    text2: ' Product updated successfully'
                });
                router.replace("/admin/products");
            }
            
        } catch (error: any) {
            console.error("Failed to update product:", error);
            Toast.show({
                type: 'error',
                text1: 'Failed to Update Product',
                text2: error.response?.data?.message || "Something went wrong"
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View className="items-center justify-center flex-1 bg-surface">
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 p-4 bg-surface">
            <View className="p-4 mb-20 bg-white border border-border rounded-xl">
                <Text className="mb-1 text-xs font-bold uppercase text-secondary">Product Name *</Text>
                <TextInput
                    className="p-3 mb-4 rounded-lg bg-surface text-primary"
                    value={name}
                    onChangeText={setName}
                />

                <Text className="mb-1 text-xs font-bold uppercase text-secondary">Price ($) *</Text>
                <TextInput
                    className="p-3 mb-4 rounded-lg bg-surface text-primary"
                    keyboardType="decimal-pad"
                    value={price}
                    onChangeText={setPrice}
                />

                <Text className="mb-1 text-xs font-bold uppercase text-secondary">Stock Level</Text>
                <TextInput
                    className="p-3 mb-4 rounded-lg bg-surface text-primary"
                    keyboardType="number-pad"
                    value={stock}
                    onChangeText={setStock}
                />

                <Text className="mb-1 text-xs font-bold uppercase text-secondary">Sizes (comma separated)</Text>
                <TextInput
                    className="p-3 mb-4 rounded-lg bg-surface text-primary"
                    placeholder="e.g. S, M, L"
                    value={sizes}
                    onChangeText={setSizes}
                />

                <Text className="mb-1 text-xs font-bold uppercase text-secondary">
                    Category
                </Text>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="flex-row items-center justify-between p-3 mb-4 rounded-lg bg-surface"
                >
                    <Text className="text-primary">{category || "Select Category"}</Text>
                    <Ionicons name="chevron-down" size={20} color={COLORS.secondary} />
                </TouchableOpacity>

                <Modal visible={modalVisible} animationType="slide" transparent>
                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View className="justify-end flex-1 bg-black/50">
                            <View className="bg-white rounded-t-2xl p-4 max-h-[50%]">
                                <Text className="mb-4 text-lg font-bold text-center">Select Category</Text>
                                <FlatList
                                    data={CATEGORIES}
                                    keyExtractor={(item) => String(item.id)}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            className={`p-4 border-b ${category === item.name ? "bg-primary/5" : ""}`}
                                            onPress={() => {
                                                setCategory(item.name);
                                                setModalVisible(false);
                                            }}
                                        >
                                            <View className="flex-row justify-between">
                                                <Text className={`${category === item.name ? "font-bold text-primary" : ""}`}>{item.name}</Text>
                                                {category === item.name && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                <Text className="mb-1 text-xs font-bold uppercase text-secondary">Images</Text>
                <View className="mb-4">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {existingImages.map((uri, index) => (
                            <View key={`existing-${index}`} className="relative mr-2">
                                <Image source={{ uri }} className="w-24 h-24 rounded-lg" />
                                <TouchableOpacity
                                    onPress={() => removeExistingImage(index)}
                                    className="absolute p-1 rounded-full top-1 right-1 bg-black/50"
                                >
                                    <Ionicons name="close" size={12} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {newImages.map((uri, index) => (
                            <View key={`new-${index}`} className="relative mr-2">
                                <Image source={{ uri }} className="w-24 h-24 border-2 rounded-lg border-primary" />
                                <TouchableOpacity
                                    onPress={() => removeNewImage(index)}
                                    className="absolute p-1 rounded-full top-1 right-1 bg-primary"
                                >
                                    <Ionicons name="close" size={12} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {(existingImages.length + newImages.length) < 5 && (
                            <TouchableOpacity
                                onPress={pickImages}
                                className="items-center justify-center w-24 h-24 bg-surface-muted border border-border border-dashed rounded-lg"
                            >
                                <Ionicons name="add" size={24} color={COLORS.secondary} />
                                <Text className="mt-1 text-xs text-secondary">Add</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>

                <Text className="mb-1 text-xs font-bold uppercase text-secondary">Description</Text>
                <TextInput
                    className="h-24 p-3 mb-6 rounded-lg bg-surface text-primary"
                    multiline
                    textAlignVertical="top"
                    value={description}
                    onChangeText={setDescription}
                />

                <View className="flex-row items-center justify-between mb-6">
                    <Text className="font-bold text-primary">Featured Product</Text>
                    <Switch
                        value={isFeatured}
                        onValueChange={setIsFeatured}
                        trackColor={{ false: "#eee", true: COLORS.primary }}
                    />
                </View>

                <TouchableOpacity
                    className={`bg-primary p-4 rounded-xl items-center ${submitting ? 'opacity-70' : ''}`}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-lg font-medium text-white">Update Product</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
