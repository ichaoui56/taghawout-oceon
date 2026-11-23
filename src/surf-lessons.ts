export type SurfLessonLocaleText = { en: string; fr: string };

export type SurfLesson = {
  id: string;
  title: SurfLessonLocaleText;
  duration: SurfLessonLocaleText;
  description: SurfLessonLocaleText;
  image: string;
  imageAlt: SurfLessonLocaleText;
  activities: SurfLessonLocaleText[];
  pricePerPerson: number | null;
  startTimes: string[];
  popular: boolean;
  showOnHomepage: boolean;
  published: boolean;
};

export const defaultSurfLessons: SurfLesson[] = [
  {
    id: "beginner-lesson",
    title: { en: "Beginner Lesson", fr: "Cours Débutant" },
    duration: { en: "1 Day", fr: "1 jour" },
    description: { en: "Get started with confidence in the waves.", fr: "Prenez confiance et lancez-vous dans les vagues." },
    image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=85",
    imageAlt: { en: "Surfer carrying a board beside the Atlantic", fr: "Surfeur portant une planche au bord de l’Atlantique" },
    activities: [
      { en: "Surf theory & practice", fr: "Théorie et pratique" },
      { en: "Safety instructions", fr: "Consignes de sécurité" },
      { en: "Equipment included", fr: "Équipement inclus" },
      { en: "Beach support", fr: "Accompagnement sur la plage" },
    ],
    pricePerPerson: 49,
    startTimes: ["09:00", "14:00"],
    popular: false,
    showOnHomepage: true,
    published: true,
  },
  {
    id: "surf-progression",
    title: { en: "Surf Progression", fr: "Progression Surf" },
    duration: { en: "3 Days", fr: "3 jours" },
    description: { en: "Improve your skills with structured lessons.", fr: "Progressez grâce à des cours structurés." },
    image: "https://images.unsplash.com/photo-1455729552865-3658a5d39692?auto=format&fit=crop&w=1200&q=85",
    imageAlt: { en: "Surfer practicing on an Atlantic wave", fr: "Surfeur en entraînement sur une vague de l’Atlantique" },
    activities: [
      { en: "Advanced techniques", fr: "Techniques avancées" },
      { en: "Video analysis", fr: "Analyse vidéo" },
      { en: "Equipment included", fr: "Équipement inclus" },
      { en: "Personalized coaching", fr: "Coaching personnalisé" },
    ],
    pricePerPerson: 129,
    startTimes: ["09:00", "14:00"],
    popular: true,
    showOnHomepage: true,
    published: true,
  },
  {
    id: "surf-intensive",
    title: { en: "Surf Intensive", fr: "Surf Intensif" },
    duration: { en: "5 Days", fr: "5 jours" },
    description: { en: "Accelerate your progress with intensive training.", fr: "Accélérez vos progrès avec un entraînement intensif." },
    image: "https://images.unsplash.com/photo-1502933691298-84fc14542831?auto=format&fit=crop&w=1200&q=85",
    imageAlt: { en: "Surfer training in clear ocean water", fr: "Surfeur en entraînement dans une eau limpide" },
    activities: [
      { en: "Daily surf lessons", fr: "Cours de surf quotidiens" },
      { en: "Personalized coaching", fr: "Coaching personnalisé" },
      { en: "Video analysis", fr: "Analyse vidéo" },
      { en: "Equipment included", fr: "Équipement inclus" },
    ],
    pricePerPerson: 199,
    startTimes: ["09:00", "14:00"],
    popular: false,
    showOnHomepage: true,
    published: true,
  },
  {
    id: "private-coaching",
    title: { en: "Private Coaching", fr: "Coaching Privé" },
    duration: { en: "Private", fr: "Privé" },
    description: { en: "One-to-one coaching for faster progress.", fr: "Un coaching individuel pour progresser plus vite." },
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
    imageAlt: { en: "A quiet Atlantic beach in Morocco", fr: "Une plage paisible de l’Atlantique au Maroc" },
    activities: [
      { en: "Personalized lessons", fr: "Cours personnalisés" },
      { en: "Focus on your goals", fr: "Vos objectifs au centre" },
      { en: "Video analysis", fr: "Analyse vidéo" },
      { en: "Premium equipment", fr: "Équipement premium" },
    ],
    pricePerPerson: 149,
    startTimes: ["09:00", "14:00"],
    popular: false,
    showOnHomepage: false,
    published: true,
  },
];

function localizedText(value: unknown, fallback: SurfLessonLocaleText): SurfLessonLocaleText {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return fallback;
  const input = value as Record<string, unknown>;
  return {
    en: typeof input.en === "string" ? input.en : fallback.en,
    fr: typeof input.fr === "string" ? input.fr : fallback.fr,
  };
}

export function normalizeSurfLessons(value: unknown): SurfLesson[] {
  if (!Array.isArray(value)) return defaultSurfLessons;
  return value.flatMap((item): SurfLesson[] => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) return [];
    const input = item as Record<string, unknown>;
    if (typeof input.id !== "string") return [];
    const fallback = defaultSurfLessons.find((entry) => entry.id === input.id) ?? defaultSurfLessons[0];
    const activities = Array.isArray(input.activities)
      ? input.activities.map((activity) => localizedText(activity, { en: "", fr: "" })).filter((activity) => activity.en || activity.fr)
      : fallback.activities;
    return [{
      id: input.id,
      title: localizedText(input.title, fallback.title),
      duration: localizedText(input.duration, fallback.duration),
      description: localizedText(input.description, fallback.description),
      image: typeof input.image === "string" ? input.image : fallback.image,
      imageAlt: localizedText(input.imageAlt, fallback.imageAlt),
      activities,
      pricePerPerson: typeof input.pricePerPerson === "number" && Number.isFinite(input.pricePerPerson) && input.pricePerPerson > 0 ? input.pricePerPerson : null,
      startTimes: Array.isArray(input.startTimes) ? input.startTimes.filter((time): time is string => typeof time === "string") : [],
      popular: input.popular === true,
      showOnHomepage: input.showOnHomepage === true,
      published: input.published !== false,
    }];
  });
}