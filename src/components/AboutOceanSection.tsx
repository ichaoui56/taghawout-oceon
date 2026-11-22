import Image from "next/image";
import Link from "next/link";
import type { Locale } from "../i18n";

type AboutIconName = "wave" | "board" | "coach" | "compass" | "mountain" | "pin" | "star";

function AboutIcon({ name }: { name: AboutIconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      {name === "wave" && <path d="M3 16c2.4 0 2.4-3 4.8-3s2.4 3 4.8 3 2.4-3 4.8-3 2.4 3 4.8 3M3 20c2.4 0 2.4-2 4.8-2s2.4 2 4.8 2 2.4-2 4.8-2 2.4 2 4.8 2M4 10c1.4-3.5 4-5.5 7.5-5.5 2.4 0 4.4 1 5.8 2.9" />}
      {name === "board" && <><path d="M12 3c2.2 2.7 4 6.7 4 10.2a4 4 0 1 1-8 0C8 9.7 9.8 5.7 12 3Z" /><path d="M10.4 13.5h3.2M12 14v4" /></>}
      {name === "coach" && <><path d="M4 19V9m5 10V5m6 14v-7m5 7V8" /><path d="m3 6 6-3 6 4 6-3" /></>}
      {name === "compass" && <><circle cx="12" cy="12" r="9" /><path d="m15.8 8.2-2.2 5.4-5.4 2.2 2.2-5.4 5.4-2.2Z" /></>}
      {name === "mountain" && <><path d="m3 19 6.5-11 3.2 5.2 2.2-3.4L21 19H3Z" /><path d="m8 11 1.5 1.4L11 11m3.7 1.1 1.1 1.2 1.2-1.2" /></>}
      {name === "pin" && <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.2" /></>}
      {name === "star" && <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />}
    </svg>
  );
}

const text = {
  en: {
    eyebrow: "ABOUT TAGHAZOUT OCEAN",
    titleLead: "More Than a Surf Trip.",
    titleAccent: "A True Ocean Experience.",
    introduction: "Born from a love of the Atlantic, Taghazout Ocean connects visitors with the waves, culture and people of Morocco's coastline.",
    discoverStory: "Discover Our Story",
    signature: "Surf · Explore · Relax",
    storyEyebrow: "OUR STORY",
    storyTitle: "A Local Dream with a Global Vision",
    beginningTitle: "Our Beginning",
    beginning: "A local passion for surfing and the Atlantic coastline inspired us to share the magic of Taghazout with the world.",
    beginningImageAlt: "The Moroccan coastline near Taghazout",
    journeyTitle: "Our Journey",
    journey: [
      "A love for the ocean",
      "Sharing the waves",
      "Growing together",
      "Looking ahead",
    ],
    whatTitle: "What We Do",
    services: [
      "Surf Lessons",
      "Surf Packages",
      "Surf Coaching",
      "Travel Experiences",
      "Local Adventures",
    ],
    impactEyebrow: "OUR IMPACT",
    impactTitle: ["A Growing Community", "of Ocean Lovers"],
    impactDescription: "Our mission is to share the ocean, Moroccan culture and create memorable experiences together.",
    highlights: [
      ["Local roots", "Inspired by Taghazout"],
      ["Ocean first", "Connected to the Atlantic"],
      ["More to discover", "Surf, culture, and adventure"],
    ],
    cta: "Discover Taghazout With Us",
    lessons: "Surf lessons",
    packages: "Surf packages",
    activities: "Local activities",
    surferAlt: "A surfer riding a powerful Atlantic wave",
    coastAlt: "The Atlantic coastline near Taghazout, Morocco",
    groupAlt: "A surf session shared on the Atlantic coast",
  },
  fr: {
    eyebrow: "À PROPOS DE TAGHAZOUT OCEAN",
    titleLead: "Bien plus qu'un séjour de surf.",
    titleAccent: "Une véritable expérience océanique.",
    introduction: "Bienvenue chez Taghazout Ocean, où l'esprit du surf rencontre la beauté de la côte atlantique marocaine. Nous partageons avec passion la magie de Taghazout à travers des expériences de surf inoubliables, des aventures locales et une hospitalité marocaine authentique.",
    discoverStory: "Découvrir notre histoire",
    signature: "Surfer · Explorer · Se détendre",
    storyEyebrow: "NOTRE HISTOIRE",
    storyTitle: "Un rêve local tourné vers le monde",
    beginningTitle: "Nos débuts",
    beginning: "Une passion locale pour le surf et la côte atlantique nous a donné envie de partager la magie de Taghazout avec le monde.",
    beginningImageAlt: "Le littoral marocain près de Taghazout",
    journeyTitle: "Notre parcours",
    journey: [
      "L'amour de l'océan",
      "Partager les vagues",
      "Grandir ensemble",
      "Voir plus loin",
    ],
    whatTitle: "Nos activités",
    services: [
      "Cours de surf",
      "Séjours surf",
      "Coaching surf",
      "Expériences locales",
      "Aventures locales",
    ],
    impactEyebrow: "NOTRE ENGAGEMENT",
    impactTitle: ["Une communauté", "réunie par l'océan"],
    impactDescription: "Notre mission : partager l'océan et la culture marocaine pour créer ensemble des expériences mémorables.",
    highlights: [
      ["Ancrés localement", "Inspirés par Taghazout"],
      ["L'océan d'abord", "Au bord de l'Atlantique"],
      ["À découvrir", "Surf, culture et aventure"],
    ],
    cta: "Découvrir Taghazout avec nous",
    lessons: "Cours de surf",
    packages: "Séjours surf",
    activities: "Activités locales",
    surferAlt: "Un surfeur glisse sur une puissante vague de l'Atlantique",
    coastAlt: "Le littoral atlantique près de Taghazout, au Maroc",
    groupAlt: "Une session de surf partagée sur la côte atlantique",
  },
} as const;

export default function AboutOceanSection({ locale }: { locale: Locale }) {
  const copy = text[locale];

  return (
    <div id="about-ocean" className="about-ocean">
      <section id="about" className="about-ocean__hero" aria-labelledby="about-ocean-title">
        <div className="about-ocean__hero-inner">
          <div className="about-ocean__intro" data-reveal>
            <p className="about-ocean__eyebrow"><span>{copy.eyebrow}</span><i aria-hidden="true" /></p>
            <h2 id="about-ocean-title">{copy.titleLead} <em>{copy.titleAccent}</em></h2>
            <p className="about-ocean__lead">{copy.introduction}</p>
            <Link href="#our-story" className="about-ocean__button">
              {copy.discoverStory}<span aria-hidden="true">→</span>
            </Link>
            <p className="about-ocean__signature">{copy.signature}</p>
          </div>

          <div className="about-ocean__visual" data-reveal>
            <figure className="about-ocean__surfer">
              <Image
                src="https://images.unsplash.com/photo-1455729552865-3658a5d39692?auto=format&fit=crop&w=1600&q=88"
                alt={copy.surferAlt}
                fill
                sizes="(max-width: 720px) 100vw, 55vw"
                loading="lazy"
              />
            </figure>
            <figure className="about-ocean__postcard about-ocean__postcard--coast">
              <Image src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=86" alt={copy.coastAlt} fill sizes="(max-width: 720px) 42vw, 20vw" loading="lazy" />
            </figure>
            <figure className="about-ocean__postcard about-ocean__postcard--crew">
              <Image
                src="https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=85"
                alt={copy.groupAlt}
                fill
                sizes="(max-width: 720px) 44vw, 22vw"
                loading="lazy"
              />
            </figure>
            <span className="about-ocean__visual-note" aria-hidden="true"><AboutIcon name="wave" /></span>
          </div>
        </div>
        
      </section>

      <section id="ocean-impact" className="about-ocean__impact" aria-labelledby="about-ocean-impact-title">
        
        <Image
          className="about-ocean__impact-image"
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2200&q=88"
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
        />
        <div className="about-ocean__impact-inner">
          <div className="about-ocean__impact-copy" data-reveal>
            <p className="about-ocean__eyebrow"><span>{copy.impactEyebrow}</span><i aria-hidden="true" /></p>
            <h2 id="about-ocean-impact-title">{copy.impactTitle.map((line) => <span key={line}>{line}</span>)}</h2>
            <p>{copy.impactDescription}</p>
            <Link href="/activities" className="about-ocean__button about-ocean__button--light">
              {copy.cta}<span aria-hidden="true">→</span>
            </Link>
          </div>

          <ul className="about-ocean__highlights" data-stagger>
            {copy.highlights.map(([title, detail], index) => {
              const icons: AboutIconName[] = ["pin", "wave", "star"];
              return (
                <li key={title} data-card>
                  <span className="about-ocean__highlight-icon"><AboutIcon name={icons[index]} /></span>
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </li>
              );
            })}
          </ul>

        </div>
        <svg className="about-ocean__impact-wave about-ocean__impact-wave--bottom" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 44c166 46 281-14 451 2 203 20 263 64 468 29 194-33 316-15 521 10v35H0Z" fill="#08b5de" />
          <path d="M0 71c176 39 265-19 446 0 210 22 302 48 488 17 194-32 303-6 506 8v24H0Z" fill="#F5FAFC" />
        </svg>
      </section>
    </div>
  );
}