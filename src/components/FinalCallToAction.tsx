import Link from "next/link";
import ContactForm from "./ContactForm";
import SiteFooter from "./SiteFooter";
import { translate, type Locale } from "../i18n";

const contactCopy = {
  en: {
    eyebrow: "GET IN TOUCH",
    heading: "Contact",
    accent: "Us",
    intro: "We’re here to help you plan your perfect surf trip in Taghazout.",
    trust: ["Local team", "Every surf level", "Made around you"],
    invitation: "Let’s plan your adventure together!",
    locationTitle: "Our location",
    location: "Taghazout, Morocco",
    locationNote: "By the Atlantic, close to the waves.",
    messageTitle: "Talk to our team",
    message: "Tell us what you’re dreaming of.",
    messageAction: "Send a message",
    experiencesTitle: "Surf & experiences",
    experiences: "Lessons, stays, and local adventures.",
    experiencesAction: "Explore activities",
    signature: "Surf · Explore · Relax",
  },
  fr: {
    eyebrow: "CONTACTEZ-NOUS",
    heading: "Contact",
    accent: "ez-nous",
    intro: "Nous sommes là pour préparer votre séjour surf idéal à Taghazout.",
    trust: ["Équipe locale", "Tous niveaux", "À votre rythme"],
    invitation: "Préparons votre prochaine aventure !",
    locationTitle: "Notre adresse",
    location: "Taghazout, Maroc",
    locationNote: "Au bord de l’Atlantique, près des vagues.",
    messageTitle: "Parlez à notre équipe",
    message: "Racontez-nous votre projet.",
    messageAction: "Envoyer un message",
    experiencesTitle: "Surf et expériences",
    experiences: "Cours, séjours et aventures locales.",
    experiencesAction: "Explorer les activités",
    signature: "Surf · Explore · Détends-toi",
  },
} as const;

function TrustIcon({ kind }: { kind: "support" | "levels" | "personal" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {kind === "support" && <><path d="M4 13v-1a8 8 0 0 1 16 0v1" /><path d="M4 12h3v6H6a2 2 0 0 1-2-2v-4Zm16 0h-3v6h1a2 2 0 0 0 2-2v-4ZM17 18a5 5 0 0 1-5 3h-1" /></>}
      {kind === "levels" && <><path d="M12 3 19 6v5c0 4.7-2.8 8-7 10-4.2-2-7-5.3-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></>}
      {kind === "personal" && <path d="M20.8 8.8c0 4.3-8.8 10-8.8 10s-8.8-5.7-8.8-10a4.6 4.6 0 0 1 8.8-1.7 4.6 4.6 0 0 1 8.8 1.7Z" />}
    </svg>
  );
}

function ContactInfoIcon({ kind }: { kind: "pin" | "message" | "surf" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {kind === "pin" && <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.2" /></>}
      {kind === "message" && <><path d="M4 5.5h16v12H9l-5 3v-3H4z" /><path d="M8 10h8m-8 3h5" /></>}
      {kind === "surf" && <><path d="M3 16c3-4 5-7 8-9 3 3 6 6 10 9-5 2-12 2-18 0Z" /><path d="M2 20c4-1.5 7-1.5 11 0s7 1.5 9 0" /></>}
    </svg>
  );
}

export default function FinalCallToAction({ locale }: { locale: Locale }) {
  const t = (phrase: string) => translate(locale, phrase);
  const text = contactCopy[locale];
  const trustKinds = ["support", "levels", "personal"] as const;
  const infoKinds = ["pin", "message", "surf"] as const;
  const infoBlocks = [
    { title: text.locationTitle, detail: text.location, note: text.locationNote, kind: infoKinds[0] },
    { title: text.messageTitle, detail: text.message, note: text.messageAction, kind: infoKinds[1], href: "#contact-form" },
    { title: text.experiencesTitle, detail: text.experiences, note: text.experiencesAction, kind: infoKinds[2], href: "/activities" },
  ];

  return (
    <section id="contact" className="contact-page" aria-labelledby="contact-title">
      <div className="contact-page__inner">
        <div className="contact-inquiry contact-page__hero">
          <div className="contact-inquiry__copy" data-reveal>
            <p className="contact-page__eyebrow"><span>{text.eyebrow}</span><i aria-hidden="true" /></p>
            <h1 id="contact-title"><span>{text.heading}</span><em>{text.accent}</em></h1>
            <p className="contact-page__intro">{text.intro}</p>
            <ul className="contact-page__trust">
              {text.trust.map((label, index) => (
                <li key={label}>
                  <span className="contact-page__trust-icon"><TrustIcon kind={trustKinds[index]} /></span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
            <div className="contact-page__slogan">
              <p>{text.invitation}</p>
              <span aria-hidden="true" />
            </div>
          </div>
          <ContactForm locale={locale} />
        </div>

        <div className="contact-page__info" aria-label={t("Contact Us")}>
          {infoBlocks.map((block) => (
            <div className="contact-page__info-block" key={block.title}>
              <span className="contact-page__info-icon"><ContactInfoIcon kind={block.kind} /></span>
              <div>
                <p>{block.title}</p>
                <strong>{block.detail}</strong>
                {block.href ? <Link href={block.href}>{block.note}<span aria-hidden="true"> ↗</span></Link> : <span>{block.note}</span>}
              </div>
            </div>
          ))}
          <p className="contact-page__info-signature">{text.signature}<span aria-hidden="true" /></p>
        </div>
      </div>
      <SiteFooter locale={locale} />
    </section>
  );
}
