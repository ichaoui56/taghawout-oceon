export type SurfPackageLocaleText = { en: string; fr: string };

export type SurfPackage = {
  id: string;
  title: SurfPackageLocaleText;
  duration: SurfPackageLocaleText;
  description: SurfPackageLocaleText;
  image: string;
  imageAlt: SurfPackageLocaleText;
  activities: SurfPackageLocaleText[];
  pricePerPerson: number | null;
  startTimes: string[];
  popular: boolean;
  showOnHomepage: boolean;
  published: boolean;
};

export const defaultSurfPackages: SurfPackage[] = [
  {
    id: "surf-yoga-retreat",
    title: { en: "Surf & Yoga Retreat", fr: "Retraite Surf & Yoga" },
    duration: { en: "7 Days", fr: "7 jours" },
    description: { en: "Surf, relax and recharge in paradise.", fr: "Surfez, détendez-vous et ressourcez-vous au bord de l’océan." },
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=85",
    imageAlt: { en: "A quiet yoga practice by the Atlantic at sunset", fr: "Une séance de yoga paisible au bord de l’Atlantique au coucher du soleil" },
    activities: [
      { en: "Surf sessions", fr: "Sessions de surf" },
      { en: "Yoga sessions", fr: "Séances de yoga" },
      { en: "Accommodation", fr: "Hébergement" },
      { en: "Breakfast", fr: "Petit-déjeuner" },
    ],
    pricePerPerson: 499,
    startTimes: [],
    popular: false,
    showOnHomepage: true,
    published: true,
  },
  {
    id: "six-day-surf-package",
    title: { en: "Six-Day Surf Package", fr: "Séjour Surf de Six Jours" },
    duration: { en: "6 Days", fr: "6 jours" },
    description: { en: "Improve your surfing skills with six days of surf experiences.", fr: "Progressez avec six jours d’expériences de surf." },
    image: "https://images.unsplash.com/photo-1455729552865-3658a5d39692?auto=format&fit=crop&w=1200&q=85",
    imageAlt: { en: "A surfer riding an Atlantic wave", fr: "Un surfeur sur une vague de l’Atlantique" },
    activities: [
      { en: "Six-day surf experience", fr: "Six jours de surf" },
      { en: "Professional surf coaching", fr: "Coaching professionnel" },
      { en: "Equipment", fr: "Équipement" },
      { en: "Accommodation", fr: "Hébergement" },
    ],
    pricePerPerson: 699,
    startTimes: [],
    popular: true,
    showOnHomepage: true,
    published: true,
  },
  {
    id: "surf-coaching-package",
    title: { en: "Surf Coaching Package", fr: "Formule Coaching Surf" },
    duration: { en: "7 Days", fr: "7 jours" },
    description: { en: "Take your surfing to the next level with personalized coaching.", fr: "Passez au niveau supérieur avec un coaching personnalisé." },
    image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=85",
    imageAlt: { en: "Surfers carrying their boards to the water", fr: "Des surfeurs qui portent leurs planches vers l’océan" },
    activities: [
      { en: "Personalized coaching", fr: "Coaching personnalisé" },
      { en: "Surf equipment", fr: "Matériel de surf" },
      { en: "Video analysis", fr: "Analyse vidéo" },
      { en: "Skill development", fr: "Progression technique" },
    ],
    pricePerPerson: 899,
    startTimes: [],
    popular: false,
    showOnHomepage: true,
    published: true,
  },
  {
    id: "custom-surf-escape",
    title: { en: "Custom Surf Escape", fr: "Séjour Surf Sur Mesure" },
    duration: { en: "Flexible", fr: "Flexible" },
    description: { en: "A tailored stay shaped around your dates, goals and pace.", fr: "Un séjour adapté à vos dates, vos objectifs et votre rythme." },
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
    imageAlt: { en: "Open Atlantic coastline and waves in Morocco", fr: "Côte atlantique et vagues au Maroc" },
    activities: [
      { en: "Surf sessions", fr: "Sessions de surf" },
      { en: "Local surf guidance", fr: "Conseils de surf locaux" },
      { en: "Flexible coaching", fr: "Coaching flexible" },
      { en: "Stay options", fr: "Options d’hébergement" },
    ],
    pricePerPerson: null,
    startTimes: [],
    popular: false,
    showOnHomepage: false,
    published: true,
  },
];

function localizedText(value: unknown, fallback: SurfPackageLocaleText): SurfPackageLocaleText {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return fallback;
  const input = value as Record<string, unknown>;
  return {
    en: typeof input.en === "string" ? input.en : fallback.en,
    fr: typeof input.fr === "string" ? input.fr : fallback.fr,
  };
}

export function normalizeSurfPackages(value: unknown): SurfPackage[] {
  if (!Array.isArray(value)) return defaultSurfPackages;
  return value.flatMap((item): SurfPackage[] => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) return [];
    const input = item as Record<string, unknown>;
    if (typeof input.id !== "string") return [];
    const fallback = defaultSurfPackages.find((entry) => entry.id === input.id) ?? defaultSurfPackages[0];
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