import Image from "next/image";
import Link from "next/link";
import type { Locale } from "../i18n";

const copy = {
  en: {
    eyebrow: "THE LOCAL EDGE",
    location: "TAGHAZOUT · MOROCCO",
    imageAlt: "A surfer riding an Atlantic wave",
    heading: "Better surf, rooted locally.",
    features: [
      { title: "Lessons for every level", detail: "Group and private sessions, from first wave to your next step." },
      { title: "Local spot guidance", detail: "Get to know the coastline with people who know it best." },
      { title: "Surf days your way", detail: "Bring lessons, coaching, and slower days together." },
    ],
    action: "Explore surf experiences",
  },
  fr: {
    eyebrow: "L'AVANTAGE LOCAL",
    location: "TAGHAZOUT · MAROC",
    imageAlt: "Un surfeur prend une vague de l'Atlantique",
    heading: "Le surf, ancré dans la région.",
    features: [
      { title: "Des cours pour tous les niveaux", detail: "En groupe ou en privé, de la première vague à la prochaine étape." },
      { title: "Des conseils sur les spots", detail: "Découvrez la côte avec celles et ceux qui la connaissent le mieux." },
      { title: "Le surf à votre façon", detail: "Associez cours, coaching et journées plus tranquilles." },
    ],
    action: "Découvrir les expériences surf",
  },
} as const;

export default function WhyChooseUs({ locale }: { locale: Locale }) {
  const text = copy[locale];
  return (
    <section id="why-us" className="surf-why" aria-labelledby="surf-why-title">
      <div className="surf-why__inner">
        <article className="surf-why__card" data-reveal>
          <div className="surf-why__visual">
            <Image
              src="https://images.unsplash.com/photo-1455729552865-3658a5d39692?auto=format&fit=crop&w=1400&q=88"
              alt={text.imageAlt}
              fill
              sizes="(max-width: 760px) 100vw, 50vw"
              className="surf-why__photo"
              loading="lazy"
            />
            <span className="surf-why__shade" aria-hidden="true" />
          </div>
          <div className="surf-why__content">
            <div className="surf-why__heading">
              <p className="surf-why__eyebrow">{text.eyebrow}</p>
              <h2 id="surf-why-title">{text.heading}</h2>
            </div>
            <ul className="surf-why__features" aria-label={text.location}>
              {text.features.map((feature, index) => (
                <li key={feature.title}>
                  <span className="surf-why__number">0{index + 1}</span>
                  <span className="surf-why__feature-copy">
                    <strong>{feature.title}</strong>
                    <span>{feature.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/activities" className="surf-why__action">
              {text.action}<span aria-hidden="true">→</span>
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
