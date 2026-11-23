import { translate, type Locale } from "./i18n";

export type LocalizedText = { en: string; fr: string };

export type AboutOceanHeroImage = {
  image: string;
  alt: LocalizedText;
};

export type AboutOceanHighlight = {
  title: LocalizedText;
  detail: LocalizedText;
};

export type AboutOceanSettings = {
  hero: {
    eyebrow: LocalizedText;
    titleLead: LocalizedText;
    titleAccent: LocalizedText;
    introduction: LocalizedText;
    discoverStory: LocalizedText;
    signature: LocalizedText;
    images: AboutOceanHeroImage[];
  };
  impact: {
    eyebrow: LocalizedText;
    title: LocalizedText[];
    description: LocalizedText;
    cta: LocalizedText;
    image: string;
    highlights: AboutOceanHighlight[];
  };
};

export type TeamMember = {
  id: string;
  name: string;
  role: LocalizedText;
  detail: LocalizedText;
  image: string;
  imageAlt: LocalizedText;
};

export type TeamSectionSettings = {
  localCrew: LocalizedText;
  eyebrow: LocalizedText;
  titleLead: LocalizedText;
  titleAccent: LocalizedText;
  summary: LocalizedText;
  outroLabel: LocalizedText;
  outro: LocalizedText;
  members: TeamMember[];
};

export type OceanLogSettings = {
  eyebrow: LocalizedText;
  titleLead: LocalizedText;
  titleBridge: LocalizedText;
  titleAccent: LocalizedText;
  description: LocalizedText;
  button: LocalizedText;
  signature: LocalizedText;
};

export type HomepageSectionsSettings = {
  about: AboutOceanSettings;
  team: TeamSectionSettings;
  oceanLog: OceanLogSettings;
};

const localized = (en: string, fr: string): LocalizedText => ({ en, fr });
const translated = (phrase: string): LocalizedText => ({
  en: translate("en", phrase),
  fr: translate("fr", phrase),
});

export const defaultHomepageSectionsSettings: HomepageSectionsSettings = {
  about: {
    hero: {
      eyebrow: localized("ABOUT TAGHAZOUT OCEAN", "À PROPOS DE TAGHAZOUT OCEAN"),
      titleLead: localized("More Than a Surf Trip.", "Bien plus qu'un séjour de surf."),
      titleAccent: localized("A True Ocean Experience.", "Une véritable expérience océanique."),
      introduction: localized(
        "Born from a love of the Atlantic, Taghazout Ocean connects visitors with the waves, culture and people of Morocco's coastline.",
        "Bienvenue chez Taghazout Ocean, où l'esprit du surf rencontre la beauté de la côte atlantique marocaine. Nous partageons avec passion la magie de Taghazout à travers des expériences de surf inoubliables, des aventures locales et une hospitalité marocaine authentique.",
      ),
      discoverStory: localized("Discover Our Story", "Découvrir notre histoire"),
      signature: localized("Surf · Explore · Relax", "Surfer · Explorer · Se détendre"),
      images: [
        {
          image: "https://images.unsplash.com/photo-1455729552865-3658a5d39692?auto=format&fit=crop&w=1600&q=88",
          alt: localized("A surfer riding a powerful Atlantic wave", "Un surfeur glisse sur une puissante vague de l'Atlantique"),
        },
        {
          image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=86",
          alt: localized("The Atlantic coastline near Taghazout, Morocco", "Le littoral atlantique près de Taghazout, au Maroc"),
        },
        {
          image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=85",
          alt: localized("A surf session shared on the Atlantic coast", "Une session de surf partagée sur la côte atlantique"),
        },
      ],
    },
    impact: {
      eyebrow: localized("OUR IMPACT", "NOTRE ENGAGEMENT"),
      title: [
        localized("A Growing Community", "Une communauté"),
        localized("of Ocean Lovers", "réunie par l'océan"),
      ],
      description: localized(
        "Our mission is to share the ocean, Moroccan culture and create memorable experiences together.",
        "Notre mission : partager l'océan et la culture marocaine pour créer ensemble des expériences mémorables.",
      ),
      cta: localized("Discover Taghazout With Us", "Découvrir Taghazout avec nous"),
      image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2200&q=88",
      highlights: [
        { title: localized("Local roots", "Ancrés localement"), detail: localized("Inspired by Taghazout", "Inspirés par Taghazout") },
        { title: localized("Ocean first", "L'océan d'abord"), detail: localized("Connected to the Atlantic", "Au bord de l'Atlantique") },
        { title: localized("More to discover", "À découvrir"), detail: localized("Surf, culture, and adventure", "Surf, culture et aventure") },
      ],
    },
  },
  team: {
    localCrew: localized("LOCAL CREW", "ÉQUIPE LOCALE"),
    eyebrow: translated("The people behind it"),
    titleLead: translated("Meet the"),
    titleAccent: translated("team."),
    summary: translated("Three people, one local perspective. Get to know the team behind your Taghazout experience."),
    outroLabel: localized("TEAM · TAGHAZOUT", "ÉQUIPE · TAGHAZOUT"),
    outro: translated("Good journeys start with good people."),
    members: [
      {
        id: "team-ali",
        name: "Ali",
        role: localized("Chief Executive Officer", "Directeur général"),
        detail: localized("Leading the team and shaping thoughtful journeys in Taghazout.", "À la tête de l'équipe, il imagine des séjours attentionnés à Taghazout."),
        image: "/team/ali.png",
        imageAlt: localized("Ali, Chief Executive Officer", "Ali, directeur général"),
      },
      {
        id: "team-skorola",
        name: "Skorola",
        role: localized("Head of Marketing", "Responsable marketing"),
        detail: localized("Sharing the people, places, and experiences that make Taghazout special.", "Elle partage les personnes, les lieux et les expériences qui rendent Taghazout unique."),
        image: "/team/skorola.png",
        imageAlt: localized("Skorola, Head of Marketing", "Skorola, responsable marketing"),
      },
      {
        id: "team-srikisa",
        name: "Srikisa",
        role: localized("Surf Guide", "Guide de surf"),
        detail: localized("Guiding guests through the local surf experience and out to the waves.", "Il accompagne les voyageurs dans leurs expériences de surf et les mène jusqu'aux vagues."),
        image: "/team/skirisa.png",
        imageAlt: localized("Srikisa, Surf Guide", "Srikisa, guide de surf"),
      },
    ],
  },
  oceanLog: {
    eyebrow: translated("OUR BLOG"),
    titleLead: translated("Stories for"),
    titleBridge: translated("the"),
    titleAccent: translated("Road"),
    description: translated("Travel tips, destination guides, and insider advice to make your journey even better."),
    button: translated("Explore All Articles"),
    signature: translated("Let's explore together"),
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeLocalized(value: unknown, fallback: LocalizedText): LocalizedText {
  if (!isRecord(value)) return fallback;
  return {
    en: typeof value.en === "string" ? value.en : fallback.en,
    fr: typeof value.fr === "string" ? value.fr : fallback.fr,
  };
}

function normalizeImage(value: unknown, fallback: string): string {
  return typeof value === "string" && value ? value : fallback;
}

export function normalizeHomepageSectionsSettings(value: unknown): HomepageSectionsSettings {
  if (!isRecord(value)) return defaultHomepageSectionsSettings;
  const about = isRecord(value.about) ? value.about : {};
  const hero = isRecord(about.hero) ? about.hero : {};
  const impact = isRecord(about.impact) ? about.impact : {};
  const team = isRecord(value.team) ? value.team : {};
  const oceanLog = isRecord(value.oceanLog) ? value.oceanLog : {};
  const heroImages = Array.isArray(hero.images) ? hero.images : [];
  const impactTitle = Array.isArray(impact.title) ? impact.title : [];
  const highlights = Array.isArray(impact.highlights) ? impact.highlights : [];
  const members = Array.isArray(team.members) ? team.members : null;

  return {
    about: {
      hero: {
        eyebrow: normalizeLocalized(hero.eyebrow, defaultHomepageSectionsSettings.about.hero.eyebrow),
        titleLead: normalizeLocalized(hero.titleLead, defaultHomepageSectionsSettings.about.hero.titleLead),
        titleAccent: normalizeLocalized(hero.titleAccent, defaultHomepageSectionsSettings.about.hero.titleAccent),
        introduction: normalizeLocalized(hero.introduction, defaultHomepageSectionsSettings.about.hero.introduction),
        discoverStory: normalizeLocalized(hero.discoverStory, defaultHomepageSectionsSettings.about.hero.discoverStory),
        signature: normalizeLocalized(hero.signature, defaultHomepageSectionsSettings.about.hero.signature),
        images: defaultHomepageSectionsSettings.about.hero.images.map((fallback, index) => {
          const entry = isRecord(heroImages[index]) ? heroImages[index] : {};
          return {
            image: normalizeImage(entry.image, fallback.image),
            alt: normalizeLocalized(entry.alt, fallback.alt),
          };
        }),
      },
      impact: {
        eyebrow: normalizeLocalized(impact.eyebrow, defaultHomepageSectionsSettings.about.impact.eyebrow),
        title: defaultHomepageSectionsSettings.about.impact.title.map((fallback, index) => normalizeLocalized(impactTitle[index], fallback)),
        description: normalizeLocalized(impact.description, defaultHomepageSectionsSettings.about.impact.description),
        cta: normalizeLocalized(impact.cta, defaultHomepageSectionsSettings.about.impact.cta),
        image: normalizeImage(impact.image, defaultHomepageSectionsSettings.about.impact.image),
        highlights: defaultHomepageSectionsSettings.about.impact.highlights.map((fallback, index) => {
          const entry = isRecord(highlights[index]) ? highlights[index] : {};
          return {
            title: normalizeLocalized(entry.title, fallback.title),
            detail: normalizeLocalized(entry.detail, fallback.detail),
          };
        }),
      },
    },
    team: {
      localCrew: normalizeLocalized(team.localCrew, defaultHomepageSectionsSettings.team.localCrew),
      eyebrow: normalizeLocalized(team.eyebrow, defaultHomepageSectionsSettings.team.eyebrow),
      titleLead: normalizeLocalized(team.titleLead, defaultHomepageSectionsSettings.team.titleLead),
      titleAccent: normalizeLocalized(team.titleAccent, defaultHomepageSectionsSettings.team.titleAccent),
      summary: normalizeLocalized(team.summary, defaultHomepageSectionsSettings.team.summary),
      outroLabel: normalizeLocalized(team.outroLabel, defaultHomepageSectionsSettings.team.outroLabel),
      outro: normalizeLocalized(team.outro, defaultHomepageSectionsSettings.team.outro),
      members: members === null
        ? defaultHomepageSectionsSettings.team.members
        : members.filter(isRecord).flatMap((member) => {
            if (typeof member.id !== "string" || typeof member.name !== "string" || typeof member.image !== "string") return [];
            const fallback = defaultHomepageSectionsSettings.team.members[0];
            return [{
              id: member.id,
              name: member.name,
              role: normalizeLocalized(member.role, fallback.role),
              detail: normalizeLocalized(member.detail, fallback.detail),
              image: member.image,
              imageAlt: normalizeLocalized(member.imageAlt, { en: `${member.name}, ${fallback.role.en}`, fr: `${member.name}, ${fallback.role.fr}` }),
            }];
          }),
    },
    oceanLog: {
      eyebrow: normalizeLocalized(oceanLog.eyebrow, defaultHomepageSectionsSettings.oceanLog.eyebrow),
      titleLead: normalizeLocalized(oceanLog.titleLead, defaultHomepageSectionsSettings.oceanLog.titleLead),
      titleBridge: normalizeLocalized(oceanLog.titleBridge, defaultHomepageSectionsSettings.oceanLog.titleBridge),
      titleAccent: normalizeLocalized(oceanLog.titleAccent, defaultHomepageSectionsSettings.oceanLog.titleAccent),
      description: normalizeLocalized(oceanLog.description, defaultHomepageSectionsSettings.oceanLog.description),
      button: normalizeLocalized(oceanLog.button, defaultHomepageSectionsSettings.oceanLog.button),
      signature: normalizeLocalized(oceanLog.signature, defaultHomepageSectionsSettings.oceanLog.signature),
    },
  };
}

export function getLocalizedText(value: LocalizedText, locale: Locale) {
  return value[locale];
}