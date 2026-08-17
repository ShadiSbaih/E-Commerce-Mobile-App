import api from "@/constants/api";
import { Product, WishlistContextType } from "@/constants/types";
import { useAuth } from "@clerk/expo";
import React, { createContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const { getToken, isSignedIn } = useAuth();

    const fetchWishlist = async () => {
        if (!isSignedIn) {
            setWishlist([]);
            return;
        }
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) return;
            const { data } = await api.get("/wishlist", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setWishlist(data.data);
            }
        } catch (error) {
            console.error("Error fetching wishlist:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleWishlist = async (product: Product) => {
        if (!isSignedIn) {
            Toast.show({
                type: "info",
                text1: "Sign In Required",
                text2: "Please sign in to save items to your wishlist",
            });
            return;
        }

        // 1. Snapshot previous state
        const previousWishlist = [...wishlist];
        const exists = wishlist.some(item => item._id === product._id);

        // 2. Optimistic UI update
        const updatedWishlist = exists
            ? wishlist.filter(item => item._id !== product._id)
            : [...wishlist, product];

        setWishlist(updatedWishlist);

        // 3. API mutation
        try {
            const token = await getToken();
            const { data } = await api.post("/wishlist/toggle", { productId: product._id }, {
                headers: { Authorization: `Bearer ${token}` }
            });

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
            // 4. Rollback on failure
            setWishlist(previousWishlist);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to update wishlist. Please try again.",
            });
        }
    };

    const isInWishlist = (productId: string) => {
        return wishlist.some(item => item._id === productId);
    };

    useEffect(() => {
        fetchWishlist();
    }, [isSignedIn]);

    return (
        <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = React.useContext(WishlistContext);
    if (context === undefined || !context) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
}