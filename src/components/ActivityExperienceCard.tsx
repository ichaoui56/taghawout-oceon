import Link from "next/link";
import { getActivityImageUrl, type Activity } from "../activities";
import type { ActivityExperience } from "../activity-experiences";
import type { Locale } from "../i18n";

function CategoryIcon({ kind }: { kind: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {kind === "quad" && <><circle cx="6" cy="17" r="2.5" /><circle cx="18" cy="17" r="2.5" /><path d="m4 16 2-6h9l4 4 1 3M7 10l2-3h5l2 3M9 10l1 6m5-6 1 6m-9-3h9" /></>}
      {kind === "camel" && <><path d="M4 17h16l-2-5-3-1-2-4-2 4-3 1-2 5Zm3 0v3m10-3v3M5 10 4 7m13 4 2-2" /><circle cx="18" cy="8" r="1" /></>}
      {kind === "boat" && <><path d="M3 16h18l-3 4H7Zm9-12v11m0-10-6 7h6m1-5 5 5h-5" /></>}
      {kind === "fish" && <><path d="M3 12s4-6 10-6c4 0 7 6 7 6s-3 6-7 6c-6 0-10-6-10-6Zm17 0 3-3v6Z" /><circle cx="11" cy="10" r="1" /></>}
      {kind === "hike" && <><circle cx="13" cy="5" r="2" /><path d="m11 9-3 4 3 2-1 5m1-10 4 3 3-1m-8 3-3 4m8-6 3 6M4 21l5-8" /></>}
      {kind === "yoga" && <><circle cx="12" cy="5" r="2" /><path d="m12 8-3 4-5 1m8-5 3 4 5 1m-11-1 3 4-4 4m5-8-1 5 4 3" /></>}
      {kind === "cooking" && <><path d="M5 10h14v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3Zm-1 0h16M8 6c0-1 1-1 1-2m4 2c0-1 1-1 1-2m3 2c0-1 1-1 1-2" /></>}
      {kind === "desert" && <><path d="M3 18c4-5 7-5 10-2 2-3 5-4 8-1M3 21h18M10 15l2-3 2 3" /></>}
    </svg>
  );
}

export default function ActivityExperienceCard({ experience, activity, locale }: { experience: ActivityExperience; activity?: Activity; locale: Locale }) {
  const copy = {
    title: experience.title[locale],
    category: experience.category[locale],
    summary: experience.summary[locale],
    imageAlt: experience.imageAlt[locale],
  };
  const image = activity?.image ?? experience.image;
  const imageAlt = activity?.imageAlt ?? copy.imageAlt;

  return (
    <article className="activity-experience-card">
      <Link href={`/activities/${experience.slug}`} className="activity-experience-card__link" aria-label={`${locale === "fr" ? "Découvrir" : "Learn more about"} ${copy.title}`}>
        <figure className="activity-experience-card__image">
          <img src={getActivityImageUrl(image, 1100)} alt={imageAlt} loading="lazy" decoding="async" />
          <span className="activity-experience-card__icon"><CategoryIcon kind={experience.icon} /></span>
          <span className="activity-experience-card__category">{copy.category}</span>
        </figure>
        <div className="activity-experience-card__body">
          <div className="activity-experience-card__copy">
            <h3>{copy.title}</h3>
            <p>{copy.summary}</p>
          </div>
          <span className="activity-experience-card__button">{locale === "fr" ? "En savoir plus" : "Learn More"}<span aria-hidden="true">→</span></span>
        </div>
      </Link>
    </article>
  );
}