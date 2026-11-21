import Link from "next/link";
import type { Locale } from "../i18n";
import ContactForm from "./ContactForm";

export default function FinalContact({ locale }: { locale: Locale }) {
  const fr = locale === "fr";
  return (
    <section id="contact" className="final-contact">
      <div className="final-contact__backdrop" aria-hidden="true" />
      <div className="final-contact__overlay" aria-hidden="true" />
      <div className="final-contact__content" data-reveal>
        <p className="final-contact__kicker">TAGHAZOUT OCEAN</p>
        <h2>{fr ? "VOTRE PROCHAINE AVENTURE OCEANIQUE COMMENCE ICI." : "YOUR NEXT OCEAN ADVENTURE STARTS HERE."}</h2>
        <p>{fr
          ? "De votre première vague aux séjours surf inoubliables et aux aventures marocaines, laissez Taghazout Ocean rendre votre prochaine expérience exceptionnelle."
          : "From your first wave to unforgettable surf holidays and Moroccan adventures, let Taghazout Ocean make your next experience special."}</p>
        <div className="final-contact__actions">
          <Link href="#contact-form" className="final-contact__button final-contact__button--primary">{fr ? "NOUS CONTACTER" : "CONTACT US"}<span>↗</span></Link>
          <Link href="#world" className="final-contact__button">{fr ? "EXPLORER NOS EXPÉRIENCES" : "EXPLORE OUR EXPERIENCES"}<span>↘</span></Link>
        </div>
        <div className="final-contact__signature">
          <strong>TAGHAZOUT OCEAN</strong>
          <span>SURF • EXPLORE • EXPERIENCE</span>
        </div>
      </div>
      <div id="contact-form" className="final-contact__form" aria-label="Contact">
        <ContactForm locale={locale} />
      </div>
    </section>
  );
}
