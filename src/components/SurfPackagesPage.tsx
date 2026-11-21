"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Nav from "./Nav";
import SiteFooter from "./SiteFooter";
import { useLocale } from "./LocaleProvider";

const packages = {
  en: [
    {
      title: "Surf & Yoga Retreat",
      days: "7 Days",
      description: "Surf, relax and recharge in paradise.",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=85",
      alt: "A quiet yoga practice by the Atlantic at sunset",
      includes: ["Surf sessions", "Yoga sessions", "Accommodation", "Breakfast"],
      capacity: "Up to 12 People",
      price: "€499",
      popular: false,
    },
    {
      title: "Six-Day Surf Package",
      days: "6 Days",
      description: "Improve your surfing skills with six days of surf experiences.",
      image: "https://images.unsplash.com/photo-1455729552865-3658a5d39692?auto=format&fit=crop&w=1000&q=85",
      alt: "A surfer riding an Atlantic wave",
      includes: ["Six-day surf experience", "Professional surf coaching", "Equipment", "Accommodation"],
      capacity: "Up to 14 People",
      price: "€699",
      popular: true,
    },
    {
      title: "Surf Coaching Package",
      days: "7 Days",
      description: "Take your surfing to the next level with personalized coaching.",
      image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1000&q=85",
      alt: "Surfers carrying their boards to the water",
      includes: ["Personalized coaching", "Surf equipment", "Video analysis", "Skill development"],
      capacity: "Up to 10 People",
      price: "€899",
      popular: false,
    },
    {
      title: "Custom Surf Escape",
      days: "Flexible",
      description: "A tailored stay shaped around your dates, goals and pace.",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85",
      alt: "Open Atlantic coastline and waves in Morocco",
      includes: ["Surf sessions", "Local surf guidance", "Flexible coaching", "Stay options"],
      capacity: "Flexible group sizes",
      price: "On request",
      popular: false,
    },
  ],
  fr: [
    {
      title: "Retraite Surf & Yoga",
      days: "7 jours",
      description: "Surfez, détendez-vous et ressourcez-vous au bord de l’océan.",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=85",
      alt: "Une séance de yoga paisible au bord de l’Atlantique au coucher du soleil",
      includes: ["Sessions de surf", "Séances de yoga", "Hébergement", "Petit-déjeuner"],
      capacity: "Jusqu’à 12 personnes",
      price: "499 €",
      popular: false,
    },
    {
      title: "Séjour Surf de Six Jours",
      days: "6 jours",
      description: "Progressez avec six jours d’expériences de surf.",
      image: "https://images.unsplash.com/photo-1455729552865-3658a5d39692?auto=format&fit=crop&w=1000&q=85",
      alt: "Un surfeur sur une vague de l’Atlantique",
      includes: ["Six jours de surf", "Coaching professionnel", "Équipement", "Hébergement"],
      capacity: "Jusqu’à 14 personnes",
      price: "699 €",
      popular: true,
    },
    {
      title: "Formule Coaching Surf",
      days: "7 jours",
      description: "Passez au niveau supérieur avec un coaching personnalisé.",
      image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1000&q=85",
      alt: "Des surfeurs qui portent leurs planches vers l’océan",
      includes: ["Coaching personnalisé", "Matériel de surf", "Analyse vidéo", "Progression technique"],
      capacity: "Jusqu’à 10 personnes",
      price: "899 €",
      popular: false,
    },
    {
      title: "Séjour Surf Sur Mesure",
      days: "Flexible",
      description: "Un séjour adapté à vos dates, vos objectifs et votre rythme.",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85",
      alt: "Côte atlantique et vagues au Maroc",
      includes: ["Sessions de surf", "Conseils de surf locaux", "Coaching flexible", "Options d’hébergement"],
      capacity: "Groupes flexibles",
      price: "Sur demande",
      popular: false,
    },
  ],
} as const;

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

export default function SurfPackagesPage() {
  const { locale } = useLocale();
  const french = locale === "fr";
  const pageRef = useRef<HTMLDivElement>(null);

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
              {packages[locale].map((item) => (
                <article className={`surf-offer-card${item.popular ? " surf-offer-card--featured" : ""}`} data-reveal key={item.title}>
                  <div className="surf-offer-card__image">
                    <img src={item.image} alt={item.alt} loading="lazy" />
                    <span className="surf-offer-card__days"><span aria-hidden="true">◷</span>{item.days}</span>
                    {item.popular && <span className="surf-offer-card__popular"><span aria-hidden="true">★</span>{french ? "LE PLUS POPULAIRE" : "MOST POPULAR"}</span>}
                  </div>
                  <div className="surf-offer-card__body">
                    <h3>{item.title}</h3>
                    <p className="surf-offer-card__description">{item.description}</p>
                    <ul>{item.includes.map((feature) => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}</ul>
                    <div className="surf-offer-card__capacity"><RoundIcon kind="people" /><span>{item.capacity}</span></div>
                    <div className={`surf-offer-card__price${item.price === "On request" || item.price === "Sur demande" ? " surf-offer-card__price--quote" : ""}`}>
                      <span>{item.price === "On request" || item.price === "Sur demande" ? (french ? "Tarif" : "Price") : (french ? "À partir de" : "From")}</span>
                      <strong>{item.price}</strong>
                      {item.price !== "On request" && item.price !== "Sur demande" && <span>{french ? "/ personne" : "/ person"}</span>}
                    </div>
                    <Link className="surf-button surf-button--deep" href="/#contact">{item.price === "On request" || item.price === "Sur demande" ? (french ? "PERSONNALISER LE SÉJOUR" : "Plan Your Stay") : (french ? "CHOISIR CE SÉJOUR" : "Choose Package")}<span aria-hidden="true">→</span></Link>
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
            <Link className="surf-button surf-button--light" href="/#contact">{french ? "PRÉPARER VOTRE AVENTURE" : "PLAN YOUR ADVENTURE"}<span aria-hidden="true">→</span></Link>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}