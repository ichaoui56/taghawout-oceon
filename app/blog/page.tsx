import type { Metadata } from "next";
import { connection } from "next/server";
import Image from "next/image";
import Nav from "../../src/components/Nav";
import BlogArchiveExperience, { type BlogCardPost } from "../../src/components/BlogArchiveExperience";
import SiteFooter from "../../src/components/SiteFooter";
import { getBlogImageUrl } from "../../src/blogs";
import { getPublicBlogPosts } from "../../src/server/blog-catalog";
import { getSiteSeoSettings } from "../../src/server/site-seo";
import { getLocale } from "../../src/server/locale";
import { localizeTree, type Locale } from "../../src/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, settings] = await Promise.all([getLocale(), getSiteSeoSettings()]);
  return locale === "fr" ? {
    title: settings.journalTitleFr,
    description: settings.journalDescriptionFr,
    keywords: settings.keywordsFr.split(",").map((keyword) => keyword.trim()).filter(Boolean),
    alternates: { canonical: "/blog" },
  } : {
    title: settings.journalTitleEn,
    description: settings.journalDescriptionEn,
    keywords: settings.keywordsEn.split(",").map((keyword) => keyword.trim()).filter(Boolean),
    alternates: { canonical: "/blog" },
  };
}

export default async function BlogPage() {
  if (process.env.DATABASE_URL) await connection();
  const posts = await getPublicBlogPosts();
  const locale = await getLocale();
  const localizedPosts = [...localizeTree(posts, locale)].sort((first, second) =>
    second.publishedAt.localeCompare(first.publishedAt),
  );
  const archivePosts: BlogCardPost[] = localizedPosts.map((post) => {
    const image = getBlogImageUrl(post.image, 1200);
    return {
      slug: post.slug,
      title: post.title,
      category: post.category,
      excerpt: post.excerpt,
      image,
      imageAlt: post.imageAlt,
      publishedAt: post.publishedAt,
      readingTime: post.readingTime,
      imageUnoptimized: !image.startsWith("https://images.unsplash.com/"),
    };
  });
  const localeCopy = getBlogPageCopy(locale);

  return (
    <>
      <Nav />
      <main className="blog-redesign">
        <section className="blog-redesign__hero" aria-labelledby="blog-redesign-title">
          <div className="blog-redesign__hero-inner">
            <div className="blog-redesign__intro">
              <p className="blog-redesign__eyebrow"><span>{localeCopy.eyebrow}</span><i aria-hidden="true" /></p>
              <h1 id="blog-redesign-title">{localeCopy.titleLead}<br /><em>{localeCopy.titleAccent}</em></h1>
              <p className="blog-redesign__lead">{localeCopy.description}</p>
              <a className="blog-redesign__button" href="#blog-articles">
                {localeCopy.explore}<span aria-hidden="true">→</span>
              </a>
              <p className="blog-redesign__signature">{localeCopy.signature}</p>
            </div>
            <div className="blog-redesign__hero-visual" aria-label={localeCopy.heroImageLabel}>
              <div className="blog-redesign__hero-photo">
                <Image
                  src="/Moroccan Coastal Travel Panorama.webp"
                  alt={localeCopy.heroImageAlt}
                  fill
                  sizes="(max-width: 760px) 100vw, 58vw"
                  preload
                  className="blog-redesign__hero-image"
                />
              </div>
              <span className="blog-redesign__surf-mark" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none"><path d="M4 20c4.3 0 4.3-7 8.6-7s4.3 7 8.6 7 4.3-7 8.6-7M4 25c4.3 0 4.3-4 8.6-4s4.3 4 8.6 4 4.3-4 8.6-4M7 12c2-4.1 5.2-6 9.3-6 2.8 0 5.3 1.2 7.3 3.5" /></svg>
              </span>
              <svg className="blog-redesign__hero-wave" viewBox="0 0 900 100" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 48c132 34 202-22 341-6 139 16 197 38 331 16 89-15 157-12 228 3v39H0Z" fill="#dff6fb" />
              </svg>
            </div>
          </div>
        </section>
        <BlogArchiveExperience posts={archivePosts} locale={locale} newsletterImage={archivePosts[0]?.image ?? "/Moroccan Coastal Travel Panorama.webp"} newsletterImageUnoptimized={archivePosts[0]?.imageUnoptimized ?? false} />
      </main>
      <SiteFooter className="w-[100%] h-full p-24" locale={locale} />
    </>
  );
}

function getBlogPageCopy(locale: Locale) {
  return locale === "fr" ? {
    eyebrow: "NOTRE BLOG",
    titleLead: "Prenez la",
    titleAccent: "route panoramique.",
    description: "Découvrez des conseils, des récits et des guides sur le surf, les voyages et la vie à Taghazout, au Maroc.",
    explore: "Explorer les articles",
    signature: "Surfer · Voyager · Explorer",
    heroImageLabel: "Photographie de la côte atlantique marocaine",
    heroImageAlt: "La côte atlantique et le village de Taghazout au Maroc",
  } : {
    eyebrow: "OUR BLOG",
    titleLead: "Take the",
    titleAccent: "Scenic Route",
    description: "Discover tips, stories and guides about surfing, travel and life in Taghazout, Morocco.",
    explore: "Explore Our Articles",
    signature: "Surf · Travel · Explore",
    heroImageLabel: "Photography of the Moroccan Atlantic coast",
    heroImageAlt: "The Atlantic coastline and village of Taghazout, Morocco",
  };
}
