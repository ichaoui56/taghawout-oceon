import Link from "next/link";
import type { Activity } from "../activities";
import { getActivityImageUrl } from "../activities";
import type { Locale } from "../i18n";

const copy = {
  en: {
    eyebrow: "OUT THERE IS CLOSER THAN YOU THINK",
    heading: "BEYOND THE WAVES. DISCOVER MOROCCO.",
    description: "Explore the beauty of Morocco through unforgettable outdoor adventures, nature, and local experiences.",
    view: "Explore activity",
    viewAll: "VIEW ALL ACTIVITIES",
  },
  fr: {
    eyebrow: "L'AVENTURE EST PLUS PROCHE QUE VOUS NE LE PENSEZ",
    heading: "AU-DELÀ DES VAGUES. DÉCOUVREZ LE MAROC.",
    description: "Explorez le Maroc à travers des aventures en plein air, la nature et des expériences locales inoubliables.",
    view: "Découvrir l'activité",
    viewAll: "VOIR TOUTES LES ACTIVITÉS",
  },
} as const;

const featuredTerms = ["camel", "paradise", "quad"];

function findActivity(activities: Activity[], term: string) {
  return activities.find((activity) => [activity.slug, activity.title, activity.category]
    .some((value) => value.toLowerCase().includes(term)));
}

export default function ActivitiesAdventuresSection({ activities, locale }: { activities: Activity[]; locale: Locale }) {
  const text = copy[locale];
  const featured = featuredTerms
    .map((term) => findActivity(activities, term))
    .filter((activity): activity is Activity => Boolean(activity));

  const outdoorActivities = activities.filter((activity) =>
    [activity.slug, activity.category, activity.title].some((value) => /adventure|nature|camel|paradise|quad|sandboard/i.test(value)),
  );

  for (const activity of [...outdoorActivities, ...activities]) {
    if (featured.length === 3) break;
    if (!featured.some((item) => item.slug === activity.slug)) featured.push(activity);
  }

  return (
    <section id="activities-adventures" className="service-section activities-adventures" aria-labelledby="activities-adventures-title">
      <div className="service-section__inner">
        <div className="activities-adventures__layout">
          <header className="activities-adventures__intro" data-reveal>
            <p className="service-section__eyebrow">{text.eyebrow}</p>
            <h2 id="activities-adventures-title">{text.heading}</h2>
            <p>{text.description}</p>
            <Link href="/activities" className="service-section__button activities-adventures__button">
              {text.viewAll} <span aria-hidden="true">→</span>
            </Link>
          </header>

          <div className="activities-adventures__grid" data-stagger>
            {featured.map((activity, index) => (
              <Link
                href={`/activities/${activity.slug}`}
                className={`adventure-feature adventure-feature--${index + 1}`}
                key={activity.slug}
                data-card
              >
                <img src={getActivityImageUrl(activity.image, 1400)} alt={activity.imageAlt} loading={index === 0 ? "eager" : "lazy"} />
                <span className="adventure-feature__shade" />
                <span className="adventure-feature__content">
                  <span className="adventure-feature__number">{String(index + 1).padStart(2, "0")}</span>
                  <strong>{activity.title}</strong>
                  <span className="adventure-feature__summary">{activity.summary}</span>
                  <span className="adventure-feature__link">{text.view} <span aria-hidden="true">↗</span></span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
