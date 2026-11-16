"use client";

import { useEffect, useRef, useState } from "react";
import { translate, type Locale } from "../i18n";
import type { GoogleReviewsData, GoogleReview } from "../server/google-reviews";

function GoogleWordmark() {
  return (
    <span className="google-reviews__wordmark" aria-label="Google">
      <span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span>
    </span>
  );
}

function Stars({ rating, label }: { rating: number; label: string }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span className="google-reviews__stars" aria-label={`${label}: ${rating.toFixed(1)} / 5`}>
      {Array.from({ length: 5 }, (_, index) => <span key={index} aria-hidden="true" className={index < filled ? "is-filled" : ""}>★</span>)}
    </span>
  );
}

function ReviewCard({ review, locale, t }: { review: GoogleReview; locale: Locale; t: (phrase: string) => string }) {
  const [expanded, setExpanded] = useState(false);
  const date = review.publishedAt
    ? new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "long", year: "numeric" }).format(new Date(review.publishedAt))
    : review.relativeDate;

  return (
    <article className="google-reviews__card">
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
        <span className="google-reviews__google-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48" focusable="false">
            <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-2 4.7-4.2 6.1l6.8 5.2c4-3.7 6-9.1 6-15z" />
            <path fill="#34A853" d="M24 44c5.4 0 9.9-1.8 13.2-4.8l-6.8-5.2c-1.8 1.2-4 2-6.4 2-4.9 0-9.1-3.3-10.6-7.8l-7 5.2C9.7 39.8 16.3 44 24 44z" />
            <path fill="#FBBC05" d="M13.4 28.2a12 12 0 0 1 0-8.4l-7-5.2a20 20 0 0 0 0 18.8l7-5.2z" />
            <path fill="#EA4335" d="M24 12.9c3.2 0 6 1.1 8.2 3.2l6.1-6.1C34.6 6.4 29.7 4 24 4 16.3 4 9.7 8.2 6.4 14.6l7 5.2c1.5-4.5 5.7-6.9 10.6-6.9z" />
          </svg>
        </span>
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
  const hasGoogleProfile = Boolean(data?.googleUrl);
  const googleUrl = data?.googleUrl ?? "https://www.google.com/search?q=Mouja+Tours+reviews";

  return (
    <section className="google-reviews" id="reviews" aria-labelledby="google-reviews-title">
      <div className="google-reviews__flight" aria-hidden="true"><span>✈</span></div>
      <div className="google-reviews__inner">
        <header className="google-reviews__header">
          <p className="google-reviews__eyebrow">{t("From our travellers")}</p>
          <h2 id="google-reviews-title">{t("Ce que disent nos clients")}</h2>
          <span className="google-reviews__underline" aria-hidden="true" />
          <p>{t("Découvrez les expériences vécues par nos voyageurs lors de leurs aventures au Maroc avec Mh Traveling.")}</p>
        </header>

        <div className="google-reviews__layout">
          <aside className="google-reviews__summary" aria-label={t("Google rating summary")}>
            <div className="google-reviews__summary-top"><span>{t("TRAVELLER STORIES")}</span><GoogleWordmark /></div>
            {data?.rating !== null && data?.rating !== undefined ? (
              <>
                <strong className="google-reviews__summary-rating">{data.rating.toFixed(1)}</strong>
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
            <a className="google-reviews__summary-link" href={googleUrl} target="_blank" rel="noopener noreferrer">
              {hasGoogleProfile ? t("Visit Google") : t("Search Google")} <span aria-hidden="true">↗</span>
            </a>
          </aside>

          <div className="google-reviews__carousel">
            {hasReviews ? (
              <>
                <div className="google-reviews__track" ref={trackRef}>
                  {reviews.map((review) => <ReviewCard key={review.id} review={review} locale={locale} t={t} />)}
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
                <a href={googleUrl} target="_blank" rel="noopener noreferrer">{hasGoogleProfile ? t("Visit our Google profile") : t("Search Google for Mh Traveling")} <span aria-hidden="true">↗</span></a>
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
    </section>
  );
}