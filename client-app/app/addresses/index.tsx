import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, Modal, TextInput, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { COLORS } from "@/constants";
import type { Address } from "@/constants/types";
import api from "@/constants/api";
import Toast from "react-native-toast-message";
import EmptyState from '@/components/EmptyState';
import axios from 'axios';

export default function Addresses() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form state
    const [type, setType] = useState("Home");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [country, setCountry] = useState("");
    const [isDefault, setIsDefault] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => { fetchAddresses(); }, []);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            // R9: interceptor attaches token automatically
            const { data } = await api.get("/addresses");
            setAddresses(data.data);
        } catch (err) {
            console.error("Error fetching addresses:", err);
            Toast.show({ type: "error", text1: "Error", text2: "Failed to fetch addresses" });
        } finally {
            setLoading(false);
        }
    };

    const handleEditAddress = (item: Address) => {
        setIsEditing(true);
        setEditingId(item._id);
        setType(item.type);
        setStreet(item.street);
        setCity(item.city);
        setState(item.state);
        setZipCode(item.zipCode);
        setCountry(item.country);
        setIsDefault(item.isDefault);
        setModalVisible(true);
    };

    const handleSaveAddress = async () => {
        if (!street || !city || !state || !zipCode || !country) {
            Toast.show({ type: "error", text1: "Validation Error", text2: "Please fill in all fields" });
            return;
        }
        setSubmitting(true);
        try {
            const body = { type, street, city, state, zipCode, country, isDefault };
            if (isEditing && editingId) {
                // R9: interceptor attaches token automatically
                await api.put(`/addresses/${editingId}`, body);
                Toast.show({ type: "success", text1: "Address Updated", text2: "Your address has been updated successfully" });
            } else {
                await api.post("/addresses", body);
                Toast.show({ type: "success", text1: "Address Added", text2: "Your new address has been added successfully" });
            }
            resetForm();
        } catch (error) {
            console.error("Error saving address:", error);
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : "Failed to save address";
            Toast.show({ type: "error", text1: "Could not save address", text2: message });
        } finally {
            setSubmitting(false);
            fetchAddresses();
            setModalVisible(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        Alert.alert("Delete Address", "Are you sure you want to delete this address?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        // R9: interceptor attaches token automatically
                        await api.delete(`/addresses/${id}`);
                        Toast.show({ type: "success", text1: "Address Deleted", text2: "The address has been deleted successfully" });
                        fetchAddresses();
                    } catch (error) {
                        console.error("Error deleting address:", error);
                        Toast.show({ type: "error", text1: "Error", text2: "Failed to delete address" });
                    }
                },
            },
        ]);
    };

    const resetForm = () => {
        setStreet(""); setCity(""); setState(""); setZipCode(""); setCountry("");
        setType("Home"); setIsDefault(false); setIsEditing(false); setEditingId(null);
    };

    const openAddModal = () => { resetForm(); setModalVisible(true); };

    return (
        <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
            <Header title="Shipping Addresses" showBack />

            {loading ? (
                <View className="items-center justify-center flex-1">
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <ScrollView className="flex-1 px-4 pt-4">
                    {addresses.length === 0 ? (
                        <EmptyState title="Add a shipping address" description="Save an address to make checkout faster." icon="location-outline" />
                    ) : (
                        addresses.map((item) => (
                            <View key={item._id} className="p-4 mb-4 bg-white rounded-xl">
                                <View className="flex-row items-center justify-between mb-2">
                                    <View className="flex-row items-center">
                                        <Ionicons
                                            name={item.type === "Home" ? "home-outline" : "briefcase-outline"}
                                            size={20} color={COLORS.primary}
                                        />
                                        <Text className="ml-2 text-base font-bold text-primary">{item.type}</Text>
                                        {item.isDefault && (
                                            <View className="px-2 py-1 ml-2 rounded bg-primary/10">
                                                <Text className="text-xs font-bold text-primary">Default</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View className="flex-row items-center gap-4">
                                        <TouchableOpacity onPress={() => handleEditAddress(item)}>
                                            <Ionicons name="pencil-outline" size={20} color={COLORS.secondary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteAddress(item._id)}>
                                            <Ionicons name="trash-outline" size={20} color={COLORS.error || '#ff4444'} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <Text className="leading-5 text-secondary ml-7">
                                    {item.street}, {item.city}, {item.state} {item.zipCode}, {item.country}
                                </Text>
                            </View>
                        ))
                    )}

                    <TouchableOpacity className="flex-row items-center justify-center p-4 mt-2 mb-8 border border-border border-dashed rounded-xl" onPress={openAddModal}>
                        <Ionicons name="add" size={24} color={COLORS.secondary} />
                        <Text className="ml-2 font-medium text-secondary">Add New Address</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {/* Add/Edit Address Modal */}
            <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View className="justify-end flex-1 bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 h-[85%]">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl font-bold text-primary">{isEditing ? "Edit Address" : "Add New Address"}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text className="mb-2 font-medium text-primary">Label</Text>
                            <View className="flex-row gap-3 mb-4">
                                {["Home", "Work", "Other"].map((t) => (
                                    <TouchableOpacity key={t} onPress={() => setType(t)} className={`px-4 py-2 rounded-full border ${type === t ? 'bg-primary border-primary' : 'bg-white border-border'}`}>
                                        <Text className={type === t ? 'text-white' : 'text-primary'}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text className="mb-2 font-medium text-primary">Street Address</Text>
                            <TextInput className="p-4 mb-4 bg-surface rounded-xl text-primary" placeholder="123 Main St" value={street} onChangeText={setStreet} />

                            <View className="flex-row gap-4 mb-4">
                                <View className="flex-1">
                                    <Text className="mb-2 font-medium text-primary">City</Text>
                                    <TextInput className="p-4 bg-surface rounded-xl text-primary" placeholder="New York" value={city} onChangeText={setCity} />
                                </View>
                                <View className="flex-1">
                                    <Text className="mb-2 font-medium text-primary">State</Text>
                                    <TextInput className="p-4 bg-surface rounded-xl text-primary" placeholder="NY" value={state} onChangeText={setState} />
                                </View>
                            </View>

                            <View className="flex-row gap-4 mb-4">
                                <View className="flex-1">
                                    <Text className="mb-2 font-medium text-primary">Zip Code</Text>
                                    <TextInput className="p-4 bg-surface rounded-xl text-primary" placeholder="10001" value={zipCode} onChangeText={setZipCode} keyboardType="numeric" />
                                </View>
                                <View className="flex-1">
                                    <Text className="mb-2 font-medium text-primary">Country</Text>
                                    <TextInput className="p-4 bg-surface rounded-xl text-primary" placeholder="USA" value={country} onChangeText={setCountry} />
                                </View>
                            </View>

                            <TouchableOpacity className="flex-row items-center mb-8" onPress={() => setIsDefault(!isDefault)}>
                                <View className={`w-5 h-5 border rounded mr-2 items-center justify-center ${isDefault ? 'bg-primary border-primary' : 'border-border'}`}>
                                    {isDefault && <Ionicons name="checkmark" size={14} color="white" />}
                                </View>
                                <Text className="text-primary">Set as default address</Text>
                            </TouchableOpacity>

                            <TouchableOpacity className="items-center w-full py-4 mb-10 rounded-xl bg-primary" onPress={handleSaveAddress} disabled={submitting}>
                                {submitting ? <ActivityIndicator color="white" /> : <Text className="text-lg font-bold text-white">Save Address</Text>}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
