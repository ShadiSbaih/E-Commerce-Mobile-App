import api from "@/constants/api";
import { Product } from "@/constants/types";
import { useAuth } from "@clerk/expo";
import React, { createContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

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
    updateQuantity: (
        itemId: string,
        quantity: number,
        size: string,
    ) => Promise<void>;
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

    const { getToken, isSignedIn, signOut } = useAuth();

    // دالة مساعدة لحساب السعر الإجمالي محلياً
    const calculateLocalTotal = (items: CartItem[]) => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getValidToken = async (): Promise<string | null> => {
        const token = await getToken();
        if (!token) {
            console.warn("Token is null - session expired or invalid, signing out");
            Toast.show({
                type: "error",
                text1: "Session Expired",
                text2: "Please sign in again",
            });
            await signOut();
            return null;
        }
        return token;
    };

    const fetchCartItems = async (showLoading = true) => {
        if (!isSignedIn) return;
        try {
            if (showLoading) setIsLoading(true);
            const token = await getValidToken();
            if (!token) return;

            const { data } = await api.get("/cart", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (data.success && data.data) {
                const serverCart = data.data;
                const mappedItems: CartItem[] = serverCart.items.map((item: any) => ({
                    id: item.product._id,
                    productId: item.product._id,
                    quantity: item.quantity,
                    product: item.product,
                    size: item?.size || "M",
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
    };

    const addToCart = async (product: Product, size: string) => {
        if (!isSignedIn) {
            Toast.show({ type: "error", text1: "Not signed in", text2: "Please sign in to add items" });
            return;
        }

        const previousCart = [...cartItems];
        const previousTotal = cartTotal;

        // --- Optimistic Update ---
        let updatedCart = [...cartItems];
        const existingIndex = updatedCart.findIndex(item => item.productId === product._id && item.size === size);
        
        if (existingIndex >= 0) {
            updatedCart[existingIndex].quantity += 1;
        } else {
            updatedCart.push({
                id: product._id, // مؤقت لحين رد السيرفر
                productId: product._id,
                quantity: 1,
                product: product,
                size: size,
                price: product.price,
            });
        }
        setCartItems(updatedCart);
        setCartTotal(calculateLocalTotal(updatedCart));
        
        Toast.show({ type: "success", text1: "Added to cart", text2: `${product.name} added` });

        // --- API Call ---
        try {
            const token = await getValidToken();
            if (!token) throw new Error("No token");

            const { data } = await api.post(
                "/cart/add",
                { productId: product._id, quantity: 1, size },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (data.success) {
                // مزامنة صامتة في الخلفية لتحديث الـ IDs بدون تجميد الواجهة
                fetchCartItems(false); 
            } else {
                throw new Error("Server rejected");
            }
        } catch (error: any) {
            // --- Rollback ---
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

        // --- Optimistic Update ---
        const updatedCart = cartItems.filter(item => !(item.productId === productId && item.size === size));
        setCartItems(updatedCart);
        setCartTotal(calculateLocalTotal(updatedCart));

        // --- API Call ---
        try {
            const token = await getValidToken();
            if (!token) throw new Error("No token");

            await api.delete(`/cart/item/${productId}?size=${size}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error: any) {
            // --- Rollback ---
            setCartItems(previousCart);
            setCartTotal(previousTotal);
            if (error.response?.status !== 401) {
                Toast.show({ type: "error", text1: "Error", text2: "Failed to remove item" });
            }
        }
    };

    const updateQuantity = async (productId: string, quantity: number, size: string = "M") => {
        if (!isSignedIn || quantity < 1) return;

        const previousCart = [...cartItems];
        const previousTotal = cartTotal;

        // --- Optimistic Update ---
        const updatedCart = cartItems.map(item =>
            (item.productId === productId && item.size === size)
                ? { ...item, quantity }
                : item
        );
        setCartItems(updatedCart);
        setCartTotal(calculateLocalTotal(updatedCart));

        // --- API Call ---
        try {
            const token = await getValidToken();
            if (!token) throw new Error("No token");

            await api.put(
                `/cart/item/${productId}`,
                { quantity, size },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error: any) {
            // --- Rollback ---
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

        // --- Optimistic Update ---
        setCartItems([]);
        setCartTotal(0);

        // --- API Call ---
        try {
            const token = await getValidToken();
            if (!token) throw new Error("No token");

            await api.delete(`/cart`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            Toast.show({ type: "success", text1: "Cart cleared", text2: "Your cart has been cleared" });
        } catch (error: any) {
            // --- Rollback ---
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
    if (context === undefined || !context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}