import CartItem from '@/components/CartItem';
import Header from '@/components/Header';
import { useCart } from '@/Context/CartContext';
import { useRouter } from 'expo-router';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import EmptyState from '@/components/EmptyState';

export default function Cart() {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const shippingCost = 5.00;
  const tax = Number((cartTotal * 0.1).toFixed(2));
  const totalAmount = cartTotal + shippingCost + tax;

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
            contentContainerStyle={{ paddingBottom: 220 + insets.bottom }}
            renderItem={({ item }) => (
              <CartItem
                item={item}
                onRemove={() => removeFromCart(item.productId, item.size)}
                onUpdateQuantity={(q) => updateQuantity(item.productId, q, item.size)}
              />
            )}
          />

          <View
            className='p-4 bg-white border-t border-border'
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              // Keep the summary just above the tab bar, but lower it slightly
              // so the Checkout button does not sit too high on the screen.
              bottom: Math.max(tabBarHeight - 64, 0),
              paddingBottom: 16,
            }}
          >
            
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

            <View className='flex-row justify-between mb-2'>
              <Text className='text-secondary'>Tax</Text>
              <Text className='font-bold text-primary'>
                ${tax.toFixed(2)}
              </Text>
            </View>
            
            <View className='mb-4 bg-border h-[1px]' />

            <View className='flex-row justify-between mb-6'>
              <Text className='text-lg font-bold text-secondary'>Total</Text>
              <Text className='text-lg font-bold text-primary'>
                ${totalAmount.toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Checkout"
              activeOpacity={0.82}
              onPress={() => router.push('/checkout')}
              style={{
                minHeight: 48,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 24,
                borderRadius: 8,
                backgroundColor: '#0F172A',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                Checkout
              </Text>
            </TouchableOpacity>

          </View>
        </>
      ) : (
        <EmptyState title="Your cart is waiting." description="Add a few thoughtful finds and they’ll appear here." actionLabel="Start shopping" onAction={() => router.push('/')} icon="bag-outline" />
      )}
    </SafeAreaView>
  );
}
