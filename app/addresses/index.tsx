import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, Modal, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { COLORS } from "@/constants";
import type { Address } from "@/constants/types";
import { dummyAddress } from "@/assets/assets";

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

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        setAddresses(dummyAddress as any);
        setLoading(false);
    };

    const handleEditSearch = (item: Address) => {
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
        setModalVisible(false);
        resetForm();
        fetchAddresses();
    };

    const handleDeleteAddress = async (id: string) => {

    };

    const resetForm = () => {
        setStreet("");
        setCity("");
        setState("");
        setZipCode("");
        setCountry("");
        setType("Home");
        setIsDefault(false);
        setIsEditing(false);
        setEditingId(null);
    };

    const openAddModal = () => {
        resetForm();
        setModalVisible(true);
    };

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
                        <Text className="mt-10 text-center text-secondary">No addresses found</Text>
                    ) : (
                        addresses.map((item) => (
                            <View key={item._id} className="p-4 mb-4 bg-white shadow-sm rounded-xl">
                                <View className="flex-row items-center justify-between mb-2">
                                    <View className="flex-row items-center">
                                        <Ionicons
                                            name={item.type === "Home" ? "home-outline" : "briefcase-outline"}
                                            size={20}
                                            color={COLORS.primary}
                                        />
                                        <Text className="ml-2 text-base font-bold text-primary">{item.type}</Text>
                                        {item.isDefault && (
                                            <View className="px-2 py-1 ml-2 rounded bg-primary/10">
                                                <Text className="text-xs font-bold text-primary">Default</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View className="flex-row items-center gap-4">
                                        <TouchableOpacity onPress={() => handleEditSearch(item)}>
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

                    <TouchableOpacity className="flex-row items-center justify-center p-4 mt-2 mb-8 border border-gray-300 border-dashed rounded-xl" onPress={openAddModal}>
                        <Ionicons name="add" size={24} color={COLORS.secondary} />
                        <Text className="ml-2 font-medium text-secondary">Add New Address</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {/* Add Address Modal */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
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
                                    <TouchableOpacity key={t} onPress={() => setType(t)} className={`px-4 py-2 rounded-full border ${type === t ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}>
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
                                <View className={`w-5 h-5 border rounded mr-2 items-center justify-center ${isDefault ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                                    {isDefault && <Ionicons name="checkmark" size={14} color="white" />}
                                </View>
                                <Text className="text-primary">Set as default address</Text>
                            </TouchableOpacity>

                            <TouchableOpacity className="items-center w-full py-4 mb-10 rounded-full bg-primary" onPress={handleSaveAddress} disabled={submitting} >
                                {submitting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-lg font-bold text-white">Save Address</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
