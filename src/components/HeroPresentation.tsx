"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Locale } from "../i18n";

const copy = {
  en: {
    title: "FIND YOUR RHYTHM IN THE ATLANTIC.",
    subtitle: "Discover the magic of Morocco’s Atlantic coast with Taghazout Ocean. From unforgettable surf holidays and professional surf lessons to exciting outdoor adventures, experience everything the ocean and its surroundings have to offer.",
    mobileSubtitle: "Surf holidays, professional lessons, and outdoor adventures on Morocco’s Atlantic coast.",
    explore: "EXPLORE OUR EXPERIENCES",
    contact: "CONTACT US",
  },
  fr: {
    title: "TROUVEZ VOTRE RYTHME SUR L’ATLANTIQUE.",
    subtitle: "Découvrez la magie de la côte Atlantique marocaine avec Taghazout Ocean. Des séjours surf inoubliables et cours de surf aux aventures en plein air, vivez tout ce que l’océan et ses environs ont à offrir.",
    mobileSubtitle: "Séjours surf, cours et aventures en plein air sur la côte Atlantique marocaine.",
    explore: "EXPLORER NOS EXPÉRIENCES",
    contact: "NOUS CONTACTER",
  },
} as const;

type HeroCard = {
  key: string;
  title: string;
  description: string;
  image: string;
  icon: "wave" | "lesson" | "mountain";
};

function HeroCardIcon({ icon }: { icon: HeroCard["icon"] }) {
  if (icon === "mountain") {
    return (
      <svg viewBox="0 0 48 32" aria-hidden="true" focusable="false">
        <path d="m3 28 13-21 10 16 6-10 13 15M12 13l4-6 4 6m7 8 5-8 5 7" />
      </svg>
    );
  }

  if (icon === "lesson") {
    return (
      <svg viewBox="0 0 48 32" aria-hidden="true" focusable="false">
        <path d="M4 25c4-5 8-5 12 0s8 5 12 0 8-5 16 0M24 3c-4 4-6 9-6 15s2 9 6 12c4-3 6-7 6-12S28 7 24 3Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 32" aria-hidden="true" focusable="false">
      <path d="M3 20c4-6 8-6 12 0s8 6 12 0 8-6 12 0 5 6 7 2M8 28h32" />
    </svg>
  );
}

export default function HeroPresentation({ locale }: { locale: Locale }) {
  const sectionRef = useRef<HTMLElement>(null);
  const c = copy[locale];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const backdrop = section.querySelector<HTMLElement>(".hero-presentation__backdrop");
    if (!backdrop) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        backdrop.classList.toggle("is-visible", entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  const cards: HeroCard[] = locale === "fr"
    ? [
        { key: "Surf Holidays", title: "Séjours surf", description: "Découvrez nos expériences surf : retraites Surf & Yoga, séjours de six jours et coaching dédié.", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=86", icon: "wave" },
        { key: "Learn to Surf", title: "Cours de surf", description: "Débutant ou envie de progresser ? Cours en groupe, sessions privées et accompagnement.", image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=86", icon: "lesson" },
        { key: "Explore & Adventure", title: "Activités & aventures", description: "Balade à dos de chameau, Paradise Valley, quad, cheval et autres expériences outdoor.", image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=86", icon: "mountain" },
      ]
    : [
        { key: "Surf Holidays", title: "Surf holidays", description: "Surf & Yoga retreats, six-day stays in Tamraght, and dedicated surf coaching.", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=86", icon: "wave" },
        { key: "Learn to Surf", title: "Surf lessons", description: "Group lessons, private sessions, and guidance for every level in the water.", image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=86", icon: "lesson" },
        { key: "Explore & Adventure", title: "Activities & adventures", description: "Camel rides, Paradise Valley, quad biking, horse riding, and more.", image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=86", icon: "mountain" },
      ];

  return (
    <section id="ocean-experience" ref={sectionRef} className="hero-presentation">
      <div className="hero-presentation__backdrop is-visible" aria-hidden="true" />
      <div className="hero-presentation__overlay" aria-hidden="true" />
      <div className="hero-presentation__content">
        <div className="hero-presentation__copy" data-reveal>
          <p className="hero-presentation__kicker">TAGHAZOUT OCEAN <span>30°43′ N · 9°42′ W</span></p>
          <h1>{c.title}</h1>
          <p className="hero-presentation__subtitle">
            <span className="hero-presentation__subtitle-full">{c.subtitle}</span>
            <span className="hero-presentation__subtitle-mobile">{c.mobileSubtitle}</span>
          </p>
          <div className="hero-presentation__actions">
            <Link href="#world" className="hero-presentation__button hero-presentation__button--primary">{c.explore}<span>↘</span></Link>
            <Link href="#contact" className="hero-presentation__button">{c.contact}<span>↗</span></Link>
          </div>
        </div>

        <div className="hero-presentation__cards" data-stagger>
          {cards.map((card, index) => (
            <Link
              href={index === 0 ? "#surf-packages" : index === 1 ? "#surf-lessons" : "#activities-adventures"}
              className="hero-presentation__card"
              data-card
              key={card.key}
            >
              <img src={card.image} alt="" loading={index === 0 ? "eager" : "lazy"} />
              <span className="hero-presentation__card-content">
                <span className="hero-presentation__card-icon"><HeroCardIcon icon={card.icon} /></span>
                <h2>{card.title}</h2>
                <p>{card.description}</p>
              </span>
              <span className="hero-presentation__card-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
