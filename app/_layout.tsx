import React, { useEffect } from "react";
import { CartProvider } from "@/Context/CartContext";
import "../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { WishlistProvider } from "@/Context/WishlistContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";

/**
 * Clerk publishable key used to initialize authentication.
 * Required for Clerk to function.
 */
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

/**
 * Ensures authentication configuration exists before app starts.
 */
if (!publishableKey) {
  throw new Error("Missing Clerk Publishable Key");
}

/**
 * AuthGate
 *
 * Responsible for:
 * - Protecting routes based on authentication state
 * - Redirecting users between auth screens and protected app screens
 */
function AuthGate() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  /**
   * Current route segment (first level of navigation path)
   */
  const segment = segments[0];

  /**
   * Determines whether user is currently in authentication flow
   */
  const isAuthRoute =
    segment === "(auth)" ||
    segment === "sign-in" ||
    segment === "sign-up";

  /**
   * Authentication routing logic:
   * - Redirect unauthenticated users to sign-in
   * - Prevent signed-in users from accessing auth screens
   */
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn && !isAuthRoute) {
      router.replace("/sign-in");
      return;
    }

    if (isSignedIn && isAuthRoute) {
      router.replace("/");
    }
  }, [isLoaded, isSignedIn, isAuthRoute]);

  /**
   * Prevent rendering navigation until auth state is resolved
   */
  if (!isLoaded) return null;

  /**
   * Root stack navigator (global navigation config)
   */
  return <Stack screenOptions={{ headerShown: false }} />;
}

/**
 * RootLayout
 *
 * Global application wrapper that sets up:
 * - Gesture handling system
 * - Authentication provider (Clerk)
 * - Global state providers (Cart, Wishlist)
 * - Navigation system
 * - Toast notification system
 */
export default function RootLayout() {
  return (
    /**
     * Required root wrapper for gesture handling support
     */
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Authentication provider (Clerk) */}
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        {/* Global cart state */}
        <CartProvider>
          {/* Global wishlist state */}
          <WishlistProvider>
            {/* Authentication-based routing guard */}
            <AuthGate />

            {/* Global toast notifications */}
            <Toast />
          </WishlistProvider>
        </CartProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}