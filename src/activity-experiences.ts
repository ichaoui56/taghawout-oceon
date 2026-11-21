export type ActivityExperience = {
  slug: string;
  icon: string;
  image: string;
  title: { en: string; fr: string };
  category: { en: string; fr: string };
  summary: { en: string; fr: string };
  imageAlt: { en: string; fr: string };
};

export const activityExperiences: ActivityExperience[] = [
  {
    slug: "quad-biking",
    icon: "quad",
    image: "https://www.bookagadirexperience.com/images/quad/quad-dunes-convoy.jpg",
    title: { en: "Quad Biking", fr: "Balade en quad" },
    category: { en: "Adventure", fr: "Aventure" },
    summary: { en: "Explore the stunning landscapes around Taghazout on a thrilling quad ride.", fr: "Parcourez les paysages autour de Taghazout lors d’une excursion en quad." },
    imageAlt: { en: "A convoy of quad bikes crossing the Moroccan dunes", fr: "Un groupe de quads traverse les dunes marocaines" },
  },
  {
    slug: "camel-ride",
    icon: "camel",
    image: "photo-1512632578888-169bbbc64f33",
    title: { en: "Camel Rides", fr: "Balades à dos de chameau" },
    category: { en: "Culture", fr: "Culture" },
    summary: { en: "Experience the Moroccan coast with a peaceful camel ride.", fr: "Découvrez la côte marocaine au rythme paisible d’une balade à dos de chameau." },
    imageAlt: { en: "Camels walking through a warm desert landscape", fr: "Des chameaux avancent dans un paysage désertique doré" },
  },
  {
    slug: "boat-trip",
    icon: "boat",
    image: "photo-1544551763-46a013bb70d5",
    title: { en: "Boat Trips", fr: "Sorties en bateau" },
    category: { en: "Ocean", fr: "Océan" },
    summary: { en: "Discover the Atlantic coast with an unforgettable boat trip.", fr: "Découvrez la côte atlantique lors d’une sortie en bateau inoubliable." },
    imageAlt: { en: "A boat cruising across clear Atlantic water", fr: "Un bateau navigue sur les eaux limpides de l’Atlantique" },
  },
  {
    slug: "fishing-trips",
    icon: "fish",
    image: "photo-1500375592092-40eb2168fd21",
    title: { en: "Fishing Trips", fr: "Sorties de pêche" },
    category: { en: "Ocean", fr: "Océan" },
    summary: { en: "Enjoy a relaxing fishing experience in the rich Atlantic waters.", fr: "Profitez d’un moment de pêche relaxant dans les eaux poissonneuses de l’Atlantique." },
    imageAlt: { en: "A peaceful fishing trip on the Atlantic Ocean", fr: "Une sortie de pêche paisible sur l’océan Atlantique" },
  },
  {
    slug: "hiking-tours",
    icon: "hike",
    image: "photo-1551632811-561732d1e306",
    title: { en: "Hiking Tours", fr: "Randonnées guidées" },
    category: { en: "Nature", fr: "Nature" },
    summary: { en: "Explore breathtaking trails and panoramic coastal views.", fr: "Parcourez des sentiers magnifiques et admirez les panoramas de la côte." },
    imageAlt: { en: "Hikers following a trail along the Moroccan coast", fr: "Des randonneurs suivent un sentier sur la côte marocaine" },
  },
  {
    slug: "yoga-retreats",
    icon: "yoga",
    image: "photo-1544367567-0f2fcb009e0b",
    title: { en: "Yoga Retreats", fr: "Retraites de yoga" },
    category: { en: "Wellbeing", fr: "Bien-être" },
    summary: { en: "Relax and rejuvenate with our yoga sessions.", fr: "Détendez-vous et ressourcez-vous lors de nos séances de yoga." },
    imageAlt: { en: "A calm yoga practice in soft morning light", fr: "Une séance de yoga paisible dans la lumière du matin" },
  },
  {
    slug: "moroccan-cooking-class",
    icon: "cooking",
    image: "photo-1547592180-85f173990554",
    title: { en: "Cooking Classes", fr: "Cours de cuisine" },
    category: { en: "Food", fr: "Gastronomie" },
    summary: { en: "Learn to cook traditional Moroccan dishes.", fr: "Apprenez à préparer des plats traditionnels marocains." },
    imageAlt: { en: "A table of colourful Moroccan dishes and ingredients", fr: "Une table garnie de plats et d’ingrédients marocains colorés" },
  },
  {
    slug: "desert-excursions",
    icon: "desert",
    image: "photo-1509316785289-025f5b846b35",
    title: { en: "Desert Excursions", fr: "Excursions dans le désert" },
    category: { en: "Nature", fr: "Nature" },
    summary: { en: "Discover the beauty of the Moroccan desert.", fr: "Découvrez la beauté des paysages désertiques marocains." },
    imageAlt: { en: "Golden Moroccan dunes stretching into the distance", fr: "Des dunes marocaines dorées s’étendent à l’horizon" },
  },
];

export const getActivityExperience = (slug: string) =>
  activityExperiences.find((experience) => experience.slug === slug);