"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Locale } from "../i18n";
import type { HeroPresentationSettings } from "../hero-presentation";

type HeroCard = {
  title: string;
  description: string;
  image: string;
  href: string;
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

export default function HeroPresentation({ locale, settings }: { locale: Locale; settings: HeroPresentationSettings }) {
  const sectionRef = useRef<HTMLElement>(null);

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
  const cards: HeroCard[] = settings.cards.map((card) => ({
    title: card.title[locale],
    description: card.description[locale],
    image: card.image,
    icon: card.icon,
    href: card.href,
  }));

  return (
    <section id="ocean-experience" ref={sectionRef} className="hero-presentation">
      <div className="hero-presentation__backdrop is-visible" aria-hidden="true" />
      <div className="hero-presentation__overlay" aria-hidden="true" />
      <div className="hero-presentation__content">
        <div className="hero-presentation__copy" data-reveal>
          <p className="hero-presentation__kicker">{settings.kicker[locale]} <span>{settings.coordinates}</span></p>
          <h1>{settings.title[locale]}</h1>
          <p className="hero-presentation__subtitle">
            <span className="hero-presentation__subtitle-full">{settings.subtitle[locale]}</span>
            <span className="hero-presentation__subtitle-mobile">{settings.mobileSubtitle[locale]}</span>
          </p>
          <div className="hero-presentation__actions">
            <Link href={settings.primaryAction.href} className="hero-presentation__button hero-presentation__button--primary">{settings.primaryAction.label[locale]}<span>↘</span></Link>
            <Link href={settings.secondaryAction.href} className="hero-presentation__button">{settings.secondaryAction.label[locale]}<span>↗</span></Link>
          </div>
        </div>

        <div className="hero-presentation__cards" data-stagger>
          {cards.map((card, index) => (
            <Link
              href={card.href}
              className="hero-presentation__card"
              data-card
              key={card.href}
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
