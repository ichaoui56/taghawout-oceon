"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { Locale } from "../i18n";

export type BlogCardPost = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  publishedAt: string;
  readingTime: string;
  imageUnoptimized: boolean;
};

const filterKeys = ["All", "Surf", "Travel", "Lifestyle", "Tips"] as const;
type FilterKey = typeof filterKeys[number];

function getPostFilters(post: BlogCardPost): FilterKey[] {
  const category = post.category.toLocaleLowerCase();
  const content = `${post.title} ${post.excerpt}`.toLocaleLowerCase();
  const filters: FilterKey[] = [];

  if (/surf|wave|ocean|coast/.test(`${category} ${content}`)) filters.push("Surf");
  if (/city notes|on the road|beyond the city|travel well|coast & culture/.test(category)) filters.push("Travel");
  if (/local flavour|slow moments/.test(category)) filters.push("Lifestyle");
  if (/travel well/.test(category) || /guide|tips|how to|what to|pack|advice/.test(content)) filters.push("Tips");
  if (!filters.length) filters.push("Travel");

  return filters;
}

function BlogWaveIcon() {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M3 19c4.3 0 4.3-7 8.6-7s4.3 7 8.6 7 4.3-7 8.6-7M3 24c4.3 0 4.3-4 8.6-4s4.3 4 8.6 4 4.3-4 8.6-4M6 11c2-4 5-6 9-6 3 0 5 1 7 3" /></svg>;
}

export default function BlogArchiveExperience({
  posts,
  locale,
  newsletterImage,
  newsletterImageUnoptimized,
}: {
  posts: BlogCardPost[];
  locale: Locale;
  newsletterImage: string;
  newsletterImageUnoptimized: boolean;
}) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");
  const [newsletterError, setNewsletterError] = useState(false);
  const french = locale === "fr";
  const labels: Record<FilterKey, string> = french
    ? { All: "Tout", Surf: "Surf", Travel: "Voyage", Lifestyle: "Art de vivre", Tips: "Conseils" }
    : { All: "All", Surf: "Surf", Travel: "Travel", Lifestyle: "Lifestyle", Tips: "Tips" };
  const copy = french ? {
    eyebrow: "DERNIÈRES HISTOIRES",
    heading: "Récits de Taghazout",
    readMore: "Lire la suite",
    empty: "Aucun article dans cette catégorie pour le moment.",
    newsletterEyebrow: "RESTEZ AU COURANT",
    newsletterHeading: "Les dernières histoires de surf",
    newsletterDescription: "Recevez nos récits et conseils sur le surf, les voyages et les aventures à Taghazout.",
    emailLabel: "Votre adresse e-mail",
    subscribe: "S’inscrire",
    unavailable: "Les inscriptions à la newsletter ne sont pas encore disponibles. Réessayez plus tard.",
    imageLabel: "Côte atlantique du Maroc",
  } : {
    eyebrow: "LATEST INSIGHTS",
    heading: "Stories from Taghazout",
    readMore: "Read More",
    empty: "There are no stories in this category yet.",
    newsletterEyebrow: "STAY IN THE LOOP",
    newsletterHeading: "Get the Latest Surf Stories",
    newsletterDescription: "Subscribe to our newsletter and never miss an update on surf, travel and adventure in Taghazout.",
    emailLabel: "Your email address",
    subscribe: "Subscribe",
    unavailable: "Newsletter sign-ups are not available right now. Please try again later.",
    imageLabel: "The Moroccan Atlantic coast",
  };

  const visiblePosts = activeFilter === "All"
    ? posts
    : posts.filter((post) => getPostFilters(post).includes(activeFilter));

  function submitNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setNewsletterError(true);
  }

  return (
    <>
      <section id="blog-articles" className="blog-redesign__articles" aria-labelledby="blog-articles-title">
        <div className="blog-redesign__container">
          <div className="blog-redesign__section-head">
            <div>
              <p className="blog-redesign__eyebrow"><span>{copy.eyebrow}</span><i aria-hidden="true" /></p>
              <h2 id="blog-articles-title">{copy.heading}</h2>
            </div>
            <div className="blog-redesign__filters" role="group" aria-label={french ? "Filtrer les articles" : "Filter articles"}>
              {filterKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={activeFilter === key}
                  className={activeFilter === key ? "is-active" : ""}
                  onClick={() => setActiveFilter(key)}
                >
                  {labels[key]}
                </button>
              ))}
            </div>
          </div>

          {visiblePosts.length ? (
            <div className="blog-redesign__grid" aria-live="polite">
              {visiblePosts.map((post, index) => (
                <article className="blog-redesign__card" key={`${activeFilter}-${post.slug}`} style={{ "--card-index": index } as React.CSSProperties}>
                  <Link href={`/blog/${post.slug}`} className="blog-redesign__card-image" aria-label={`${copy.readMore}: ${post.title}`}>
                    <Image
                      src={post.image}
                      alt={post.imageAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw"
                      className="blog-redesign__card-photo"
                      unoptimized={post.imageUnoptimized}
                      loading="lazy"
                    />
                    <span className="blog-redesign__category">{post.category}</span>
                  </Link>
                  <div className="blog-redesign__card-body">
                    <div className="blog-redesign__card-meta">
                      <time dateTime={post.publishedAt}>{new Intl.DateTimeFormat(french ? "fr-FR" : "en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${post.publishedAt}T00:00:00Z`))}</time>
                      <span>{post.readingTime}</span>
                    </div>
                    <Link href={`/blog/${post.slug}`} className="blog-redesign__card-title"><h3>{post.title}</h3></Link>
                    <p className="blog-redesign__card-excerpt">{post.excerpt}</p>
                    <Link href={`/blog/${post.slug}`} className="blog-redesign__read-more">
                      {copy.readMore}<span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="blog-redesign__empty" role="status">{copy.empty}</p>
          )}
        </div>
      </section>

      <section className="blog-redesign__newsletter" aria-labelledby="blog-newsletter-title">
        <Image
          className="blog-redesign__newsletter-image"
          src={newsletterImage}
          alt=""
          fill
          sizes="100vw"
          unoptimized={newsletterImageUnoptimized}
          loading="lazy"
        />
        <div className="blog-redesign__newsletter-inner">
          <div className="blog-redesign__newsletter-copy">
            <p className="blog-redesign__eyebrow"><span>{copy.newsletterEyebrow}</span><i aria-hidden="true" /></p>
            <h2 id="blog-newsletter-title">{copy.newsletterHeading}</h2>
            <p>{copy.newsletterDescription}</p>
          </div>
          <form className="blog-redesign__newsletter-form" onSubmit={submitNewsletter}>
            <label className="sr-only" htmlFor="blog-newsletter-email">{copy.emailLabel}</label>
            <input
              id="blog-newsletter-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={copy.emailLabel}
              required
              onChange={() => setNewsletterError(false)}
            />
            <button type="submit">{copy.subscribe}<span aria-hidden="true">→</span></button>
            {newsletterError && <p className="blog-redesign__newsletter-error" role="alert">{copy.unavailable}</p>}
          </form>
          <span className="blog-redesign__newsletter-mark" aria-label={copy.imageLabel}><BlogWaveIcon /></span>
        </div>
        <svg className="blog-redesign__newsletter-wave" viewBox="0 0 1440 110" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 44c152 42 264-20 440-4 189 17 268 57 454 26 204-34 346-26 546 8v36H0Z" fill="#08b5de" />
          <path d="M0 73c178 35 289-22 472-3 191 20 285 40 463 12 193-30 322-10 505 5v23H0Z" fill="#ffffff" />
        </svg>
      </section>
    </>
  );
}