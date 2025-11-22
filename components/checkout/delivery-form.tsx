"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeliveryFormProps {
    formData: {
        firstName: string;
        lastName: string;
        email: string;
        address: string;
        city: string;
        postalCode: string;
        country: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DeliveryForm({ formData, onChange }: DeliveryFormProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                        id="firstName"
                        name="firstName"
                        placeholder="Jean"
                        value={formData.firstName}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Dupont"
                        value={formData.lastName}
                        onChange={onChange}
                        required
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jean.dupont@example.com"
                    value={formData.email}
                    onChange={onChange}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                    id="address"
                    name="address"
                    placeholder="123 Rue de la Paix"
                    value={formData.address}
                    onChange={onChange}
                    required
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="postalCode">Code Postal</Label>
                    <Input
                        id="postalCode"
                        name="postalCode"
                        placeholder="75000"
                        value={formData.postalCode}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                        id="city"
                        name="city"
                        placeholder="Paris"
                        value={formData.city}
                        onChange={onChange}
                        required
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                    id="country"
                    name="country"
                    placeholder="France"
                    value={formData.country}
                    onChange={onChange}
                    required
                />
            </div>
        </div>
    );
}
