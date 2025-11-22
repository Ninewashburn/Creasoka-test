"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Creation } from "@/types/creation";
import { useToast } from "@/hooks/use-toast";

export type CartItem = {
    id: string;
    title: string;
    price: number;
    image: string;
    quantity: number;
    maxStock: number;
    slug: string;
};

type CartContextType = {
    items: CartItem[];
    addItem: (product: Creation) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const { toast } = useToast();

    // Load cart from localStorage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedCart = localStorage.getItem("creasoka-cart");
            if (savedCart) {
                try {
                    setItems(JSON.parse(savedCart));
                } catch (e) {
                    console.error("Failed to parse cart from localStorage", e);
                }
            }
            setIsLoaded(true);
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isLoaded && typeof window !== "undefined") {
            localStorage.setItem("creasoka-cart", JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addItem = (product: Creation) => {
        const existingItem = items.find((item) => item.id === product.id);
        const currentQty = existingItem ? existingItem.quantity : 0;
        const stock = product.stock || 0;

        if (currentQty >= stock) {
            toast({
                title: "Stock insuffisant",
                description: `Désolé, il n'y a que ${stock} exemplaires disponibles.`,
                variant: "error",
            });
            return;
        }

        setItems((prevItems) => {
            const existing = prevItems.find((item) => item.id === product.id);
            if (existing) {
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [
                ...prevItems,
                {
                    id: product.id,
                    title: product.title,
                    price: product.price || 0,
                    image: product.image,
                    quantity: 1,
                    maxStock: product.stock || 0,
                    slug: product.id,
                },
            ];
        });

        toast({
            title: "Ajouté au panier",
            description: `${product.title} a été ajouté à votre panier.`,
        });
        setIsOpen(true);
    };

    const removeItem = (id: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) {
            removeItem(id);
            return;
        }

        setItems((prevItems) =>
            prevItems.map((item) => {
                if (item.id === id) {
                    // Check max stock
                    if (quantity > item.maxStock) {
                        toast({
                            title: "Stock insuffisant",
                            description: `Maximum ${item.maxStock} exemplaires disponibles.`,
                            variant: "error",
                        });
                        return { ...item, quantity: item.maxStock };
                    }
                    return { ...item, quantity };
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const cartCount = items.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
                isOpen,
                setIsOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
