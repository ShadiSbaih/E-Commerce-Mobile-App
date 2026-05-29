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
// import { dummyAddress } from '@/assets/assets';
import Toast from 'react-native-toast-message';
import { COLORS } from '@/constants';
import Header from '@/components/Header';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/expo';
import api from '@/constants/api';

export default function Checkout() {
  const { cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [selecetedAddress, setSelectedAddress] =
    useState<Address | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<
    'stripe' | 'cash'
  >('stripe');

  const shipping = 5;
  const tax = 0;
  const total = cartTotal + shipping + tax;

  const fetchAddresses = async () => {
    try {

      const token = await getToken();
      const { data } = await api.get('/addresses', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const addressList: Address[] = data.data;
      if (addressList.length > 0) {
        //find default address
        const def = addressList.find((a: Address) => a.isDefault) || addressList[0];
        setSelectedAddress(def ?? null);
      }
    }
    catch (err) {
      console.error("Error fetching addresses:", err);
      Toast.show({
        type: 'error',
        text1: 'Failed to load addresses',
        text2: 'Please try again later.',
      });
    }
    finally {
      setPageLoading(false);
    }

  };

  const handlePlaceOrder = async () => {
    if (!selecetedAddress) {
      Toast.show({
        type: 'info',
        text1: 'No address selected',
        text2:
          'Please select a shipping address before placing your order.',
      });

      return;
    }

    if (paymentMethod === 'stripe') {
      return Toast.show({
        type: 'error',
        text1: 'Info',
        text2: 'Stripe checkout not implemented yet.',
      });
    }

    setLoading(true);
    try {
      const payload = {
        shippingAddress: {
          street: selecetedAddress.street,
          city: selecetedAddress.city,
          state: selecetedAddress.state,
          zipCode: selecetedAddress.zipCode,
          country: selecetedAddress.country,
        },
        notes: "Placed via App",
        paymentMethod: "cash",
      }
      const token = await getToken();
      const { data } = await api.post('/orders', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
      console.error("Error placing order:", error);
      Toast.show({
        type: 'error',
        text1: 'Failed to place order',
        text2: 'Please try again later.',
      });
    }
    finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    fetchAddresses();
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

          {selecetedAddress ? (
            <View className="p-4 mb-6 bg-white shadow-sm rounded-xl">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base font-bold">
                  {selecetedAddress.type}
                </Text>

                <TouchableOpacity
                  onPress={() => router.push('/addresses')}
                >
                  <Text className="text-sm text-accent">
                    Change
                  </Text>
                </TouchableOpacity>
              </View>

              <Text className="leading-5 text-secondary">
                {selecetedAddress.street}
                {'\n'}
                {selecetedAddress.city}
                {'\n'}
                {selecetedAddress.state} -{' '}
                {selecetedAddress.zipCode}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/addresses')}
              className="items-center justify-center p-6 mb-6 bg-white border-2 border-gray-300 border-dashed rounded-xl"
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
            className={`flex-row items-center bg-white justify-between p-4 mb-4 rounded-2xl border ${paymentMethod === 'cash'
              ? 'border-black'
              : 'border-gray-200'
              }`}
          >
            <View className="flex-row items-center flex-1">
              <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-[#ECECEC]">
                <Ionicons
                  name="cash-outline"
                  size={20}
                  color="#222"
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
                ? 'bg-black'
                : 'border border-gray-300'
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
            className={`flex-row items-center justify-between p-4 mb-6 rounded-2xl border bg-white ${paymentMethod === 'stripe'
              ? 'border-black'
              : 'border-gray-200'
              }`}
          >
            <View className="flex-row items-center flex-1">
              <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-[#ECECEC]">
                <Ionicons
                  name="card-outline"
                  size={20}
                  color="#222"
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
                ? 'bg-black'
                : 'border border-gray-300'
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
        <View className="px-4 pt-4 pb-6 bg-white border-t border-gray-200">
          <View className="p-4 bg-white rounded-xl">
            <Text className="mb-4 text-lg font-bold text-primary">
              Order Summary
            </Text>

            {/* Subtotal */}
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">
                Subtotal
              </Text>

              <Text className="font-bold">
                $ {cartTotal?.toFixed(2) ?? '0.00'}
              </Text>
            </View>

            {/* Shipping */}
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">
                Shipping
              </Text>

              <Text className="font-bold">
                $ {shipping?.toFixed(2) ?? '0.00'}
              </Text>
            </View>

            {/* Tax */}
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">
                Tax
              </Text>

              <Text className="font-bold">
                $ {tax?.toFixed(2) ?? '0.00'}
              </Text>
            </View>

            {/* Total */}
            <View className="flex-row justify-between pt-4 mt-4 border-t border-gray-200">
              <Text className="text-lg font-bold text-primary">
                Total
              </Text>

              <Text className="text-lg font-bold text-primary">
                $ {total?.toFixed(2) ?? '0.00'}
              </Text>
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