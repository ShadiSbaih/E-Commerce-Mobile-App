import { dummyCart } from "@/assets/assets";
import { Product } from "@/constants/types";
import React, { createContext,  useEffect, useState } from "react";

export type CartItem = {
    id: string;
    productId: string;
    quantity: number;
    product: Product;
    size: string;
    price: number;
}

type CartContextType = {
    cartItems: CartItem[];
    addToCart: (product: Product, size: string) => Promise<void>;
    removeFromCart: (itemId: string, size: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number, size: string) => Promise<void>;
    clearCart: () => Promise<void>;
    cartTotal: number;
    itemCount: number;
    isLoading: boolean;
}
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [cartTotal, setCartTotal] = useState(0);

    const fetchCartItems = async () => {
        setIsLoading(true);
        try {
            const serverCart = dummyCart;

            const mappedItems: CartItem[] = serverCart.items.map((item: any) => ({
                id: item.product._id,
                productId: item.product._id,
                quantity: item.quantity,
                product: item.product,
                size: item?.size || "M",
                price: item.price
            }));

            setCartItems(mappedItems);
            setCartTotal(serverCart.totalAmount);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching cart items:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const addToCart = async (product: Product, size: string) => {
    }
    const removeFromCart = async (productId: string, size: string) => {
    }
    const updateQuantity = async (productId: string, quantity: number, size: string = "M") => {
    }
    const clearCart = async () => {
    }
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    useEffect(() => {
        fetchCartItems();
    }, []);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            itemCount,
            isLoading,
            cartTotal
        }}>
            {children}
        </CartContext.Provider >
    )
}

export function useCart() {
    const context = React.useContext(CartContext);
    if (context === undefined || !context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}