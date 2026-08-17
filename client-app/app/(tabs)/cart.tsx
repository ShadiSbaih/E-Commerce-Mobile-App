import CartItem from '@/components/CartItem';
import Header from '@/components/Header';
import { useCart } from '@/Context/CartContext';
import { useRouter } from 'expo-router';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';

export default function Cart() {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();

  const shippingCost = 5.00;
  const totalAmount = cartTotal + shippingCost;

  return (
    <SafeAreaView className='flex-1 bg-surface' edges={['top']}>
      <Header title="My Cart" showBack />
      
      {cartItems.length > 0 ? (
        <>
          <FlatList
            className="flex-1 px-4 mt-4"
            data={cartItems}
            keyExtractor={(item) => `${item.id}-${item.size}`} 
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <CartItem
                item={item}
                onRemove={() => removeFromCart(item.productId, item.size)}
                onUpdateQuantity={(q) => updateQuantity(item.productId, q, item.size)}
              />
            )}
          />

          <View className='p-4 pb-8 bg-white border-t border-border'>
            
            <View className='flex-row justify-between mb-2'>
              <Text className='text-secondary'>Subtotal</Text>
              <Text className='font-bold text-primary'>
                ${cartTotal.toFixed(2)}
              </Text>
            </View>

            <View className='flex-row justify-between mb-2'>
              <Text className='text-secondary'>Shipping</Text>
              <Text className='font-bold text-primary'>
                ${shippingCost.toFixed(2)}
              </Text>
            </View>
            
            <View className='mb-4 bg-border h-[1px]' />

            <View className='flex-row justify-between mb-6'>
              <Text className='text-lg font-bold text-secondary'>Total</Text>
              <Text className='text-lg font-bold text-primary'>
                ${totalAmount.toFixed(2)}
              </Text>
            </View>

            <Button onPress={() => router.push('/checkout')}>Checkout</Button>

          </View>
        </>
      ) : (
        <EmptyState title="Your cart is waiting." description="Add a few thoughtful finds and they’ll appear here." actionLabel="Start shopping" onAction={() => router.push('/')} icon="bag-outline" />
      )}
    </SafeAreaView>
  );
}
