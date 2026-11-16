import App from "../src/App";
import { connection } from "next/server";
import { getPublicActivityCatalog } from "../src/server/activity-catalog";
import { getLocale } from "../src/server/locale";
import { getPublicBlogPosts } from "../src/server/blog-catalog";
import { getConciergeSettings } from "../src/server/concierge";
import { getHomepageGoogleReviews } from "../src/server/google-reviews";
import { localizeTree } from "../src/i18n";

export const metadata = {
  alternates: { canonical: "/" },
};

export default async function Page() {
  if (process.env.DATABASE_URL) await connection();
  const [catalog, posts, locale, concierge] = await Promise.all([
    getPublicActivityCatalog(),
    getPublicBlogPosts(),
    getLocale(),
    getConciergeSettings(),
  ]);
  const reviews = await getHomepageGoogleReviews(locale);
  const activities = localizeTree(catalog, locale);
  return <App activities={activities} posts={posts} locale={locale} concierge={concierge} reviews={reviews} />;
}
