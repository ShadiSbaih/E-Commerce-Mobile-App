import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '@/components/Header'
import { Image, ScrollView, View, Dimensions, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { BANNERS, dummyProducts } from './../../assets/assets';
import { useRouter } from 'expo-router';
import { CATEGORIES } from '@/constants';
import CategoryItem from '@/components/CategoryItem';
import ProductCard from '@/components/ProductCard';


const { width: ScreenWidth } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();
  const categories = [{ id: "all", name: 'All', icon: 'grid' }, ...CATEGORIES];

  const [products, setProduct] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [activeBannerIndex, setActiveBannerIndex] = React.useState(0);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setProduct(dummyProducts)
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [])

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <Header title="Home" showCart showMenu showLogo />
      <ScrollView className='flex-1 px-4' showsVerticalScrollIndicator={false}

      >
        {/*The banner slider is here. */}
        <View className='mb-6'>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            className='w-full h-48 rounded-xl' scrollEventThrottle={16}
            onScroll={(event) => {
              const slide = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
              if (slide !== activeBannerIndex) {
                setActiveBannerIndex(slide);
              }
            }}>
            {BANNERS.map((banner, index) => (
              <View key={index} className='relative w-full h-48 overflow-hidden bg-gray-200' style={{ width: ScreenWidth - 32 }}>
                <Image source={{ uri: banner.image }} className='w-full h-full' resizeMode="cover" />

                <View className='absolute z-10 bottom-4 left-4'>
                  <Text className='text-2xl font-bold text-white'>
                    {banner.title}
                  </Text>

                  <Text className='text-sm font-medium text-white'>
                    {banner.subtitle}
                  </Text>

                  <TouchableOpacity className='self-start px-4 py-2 mt-2 bg-white rounded-full'>
                    <Text className='text-xs font-bold text-primary'>Get Now</Text>
                  </TouchableOpacity>
                </View>
                <View className='absolute w-full h-full bg-black opacity-20' />

              </View>
            ))}
          </ScrollView>

          {/* {Pagination dots } */}
          <View className='flex-row items-center justify-center gap-2 mt-4'>
            {
              BANNERS.map((_, index) => (
                <View key={index} className={`w-2 h-2 rounded-full ${index === activeBannerIndex ? 'w-6 bg-primary' : 'w-2  bg-gray-300'}`} />
              ))
            }
          </View>
        </View>

        {/* Categories section will be here. */}
        <View className='mb-4'>
          <View className='flex-row justify-between mb-4 item-center '>
            <Text className='text-xl font-bold text-primary'>Categories</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className='w-full h-32'>
            {categories.map((category) => (
              <TouchableOpacity key={category.id} className='mr-4'>
                <CategoryItem item={category}
                  isSelected={category.id === 'all'}
                  onPress={() => router.push({
                    pathname: `/shop/`,
                    params: { category: category.id === "all" ? "" : category.id }
                  })} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Products section will be here. */}
        <View className='mb-8'>
          <View className='flex-row items-center justify-between mb-4'>
            <Text className='text-xl font-bold text-primary'>Popular</Text>
            <TouchableOpacity onPress={() => router.push("/shop")}>
              <Text className='text-sm text-secondary'>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <View className='flex-row flex-wrap justify-between'>
              {products.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </View>
          )}

        </View>

        {/* Newsletter  CTA. */}
        <View className="items-center p-6 mb-20 bg-gray-100 rounded-2xl">
          <Text className='mb-2 text-2xl font-bold text-center text-primary'>Join Our Newsletter</Text>
          <Text className='mb-4 text-sm text-center text-secondary'>
            Subscribe to our newsletter for the latest updates and exclusive offers!
          </Text>
          <TouchableOpacity className='items-center w-4/5 py-3 rounded-full bg-primary'>
            <Text className='text-white font-base medium text-'>Subscribe</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}