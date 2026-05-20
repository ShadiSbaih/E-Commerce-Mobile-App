import CartItem from '@/components/CartItem';
import Header from '@/components/Header';
import { useCart } from '@/Context/CartContext';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Cart() {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();

  const shippingCost = 1.99;
  const totalAmount = cartTotal + shippingCost;

  return (
    <SafeAreaView className='flex-1 bg-surface' edges={['top', 'bottom']}>
      <Header title="My Cart" showBack />
      
      {cartItems.length > 0 ? (
        <>
          <ScrollView className="flex-1 px-4 mt-4" showsVerticalScrollIndicator={false}>
            {cartItems.map((item) => (
              <CartItem
                key={`${item.product._id}-${item.size}`}
                item={item}
                onRemove={() => removeFromCart(item.id, item.size)}
                onUpdateQuantity={(q) => updateQuantity(item.id, q, item.size)}
              />
            ))}
          </ScrollView>

          {/* Adjusted padding-bottom (pb-24) to clear the bottom tab bar */}
          <View className='p-4 pb-24 bg-white shadow-sm rounded-t-3xl'>
            
            {/* subtotal */}
            <View className='flex-row justify-between mb-2'>
              <Text className='text-secondary'>Subtotal</Text>
              <Text className='font-bold text-primary'>
                ${cartTotal.toFixed(2)}
              </Text>
            </View>

            {/* shipping */}
            <View className='flex-row justify-between mb-2'>
              <Text className='text-secondary'>Shipping</Text>
              <Text className='font-bold text-primary'>
                ${shippingCost.toFixed(2)}
              </Text>
            </View>
            
            {/* border */}
            <View className='mb-4 bg-border h-[1px]' />

            {/* total */}
            <View className='flex-row justify-between mb-6'>
              <Text className='text-lg font-bold text-secondary'>Total</Text>
              <Text className='text-lg font-bold text-primary'>
                ${totalAmount.toFixed(2)}
              </Text>
            </View>

            {/* Check out button with corrected Tailwind classes */}
            <TouchableOpacity 
              className='items-center justify-center py-4 rounded-full bg-primary'
              onPress={() => router.push('/checkout')}
            >
              <Text className='text-lg font-bold text-white'>Checkout</Text>
            </TouchableOpacity>

          </View>
        </>
      ) : (
        <View className="items-center justify-center flex-1">
          <Text className="text-lg text-secondary">Your cart is empty</Text>
          <TouchableOpacity onPress={() => router.push('/')} className="px-4 py-2 mt-10 rounded-full bg-primary">
            <Text className="text-xl font-bold text-white">Start Shopping</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}