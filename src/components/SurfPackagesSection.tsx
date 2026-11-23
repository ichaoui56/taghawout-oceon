import Link from "next/link";
import type { Locale } from "../i18n";
import type { SurfPackage } from "../surf-packages";

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

export default function SurfPackagesSection({ locale, packages }: { locale: Locale; packages: SurfPackage[] }) {
  const text = copy[locale];
  const featuredPackages = packages.filter((item) => item.published && item.showOnHomepage).slice(0, 3);

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
            {featuredPackages.map((item, index) => (
              <article className={`surf-package-card surf-package-card--${index + 1}`} key={item.id} data-card>
                <img src={item.image} alt={item.imageAlt[locale]} loading={index === 0 ? "eager" : "lazy"} />
                <div className="surf-package-card__shade" />
                <div className="surf-package-card__content">
                  <span className="surf-package-card__number">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item.title[locale]}</h3>
                  <p>{item.description[locale]}</p>
                  <Link href={`/surf-packages#package-${item.id}`} className="surf-package-card__link">
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
