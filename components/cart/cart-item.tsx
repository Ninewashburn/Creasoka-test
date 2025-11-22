"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem as CartItemType, useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

interface CartItemProps {
    item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeItem } = useCart();

    return (
        <div className="flex gap-4 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                />
            </div>

            <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {formatPrice(item.price)}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-500"
                        onClick={() => removeItem(item.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                    </Button>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-none"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-none"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                    <div className="font-medium text-sm">
                        {formatPrice(item.price * item.quantity)}
                    </div>
                </div>
            </div>
        </div>
    );
}
