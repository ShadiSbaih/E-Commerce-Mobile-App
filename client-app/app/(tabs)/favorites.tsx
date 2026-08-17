import { View, ScrollView, StyleSheet } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { useWishlist } from '@/Context/WishlistContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import EmptyState from '@/components/EmptyState';

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
            <View style={styles.grid}>
              {wishlist.map((item) => (
                <View key={item._id} style={styles.productCell}>
                  <ProductCard product={item} style={styles.productCard} />
                </View>
              ))}
            </View>

          </ScrollView>
        ) : (
              <EmptyState title="Your favorites are waiting." description="Save products you love and they’ll appear here." actionLabel="Explore products" onAction={() => router.push('/')} icon="heart-outline" />
        )
      }

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productCell: {
    width: '48%',
  },
  productCard: {
    width: '100%',
  },
});
