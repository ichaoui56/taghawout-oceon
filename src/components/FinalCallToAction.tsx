import Link from "next/link";
import Logo from "./Logo";
import ContactForm from "./ContactForm";
import { translate, type Locale } from "../i18n";

export default function FinalCallToAction({ locale }: { locale: Locale }) {
  const t = (phrase: string) => translate(locale, phrase);
  return (
    <section id="contact" className="contact-page">
      <div className="contact-page__inner">
        <div className="contact-inquiry">
          <div className="contact-inquiry__copy">
            <p className="eyebrow">{t("Let’s talk Morocco")}</p>
            <h1>{t("Tell us about your trip.")}</h1>
            <div className="contact-inquiry__details">
              <p>{t("Share a few details and our local team will help you plan the next step.")}</p>
              <div className="contact-inquiry__coordinates">
                <span className="contact-inquiry__pin" aria-hidden="true">⌖</span>
                <p>30°25′ N&nbsp;&nbsp; 9°36′ W<small>AGADIR · MOROCCO</small></p>
              </div>
            </div>
          </div>
          <ContactForm locale={locale} />
        </div>
        <footer className="contact-footer">
          <div className="contact-footer__main">
            <Logo className="on-light" />
            <nav aria-label={t("Footer navigation")} className="contact-footer__nav">
              <Link href="#transfer">{t("Airport transfers")}</Link>
              <Link href="#stays">{t("Places to stay")}</Link>
              <Link href="#experiences">{t("Experiences")}</Link>
              <Link href="#concierge">{t("Notre Histoire")}</Link>
              <Link href="#journal">{t("Travel journal")}</Link>
              <Link href="#why-us">{t("Why choose us")}</Link>
            </nav>
            <div className="contact-footer__aside">
              <p>{t("More than a trip. A journey.")}</p>
            </div>
          </div>
          <div className="contact-footer__credit">
            <span>{t("Website made by")}</span>
            <strong>HostelGrowth<span>.</span></strong>
          </div>
        </footer>
      </div>
    </section>
  );
}
