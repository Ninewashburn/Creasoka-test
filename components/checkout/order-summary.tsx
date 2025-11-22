"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";

export default function OrderSummary() {
    const { items, cartTotal } = useCart();
    const shippingCost = cartTotal > 50 ? 0 : 4.99;
    const total = cartTotal + shippingCost;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Récapitulatif</h2>
            <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
                {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border">
                            <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1 text-sm">
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Qté: {item.quantity}
                            </p>
                        </div>
                        <div className="text-sm font-medium">
                            {formatPrice(item.price * item.quantity)}
                        </div>
                    </div>
                ))}
            </div>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sous-total</span>
                    <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Livraison</span>
                    <span>
                        {shippingCost === 0 ? (
                            <span className="text-green-600 font-medium">Offerte</span>
                        ) : (
                            formatPrice(shippingCost)
                        )}
                    </span>
                </div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-creasoka">{formatPrice(total)}</span>
            </div>
        </div>
    );
}
