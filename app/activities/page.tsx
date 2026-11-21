import type { Metadata } from "next";
import Nav from "../../src/components/Nav";
import ActivityDirectory from "../../src/components/ActivityDirectory";
import { getActivityImageUrl } from "../../src/activities";
import { activityExperiences } from "../../src/activity-experiences";
import { connection } from "next/server";
import { getPublicActivityCatalog } from "../../src/server/activity-catalog";
import { getLocale } from "../../src/server/locale";
import { getSiteSeoSettings } from "../../src/server/site-seo";
import { localizeTree } from "../../src/i18n";
import SiteFooter from "../../src/components/SiteFooter";
import "./activities-discovery.css";

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
  const heroActivity = allActivities.find((activity) => activity.slug === "quad-biking");
  const french = locale === "fr";

  return (
    <div className="activities-discovery-page">
      <Nav />
      <main className="activities-discovery-main">
        <section className="activities-hero" aria-labelledby="activities-title">
          <img className="activities-hero__image" src={getActivityImageUrl(heroActivity?.image ?? activityExperiences[0].image, 1800)} alt={heroActivity?.imageAlt ?? activityExperiences[0].imageAlt[locale]} fetchPriority="high" />
          <div className="activities-hero__shade" />
          <div className="activities-hero__content">
            <p className="activities-eyebrow">{french ? "BIEN PLUS QUE LE SURF" : "MORE THAN JUST SURFING"}</p>
            <h1 id="activities-title">{french ? <>DES ACTIVITÉS<br />À TAGHAZOUT</> : <>EXCITING ACTIVITIES<br />IN TAGHAZOUT</>}</h1>
            <p>{french ? "Des aventures en plein air aux expériences culturelles, découvrez des activités qui rendront votre séjour inoubliable." : "Discover a variety of activities to make your stay unforgettable. From adventure sports to cultural experiences, there’s something for everyone."}</p>
            <div className="activities-hero__actions">
              <a href="#activity-list" className="activities-button activities-button--light">{french ? "EXPLORER LES ACTIVITÉS" : "EXPLORE ACTIVITIES"}<span aria-hidden="true">→</span></a>
              <a href="/#contact" className="activities-button activities-button--outline">{french ? "CONTACTEZ-NOUS" : "CONTACT OUR TEAM"}</a>
            </div>
          </div>
          <a className="activities-hero__scroll" href="#activities-intro" aria-label={french ? "Défiler vers les activités" : "Scroll to activities"}><span>↓</span></a>
        </section>

        <section className="activities-content" id="activities-intro" aria-labelledby="activities-intro-title">
          <div className="activities-content__inner">
            <header className="activities-intro">
              <div className="activities-intro__coast" role="img" aria-label={french ? "Panorama de la côte de Taghazout" : "Panoramic Taghazout coastline"} />
              <div className="activities-intro__copy">
                <p className="activities-eyebrow activities-eyebrow--blue">{french ? "L’AVENTURE AU-DELÀ DES VAGUES" : "ADVENTURE BEYOND THE WAVES"}</p>
                <h2 id="activities-intro-title">{french ? <>DÉCOUVREZ TAGHAZOUT<br />AUTREMENT</> : <>EXPLORE TAGHAZOUT<br />IN A WHOLE NEW WAY</>}</h2>
                <p>{french ? "Aventure, nature ou culture : nos activités rendront votre séjour surf encore plus spécial." : "Whether you love adventure, nature, or culture, our activities will make your surf holiday even more special."}</p>
              </div>
            </header>

            <ActivityDirectory activities={allActivities} experiences={activityExperiences} locale={locale} />
          </div>
        </section>

        <section className="activities-final-cta" aria-labelledby="activities-cta-title">
          <div className="activities-final-cta__content">
            <p className="activities-eyebrow">{french ? "VOTRE PROCHAINE AVENTURE COMMENCE ICI" : "MAKE THIS STAY YOURS"}</p>
            <h2 id="activities-cta-title">{french ? "VOTRE PROCHAINE AVENTURE SURF VOUS ATTEND" : "YOUR NEXT SURF ADVENTURE IS WAITING"}</h2>
            <p>{french ? "Découvrez le séjour surf idéal et la magie de la côte atlantique marocaine." : "Discover the perfect surf holiday and experience the magic of Morocco’s Atlantic coast."}</p>
            <a href="/#contact" className="activities-button activities-button--light">{french ? "PRÉPARER VOTRE AVENTURE" : "PLAN YOUR ADVENTURE"}<span aria-hidden="true">→</span></a>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
