"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Nav from "./Nav";
import SiteFooter from "./SiteFooter";
import { useLocale } from "./LocaleProvider";

const lessons = [
  {
    number: "01",
    level: { en: "START HERE", fr: "PREMIÈRES VAGUES" },
    title: { en: "Beginner Lesson", fr: "Cours Débutant" },
    duration: { en: "1 Day", fr: "1 jour" },
    description: { en: "Get started with confidence in the waves.", fr: "Prenez confiance et lancez-vous dans les vagues." },
    image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=88",
    alt: { en: "Surfer carrying a board beside the Atlantic", fr: "Surfeur portant une planche au bord de l’Atlantique" },
    includes: { en: ["Surf theory & practice", "Safety instructions", "Equipment included", "Beach support"], fr: ["Théorie et pratique", "Consignes de sécurité", "Équipement inclus", "Accompagnement sur la plage"] },
    capacity: { en: "Up to 8 People", fr: "Jusqu’à 8 personnes" },
    price: "€49",
  },
  {
    number: "02",
    level: { en: "BUILD YOUR FLOW", fr: "GAGNEZ EN AISANCE" },
    title: { en: "Surf Progression", fr: "Progression Surf" },
    duration: { en: "3 Days", fr: "3 jours" },
    description: { en: "Improve your skills with structured lessons.", fr: "Progressez grâce à des cours structurés." },
    image: "https://images.unsplash.com/photo-1455729552865-3658a5d39692?auto=format&fit=crop&w=900&q=88",
    alt: { en: "Surfer practicing on an Atlantic wave", fr: "Surfeur en entraînement sur une vague de l’Atlantique" },
    includes: { en: ["Advanced techniques", "Video analysis", "Equipment included", "Personalized coaching"], fr: ["Techniques avancées", "Analyse vidéo", "Équipement inclus", "Coaching personnalisé"] },
    capacity: { en: "Up to 10 People", fr: "Jusqu’à 10 personnes" },
    price: "€129",
    popular: true,
  },
  {
    number: "03",
    level: { en: "FIND YOUR PACE", fr: "TROUVEZ VOTRE RYTHME" },
    title: { en: "Surf Intensive", fr: "Surf Intensif" },
    duration: { en: "5 Days", fr: "5 jours" },
    description: { en: "Accelerate your progress with intensive training.", fr: "Accélérez vos progrès avec un entraînement intensif." },
    image: "https://images.unsplash.com/photo-1502933691298-84fc14542831?auto=format&fit=crop&w=900&q=88",
    alt: { en: "Surfer training in clear ocean water", fr: "Surfeur en entraînement dans une eau limpide" },
    includes: { en: ["Daily surf lessons", "Personalized coaching", "Video analysis", "Equipment included"], fr: ["Cours de surf quotidiens", "Coaching personnalisé", "Analyse vidéo", "Équipement inclus"] },
    capacity: { en: "Up to 12 People", fr: "Jusqu’à 12 personnes" },
    price: "€199",
  },
  {
    number: "04",
    level: { en: "ONE-TO-ONE", fr: "COURS PRIVÉ" },
    title: { en: "Private Coaching", fr: "Coaching Privé" },
    duration: { en: "Private", fr: "Privé" },
    description: { en: "One-to-one coaching for faster progress.", fr: "Un coaching individuel pour progresser plus vite." },
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=88",
    alt: { en: "A quiet Atlantic beach in Morocco", fr: "Une plage paisible de l’Atlantique au Maroc" },
    includes: { en: ["Personalized lessons", "Focus on your goals", "Video analysis", "Premium equipment"], fr: ["Cours personnalisés", "Vos objectifs au centre", "Analyse vidéo", "Équipement premium"] },
    capacity: { en: "1 Person", fr: "1 personne" },
    price: "€149",
  },
] as const;

const benefits = [
  { icon: "coach", title: { en: "EXPERIENCED INSTRUCTORS", fr: "MONITEURS EXPÉRIMENTÉS" }, copy: { en: "Learn from the best.", fr: "Apprenez avec les meilleurs." } },
  { icon: "board", title: { en: "TOP-QUALITY EQUIPMENT", fr: "ÉQUIPEMENT DE QUALITÉ" }, copy: { en: "Surf with confidence.", fr: "Surfez en confiance." } },
  { icon: "pin", title: { en: "STUNNING LOCATION", fr: "UN CADRE EXCEPTIONNEL" }, copy: { en: "Taghazout, Morocco.", fr: "Taghazout, au Maroc." } },
  { icon: "group", title: { en: "SMALL GROUPS", fr: "PETITS GROUPES" }, copy: { en: "Personalized attention.", fr: "Une attention personnalisée." } },
  { icon: "shield", title: { en: "SAFE ENVIRONMENT", fr: "UN ENVIRONNEMENT SÛR" }, copy: { en: "Surf worry-free.", fr: "Surfez en toute sérénité." } },
  { icon: "heart", title: { en: "UNFORGETTABLE EXPERIENCE", fr: "UNE EXPÉRIENCE UNIQUE" }, copy: { en: "More than just surfing.", fr: "Bien plus que du surf." } },
] as const;

function LessonIcon({ kind }: { kind: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {kind === "coach" && <><circle cx="12" cy="7" r="3" /><path d="M5 21v-2a7 7 0 0 1 14 0v2M4 5l1-2m15 2-1-2" /></>}
      {kind === "board" && <><path d="M4 16c3-4 5-7 8-10 3 3 5.5 6 8 10-5 2-11 2-16 0Z" /><path d="M3 20c3-1 5-1 8 0s5 1 10 0" /></>}
      {kind === "pin" && <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>}
      {kind === "group" && <><circle cx="9" cy="8" r="3" /><path d="M3.5 20v-1.6a5.5 5.5 0 0 1 11 0V20Zm11.1-9.2a3 3 0 1 0-1.1-5.8m2.8 8.3a4.8 4.8 0 0 1 4.2 4.8V20h-3" /></>}
      {kind === "shield" && <><path d="M12 3 20 6v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6Z" /><path d="m9 12 2 2 4-4" /></>}
      {kind === "heart" && <path d="M20.8 8.8c0 4.3-8.8 10-8.8 10s-8.8-5.7-8.8-10a4.6 4.6 0 0 1 8.8-1.7 4.6 4.6 0 0 1 8.8 1.7Z" />}
    </svg>
  );
}

export default function SurfLessonsPage() {
  const { locale } = useLocale();
  const french = locale === "fr";
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = pageRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    const targets = root.querySelectorAll<HTMLElement>("[data-reveal]");
    root.querySelectorAll<HTMLElement>(".lesson-offer-card").forEach((card, index) => {
      card.style.setProperty("--reveal-delay", `${index * 90}ms`);
    });
    root.querySelectorAll<HTMLElement>(".lesson-benefit").forEach((benefit, index) => {
      benefit.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
    });

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });

    root.classList.add("lessons-page--motion-ready");
    targets.forEach((target) => observer.observe(target));
    return () => {
      observer.disconnect();
      root.classList.remove("lessons-page--motion-ready");
    };
  }, []);

  return (
    <div className="lessons-page" id="top" ref={pageRef}>
      <Nav />
      <main>
        <section className="lessons-hero" aria-labelledby="lessons-hero-title">
          <div className="lessons-hero__content" data-reveal>
            <p className="lessons-eyebrow">{french ? "COURS DE SURF À TAGHAZOUT" : "SURF LESSONS IN TAGHAZOUT"}</p>
            <h1 id="lessons-hero-title">{french ? <>APPRENEZ À SURFER<br />AVEC LES MEILLEURS</> : <>LEARN TO SURF<br />WITH THE BEST</>}</h1>
            <p>{french ? "Progressez avec des cours de surf professionnels à Taghazout. Débutant ou confirmé, nos moniteurs sont là pour vous guider." : "Improve your skills with professional surf lessons in Taghazout. From beginner to advanced, our expert instructors are here to guide you."}</p>
            <div className="lessons-hero__actions">
              <a className="lessons-button lessons-button--light" href="#lesson-plans">{french ? "VOIR LES FORMULES" : "VIEW LESSON PLANS"}<span aria-hidden="true">→</span></a>
              <Link className="lessons-button lessons-button--outline" href="/#contact">{french ? "CONTACTEZ-NOUS" : "CONTACT OUR TEAM"}</Link>
            </div>
          </div>
          <a className="lessons-hero__scroll" href="#lesson-intro" aria-label={french ? "Défiler vers les cours" : "Scroll to surf lessons"}><span>↓</span></a>
        </section>

        <section className="lessons-content" id="lesson-intro" aria-labelledby="lesson-intro-title">
          <div className="lessons-content__inner">
            <div className="lessons-intro">
              <div className="lessons-intro__coast" data-reveal role="img" aria-label={french ? "Panorama de la côte de Taghazout" : "Panoramic view of the Taghazout coastline"} />
              <div className="lessons-intro__copy" data-reveal>
                <p className="lessons-eyebrow lessons-eyebrow--blue">{french ? "SURFEZ PLUS. APPRENEZ MIEUX." : "SURF MORE. LEARN MORE."}</p>
                <h2 id="lesson-intro-title">{french ? <>DES COURS<br />POUR TOUS</> : <>LESSONS FOR<br />EVERY LEVEL</>}</h2>
                <p>{french ? "Débutant ou en quête de perfectionnement, nos cours s’adaptent à votre niveau et à votre rythme." : "Whether you're a beginner or looking to perfect your technique, our surf lessons are designed to help you progress at your own pace."}</p>
              </div>
            </div>

            <div className="lesson-plan-grid" id="lesson-plans">
              {lessons.map((lesson) => (
                <article className={`lesson-offer-card${"popular" in lesson && lesson.popular ? " lesson-offer-card--featured" : ""}`} data-reveal key={lesson.number}>
                  <div className="lesson-offer-card__image">
                    <img src={lesson.image} alt={lesson.alt[locale]} loading={lesson.number === "01" ? "eager" : "lazy"} />
                    <span className="lesson-offer-card__duration"><span aria-hidden="true">◷</span>{lesson.duration[locale]}</span>
                    <span className="lesson-offer-card__image-number">{lesson.number}</span>
                  </div>
                  {"popular" in lesson && lesson.popular && <span className="lesson-offer-card__popular"><span aria-hidden="true">★</span>{french ? "LE PLUS POPULAIRE" : "MOST POPULAR"}</span>}
                  <div className="lesson-offer-card__body">
                    <p className="lesson-offer-card__level">{lesson.number}<span />{lesson.level[locale]}</p>
                    <h3>{lesson.title[locale]}</h3>
                    <p className="lesson-offer-card__description">{lesson.description[locale]}</p>
                    <ul>{lesson.includes[locale].map((feature) => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}</ul>
                    <div className="lesson-offer-card__capacity"><LessonIcon kind="group" /><span>{lesson.capacity[locale]}</span></div>
                    <div className="lesson-offer-card__price"><span>{french ? "À partir de" : "From"}</span><strong>{lesson.price}</strong><span>{french ? "/ personne" : "/ person"}</span></div>
                    <Link className="lessons-button lesson-offer-card__button" href="/#contact">{french ? "CHOISIR CE COURS" : "Choose Lesson"}<span aria-hidden="true">→</span></Link>
                  </div>
                </article>
              ))}
            </div>

            <section className="lesson-benefits" id="why-us" aria-labelledby="lesson-benefits-title">
              <h2 id="lesson-benefits-title" data-reveal>{french ? <>POURQUOI CHOISIR<br />TAGHAZOUT OCEAN ?</> : <>WHY CHOOSE<br />TAGHAZOUT OCEAN?</>}</h2>
              <div className="lesson-benefits__grid">
                {benefits.map((benefit) => (
                  <article className="lesson-benefit" data-reveal key={benefit.icon}>
                    <span className="lesson-benefit__icon"><LessonIcon kind={benefit.icon} /></span>
                    <span className="lesson-benefit__copy"><strong>{benefit.title[locale]}</strong><span>{benefit.copy[locale]}</span></span>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="lessons-final-cta" id="contact" aria-labelledby="lessons-final-title">
          <div className="lessons-final-cta__content" data-reveal>
            <p className="lessons-eyebrow">{french ? "À VOUS LA PROCHAINE VAGUE" : "YOUR NEXT WAVE IS WAITING"}</p>
            <h2 id="lessons-final-title">{french ? "VOTRE PROCHAINE AVENTURE SURF VOUS ATTEND" : "YOUR NEXT SURF ADVENTURE IS WAITING"}</h2>
            <p>{french ? "Découvrez le surf à Taghazout et la magie de la côte atlantique marocaine." : "Discover the perfect surf holiday and experience the magic of Morocco’s Atlantic coast."}</p>
            <Link className="lessons-button lessons-button--light" href="/#contact">{french ? "PRÉPARER VOTRE AVENTURE" : "Explore"}<span aria-hidden="true">→</span></Link>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}