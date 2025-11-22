import { NextResponse } from "next/server";
import { z } from "zod";

// Schema de validation pour la commande
const orderSchema = z.object({
    items: z.array(
        z.object({
            creationId: z.string(),
            quantity: z.number().min(1),
            price: z.number().min(0),
        })
    ),
    shipping: z.object({
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        email: z.string().email(),
        address: z.string().min(5),
        city: z.string().min(2),
        postalCode: z.string().min(4),
        country: z.string().default("France"),
    }),
    total: z.number().min(0),
});

interface Order {
    id: string;
    status: string;
    total: number;
    trackingNumber?: string;
    items: {
        creationId: string;
        quantity: number;
        price: number;
    }[];
    shipping: {
        firstName: string;
        lastName: string;
        email: string;
        address: string;
        city: string;
        postalCode: string;
        country: string;
    };
    createdAt: string;
}

// Simulation de base de données en mémoire (se réinitialise au redémarrage du serveur)
const MOCK_ORDERS: Order[] = [
    {
        id: "ord_1732190000000",
        status: "pending",
        total: 45.00,
        items: [
            { creationId: "bracelet-perles-rose-01", quantity: 1, price: 18.00 },
            { creationId: "collier-resine-fleurs-02", quantity: 1, price: 27.00 }
        ],
        shipping: {
            firstName: "Sophie",
            lastName: "Martin",
            email: "sophie@example.com",
            address: "12 Rue des Fleurs",
            city: "Lyon",
            postalCode: "69000",
            country: "France"
        },
        createdAt: new Date("2024-11-20T14:30:00Z").toISOString(),
    },
    {
        id: "ord_1732100000000",
        status: "shipped",
        total: 22.00,
        trackingNumber: "1Z999AA10123456784",
        items: [
            { creationId: "pikachu-clin-oeil-03", quantity: 1, price: 22.00 }
        ],
        shipping: {
            firstName: "Thomas",
            lastName: "Dubois",
            email: "thomas@example.com",
            address: "8 Avenue Jean Jaurès",
            city: "Paris",
            postalCode: "75011",
            country: "France"
        },
        createdAt: new Date("2024-11-19T09:15:00Z").toISOString(),
    }
];

export async function GET() {
    // Simulation: Récupérer toutes les commandes (pour l'admin) ou les commandes de l'utilisateur
    // Ici on renvoie tout pour la démo admin
    return NextResponse.json({ orders: MOCK_ORDERS });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Valider les données
        const result = orderSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Données invalides", details: result.error.format() },
                { status: 400 }
            );
        }

        const { items, shipping, total } = result.data;

        const newOrder = {
            id: `ord_${Date.now()}`,
            status: "pending",
            total,
            items,
            shipping,
            createdAt: new Date().toISOString(),
        };

        // Ajouter à la "base de données" en mémoire
        MOCK_ORDERS.unshift(newOrder);



        // Simulation d'un délai réseau
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return NextResponse.json(
            { success: true, order: newOrder, message: "Commande créée avec succès" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Erreur lors de la création de la commande:", error);
        return NextResponse.json(
            { error: "Une erreur est survenue lors de la création de la commande" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { orderId, status, trackingNumber } = body;

        const orderIndex = MOCK_ORDERS.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            return NextResponse.json(
                { error: "Commande non trouvée" },
                { status: 404 }
            );
        }

        // Mise à jour de la commande
        MOCK_ORDERS[orderIndex] = {
            ...MOCK_ORDERS[orderIndex],
            status: status || MOCK_ORDERS[orderIndex].status,
            trackingNumber: trackingNumber || MOCK_ORDERS[orderIndex].trackingNumber,
        };

        return NextResponse.json({
            success: true,
            order: MOCK_ORDERS[orderIndex],
            message: "Commande mise à jour"
        });

    } catch {
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour" },
            { status: 500 }
        );
    }
}
