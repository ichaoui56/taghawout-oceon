"use client";

import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import { translate, type Locale } from "../i18n";
import type { GoogleReviewsData, GoogleReview } from "../server/google-reviews";

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-2 4.7-4.2 6.1l6.8 5.2c4-3.7 6-9.1 6-15z" />
      <path fill="#34A853" d="M24 44c5.4 0 9.9-1.8 13.2-4.8l-6.8-5.2c-1.8 1.2-4 2-6.4 2-4.9 0-9.1-3.3-10.6-7.8l-7 5.2C9.7 39.8 16.3 44 24 44z" />
      <path fill="#FBBC05" d="M13.4 28.2a12 12 0 0 1 0-8.4l-7-5.2a20 20 0 0 0 0 18.8l7-5.2z" />
      <path fill="#EA4335" d="M24 12.9c3.2 0 6 1.1 8.2 3.2l6.1-6.1C34.6 6.4 29.7 4 24 4 16.3 4 9.7 8.2 6.4 14.6l7 5.2c1.5-4.5 5.7-6.9 10.6-6.9z" />
    </svg>
  );
}

function Stars({ rating, label }: { rating: number; label: string }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span className="google-reviews__stars" aria-label={`${label}: ${rating.toFixed(1)} / 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <svg key={index} viewBox="0 0 24 24" aria-hidden="true" className={index < filled ? "is-filled" : ""}>
          <path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9L12 2.6Z" />
        </svg>
      ))}
    </span>
  );
}

function ReviewIllustration({ kind }: { kind: "palm" | "quad" | "camel" }) {
  return (
    <svg className={`google-reviews__scene google-reviews__scene--${kind}`} viewBox="0 0 128 96" aria-hidden="true">
      {kind === "palm" && (
        <>
          <path d="M65 94c1-22 0-41-4-62" />
          <path d="M61 33C40 10 24 14 15 20c19 1 32 7 47 17M61 33C54 11 42 5 30 5c14 8 22 17 33 31M61 33C68 10 84 4 98 7c-16 7-27 16-37 29M62 35c22-17 40-12 49-5-19 1-31 6-48 15M62 35C39 25 25 31 18 39c18-4 30-3 46 1" />
        </>
      )}
      {kind === "quad" && (
        <>
          <circle cx="33" cy="72" r="13" />
          <circle cx="91" cy="72" r="13" />
          <path d="m24 67 15-24 34 1 19 22-4 8H78l-8-12H50l-8 12H29l-5-7Zm21-22-9-11h19l9 10m-9-11 5-15 12 4 5 12m-22-2 9 6m5 17 14-1" />
          <circle cx="58" cy="17" r="6" />
        </>
      )}
      {kind === "camel" && (
        <path d="M13 68c8-8 15-10 23-8l9-15c4-7 11-8 16-1l6 8 9-9c6-6 13-4 16 3l5 13 14 5-4 8-14-2-5 19h-5l-2-18-25 1-3 18h-5l-1-19-20-1-4 19h-5l1-20-12 1-4-4Zm38-21c3-10 8-16 16-17l10 4-5 4-8-1-5 16m25 3 8-11 8 2-3 13" />
      )}
    </svg>
  );
}


const reviewScenes = ["palm", "quad", "camel"] as const;

function ReviewCard({ review, locale, t, index }: { review: GoogleReview; locale: Locale; t: (phrase: string) => string; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const date = review.publishedAt
    ? new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "long", year: "numeric" }).format(new Date(review.publishedAt))
    : review.relativeDate;

  return (
    <article className="google-reviews__card" data-card>
      <div className="google-reviews__reviewer">
        {review.photoUrl ? (
          <img className="google-reviews__avatar" src={review.photoUrl} alt="" loading="lazy" />
        ) : (
          <span className="google-reviews__avatar google-reviews__avatar--fallback" aria-hidden="true">{review.author.slice(0, 1).toUpperCase()}</span>
        )}
        <div className="google-reviews__reviewer-copy">
          <h3>{review.author}</h3>
          {date && <time dateTime={review.publishedAt ?? undefined}>{date}</time>}
        </div>
        <GoogleMark className="google-reviews__google-mark" />
      </div>
      <div className="google-reviews__card-rating">
        <Stars rating={review.rating} label={t("Rated")} />
      </div>
      <p className={`google-reviews__text${expanded ? " is-expanded" : ""}`}>
        {review.text || t("No written comment was provided.")}
      </p>
      {review.text.length > 150 && (
        <button className="google-reviews__read-more" type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? t("Read less") : t("Read more")} <span aria-hidden="true">{expanded ? "↑" : "→"}</span>
        </button>
      )}
      <ReviewIllustration kind={reviewScenes[index % reviewScenes.length]} />
    </article>
  );
}

export default function GoogleReviews({ data, locale }: { data: GoogleReviewsData | null; locale: Locale }) {
  const t = (phrase: string) => translate(locale, phrase);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const reviews = data?.reviews ?? [];
  const pageCount = Math.max(1, reviews.length - visibleCount + 1);

  useEffect(() => {
    const updateVisibleCount = () => setVisibleCount(window.matchMedia("(max-width: 767px)").matches ? 1 : window.matchMedia("(max-width: 1023px)").matches ? 2 : 3);
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const updateIndex = () => {
      const firstCard = track.firstElementChild as HTMLElement | null;
      if (!firstCard) return;
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
      setActiveIndex(Math.min(pageCount - 1, Math.max(0, Math.round(track.scrollLeft / (firstCard.offsetWidth + gap)))));
    };
    track.addEventListener("scroll", updateIndex, { passive: true });
    return () => track.removeEventListener("scroll", updateIndex);
  }, [pageCount]);

  function goTo(index: number) {
    const track = trackRef.current;
    const card = track?.children[index] as HTMLElement | undefined;
    if (!track || !card) return;
    const targetLeft = card.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    track.scrollTo({ left: targetLeft, behavior: "smooth" });
    setActiveIndex(index);
  }

  function move(direction: number) {
    goTo((activeIndex + direction + pageCount) % pageCount);
  }

  const hasReviews = reviews.length > 0;
  const googleUrl = data?.googleUrl?.trim() || null;

  return (
    <section className="google-reviews" id="reviews" aria-labelledby="google-reviews-title">
      <div className="google-reviews__flight" aria-hidden="true">
        <svg viewBox="0 0 240 80"><path d="M3 62C42 5 92 75 137 37S198 14 229 32" /></svg>
        <span>✈</span>
      </div>
      <svg className="google-reviews__contours" viewBox="0 0 320 190" aria-hidden="true">
        <path d="M-30 43c56-68 146-60 157-1 8 43-43 64-80 44-28-15-59 2-54 32 7 42 73 36 96 10 38-42 102-50 150-10 30 25 65 23 96-3" />
        <path d="M-29 63c43-53 117-48 127-4 7 32-32 48-59 34-36-19-82 4-73 47 11 55 91 47 121 14 31-34 83-42 122-9 37 31 85 27 123-8" />
        <path d="M-26 84c28-38 86-37 96-7 6 20-20 32-39 22-43-23-104 5-91 63 14 65 109 58 146 16 25-28 64-34 94-9 45 38 106 31 151-12" />
      </svg>
      <div className="google-reviews__inner">
        <header className="google-reviews__header">
          <p className="google-reviews__eyebrow">{t("From our travellers")}</p>
          <h2 id="google-reviews-title">{t("Ce que disent nos clients")}</h2>
          <span className="google-reviews__underline" aria-hidden="true" />
          <p>{t("Découvrez les expériences vécues par nos voyageurs lors de leurs aventures au Maroc avec Mh Traveling.")}</p>
        </header>

        <div className="google-reviews__layout">
          <aside className="google-reviews__summary" aria-label={t("Google rating summary")}>
            <div className="google-reviews__summary-brand">
              <NextImage src="/tagawout-oceon-white.png" alt="Taghazout Ocean" width={190} height={65} priority={false} />
            </div>
            {data?.rating !== null && data?.rating !== undefined ? (
              <>
                <div className="google-reviews__summary-score">
                  <strong className="google-reviews__summary-rating">{data.rating.toFixed(1)}</strong><span>/5</span>
                </div>
                <Stars rating={data.rating} label={t("Rated")} />
                {data.reviewCount !== null && data.reviewCount !== undefined && (
                  <p>{t("Based on")} <strong>{data.reviewCount.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")}</strong> {t("Google reviews")}</p>
                )}
              </>
            ) : (
              <div className="google-reviews__summary-empty">
                <strong>{t("A journey worth sharing")}</strong>
                <p>{t("Our Google reviews will appear here soon.")}</p>
              </div>
            )}
            {data?.location && <p className="google-reviews__location"><span aria-hidden="true">⌖</span>{data.location}</p>}
            <span className="google-reviews__summary-divider" aria-hidden="true" />
            <div className="google-reviews__google-source"><GoogleMark /><span>Google Reviews</span></div>
            {googleUrl && (
              <a className="google-reviews__summary-link" href={googleUrl} target="_blank" rel="noopener noreferrer">
                {t("Visit Google")} <span aria-hidden="true">→</span>
              </a>
            )}
          </aside>

          <div className="google-reviews__carousel">
            {hasReviews ? (
              <>
                <div className="google-reviews__track" ref={trackRef} data-stagger aria-label={t("Google reviews")}>
                  {reviews.map((review, index) => <ReviewCard key={review.id} review={review} locale={locale} t={t} index={index} />)}
                </div>
                {reviews.length > visibleCount && (
                  <div className="google-reviews__controls">
                    <button className="google-reviews__arrow" type="button" aria-label={t("Previous reviews")} onClick={() => move(-1)}>‹</button>
                    <div className="google-reviews__pagination" aria-label={t("Review pages")}>
                      {Array.from({ length: pageCount }, (_, index) => (
                        <button key={index} type="button" aria-label={`${t("Show review page")} ${index + 1}`} aria-current={activeIndex === index ? "true" : undefined} onClick={() => goTo(index)} />
                      ))}
                    </div>
                    <button className="google-reviews__arrow" type="button" aria-label={t("Next reviews")} onClick={() => move(1)}>›</button>
                  </div>
                )}
              </>
            ) : (
              <div className="google-reviews__empty">
                <span className="google-reviews__empty-mark" aria-hidden="true">“</span>
                <p>{t("Google reviews are temporarily unavailable.")}</p>
                {googleUrl && <a href={googleUrl} target="_blank" rel="noopener noreferrer">{t("Visit our Google profile")} <span aria-hidden="true">↗</span></a>}
              </div>
            )}
          </div>
        </div>

        {data?.HostelGrowthUrl && (
          <a className="google-reviews__HostelGrowth" href={data.HostelGrowthUrl} target="_blank" rel="noopener noreferrer">
            <span className="google-reviews__HostelGrowth-check" aria-hidden="true">✓</span>
            {t("Certified by")} <strong>HostelGrowth</strong><span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
      <svg className="google-reviews__wave" viewBox="0 0 1440 170" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 50c140-53 258-30 396 27 152 63 275 66 426 23 135-39 248-55 372-25 102 25 170 20 246-13v108H0Z" />
      </svg>
    </section>
  );
}