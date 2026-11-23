import Link from "next/link";
import Image from "next/image";
import { getBlogImageUrl, type BlogPost } from "../blogs";
import { localizeTree, translate, type Locale } from "../i18n";
import type { OceanLogSettings } from "../homepage-sections";

export default function BlogSection({ locale, posts, settings }: { locale: Locale; posts: BlogPost[]; settings: OceanLogSettings }) {
  const t = (phrase: string) => translate(locale, phrase);
  const sortedPosts = [...localizeTree(posts, locale)]
    .sort((first, second) => second.publishedAt.localeCompare(first.publishedAt));
  const featuredPost = sortedPosts.find((post) => post.featuredOnHome) ?? sortedPosts[0];
  const articlePosts = sortedPosts.filter((post) => post.slug !== featuredPost?.slug).slice(0, 3);
  const formatDate = (date: string) => new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
  const imageSource = (post: BlogPost, width: number) => {
    const src = getBlogImageUrl(post.image, width);
    return { src, unoptimized: !src.startsWith("https://images.unsplash.com/") };
  };

  return (
    <section id="journal" className="journal-section travel-blog px-5 py-20 text-ink md:px-[4vw] md:py-28" aria-labelledby="travel-blog-title">
      <div className="travel-blog__inner mx-auto max-w-[1500px]">
        <div className="travel-blog__hero">
          <div className="travel-blog__intro" data-reveal>
            <div className="travel-blog__flight" aria-hidden="true">
              <svg viewBox="0 0 180 42" fill="none">
                <path d="M2 32C28 4 48 39 75 20s47-15 67 0" />
              </svg>
              <span>✈</span>
            </div>
            <span className="travel-blog__eyebrow">{settings.eyebrow[locale]}</span>
            <h2 id="travel-blog-title" className="travel-blog__title">
              <span>{settings.titleLead[locale]} </span>
              <span>{settings.titleBridge[locale]} <em>{settings.titleAccent[locale]}</em></span>
            </h2>
            <p className="travel-blog__description">
              {settings.description[locale]}
            </p>
            <div className="travel-blog__actions">
              <Link href="/blog" className="travel-blog__button">
                <span>{settings.button[locale]}</span>
                <span className="travel-blog__button-arrow" aria-hidden="true">→</span>
              </Link>
              <span className="travel-blog__signature">{settings.signature[locale]}</span>
            </div>
          </div>

          {featuredPost && (() => {
            const image = imageSource(featuredPost, 1600);
            return (
              <article className="travel-blog__feature" data-reveal>
                <Link href={`/blog/${featuredPost.slug}`} className="travel-blog__feature-link" aria-label={`${t("Read More")}: ${featuredPost.title}`}>
                  <Image
                    src={image.src}
                    alt={featuredPost.imageAlt}
                    fill
                    sizes="(max-width: 780px) 100vw, 60vw"
                    className="travel-blog__feature-image"
                    unoptimized={image.unoptimized}
                    loading="lazy"
                  />
                  <span className="travel-blog__feature-shade" aria-hidden="true" />
                  <span className="travel-blog__badge travel-blog__badge--category"><i aria-hidden="true" />{t(featuredPost.category)}</span>
                  <time className="travel-blog__badge travel-blog__badge--date" dateTime={featuredPost.publishedAt}>
                    <span aria-hidden="true">▦</span>{formatDate(featuredPost.publishedAt)}
                  </time>
                  <span className="travel-blog__feature-copy">
                    <span className="travel-blog__feature-title">{featuredPost.title}</span>
                    <span className="travel-blog__feature-excerpt">{t(featuredPost.excerpt)}</span>
                    <span className="travel-blog__feature-bottom">
                      <span className="travel-blog__author"><span className="travel-blog__avatar" aria-hidden="true">IC</span>{t("By Ilyas Chaoui")}</span>
                      <span className="travel-blog__read-more">{t("Read More")} <span aria-hidden="true">→</span></span>
                    </span>
                  </span>
                </Link>
              </article>
            );
          })()}
        </div>

        <div className="travel-blog__grid" data-stagger>
          {articlePosts.map((post) => {
            const image = imageSource(post, 1000);
            return (
              <article key={post.slug} className="travel-blog__card" data-card>
                <Link href={`/blog/${post.slug}`} className="travel-blog__card-image" aria-label={post.title}>
                  <Image
                    src={image.src}
                    alt={post.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
                    className="travel-blog__card-photo"
                    unoptimized={image.unoptimized}
                    loading="lazy"
                  />
                  <span className="travel-blog__badge travel-blog__badge--category"><i aria-hidden="true" />{t(post.category)}</span>
                  <time className="travel-blog__badge travel-blog__badge--date" dateTime={post.publishedAt}>
                    <span aria-hidden="true">▦</span>{formatDate(post.publishedAt)}
                  </time>
                </Link>
                <div className="travel-blog__card-body">
                  <Link href={`/blog/${post.slug}`} className="travel-blog__card-title">
                    <h3>{post.title}</h3><span aria-hidden="true">↗</span>
                  </Link>
                  <p>{t(post.excerpt)}</p>
                  <div className="travel-blog__card-footer">
                    <span className="travel-blog__author"><span className="travel-blog__avatar" aria-hidden="true">IC</span>{t("By Ilyas Chaoui")}</span>
                    <span className="travel-blog__reading-time"><span aria-hidden="true">◷</span>{t(post.readingTime)}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
