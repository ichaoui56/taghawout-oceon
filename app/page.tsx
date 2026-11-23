import App from "../src/App";
import { connection } from "next/server";
import { getPublicActivityCatalog } from "../src/server/activity-catalog";
import { getLocale } from "../src/server/locale";
import { getPublicBlogPosts } from "../src/server/blog-catalog";
import { getHomepageGoogleReviews } from "../src/server/google-reviews";
import { getHeroPresentationSettings } from "../src/server/hero-presentation";
import { getSurfPackages } from "../src/server/surf-package-catalog";
import { getSurfLessons } from "../src/server/surf-lesson-catalog";
import { localizeTree } from "../src/i18n";

export const metadata = {
  alternates: { canonical: "/" },
};

export default async function Page() {
  if (process.env.DATABASE_URL) await connection();
  const [catalog, posts, locale, heroPresentation, surfPackages, surfLessons] = await Promise.all([
    getPublicActivityCatalog(),
    getPublicBlogPosts(),
    getLocale(),
    getHeroPresentationSettings(),
    getSurfPackages(),
    getSurfLessons(),
  ]);
  const reviews = await getHomepageGoogleReviews(locale);
  const activities = localizeTree(catalog, locale);
  return <App activities={activities} posts={posts} locale={locale} reviews={reviews} heroPresentation={heroPresentation} surfPackages={surfPackages} surfLessons={surfLessons} />;
}
