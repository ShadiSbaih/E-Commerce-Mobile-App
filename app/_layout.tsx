import React, { useEffect } from "react";
import { CartProvider } from "@/Context/CartContext";
import "../global.css";
import { type Href, Stack, useRouter, useSegments } from "expo-router";
import { WishlistProvider } from "@/Context/WishlistContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const rootSegment = segments[0] as string | undefined;
    const inAuthRoute =
      rootSegment === "(auth)" || rootSegment === "sign-in" || rootSegment === "sign-up";

    if (!isSignedIn && !inAuthRoute) {
      router.replace("/sign-in" as Href);
      return;
    }

    if (isSignedIn && inAuthRoute) {
      router.replace("/" as Href);
    }
  }, [isLoaded, isSignedIn, segments, router]);

  if (!isLoaded) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <CartProvider>
          <WishlistProvider>
            <RootNavigator />
            <Toast />
          </WishlistProvider>
        </CartProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
