export interface Testimonial {
  author: string;
  creationName: string;
  creationSlug: string;
  imageUrl: string;
  comment: string;
}

export const testimonials: Testimonial[] = [
  {
    author: "JesstheWitch",
    creationName: "Goupix",
    creationSlug: "goupix",
    imageUrl: "/images/creations/717f2de2-d4ae-439a-b917-d75b9587013e.jpeg",
    comment: "Superbe objet, trop mignon, personne sérieuse, envoi parfait.",
  },
  {
    author: "Mlle_Malefoy",
    creationName: "Psykokwak",
    creationSlug: "psykokwak",
    imageUrl: "/images/creations/79445423-b089-4c52-882c-b7293e7d1ed0.jpeg",
    comment:
      "Bonjour, j'ai bien reçu le colis rien n'est casser et c'est très choupi, j'ai hâte de lui offrir, je sais qu'il va adorer et je sais que ça va aller dans notre déco ! Merci beaucoup",
  },
  {
    author: "El_Rsl",
    creationName: "Ronflex",
    creationSlug: "ronflex",
    imageUrl: "/images/creations/71f44914-9612-4a9c-8eca-163b3c51cc52.jpeg",
    comment: "C'est magnifique ce que vous faites !",
  },
];
