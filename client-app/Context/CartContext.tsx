import api from "@/constants/api";
import { Product } from "@/constants/types";
import { useAuth } from "@clerk/expo";
import React, { createContext, useEffect, useCallback, useState } from "react";
import Toast from "react-native-toast-message";

// R10: Single canonical CartItem type — re-exported so components
// that previously imported from types.ts or CartContext use the same shape.
export type CartItem = {
    id: string;
    productId: string;
    quantity: number;
    product: Product;
    size: string;
    price: number;
};

type CartContextType = {
    cartItems: CartItem[];
    addToCart: (product: Product, size: string) => Promise<void>;
    removeFromCart: (itemId: string, size: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number, size: string) => Promise<void>;
    clearCart: () => Promise<void>;
    cartTotal: number;
    itemCount: number;
    isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [cartTotal, setCartTotal] = useState(0);

    // R9: Auth is handled by the global Axios interceptor in api.ts.
    // We only need isSignedIn here — no manual token fetching.
    const { isSignedIn } = useAuth();

    const calculateLocalTotal = (items: CartItem[]) =>
        items.reduce((total, item) => total + item.price * item.quantity, 0);

    // R9: No more getValidToken() — the interceptor does it automatically.
    // The 401 response interceptor in api.ts handles sign-out on session expiry.
    const fetchCartItems = useCallback(async (showLoading = true) => {
        if (!isSignedIn) return;
        try {
            if (showLoading) setIsLoading(true);
            // R9: No manual Authorization header — handled by request interceptor
            const { data } = await api.get("/cart");
            if (data.success && data.data) {
                const serverCart = data.data;
                const mappedItems: CartItem[] = serverCart.items.map((item: any) => ({
                    id: item.product._id,
                    productId: item.product._id,
                    quantity: item.quantity,
                    product: item.product,
                    size: item?.size ?? "M",
                    price: item.price,
                }));
                setCartItems(mappedItems);
                setCartTotal(serverCart.totalAmount);
            }
        } catch (error: any) {
            if (error.response?.status !== 401) {
                console.error("Error fetching cart items:", error);
            }
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, [isSignedIn]);

    const addToCart = async (product: Product, size: string) => {
        if (!isSignedIn) {
            Toast.show({ type: "error", text1: "Not signed in", text2: "Please sign in to add items" });
            return;
        }

        const previousCart = [...cartItems];
        const previousTotal = cartTotal;

        // Optimistic update
        const updatedCart = [...cartItems];
        const existingIndex = updatedCart.findIndex(
            (item) => item.productId === product._id && item.size === size,
        );
        if (existingIndex >= 0) {
            updatedCart[existingIndex] = {
                ...updatedCart[existingIndex],
                quantity: updatedCart[existingIndex].quantity + 1,
            };
        } else {
            updatedCart.push({
                id: product._id,
                productId: product._id,
                quantity: 1,
                product,
                size,
                price: product.price,
            });
        }
        setCartItems(updatedCart);
        setCartTotal(calculateLocalTotal(updatedCart));
        Toast.show({ type: "success", text1: "Added to cart", text2: `${product.name} added` });

        try {
            // R9: No manual Authorization header
            const { data } = await api.post("/cart/add", {
                productId: product._id,
                quantity: 1,
                size,
            });
            if (data.success) {
                // Silent background sync to get server-canonical IDs
                fetchCartItems(false);
            } else {
                throw new Error("Server rejected add-to-cart");
            }
        } catch (error: any) {
            // Rollback
            setCartItems(previousCart);
            setCartTotal(previousTotal);
            if (error.response?.status !== 401) {
                Toast.show({ type: "error", text1: "Error", text2: "Failed to add item to cart" });
            }
        }
    };

    const removeFromCart = async (productId: string, size: string) => {
        if (!isSignedIn) return;

        const previousCart = [...cartItems];
        const previousTotal = cartTotal;

        // Optimistic update
        const updatedCart = cartItems.filter(
            (item) => !(item.productId === productId && item.size === size),
        );
        setCartItems(updatedCart);
        setCartTotal(calculateLocalTotal(updatedCart));

        try {
            // R9: No manual Authorization header
            await api.delete(`/cart/item/${productId}?size=${encodeURIComponent(size)}`);
        } catch (error: any) {
            // Rollback
            setCartItems(previousCart);
            setCartTotal(previousTotal);
            if (error.response?.status !== 401) {
                Toast.show({ type: "error", text1: "Error", text2: "Failed to remove item" });
            }
        }
    };

    const updateQuantity = async (productId: string, quantity: number, size = "M") => {
        if (!isSignedIn || quantity < 1) return;

        const previousCart = [...cartItems];
        const previousTotal = cartTotal;

        // Optimistic update
        const updatedCart = cartItems.map((item) =>
            item.productId === productId && item.size === size
                ? { ...item, quantity }
                : item,
        );
        setCartItems(updatedCart);
        setCartTotal(calculateLocalTotal(updatedCart));

        try {
            // R9: No manual Authorization header
            await api.put(`/cart/item/${productId}`, { quantity, size });
        } catch (error: any) {
            // Rollback
            setCartItems(previousCart);
            setCartTotal(previousTotal);
            if (error.response?.status !== 401) {
                Toast.show({ type: "error", text1: "Error", text2: "Failed to update quantity" });
            }
        }
    };

    const clearCart = async () => {
        if (!isSignedIn) return;

        const previousCart = [...cartItems];
        const previousTotal = cartTotal;

        // Optimistic update
        setCartItems([]);
        setCartTotal(0);

        try {
            // R9: No manual Authorization header
            await api.delete("/cart");
            Toast.show({ type: "success", text1: "Cart cleared" });
        } catch (error: any) {
            // Rollback
            setCartItems(previousCart);
            setCartTotal(previousTotal);
            if (error.response?.status !== 401) {
                Toast.show({ type: "error", text1: "Error", text2: "Failed to clear cart" });
            }
        }
    };

    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    useEffect(() => {
        if (isSignedIn) {
            fetchCartItems();
        } else {
            setCartItems([]);
            setCartTotal(0);
        }
    }, [isSignedIn]);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                itemCount,
                isLoading,
                cartTotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = React.useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}