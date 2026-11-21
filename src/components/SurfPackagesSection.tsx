import Link from "next/link";
import type { Locale } from "../i18n";

const packages = {
  en: [
    {
      number: "01",
      title: "SURF & YOGA PACKAGE",
      description: "Surfing and yoga experiences shaped for a slower, more balanced stay.",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=88",
      alt: "A quiet yoga practice by the Atlantic at sunset",
    },
    {
      number: "02",
      title: "SIX-DAY SURF PACKAGE IN TAMRAGHT",
      description: "Six days to settle into the rhythm of Morocco's surf coast.",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=88",
      alt: "Waves rolling toward a Moroccan Atlantic beach",
    },
    {
      number: "03",
      title: "SURF COACHING PACKAGE",
      description: "Dedicated coaching to help you focus on your next step in the water.",
      image: "https://images.unsplash.com/photo-1455729552865-3658a5d39692?auto=format&fit=crop&w=1100&q=88",
      alt: "Surfers practicing together in the ocean",
    },
  ],
  fr: [
    {
      number: "01",
      title: "FORMULE SURF & YOGA",
      description: "Surf et yoga pour un séjour plus calme et équilibré.",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=88",
      alt: "Une séance de yoga au bord de l'Atlantique au coucher du soleil",
    },
    {
      number: "02",
      title: "SÉJOUR SURF DE SIX JOURS À TAMRAGHT",
      description: "Six jours pour prendre le rythme de la côte surf marocaine.",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=88",
      alt: "Des vagues sur une plage de la côte atlantique marocaine",
    },
    {
      number: "03",
      title: "FORMULE COACHING SURF",
      description: "Un coaching dédié pour vous concentrer sur votre progression.",
      image: "https://images.unsplash.com/photo-1455729552865-3658a5d39692?auto=format&fit=crop&w=1100&q=88",
      alt: "Des surfeurs qui s'entraînent ensemble dans l'océan",
    },
  ],
} as const;

const copy = {
  en: {
    eyebrow: "THE ATLANTIC, YOUR WAY",
    heading: "FIND YOUR PERFECT SURF PACKAGE",
    description: "Discover our surf holidays, carefully designed to combine surfing, relaxation, coaching, and unforgettable Moroccan experiences.",
    explore: "Explore package",
    viewAll: "VIEW ALL SURF PACKAGES",
  },
  fr: {
    eyebrow: "L'ATLANTIQUE, À VOTRE RYTHME",
    heading: "TROUVEZ VOTRE SÉJOUR SURF IDÉAL",
    description: "Découvrez nos séjours surf, pensés pour mêler surf, détente, coaching et expériences marocaines inoubliables.",
    explore: "Découvrir la formule",
    viewAll: "VOIR TOUS LES SÉJOURS SURF",
  },
} as const;

export default function SurfPackagesSection({ locale }: { locale: Locale }) {
  const text = copy[locale];

  return (
    <section id="surf-packages" className="service-section surf-packages" aria-labelledby="surf-packages-title">
      <div className="service-section__inner">
        <div className="surf-packages__layout">
          <header className="surf-packages__intro" data-reveal>
            <p className="service-section__eyebrow">{text.eyebrow}</p>
            <h2 id="surf-packages-title">{text.heading}</h2>
            <p>{text.description}</p>
            <Link href="/activities" className="service-section__button">
              {text.viewAll} <span aria-hidden="true">→</span>
            </Link>
          </header>

          <div className="surf-packages__grid" data-stagger>
            {packages[locale].map((item, index) => (
              <article className={`surf-package-card surf-package-card--${index + 1}`} key={item.number} data-card>
                <img src={item.image} alt={item.alt} loading={index === 0 ? "eager" : "lazy"} />
                <div className="surf-package-card__shade" />
                <div className="surf-package-card__content">
                  <span className="surf-package-card__number">{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <Link href="/activities" className="surf-package-card__link">
                    {text.explore} <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
