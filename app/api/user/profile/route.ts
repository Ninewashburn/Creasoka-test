import { NextResponse } from "next/server";

export async function GET() {
    // Simulation de délai réseau
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulation de récupération des commandes de l'utilisateur
    // Dans un vrai cas, on utiliserait l'ID de l'utilisateur de la session

    const mockOrders = [
        {
            id: "ord_1732185000000",
            date: new Date("2024-11-21T10:30:00"),
            status: "pending",
            total: 45.00,
            items: [
                {
                    id: "item_1",
                    title: "Bracelet Perles Rose Pastel",
                    quantity: 1,
                    price: 18.00,
                    image: "/placeholder.svg"
                },
                {
                    id: "item_2",
                    title: "Pikachu Clin d'œil",
                    quantity: 1,
                    price: 22.00,
                    image: "/placeholder.svg"
                }
            ],
            shipping: {
                address: "123 Rue des Fleurs",
                city: "Paris",
                postalCode: "75001",
                country: "France"
            }
        },
        {
            id: "ord_1731580000000",
            date: new Date("2024-11-14T14:15:00"),
            status: "delivered",
            total: 32.00,
            items: [
                {
                    id: "item_3",
                    title: "Collier Résine Fleurs Séchées",
                    quantity: 1,
                    price: 32.00,
                    image: "/placeholder.svg"
                }
            ],
            shipping: {
                address: "123 Rue des Fleurs",
                city: "Paris",
                postalCode: "75001",
                country: "France"
            }
        }
    ];

    return NextResponse.json({
        orders: mockOrders
    });
}
