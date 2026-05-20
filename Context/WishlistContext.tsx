import { dummyWishlist } from "@/assets/assets";
import { Product, WishlistContextType } from "@/constants/types";
import React, { createContext, useEffect, useState } from "react";


const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {

    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            setWishlist(dummyWishlist);
        } catch (error) {
            console.error("Error fetching wishlist:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleWishlist = (product: Product) => {
        const exists = wishlist.some(item => item._id === product._id);
        if (exists) {
            setWishlist(wishlist.filter(item => item._id !== product._id));
        } else {
            setWishlist([...wishlist, product]);
        }
    }
    
    const isInWishlist = (productId: string) => {
        return wishlist.some(item => item._id === productId);
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    return (
        <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider >
    )
}

export function useWishlist() {
    const context = React.useContext(WishlistContext);
    if (context === undefined || !context) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
}