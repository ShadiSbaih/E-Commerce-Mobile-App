import { dummyWishlist } from "@/assets/assets";
import { Product, WishlistContextType } from "@/constants/types";
import React, { createContext, useEffect, useState } from "react";


const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function wishlistProvider({ children }: { children: React.ReactNode }) {

    const [Wishlist, setWishlist] = useState<Product[]>([]);
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
        const exists = Wishlist.find(item => item._id === product._id);
        if (exists) {
            setWishlist(Wishlist.filter(item => item._id !== product._id));
        } else {
            setWishlist([...Wishlist, product]);
        }
    }
    
    const isInWishlist = (productId: string) => {
        return Wishlist.some(item => item._id === productId);
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    return (
        <WishlistContext.Provider value={{ Wishlist, setWishlist, loading, setLoading ,toggleWishlist, isInWishlist}}>
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