export type HeroLocalizedText = { en: string; fr: string };

export type HeroPresentationCard = {
  title: HeroLocalizedText;
  description: HeroLocalizedText;
  image: string;
  href: string;
  icon: "wave" | "lesson" | "mountain";
};

export type HeroPresentationSettings = {
  kicker: HeroLocalizedText;
  coordinates: string;
  title: HeroLocalizedText;
  subtitle: HeroLocalizedText;
  mobileSubtitle: HeroLocalizedText;
  primaryAction: { label: HeroLocalizedText; href: string };
  secondaryAction: { label: HeroLocalizedText; href: string };
  cards: HeroPresentationCard[];
};

export const defaultHeroPresentationSettings: HeroPresentationSettings = {
  kicker: {
    en: "TAGHAZOUT OCEAN",
    fr: "TAGHAZOUT OCEAN",
  },
  coordinates: "30°43′ N · 9°42′ W",
  title: {
    en: "FIND YOUR RHYTHM IN THE ATLANTIC.",
    fr: "TROUVEZ VOTRE RYTHME SUR L’ATLANTIQUE.",
  },
  subtitle: {
    en: "Discover the magic of Morocco’s Atlantic coast with Taghazout Ocean. From unforgettable surf holidays and professional surf lessons to exciting outdoor adventures, experience everything the ocean and its surroundings have to offer.",
    fr: "Découvrez la magie de la côte Atlantique marocaine avec Taghazout Ocean. Des séjours surf inoubliables et cours de surf aux aventures en plein air, vivez tout ce que l’océan et ses environs ont à offrir.",
  },
  mobileSubtitle: {
    en: "Surf holidays, professional lessons, and outdoor adventures on Morocco’s Atlantic coast.",
    fr: "Séjours surf, cours et aventures en plein air sur la côte Atlantique marocaine.",
  },
  primaryAction: {
    label: { en: "EXPLORE OUR EXPERIENCES", fr: "EXPLORER NOS EXPÉRIENCES" },
    href: "#world",
  },
  secondaryAction: {
    label: { en: "CONTACT US", fr: "NOUS CONTACTER" },
    href: "#contact",
  },
  cards: [
    {
      title: { en: "Surf holidays", fr: "Séjours surf" },
      description: {
        en: "Surf & Yoga retreats, six-day stays in Tamraght, and dedicated surf coaching.",
        fr: "Découvrez nos expériences surf : retraites Surf & Yoga, séjours de six jours et coaching dédié.",
      },
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=86",
      href: "#surf-packages",
      icon: "wave",
    },
    {
      title: { en: "Surf lessons", fr: "Cours de surf" },
      description: {
        en: "Group lessons, private sessions, and guidance for every level in the water.",
        fr: "Débutant ou envie de progresser ? Cours en groupe, sessions privées et accompagnement.",
      },
      image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=86",
      href: "#surf-lessons",
      icon: "lesson",
    },
    {
      title: { en: "Activities & adventures", fr: "Activités & aventures" },
      description: {
        en: "Camel rides, Paradise Valley, quad biking, horse riding, and more.",
        fr: "Balade à dos de chameau, Paradise Valley, quad, cheval et autres expériences outdoor.",
      },
      image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=86",
      href: "#activities-adventures",
      icon: "mountain",
    },
  ],
};

function localized(value: unknown, fallback: HeroLocalizedText): HeroLocalizedText {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return fallback;
  const input = value as Record<string, unknown>;
  return {
    en: typeof input.en === "string" ? input.en : fallback.en,
    fr: typeof input.fr === "string" ? input.fr : fallback.fr,
  };
}

export function normalizeHeroPresentationSettings(value: unknown): HeroPresentationSettings {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return defaultHeroPresentationSettings;
  }
  const input = value as Record<string, unknown>;
  const action = (
    key: "primaryAction" | "secondaryAction",
  ): HeroPresentationSettings[typeof key] => {
    const item = typeof input[key] === "object" && input[key] !== null
      ? input[key] as Record<string, unknown>
      : {};
    const fallback = defaultHeroPresentationSettings[key];
    return {
      label: localized(item.label, fallback.label),
      href: typeof item.href === "string" ? item.href : fallback.href,
    };
  };
  const cards = Array.isArray(input.cards) ? input.cards : [];

  return {
    kicker: localized(input.kicker, defaultHeroPresentationSettings.kicker),
    coordinates: typeof input.coordinates === "string" ? input.coordinates : defaultHeroPresentationSettings.coordinates,
    title: localized(input.title, defaultHeroPresentationSettings.title),
    subtitle: localized(input.subtitle, defaultHeroPresentationSettings.subtitle),
    mobileSubtitle: localized(input.mobileSubtitle, defaultHeroPresentationSettings.mobileSubtitle),
    primaryAction: action("primaryAction"),
    secondaryAction: action("secondaryAction"),
    cards: defaultHeroPresentationSettings.cards.map((fallback, index) => {
      const card = typeof cards[index] === "object" && cards[index] !== null
        ? cards[index] as Record<string, unknown>
        : {};
      return {
        title: localized(card.title, fallback.title),
        description: localized(card.description, fallback.description),
        image: typeof card.image === "string" ? card.image : fallback.image,
        href: typeof card.href === "string" ? card.href : fallback.href,
        icon: fallback.icon,
      };
    }),
  };
}