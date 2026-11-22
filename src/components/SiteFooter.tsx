import Link from "next/link";
import Logo from "./Logo";
import { translate, type Locale } from "../i18n";

export default function SiteFooter({ locale, className }: { locale: Locale; className?: string }) {
  const t = (phrase: string) => translate(locale, phrase);

  return (
    <footer className={`contact-footer ${className || ""}`}>
      <div className="contact-footer__main">
        <Logo className="on-light" />
        <nav aria-label={t("Footer navigation")} className="contact-footer__nav">
          <Link href="/surf-packages">{t("Surf Packages")}</Link>
          <Link href="/surf-lessons">{t("Surf Lessons")}</Link>
          <Link href="/activities">{t("Activities")}</Link>
          <Link href="/blogs">{t("Travel journal")}</Link>
          <Link href="/#about-ocean">{t("Why choose us")}</Link>
        </nav>
        <div className="contact-footer__aside">
          <p>{t("More than a trip. An ocean adventure.")}</p>
        </div>
      </div>
      <div className="contact-footer__credit">
        <span>{t("Website made by")}</span>
          <strong>HotelGrowth<span>.</span></strong>
      </div>
      <svg className="contact-footer__waves" viewBox="0 0 1440 150" preserveAspectRatio="none" aria-hidden="true">
        <path fill="#d9f3fb" d="M0 49c168 51 292-29 472-9 192 22 266 79 458 36 201-45 344-29 510 24v50H0Z" />
        <path fill="#16b7e8" d="M0 82c183-49 314 21 492 14 181-7 254-66 445-42 206 25 335 92 503 23v73H0Z" />
        <path fill="#078bc4" d="M0 111c178 8 302-49 474-34 201 17 314 66 499 43 171-21 293-61 467-36v66H0Z" />
        <path fill="#073b59" d="M0 132c193-20 305 1 478 1 196 0 300-37 475-32 188 6 319 28 487 16v33H0Z" />
      </svg>
    </footer>
  );
}