// import { dummyCart } from "@/assets/assets";
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

    const { getToken, isSignedIn } = useAuth();

    const fetchCartItems = async () => {
        try {
            setIsLoading(true);
            const token = await getToken();
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
        } catch (error) {
            console.error("Error fetching cart items:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to fetch cart items",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const addToCart = async (product: Product, size: string) => {
        if (!isSignedIn) {
            Toast.show({
                type: "error",
                text1: "Not signed in",
                text2: "Please sign in to add items to your cart",
            });
            return;
        }

        try {
            setIsLoading(true);
            const token = await getToken();
            const { data } = await api.post(
                "/cart/add",
                {
                    productId: product._id,
                    quantity: 1,
                    size,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            if (data.success) {
                Toast.show({
                    type: "success",
                    text1: "Added to cart",
                    text2: `${product.name} has been added to your cart`,
                });
                await fetchCartItems();
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to add item to cart",
            });
            console.error("Error adding to cart:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const removeFromCart = async (productId: string, size: string) => {
        if (!isSignedIn) {
            Toast.show({
                type: "error",
                text1: "Not signed in",
                text2: "Please sign in to remove items from your cart",
            });
            return;
        }
        try {
            setIsLoading(true);
            const token = await getToken();
            const { data } = await api.post(`/cart/item/${productId}?size=${size}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (data.success) {
                Toast.show({
                    type: "success",
                    text1: "Removed from cart",
                    text2: `Item has been removed from your cart`,
                });
                await fetchCartItems();
            }
        } catch (error) {
            console.error("Error removing from cart:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateQuantity = async (
        productId: string,
        quantity: number,
        size: string = "M",
    ) => {
        if (!isSignedIn) {
            Toast.show({
                type: "error",
                text1: "Not signed in",
                text2: "Please sign in to update item quantities",
            });
            return;
        }
        if (quantity < 1) { return }
        try {
            setIsLoading(true);
            const token = await getToken();
            const { data } = await api.put(
                `/cart/item/${productId}`,
                { quantity, size },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (data.success) {
                Toast.show({
                    type: "success",
                    text1: "Cart updated",
                    text2: `Item quantity has been updated`,
                });
                await fetchCartItems();
            }

        } catch (error) {
            console.error("Error updating cart item quantity:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to update cart item quantity",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const clearCart = async () => {
        if (!isSignedIn) {
            Toast.show({
                type: "error",
                text1: "Not signed in",
                text2: "Please sign in to clear your cart",
            });
            return;
        }
        try {
            setIsLoading(true);
            const token = await getToken();
            const { data } = await api.delete(`/cart`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (data.success) {
                Toast.show({
                    type: "success",
                    text1: "Cart cleared",
                    text2: "Your cart has been cleared",
                });
                setCartItems([]);
                setCartTotal(0);
                await fetchCartItems();
            }
        } catch (error) {
            console.error("Error clearing cart:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to clear cart",
            });
        } finally {
            setIsLoading(false);
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
