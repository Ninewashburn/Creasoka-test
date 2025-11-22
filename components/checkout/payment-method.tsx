"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Wallet } from "lucide-react";

interface PaymentMethodProps {
    value: string;
    onChange: (value: string) => void;
}

export default function PaymentMethod({ value, onChange }: PaymentMethodProps) {
    return (
        <RadioGroup value={value} onValueChange={onChange} className="space-y-4">
            <div
                className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer transition-colors ${value === 'card' ? 'border-creasoka bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                onClick={() => onChange('card')}
            >
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex-1 flex items-center cursor-pointer">
                    <CreditCard className="mr-2 h-5 w-5 text-gray-500" />
                    <span>Carte Bancaire</span>
                </Label>
            </div>
            <div
                className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer transition-colors ${value === 'paypal' ? 'border-creasoka bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                onClick={() => onChange('paypal')}
            >
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="flex-1 flex items-center cursor-pointer">
                    <Wallet className="mr-2 h-5 w-5 text-blue-500" />
                    <span>PayPal</span>
                </Label>
            </div>
        </RadioGroup>
    );
}
