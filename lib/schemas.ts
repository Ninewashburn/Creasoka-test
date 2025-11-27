import { z } from "zod";

export const creationSchema = z.object({
    title: z.string().min(1, "Titre requis").max(200),
    description: z.string().min(1, "Description requise"),
    categories: z
        .array(z.string())
        .min(1, "Au moins une catégorie requise"),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
    details: z.array(z.string()).optional(),
    status: z
        .enum(["nouveau", "vedette", "normal", "adopté", "promotion", "précommande"])
        .default("normal"),
    externalLink: z.string().optional().or(z.literal("")),
    customMessage: z.string().max(500).optional(),
    price: z.number().min(0, "Le prix ne peut pas être négatif").default(0),
    stock: z.number().int().min(0, "Le stock ne peut pas être négatif").default(0),
});

export type CreationInput = z.infer<typeof creationSchema>;
