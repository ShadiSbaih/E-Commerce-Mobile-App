import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '@/components/Header'
import { Image, ScrollView, View, Dimensions, Text, TouchableOpacity } from 'react-native'
import { BANNERS } from './../../assets/assets';
import { useRouter } from 'expo-router';
import { CATEGORIES } from '@/constants';
import CategoryItem from '@/components/CategoryItem';


const { width: ScreenWidth } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();
  const categories = [{ id: "all", name: 'All', icon: 'grid' }, ...CATEGORIES];

  const [activeBannerIndex, setActiveBannerIndex] = React.useState(0);
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
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}