"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Nav from "./Nav";
import SiteFooter from "./SiteFooter";
import { useLocale } from "./LocaleProvider";
import SurfPackageReservationDialog from "./SurfPackageReservationDialog";
import type { SurfPackage } from "../surf-packages";

const serviceItems = [
  { icon: "people", en: ["PROFESSIONAL SURF INSTRUCTORS", "Learn from experienced instructors."], fr: ["MONITEURS DE SURF", "Apprenez avec des moniteurs expérimentés."] },
  { icon: "board", en: ["SURF EQUIPMENT", "Quality equipment for your sessions."], fr: ["ÉQUIPEMENT DE SURF", "Du matériel de qualité pour vos sessions."] },
  { icon: "home", en: ["COMFORTABLE ACCOMMODATION", "Relax in Taghazout."], fr: ["HÉBERGEMENT CONFORTABLE", "Détendez-vous à Taghazout."] },
  { icon: "wave", en: ["DAILY SURF EXPERIENCES", "Explore the Atlantic waves."], fr: ["EXPÉRIENCES SURF QUOTIDIENNES", "Explorez les vagues de l’Atlantique."] },
  { icon: "cup", en: ["BREAKFAST & LOCAL EXPERIENCES", "Discover Moroccan culture."], fr: ["PETIT-DÉJEUNER & CULTURE LOCALE", "Découvrez la culture marocaine."] },
  { icon: "pin", en: ["SURF SPOT GUIDANCE", "Find the best spots."], fr: ["CONSEILS SUR LES SPOTS", "Trouvez les meilleurs spots."] },
] as const;

function RoundIcon({ kind }: { kind: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {kind === "people" && <><circle cx="9" cy="8" r="3" /><path d="M3.5 20v-1.6a5.5 5.5 0 0 1 11 0V20Zm11.1-9.2a3 3 0 1 0-1.1-5.8m2.8 8.3a4.8 4.8 0 0 1 4.2 4.8V20h-3" /></>}
      {kind === "board" && <><path d="M4 17c3-4 5-7 8-10 3 3 5.5 6 8 10-5 2-11 2-16 0Z" /><path d="M3 21c3-1 5-1 8 0s5 1 10 0" /></>}
      {kind === "home" && <><path d="m3 11 9-7 9 7v9h-6v-6H9v6H3z" /><path d="M9 20v-6h6v6" /></>}
      {kind === "wave" && <><path d="M3 14c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 4 2" /><path d="M3 18c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 4 2" /></>}
      {kind === "cup" && <><path d="M5 8h12v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM17 10h2a2 2 0 0 1 0 4h-2M3 22h17" /><path d="M8 5V3m4 2V3" /></>}
      {kind === "pin" && <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>}
      {kind === "star" && <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" />}
      {kind === "trophy" && <><path d="M8 4h8v5a4 4 0 0 1-8 0Zm4 9v5m-4 2h8m-4-2H8v2m4-2h4v2M8 6H5v2a4 4 0 0 0 4 4m7-6h3v2a4 4 0 0 1-4 4" /></>}
      {kind === "heart" && <path d="M20.8 8.8c0 4.3-8.8 10-8.8 10s-8.8-5.7-8.8-10a4.6 4.6 0 0 1 8.8-1.7 4.6 4.6 0 0 1 8.8 1.7Z" />}
    </svg>
  );
}

function formatPackagePrice(value: number, locale: string) {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function SurfPackagesPage({ packages }: { packages: SurfPackage[] }) {
  const { locale } = useLocale();
  const french = locale === "fr";
  const pageRef = useRef<HTMLDivElement>(null);
  const [selectedPackage, setSelectedPackage] = useState<SurfPackage | null>(null);
  const publishedPackages = packages.filter((item) => item.published);

  useEffect(() => {
    const root = pageRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    const targets = root.querySelectorAll<HTMLElement>("[data-reveal]");
    root.querySelectorAll<HTMLElement>(".surf-offer-card").forEach((card, index) => {
      card.style.setProperty("--reveal-delay", `${index * 100}ms`);
    });
    root.querySelectorAll<HTMLElement>(".surf-service-tile").forEach((tile, index) => {
      tile.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
    });

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });

    root.classList.add("surf-page--motion-ready");
    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      root.classList.remove("surf-page--motion-ready");
    };
  }, []);

  return (
    <div className="surf-page" id="top" ref={pageRef}>
      <Nav />
      <main>
        <section className="surf-hero" aria-labelledby="surf-hero-title">
          <div className="surf-hero__content" data-reveal>
            <p className="surf-eyebrow">{french ? "SÉJOURS SURF À TAGHAZOUT" : "SURF HOLIDAYS IN TAGHAZOUT"}</p>
            <h1 id="surf-hero-title">{french ? <>TROUVEZ VOTRE<br />SÉJOUR SURF IDÉAL</> : <>FIND YOUR PERFECT<br />SURF PACKAGE</>}</h1>
            <p className="surf-hero__description">{french ? "Découvrez des séjours surf inoubliables au Maroc. Entre retraite relaxante et expérience intensive, trouvez la formule idéale pour votre aventure." : "Discover unforgettable surf holidays in Morocco. Whether you're looking for a relaxing surf retreat or an intensive surfing experience, find the perfect package for your adventure."}</p>
            <div className="surf-hero__actions">
              <a className="surf-button surf-button--light" href="#package-cards">{french ? "DÉCOUVRIR LES SÉJOURS" : "EXPLORE PACKAGES"}<span aria-hidden="true">→</span></a>
              <Link className="surf-button surf-button--outline" href="/#contact">{french ? "CONTACTEZ-NOUS" : "CONTACT OUR TEAM"}</Link>
            </div>
          </div>
          <a className="surf-hero__scroll" href="#package-intro" aria-label={french ? "Défiler vers les séjours" : "Scroll to surf packages"}><span>↓</span></a>
        </section>

        <section className="surf-offers" id="package-intro" aria-labelledby="package-intro-title">
          <div className="surf-offers__inner">
            <div className="surf-offers__intro">
              <div className="surf-offers__coast" data-reveal role="img" aria-label={french ? "Vue sur la côte de Taghazout" : "View along the Taghazout coastline"} />
              <div className="surf-section-copy" data-reveal>
                <p className="surf-eyebrow surf-eyebrow--blue">{french ? "L’ATLANTIQUE, À VOTRE RYTHME" : "THE ATLANTIC, YOUR WAY"}</p>
                <h2 id="package-intro-title">{french ? <>VOTRE AVENTURE SURF<br />COMMENCE ICI</> : <>YOUR SURF ADVENTURE<br />STARTS HERE</>}</h2>
                <p>{french ? "Des séjours détente aux expériences de coaching, TAGHAZOUT OCEAN propose un surf adapté à chaque niveau." : "From relaxing retreats and surf holidays to structured coaching experiences, TAGHAZOUT OCEAN offers a variety of surf experiences for every level."}</p>
              </div>
            </div>

            <div className="surf-package-grid" id="package-cards">
              {publishedPackages.map((item) => (
                <article id={`package-${item.id}`} className={`surf-offer-card${item.popular ? " surf-offer-card--featured" : ""}`} data-reveal key={item.id}>
                  <div className="surf-offer-card__image">
                    <img src={item.image} alt={item.imageAlt[locale]} loading="lazy" />
                    <span className="surf-offer-card__days"><span aria-hidden="true">◷</span>{item.duration[locale]}</span>
                    {item.popular && <span className="surf-offer-card__popular"><span aria-hidden="true">★</span>{french ? "LE PLUS POPULAIRE" : "MOST POPULAR"}</span>}
                  </div>
                  <div className="surf-offer-card__body">
                    <h3>{item.title[locale]}</h3>
                    <p className="surf-offer-card__description">{item.description[locale]}</p>
                    <ul>{item.activities.map((activity, index) => <li key={`${item.id}-activity-${index}`}><span aria-hidden="true">✓</span>{activity[locale]}</li>)}</ul>
                    <div className="surf-offer-card__capacity"><RoundIcon kind="people" /><span>{french ? "Prix par personne" : "Price per person"}</span></div>
                    <div className={`surf-offer-card__price${item.pricePerPerson === null ? " surf-offer-card__price--quote" : ""}`}>
                      <span>{french ? "Tarif" : "Price"}</span>
                      <strong>{item.pricePerPerson === null ? (french ? "Prix à définir" : "Price to be set") : formatPackagePrice(item.pricePerPerson, locale)}</strong>
                      {item.pricePerPerson !== null && <span>{french ? "/ personne" : "/ person"}</span>}
                    </div>
                    {item.pricePerPerson === null ? (
                      <button className="surf-button surf-button--deep surf-package-booking-disabled" type="button" disabled>{french ? "TARIF À DÉFINIR" : "PRICE TO BE SET"}</button>
                    ) : item.startTimes.length === 0 ? (
                      <button className="surf-button surf-button--deep surf-package-booking-disabled" type="button" disabled>{french ? "RÉSERVATIONS BIENTÔT OUVERTES" : "RESERVATIONS OPENING SOON"}</button>
                    ) : (
                      <button className="surf-button surf-button--deep" type="button" onClick={() => setSelectedPackage(item)}>{french ? "CHOISIR CE SÉJOUR" : "Choose Package"}<span aria-hidden="true">→</span></button>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <div className="surf-included">
              <h2 data-reveal>{french ? <>TOUT POUR UN SÉJOUR<br />SURF INOUBLIABLE</> : <>EVERYTHING YOU NEED FOR<br />AN UNFORGETTABLE SURF HOLIDAY</>}</h2>
              <div className="surf-services-grid">
                {serviceItems.map((item) => {
                  const [title, body] = item[locale];
                  return <article className="surf-service-tile" data-reveal key={title}><span className="surf-service-tile__icon"><RoundIcon kind={item.icon} /></span><div><h3>{title}</h3><p>{body}</p></div></article>;
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="surf-final-cta" id="contact" aria-labelledby="surf-final-title">
          <div className="surf-final-cta__content" data-reveal>
            <h2 id="surf-final-title">{french ? "VOTRE PROCHAINE AVENTURE SURF VOUS ATTEND" : "YOUR NEXT SURF ADVENTURE IS WAITING"}</h2>
            <p>{french ? "Découvrez le séjour surf idéal et la magie de la côte atlantique marocaine." : "Discover the perfect surf holiday and experience the magic of Morocco’s Atlantic coast."}</p>
            <Link className="surf-button surf-button--light" href="/#contact">{french ? "PRÉPARER VOTRE AVENTURE" : "Explore"}<span aria-hidden="true">→</span></Link>
          </div>
        </section>
      </main>
      {selectedPackage && <SurfPackageReservationDialog packageItem={selectedPackage} locale={locale} onClose={() => setSelectedPackage(null)} />}
      <SiteFooter locale={locale} />
    </div>
  );
}