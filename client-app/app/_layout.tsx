import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";

import { CartProvider } from "@/Context/CartContext";
import { WishlistProvider } from "@/Context/WishlistContext";
import { setAuthHandlers } from "@/constants/api";
import BrandLoader from "@/components/BrandLoader";
import { LoadingProvider } from "@/Context/LoadingContext";

import "../global.css";
import { colors } from '@/theme';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing Clerk Publishable Key");
}

/**
 * Auth + routing guard
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken, signOut } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // attach axios auth handlers
  useEffect(() => {
    setAuthHandlers(getToken, signOut);
  }, [getToken, signOut]);

  // auth routing logic
  useEffect(() => {
    if (!isLoaded) return;

    const segment = segments[0];

    const isAuthRoute =
      segment === "(auth)" ||
      segment === "sign-in" ||
      segment === "sign-up";

    if (!isSignedIn && !isAuthRoute) {
      setTimeout(() => { router.replace("/sign-in"); }, 0);
    }

    if (isSignedIn && isAuthRoute) {
      setTimeout(() => { router.replace("/"); }, 0);
    }
  }, [isLoaded, isSignedIn, segments, router]);

  if (!isLoaded) return <BrandLoader label="Loading Nimbus" />;

  return <>{children}</>;
}

/**
 * App providers wrapper
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
      <ClerkProvider
        publishableKey={publishableKey!}
        tokenCache={tokenCache}
      >
        <LoadingProvider>
          <CartProvider>
            <WishlistProvider>
              <AuthGate>
                <StatusBar style="dark" backgroundColor={colors.background} />
                <Stack screenOptions={{ headerShown: false }} />
                <Toast />
              </AuthGate>
            </WishlistProvider>
          </CartProvider>
        </LoadingProvider>
      </ClerkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
