import { connection } from "next/server";
import App from "../App";
import { getPublicActivityCatalog } from "../server/activity-catalog";
import { getPublicBlogPosts } from "../server/blog-catalog";
import { getLocale } from "../server/locale";
import { getHomepageGoogleReviews } from "../server/google-reviews";
import { getHeroPresentationSettings } from "../server/hero-presentation";
import { getSurfPackages } from "../server/surf-package-catalog";
import { getSurfLessons } from "../server/surf-lesson-catalog";
import { getPublicExperienceGallery } from "../server/experience-gallery";
import { getHomepageSectionsSettings } from "../server/homepage-sections";
import { localizeTree } from "../i18n";

export default async function Page() {
  if (process.env.DATABASE_URL) await connection();
  const [catalog, posts, locale, heroPresentation, experienceGallery, homepageSections, surfPackages, surfLessons] = await Promise.all([
    getPublicActivityCatalog(),
    getPublicBlogPosts(),
    getLocale(),
    getHeroPresentationSettings(),
    getPublicExperienceGallery(),
    getHomepageSectionsSettings(),
    getSurfPackages(),
    getSurfLessons(),
  ]);
  const reviews = await getHomepageGoogleReviews(locale);
  const activities = localizeTree(catalog, locale);
  return <App activities={activities} posts={posts} locale={locale} reviews={reviews} heroPresentation={heroPresentation} experienceGallery={experienceGallery} homepageSections={homepageSections} surfPackages={surfPackages} surfLessons={surfLessons} />;
}
