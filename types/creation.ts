export interface Creation {
  id: string;
  title: string;
  description: string;
  categories: ("bijoux" | "minis" | "halloween" | "pokemon" | "divers")[];
  image: string;
  images?: string[];
  details?: string[];
  status: "nouveau" | "vedette" | "normal" | "adopté";
  externalLink?: string;
  customMessage?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}
