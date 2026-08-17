import api from "@/constants/api";
import { Product, WishlistContextType } from "@/constants/types";
import { useAuth } from "@clerk/expo";
import React, { createContext, useEffect, useCallback, useState } from "react";
import Toast from "react-native-toast-message";

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    // R9: only isSignedIn needed — no manual token fetching
    const { isSignedIn } = useAuth();

    const fetchWishlist = useCallback(async () => {
        if (!isSignedIn) { setWishlist([]); return; }
        setLoading(true);
        try {
            // R9: interceptor attaches Bearer token automatically
            const { data } = await api.get("/wishlist");
            if (data.success) setWishlist(data.data);
        } catch (error) {
            console.error("Error fetching wishlist:", error);
        } finally {
            setLoading(false);
        }
    }, [isSignedIn]);

    const toggleWishlist = async (product: Product) => {
        if (!isSignedIn) {
            Toast.show({
                type: "info",
                text1: "Sign In Required",
                text2: "Please sign in to save items to your wishlist",
            });
            return;
        }

        // Optimistic update
        const previousWishlist = [...wishlist];
        const exists = wishlist.some(item => item._id === product._id);
        setWishlist(exists
            ? wishlist.filter(item => item._id !== product._id)
            : [...wishlist, product],
        );

        try {
            // R9: interceptor attaches Bearer token automatically
            const { data } = await api.post("/wishlist/toggle", { productId: product._id });
            if (data.success) {
                setWishlist(data.data);
                Toast.show({
                    type: "success",
                    text1: exists ? "Removed from Wishlist" : "Added to Wishlist",
                    text2: exists ? `${product.name} removed` : `${product.name} saved`,
                });
            }
        } catch (error) {
            console.error("Error toggling wishlist:", error);
            // Rollback
            setWishlist(previousWishlist);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to update wishlist. Please try again.",
            });
        }
    };

    const isInWishlist = (productId: string) =>
        wishlist.some(item => item._id === productId);

    useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

    return (
        <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = React.useContext(WishlistContext);
    if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
    return context;
}