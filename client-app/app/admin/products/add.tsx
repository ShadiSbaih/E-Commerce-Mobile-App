import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View, Switch, Image, ActivityIndicator, Modal, FlatList, TouchableWithoutFeedback, Platform, } from "react-native";
import Toast from 'react-native-toast-message';
import { COLORS } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { CATEGORIES } from "@/constants";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/expo";
import api from "@/constants/api";

export default function AddProduct() {

    const router = useRouter();
    const { getToken } = useAuth();

    const [submitting, setSubmitting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [category, setCategory] = useState("Men");
    const [sizes, setSizes] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [isFeatured, setIsFeatured] = useState(false);

    // PICK MULTIPLE IMAGES (MAX 5)
    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 5,
            quality: 0.8,
        });

        if (!result.canceled) {
            const uris = result.assets.map((asset) => asset.uri);
            setImages(uris.slice(0, 5));
        }
    };

    // Add Product
    const handleSubmit = async () => {
        if (!name || !price || !category || sizes.length < 1) {
            Toast.show({
                type: 'error',
                text1: 'Missing Fields',
                text2: 'Please fill in all required fields'
            });
            return;
        }
        try {
            setSubmitting(true);
            const token = await getToken();
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("stock", stock || "0");
            formData.append("category", category);
            formData.append("sizes", sizes);
            formData.append("isFeatured", String(isFeatured));
            //images
            for (let i = 0; i < images.length; i++) {
                const uri = images[i];
                const filename = uri.split("/").pop() || `image${i}.jpg`;
                const type = `image/${filename.split(".").pop()}`;
                formData.append("images", {
                    uri,
                    name: filename,
                    type
                } as any);

                const { data } = await api.post("/products", formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!data.success) {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: data.message || 'Failed to add product'
                    });
                    return;
                }
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Product added successfully'
                });

                router.push("/admin/products");

            }
        } catch (error) {
            console.error("Error adding product:", error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to add product'
            });
        }
        finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView className="flex-1 p-4 bg-surface">
            <View className="p-4 mb-20 bg-white shadow-sm rounded-xl">
                {/* NAME */}
                <Text className="mb-1 text-xs font-bold uppercase text-secondary">
                    Product Name *
                </Text>
                <TextInput
                    className="p-3 mb-4 rounded-lg bg-surface text-primary"
                    placeholder="e.g. Wireless Headphones"
                    value={name}
                    onChangeText={setName}
                />

                {/* PRICE */}
                <Text className="mb-1 text-xs font-bold uppercase text-secondary">
                    Price ($) *
                </Text>
                <TextInput
                    className="p-3 mb-4 rounded-lg bg-surface text-primary"
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={price}
                    onChangeText={setPrice}
                />

                {/* CATEGORY */}
                <Text className="mb-1 text-xs font-bold uppercase text-secondary">
                    Category
                </Text>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="flex-row items-center justify-between p-3 mb-4 rounded-lg bg-surface"
                >
                    <Text className="text-primary">{category}</Text>
                    <Ionicons name="chevron-down" size={20} color={COLORS.secondary} />
                </TouchableOpacity>

                {/* CATEGORY MODAL */}
                <Modal visible={modalVisible} animationType="slide" transparent>
                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View className="justify-end flex-1 bg-black/50">
                            <View className="bg-white rounded-t-2xl p-4 max-h-[50%]">
                                <Text className="mb-4 text-lg font-bold text-center">
                                    Select Category
                                </Text>

                                <FlatList
                                    data={CATEGORIES}
                                    keyExtractor={(item) => String(item.id)}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            className={`p-4 border-b ${category === item.name ? "bg-primary/5" : ""
                                                }`}
                                            onPress={() => {
                                                setCategory(item.name);
                                                setModalVisible(false);
                                            }}
                                        >
                                            <View className="flex-row justify-between">
                                                <Text
                                                    className={`${category === item.name ? "font-bold text-primary" : ""
                                                        }`}
                                                >
                                                    {item.name}
                                                </Text>
                                                {category === item.name && (
                                                    <Ionicons
                                                        name="checkmark"
                                                        size={20}
                                                        color={COLORS.primary}
                                                    />
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                {/* STOCK */}
                <Text className="mb-1 text-xs font-bold uppercase text-secondary">
                    Stock Level
                </Text>
                <TextInput
                    className="p-3 mb-4 rounded-lg bg-surface text-primary"
                    placeholder="0"
                    keyboardType="number-pad"
                    value={stock}
                    onChangeText={setStock}
                />

                {/* SIZES */}
                <Text className="mb-1 text-xs font-bold uppercase text-secondary">
                    Sizes (comma separated)
                </Text>
                <TextInput
                    className="p-3 mb-4 rounded-lg bg-surface text-primary"
                    placeholder="e.g. S, M, L, XL"
                    value={sizes}
                    onChangeText={setSizes}
                />

                {/* IMAGE PICKER */}
                <Text className="mb-1 text-xs font-bold uppercase text-secondary">
                    Product Images (max 5)
                </Text>

                <TouchableOpacity onPress={pickImages} className="mb-4">
                    {images.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {images.map((uri, i) => (
                                <Image
                                    key={i}
                                    source={{ uri }}
                                    className="w-32 h-32 mr-2 rounded-lg"
                                />
                            ))}
                        </ScrollView>
                    ) : (
                        <View className="items-center justify-center w-full h-32 bg-gray-100 border border-gray-300 border-dashed rounded-lg">
                            <Ionicons
                                name="cloud-upload-outline"
                                size={32}
                                color={COLORS.secondary}
                            />
                            <Text className="mt-2 text-xs text-secondary">
                                Tap to upload images
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* DESCRIPTION */}
                <Text className="mb-1 text-xs font-bold uppercase text-secondary">
                    Description
                </Text>
                <TextInput
                    className="h-24 p-3 mb-6 rounded-lg bg-surface text-primary"
                    multiline
                    value={description}
                    onChangeText={setDescription}
                />

                {/* FEATURED */}
                <View className="flex-row items-center justify-between mb-6">
                    <Text className="font-bold text-primary">Featured Product</Text>
                    <Switch
                        value={isFeatured}
                        onValueChange={setIsFeatured}
                        trackColor={{ false: "#eee", true: COLORS.primary }}
                    />
                </View>

                {/* SUBMIT */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={submitting}
                    className={`bg-primary p-4 rounded-xl items-center ${submitting ? "opacity-70" : ""
                        }`}
                >
                    {submitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-lg font-bold text-white">
                            Create Product
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
