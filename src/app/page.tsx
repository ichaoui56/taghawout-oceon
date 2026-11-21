import { connection } from "next/server";
import App from "../App";
import { getPublicActivityCatalog } from "../server/activity-catalog";
import { getPublicBlogPosts } from "../server/blog-catalog";
import { getLocale } from "../server/locale";
import { getHomepageGoogleReviews } from "../server/google-reviews";
import { localizeTree } from "../i18n";

export default async function Page() {
  if (process.env.DATABASE_URL) await connection();
  const [catalog, posts, locale] = await Promise.all([
    getPublicActivityCatalog(),
    getPublicBlogPosts(),
    getLocale(),
  ]);
  const reviews = await getHomepageGoogleReviews(locale);
  const activities = localizeTree(catalog, locale);
  return <App activities={activities} posts={posts} locale={locale} reviews={reviews} />;
}
