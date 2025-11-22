"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
    SheetDescription,
} from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-context";
import { CartItem } from "./cart-item";
import { formatPrice } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function CartSheet() {
    const { items, cartCount, cartTotal, isOpen, setIsOpen } = useCart();

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <ShoppingBag className="h-5 w-5" />
                    {cartCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-purple-600 hover:bg-purple-700"
                        >
                            {cartCount}
                        </Badge>
                    )}
                    <span className="sr-only">Ouvrir le panier</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        Mon Panier <span className="text-gray-500 text-sm font-normal">({cartCount} articles)</span>
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                        Aperçu de votre panier d&apos;achat
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-hidden flex flex-col mt-4">
                    {items.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <ShoppingBag className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">Votre panier est vide</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
                                Découvrez nos créations uniques et ajoutez-les à votre collection.
                            </p>
                            <SheetClose asChild>
                                <Button className="bg-purple-600 hover:bg-purple-700">
                                    Continuer mes achats
                                </Button>
                            </SheetClose>
                        </div>
                    ) : (
                        <>
                            <ScrollArea className="flex-1 -mx-6 px-6">
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {items.map((item) => (
                                        <CartItem key={item.id} item={item} />
                                    ))}
                                </div>
                            </ScrollArea>

                            <div className="pt-4 mt-auto">
                                <Separator className="mb-4" />
                                <div className="space-y-1.5 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Sous-total</span>
                                        <span className="font-medium">{formatPrice(cartTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Livraison</span>
                                        <span className="text-green-600 text-xs font-medium uppercase">Calculé à l&apos;étape suivante</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold mt-2">
                                        <span>Total</span>
                                        <span>{formatPrice(cartTotal)}</span>
                                    </div>
                                </div>
                                <SheetFooter>
                                    <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-base">
                                        <Link href="/checkout" onClick={() => setIsOpen(false)}>
                                            Commander
                                        </Link>
                                    </Button>
                                </SheetFooter>
                            </div>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
