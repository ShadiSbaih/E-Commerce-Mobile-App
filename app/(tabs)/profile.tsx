import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { dummyUser } from '@/assets/assets';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import { EvilIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, PROFILE_MENU } from '@/constants';

export default function Profile() {
  const { user } = { user: dummyUser };
  const router = useRouter();

  const handleLogout = async () => {
     router.replace('/sign-in');
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <Header title="Profile" />

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={
          !user
            ? {
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }
            : {
              paddingTop: 16,
            }
        }
      >
        {user ? (
          <>
            {/* profile info */}
            <View className="items-center mb-8">
              <View className="mb-3">
                <Image
                  source={{ uri: user.imageUrl }}
                  className="border-2 border-white rounded-full shadow-sm size-20"
                />
              </View>

              <Text className="text-xl font-bold text-primary">
                {`${user.firstName} ${user.lastName}`}
              </Text>

              <Text className="mt-1 text-sm text-secondary">
                {user.emailAddresses?.[0]?.emailAddress ?? user.email}
              </Text>

              {/* admin panel button if user is admin */}
              {user.publicMetadata?.role === 'admin' && (
                <TouchableOpacity
                  className="px-4 py-2 mt-4 bg-blue-500 rounded-full"
                  onPress={() => router.push('/admin')}
                >
                  <Text className="font-bold text-white">Admin Panel</Text>
                </TouchableOpacity>
              )}
            </View>

            <View className="p-2 mb-4 bg-white border border-gray-200 rounded-xl">
              {PROFILE_MENU.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  className={`flex-row items-center justify-between p-4 ${index !== PROFILE_MENU.length - 1
                    ? 'border-b border-gray-200'
                    : ''
                    }`}
                  onPress={() => router.push(item.route as any)}
                >
                  <View className="items-center justify-center mr-4 rounded-full size-10 bg-surface">
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>

                  <Text className="flex-1 font-medium text-primary">
                    {item.title}
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={COLORS.secondary}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Logout button */}
            <TouchableOpacity className="flex-row items-center justify-center p-4" onPress={handleLogout}>
              <Text className="px-4 py-2 ml-2 font-bold text-red-500 border border-red-500 rounded-full">
                Log Out
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          // guest user screen
          <View className="items-center w-full">
            <View className="items-center justify-center w-24 h-24 mb-6 bg-gray-300 rounded-full">
              <EvilIcons
                name="user"
                size={48}
                color={COLORS.secondary}
              />
            </View>

            <Text className="mb-4 text-lg font-medium text-gray-700">
              Welcome, Guest!
            </Text>

            <Text className="mb-6 text-center text-gray-500">
              Please log in to access your profile and personalized features.
            </Text>

            <TouchableOpacity
              className="w-2/5 py-3 rounded-full bg-primary"
              onPress={() => router.push('/sign-in')}
            >
              <Text className="text-xl font-bold text-center text-white">
                Log In
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}