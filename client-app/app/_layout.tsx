import React, { useEffect } from "react";
import { CartProvider } from "@/Context/CartContext";
import "../global.css";
import { type Href, Stack, useRouter, useSegments } from "expo-router";
import { WishlistProvider } from "@/Context/WishlistContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";

/**
 * Clerk publishable key used to initialize authentication.
 * Loaded from environment variables.
 */
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

/**
 * Ensures that Clerk authentication is properly configured.
 * Throws an error if the publishable key is missing.
 */
if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

/**
 * RootNavigator
 *
 * Responsible for:
 * - Protecting routes (authentication guard)
 * - Redirecting users based on authentication state
 * - Handling navigation flow between auth and app screens
 */
function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  /**
   * Authentication guard logic:
   * - Redirect unauthenticated users to sign-in
   * - Prevent authenticated users from accessing auth screens
   */
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const rootSegment = segments[0] as string | undefined;

    /**
     * Determines whether the current route belongs to authentication flow
     */
    const inAuthRoute =
      rootSegment === "(auth)" ||
      rootSegment === "sign-in" ||
      rootSegment === "sign-up";

    /**
     * If user is not signed in and tries to access protected routes,
     * redirect them to sign-in screen.
     */
    if (!isSignedIn && !inAuthRoute) {
      router.replace("/sign-in" as Href);
      return;
    }

    /**
     * If user is signed in and tries to access auth screens,
     * redirect them to the home screen.
     */
    if (isSignedIn && inAuthRoute) {
      router.replace("/" as Href);
    }
  }, [isLoaded, isSignedIn, segments, router]);

  /**
   * Prevent rendering navigation until authentication state is resolved.
   */
  if (!isLoaded) {
    return null;
  }

  /**
   * Root stack navigator configuration.
   * Hides default headers globally.
   */
  return <Stack screenOptions={{ headerShown: false }} />;
}

/**
 * RootLayout
 *
 * Application root wrapper responsible for:
 * - Gesture handling initialization
 * - Authentication provider setup (Clerk)
 * - Global state providers (Cart, Wishlist)
 * - Navigation system
 * - Toast notifications system
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/**
       * Clerk authentication provider
       * Enables login/session management across the app
       */}
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        {/**
         * Global cart state provider
         */}
        <CartProvider>
          {/**
           * Global wishlist state provider
           */}
          <WishlistProvider>
            {/**
             * Handles authentication-based routing logic
             */}
            <RootNavigator />

            {/**
             * Global toast notification system
             */}
            <Toast />
          </WishlistProvider>
        </CartProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}