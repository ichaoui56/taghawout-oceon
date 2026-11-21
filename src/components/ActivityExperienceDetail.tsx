import Link from "next/link";
import { getActivityImageUrl } from "../activities";
import type { ActivityExperience } from "../activity-experiences";
import type { Locale } from "../i18n";
import Nav from "./Nav";
import SiteFooter from "./SiteFooter";

export default function ActivityExperienceDetail({ experience, locale }: { experience: ActivityExperience; locale: Locale }) {
  const copy = {
    title: experience.title[locale],
    category: experience.category[locale],
    summary: experience.summary[locale],
    imageAlt: experience.imageAlt[locale],
  };

  return (
    <div className="activities-discovery-page">
      <Nav />
      <main className="activity-experience-detail">
        <div className="activity-experience-detail__inner">
          <nav className="activity-experience-detail__breadcrumb" aria-label={locale === "fr" ? "Fil d’Ariane" : "Breadcrumb"}>
            <Link href="/activities">{locale === "fr" ? "Toutes les activités" : "All activities"}</Link>
            <span aria-hidden="true">/</span><span aria-current="page">{copy.title}</span>
          </nav>
          <div className="activity-experience-detail__layout">
            <div className="activity-experience-detail__copy">
              <p className="activities-eyebrow activities-eyebrow--blue">{copy.category} · {locale === "fr" ? "SUD DU MAROC" : "SOUTHERN MOROCCO"}</p>
              <h1>{copy.title}</h1>
              <p>{copy.summary}</p>
              <p className="activity-experience-detail__note">{locale === "fr" ? "Les disponibilités et détails sont confirmés par notre équipe locale." : "Availability and experience details are confirmed by our local team."}</p>
              <a href="/#contact" className="activities-button activities-button--solid">{locale === "fr" ? "CONTACTER NOTRE ÉQUIPE" : "ASK OUR TEAM"}<span aria-hidden="true">→</span></a>
            </div>
            <img className="activity-experience-detail__image" src={getActivityImageUrl(experience.image, 1400)} alt={copy.imageAlt} />
          </div>
        </div>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}