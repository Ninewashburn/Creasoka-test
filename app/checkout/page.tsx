"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import CheckoutSteps from "@/components/checkout/checkout-steps";
import OrderSummary from "@/components/checkout/order-summary";
import DeliveryForm from "@/components/checkout/delivery-form";
import PaymentMethod from "@/components/checkout/payment-method";
import { useToast } from "@/hooks/use-toast";

const STEPS = ["Panier", "Livraison", "Paiement", "Confirmation"];

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        city: "",
        postalCode: "",
        country: "France",
    });
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login?redirect=/checkout");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-16 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-creasoka"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect
    }

    const handleNext = async () => {
        if (currentStep === 2) {
            // Validate delivery form
            if (
                !formData.firstName ||
                !formData.lastName ||
                !formData.email ||
                !formData.address ||
                !formData.city ||
                !formData.postalCode
            ) {
                toast({
                    title: "Champs manquants",
                    description: "Veuillez remplir tous les champs de livraison.",
                    variant: "error",
                });
                return;
            }
        }

        if (currentStep === 3) {
            setIsProcessing(true);

            // Simulation de paiement PayPal
            if (paymentMethod === "paypal") {
                // Dans un vrai cas, on redirigerait vers PayPal ici
                await new Promise((resolve) => setTimeout(resolve, 1500));
            } else {
                // Simulation de paiement par carte
                await new Promise((resolve) => setTimeout(resolve, 1500));
            }

            // Création de la commande via l'API
            try {
                const orderData = {
                    items: items.map(item => ({
                        creationId: item.id,
                        quantity: item.quantity,
                        price: item.price
                    })),
                    total: cartTotal,
                    shipping: {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        address: formData.address,
                        city: formData.city,
                        postalCode: formData.postalCode,
                        country: formData.country
                    },
                    paymentMethod: paymentMethod
                };

                const response = await fetch("/api/orders", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(orderData),
                });

                if (!response.ok) {
                    throw new Error("Erreur lors de la création de la commande");
                }

                clearCart();
                setCurrentStep((prev) => prev + 1);
                window.scrollTo(0, 0);
            } catch (error) {
                console.error(error);
                toast({
                    title: "Erreur",
                    description: "Une erreur est survenue lors de la commande. Veuillez réessayer.",
                    variant: "error",
                });
            } finally {
                setIsProcessing(false);
            }
            return; // Stop here, don't increment step automatically if error
        }

        setCurrentStep((prev) => prev + 1);
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        setCurrentStep((prev) => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    if (items.length === 0 && currentStep !== 4) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
                <p className="text-gray-600 mb-8">
                    Ajoutez des créations à votre panier pour passer commande.
                </p>
                <Button asChild>
                    <Link href="/galerie">Découvrir la galerie</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-center mb-6">Commande</h1>
                <CheckoutSteps currentStep={currentStep} steps={STEPS} />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {currentStep === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border"
                        >
                            <h2 className="text-xl font-semibold mb-4">Vérifiez votre panier</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Vous avez {items.length} article(s) dans votre panier.
                            </p>
                            <Button asChild variant="outline">
                                <Link href="/galerie">Continuer mes achats</Link>
                            </Button>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border"
                        >
                            <h2 className="text-xl font-semibold mb-4">Adresse de livraison</h2>
                            <DeliveryForm formData={formData} onChange={handleInputChange} />
                        </motion.div>
                    )}

                    {currentStep === 3 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border"
                        >
                            <h2 className="text-xl font-semibold mb-4">Moyen de paiement</h2>
                            <PaymentMethod
                                value={paymentMethod}
                                onChange={setPaymentMethod}
                            />
                        </motion.div>
                    )}

                    {currentStep === 4 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border text-center"
                        >
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Commande confirmée !</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Merci pour votre commande, {formData.firstName}. Vous recevrez bientôt un email de confirmation.
                            </p>
                            <Button asChild size="lg" className="bg-creasoka hover:bg-creasoka/90">
                                <Link href="/">Retour à l&apos;accueil</Link>
                            </Button>
                        </motion.div>
                    )}

                    {/* Navigation Buttons */}
                    {currentStep < 4 && (
                        <div className="flex justify-between pt-4">
                            {currentStep > 1 ? (
                                <Button variant="outline" onClick={handleBack}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                                </Button>
                            ) : (
                                <div /> /* Spacer */
                            )}
                            <Button
                                onClick={handleNext}
                                disabled={isProcessing}
                                className="bg-creasoka hover:bg-creasoka/90"
                            >
                                {isProcessing ? (
                                    "Traitement..."
                                ) : currentStep === 3 ? (
                                    "Payer et Commander"
                                ) : (
                                    <>
                                        Suivant <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Sidebar Summary */}
                {currentStep < 4 && (
                    <div className="md:col-span-1">
                        <OrderSummary />
                    </div>
                )}
            </div>
        </div>
    );
}
