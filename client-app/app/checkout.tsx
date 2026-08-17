import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '@/Context/CartContext';
import { useRouter } from 'expo-router';
import { Address } from '@/constants/types';
import Toast from 'react-native-toast-message';
import { COLORS } from '@/constants';
import Header from '@/components/Header';
import { Ionicons } from '@expo/vector-icons';
import api from '@/constants/api';

export default function Checkout() {
  const { clearCart } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // R8: Real breakdown fetched from /orders/preview
  const [breakdown, setBreakdown] = useState({
    subtotal: 0,
    shippingCost: 5,
    tax: 0,
    totalAmount: 0,
  });

  // Fixed typo: selecetedAddress → selectedAddress
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  // R13: Default to 'cash' — Stripe is not yet implemented
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('cash');

  const fetchAddresses = async () => {
    try {
      // R9: No manual Authorization header — handled by Axios interceptor
      const { data } = await api.get('/addresses');
      const addressList: Address[] = data.data;
      if (addressList.length > 0) {
        const def = addressList.find((a: Address) => a.isDefault) || addressList[0];
        setSelectedAddress(def ?? null);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
      Toast.show({
        type: 'error',
        text1: 'Failed to load addresses',
        text2: 'Please try again later.',
      });
    } finally {
      setPageLoading(false);
    }
  };

  // R8: Fetch the real tax/shipping breakdown from the server
  const fetchPreview = async () => {
    try {
      const { data } = await api.get('/orders/preview');
      if (data.success) setBreakdown(data.data);
    } catch {
      // Non-fatal — summary will stay at 0 until cart is non-empty
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Toast.show({
        type: 'info',
        text1: 'No address selected',
        text2: 'Please select a shipping address before placing your order.',
      });
      return;
    }

    if (paymentMethod === 'stripe') {
      Toast.show({
        type: 'info',
        text1: 'Coming soon',
        text2: 'Card payment is not yet available. Please use Cash on Delivery.',
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        shippingAddress: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          country: selectedAddress.country,
        },
        notes: 'Placed via App',
        paymentMethod: 'cash',
      };
      // R9: No manual Authorization header
      const { data } = await api.post('/orders', payload);
      if (data.success) {
        await clearCart();
        Toast.show({
          type: 'success',
          text1: 'Order placed',
          text2: 'Your order has been placed successfully.',
        });
        router.replace('/orders');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to place order',
        text2: 'Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    fetchPreview();
  }, []);

  if (pageLoading) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-surface">
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-surface"
      edges={['top']}
    >
      <Header title="Checkout" showBack />

      <View className="flex-1">
        <ScrollView
          className="flex-1 px-4 mt-4"
          contentContainerStyle={{
            paddingBottom: 220,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Shipping Address */}
          <Text className="mb-4 text-lg font-bold text-primary">
            Shipping Address
          </Text>

          {selectedAddress ? (
            <View className="p-4 mb-6 bg-white rounded-xl">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base font-bold">
                  {selectedAddress.type}
                </Text>

                <TouchableOpacity onPress={() => router.push('/addresses')}>
                  <Text className="text-sm text-accent">Change</Text>
                </TouchableOpacity>
              </View>

              <Text className="leading-5 text-secondary">
                {selectedAddress.street}{'\n'}
                {selectedAddress.city}{'\n'}
                {selectedAddress.state} - {selectedAddress.zipCode}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/addresses')}
              className="items-center justify-center p-6 mb-6 bg-white border-2 border-border border-dashed rounded-xl"
            >
              <Text className="font-bold text-primary">
                Add Shipping Address
              </Text>
            </TouchableOpacity>
          )}

          {/* Payment Section */}
          <Text className="mb-4 text-lg font-bold text-primary">
            Payment Method
          </Text>

          {/* Cash on Delivery */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('cash')}
            className={`flex-row items-center bg-white justify-between p-4 mb-4 rounded-xl border ${paymentMethod === 'cash'
              ? 'border-primary bg-nimbus-blue'
              : 'border-border'
              }`}
          >
            <View className="flex-row items-center flex-1">
              <View className="items-center justify-center w-10 h-10 mr-3 rounded-lg bg-surface-muted">
                <Ionicons
                  name="cash-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>

              <View>
                <Text className="text-base font-bold text-primary">
                  Cash on Delivery
                </Text>

                <Text className="mt-1 text-xs text-secondary">
                  Pay when you receive the order
                </Text>
              </View>
            </View>

            <View
              className={`w-6 h-6 rounded-full items-center justify-center ${paymentMethod === 'cash'
                ? 'bg-primary'
                : 'border border-border'
                }`}
            >
              {paymentMethod === 'cash' && (
                <Ionicons
                  name="checkmark"
                  size={14}
                  color="white"
                />
              )}
            </View>
          </TouchableOpacity>

          {/* Card Payment */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('stripe')}
            className={`flex-row items-center justify-between p-4 mb-6 rounded-xl border bg-white ${paymentMethod === 'stripe'
              ? 'border-primary bg-nimbus-blue'
              : 'border-border'
              }`}
          >
            <View className="flex-row items-center flex-1">
              <View className="items-center justify-center w-10 h-10 mr-3 rounded-lg bg-surface-muted">
                <Ionicons
                  name="card-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>

              <View>
                <Text className="text-base font-bold text-primary">
                  Pay with Card
                </Text>

                <Text className="mt-1 text-xs text-secondary">
                  Credit or Debit Card
                </Text>
              </View>
            </View>

            <View
              className={`w-6 h-6 rounded-full items-center justify-center ${paymentMethod === 'stripe'
                ? 'bg-primary'
                : 'border border-border'
                }`}
            >
              {paymentMethod === 'stripe' && (
                <Ionicons
                  name="checkmark"
                  size={14}
                  color="white"
                />
              )}
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Fixed Bottom Summary */}
        <View className="px-4 pt-4 pb-6 bg-white border-t border-border">
          <View className="p-4 bg-white rounded-xl">
            <Text className="mb-4 text-lg font-bold text-primary">
              Order Summary
            </Text>

            {/* Subtotal */}
            <View className="flex-row justify-between mb-2">
              <Text className="text-secondary">Subtotal</Text>
              <Text className="font-bold">$ {breakdown.subtotal.toFixed(2)}</Text>
            </View>

            {/* Shipping */}
            <View className="flex-row justify-between mb-2">
              <Text className="text-secondary">Shipping</Text>
              <Text className="font-bold">$ {breakdown.shippingCost.toFixed(2)}</Text>
            </View>

            {/* Tax — R8: now matches the 10% the backend applies */}
            <View className="flex-row justify-between mb-2">
              <Text className="text-secondary">Tax (10%)</Text>
              <Text className="font-bold">$ {breakdown.tax.toFixed(2)}</Text>
            </View>

            <View className="flex-row justify-between pt-4 mt-4 border-t border-border">
              <Text className="text-lg font-bold text-primary">Total</Text>
              <Text className="text-lg font-bold text-primary">$ {breakdown.totalAmount.toFixed(2)}</Text>
            </View>

            {/* Place Order Button */}
            <TouchableOpacity
              onPress={handlePlaceOrder}
              className="items-center justify-center w-full py-4 mt-6 bg-primary rounded-xl"
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="white"
                />
              ) : (
                <Text className="font-bold text-white">
                  Place Order
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
