// Force TS refresh
export interface Creation {
  id: string;
  title: string;
  description: string;
  categories: ("bijoux" | "minis" | "chibi" | "halloween" | "pokemon" | "divers")[];
  image: string;
  images?: string[];
  details?: string[];
  status: "nouveau" | "vedette" | "normal" | "adopté" | "précommande" | "promotion";
  externalLink?: string;
  customMessage?: string;
  price: number;
  stock: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}
