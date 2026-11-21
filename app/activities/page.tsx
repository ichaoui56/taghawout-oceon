import type { Metadata } from "next";
import Link from "next/link";
import Nav from "../../src/components/Nav";
import ActivityDirectory from "../../src/components/ActivityDirectory";
import { getActivityImageUrl } from "../../src/activities";
import { connection } from "next/server";
import { getPublicActivityCatalog } from "../../src/server/activity-catalog";
import { getLocale } from "../../src/server/locale";
import { getSiteSeoSettings } from "../../src/server/site-seo";
import { localizeTree, translate } from "../../src/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, settings] = await Promise.all([getLocale(), getSiteSeoSettings()]);
  return locale === "fr" ? {
    title: settings.activitiesTitleFr,
    description: settings.activitiesDescriptionFr,
    keywords: settings.keywordsFr.split(",").map((keyword) => keyword.trim()).filter(Boolean),
    alternates: { canonical: "/activities" },
  } : {
    title: settings.activitiesTitleEn,
    description: settings.activitiesDescriptionEn,
    keywords: settings.keywordsEn.split(",").map((keyword) => keyword.trim()).filter(Boolean),
    alternates: { canonical: "/activities" },
  };
}

export default async function ActivitiesPage() {
  if (process.env.DATABASE_URL) await connection();
  const [catalog, locale] = await Promise.all([getPublicActivityCatalog(), getLocale()]);
  const allActivities = localizeTree(catalog, locale);
  const t = (phrase: string) => translate(locale, phrase);
  const featuredActivities = allActivities.filter((activity) => activity.popular);
  const heroActivity = featuredActivities.find((activity) => activity.slug === "mini-sahara-massa") ?? featuredActivities[0] ?? allActivities[0];

  return (
    <>
      <Nav />
      <main className="activities-page min-h-screen px-5 pb-20 pt-28 text-ink md:px-[4vw] md:pt-36">
        <div className="mx-auto max-w-[1500px]">
          <Link href="/#activities-adventures" className="activity-back-link">
            <span aria-hidden="true">←</span> {t("Back to the Morocco journey")}
          </Link>

          <header className="activities-discover-hero">
            <div className="activities-discover-hero__copy">
              <p className="eyebrow">{t("The good stuff starts out there")}</p>
              <h1>
                {t("Make room for")}<br /><span>{t("the unexpected.")}</span>
              </h1>
              <p className="activities-discover-hero__intro">
                {t("Surf the Atlantic, follow the dunes, or take the scenic way inland. Find an experience that feels like your kind of Morocco.")}
              </p>
              <a href="#activity-list" className="activities-discover-hero__button">
                {t("Find your experience")} <span aria-hidden="true">↓</span>
              </a>
              <div className="activities-discover-hero__trust">
                <span aria-hidden="true">✳</span>
                <p><strong>{t("Local moments, made easy.")}</strong><br />{t("Straightforward details. Book directly with our activity partners.")}</p>
              </div>
            </div>
            <div className="activities-discover-hero__visual">
              <img
                src={getActivityImageUrl(heroActivity?.image ?? "photo-1501785888041-af3ef285b470", 1400)}
                alt={heroActivity?.imageAlt ?? "Moroccan coastline and mountains"}
                fetchPriority="high"
              />
              <div className="activities-discover-hero__image-shade" />
              <div className="activities-discover-hero__image-caption">
                <span>{t("OUT THERE IS CLOSER THAN YOU THINK")}</span>
                <strong>{t("South of Agadir")}</strong>
              </div>
              <div className="activities-discover-hero__stamp" aria-hidden="true">
                <span>{t("GO")}</span><span>{t("YOUR")}</span><span>{t("OWN")}</span><span>{t("WAY")}</span>
              </div>
              <div className="activities-discover-hero__note">
                <span className="activities-discover-hero__note-icon" aria-hidden="true">↗</span>
                <p><strong>{allActivities.length} {t("ways to get out there")}</strong><br />{t("From quick thrills to full-day escapes")}</p>
              </div>
            </div>
          </header>

          <div className="activities-page__highlights" aria-label={t("Activity highlights")}>
            <div><strong>{String(featuredActivities.length).padStart(2, "0")}</strong><span>{t("local favourites")}</span></div>
            <span className="activities-page__highlights-divider" aria-hidden="true" />
            <div><strong>{String(allActivities.length).padStart(2, "0")}</strong><span>{t("ways to explore")}</span></div>
            <span className="activities-page__highlights-divider" aria-hidden="true" />
            <div><strong>Agadir</strong><span>{t("and beyond")}</span></div>
          </div>
          <ActivityDirectory activities={allActivities} locale={locale} />

          <aside className="activities-page__callout">
            <div>
              <p className="eyebrow">{t("Make it your own")}</p>
              <h2>{t("Need help choosing?")}</h2>
              <p>{t("Tell us when you’re travelling and what you enjoy. We’ll help you plan the rest of your journey.")}</p>
            </div>
            <Link href="/#transfer" className="button-signal">
              {t("Plan your trip")} <span aria-hidden="true">→</span>
            </Link>
          </aside>
        </div>
      </main>
    </>
  );
}
