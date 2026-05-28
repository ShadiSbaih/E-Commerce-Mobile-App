import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { useWishlist } from '@/Context/WishlistContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';

export default function Favorites() {
  const router = useRouter();
  const { wishlist } = useWishlist();

  return (
    <SafeAreaView className='flex-1 bg-surface' edges={['top']}>
      <Header title="My Favorites" showMenu showCart />

      {
        wishlist.length > 0 ? (
          <ScrollView
            className="flex-1 px-4 mt-4"
            showsVerticalScrollIndicator={false}
          >
            <View className='flex-row flex-wrap justify-between'>
              {wishlist.map((item, index) => (
                <ProductCard
                  key={item._id}
                  product={item}
                />
               
              ))}
            </View>

          </ScrollView>
        ) : (
              <View className="items-center justify-center flex-1">
                 <Text className="text-lg text-secondary">Your wishlist is empty</Text>
                 <TouchableOpacity onPress={() => router.push('/')} className="px-4 py-2 mt-10 rounded-full bg-primary">
                   <Text className="text-xl font-bold text-white">Start Shopping</Text>
                 </TouchableOpacity>
               </View>
        )
      }

    </SafeAreaView>
  )
}