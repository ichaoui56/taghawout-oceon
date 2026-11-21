"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Activity } from "../activities";
import { getActivityImageUrl } from "../activities";
import ActivityReserveButton from "./ActivityReserveButton";
import { translate, type Locale } from "../i18n";

type ActivityDirectoryProps = {
  activities: Activity[];
  locale: Locale;
};

export default function ActivityDirectory({ activities, locale }: ActivityDirectoryProps) {
  const t = (phrase: string) => translate(locale, phrase);
  const categories = useMemo(() => ["All", ...new Set(activities.map((activity) => activity.category))], [activities]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get("category");
    setActiveCategory(requestedCategory && categories.includes(requestedCategory) ? requestedCategory : "All");
    setSearchTerm(params.get("search") ?? "");
  }, [categories]);

  const filteredActivities = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return activities.filter((activity) => {
      const matchesCategory = activeCategory === "All" || activity.category === activeCategory;
      const matchesSearch = !query || [
        activity.title,
        activity.category,
        activity.location,
        activity.summary,
      ].some((value) => value.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, activities, searchTerm]);

  return (
    <section id="activity-list" className="activity-directory" aria-labelledby="activity-directory-title">
      <div className="activity-directory__heading">
        <div>
          <p className="eyebrow">{t("A little inspiration")}</p>
          <h2 id="activity-directory-title">{t("Pick your")} <span>{t("pace.")}</span></h2>
        </div>
        <p>{t("Big day out or a few hours well spent. Start with what sounds good.")}</p>
      </div>

      <div className="activity-directory__controls">
        <div className="activity-directory__filters" role="group" aria-label={t("Filter activities by category")}>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`activity-directory__filter${activeCategory === category ? " is-active" : ""}`}
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category === "All" ? t("Everything") : category}
            </button>
          ))}
        </div>
        <label className="activity-directory__search">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">Search activities</span>
          <input
            type="search"
            placeholder={t("Search experiences")}
            aria-label={t("Search activities")}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          {searchTerm && (
            <button type="button" aria-label={t("Clear search")} onClick={() => setSearchTerm("")}>
              ×
            </button>
          )}
        </label>
      </div>

      <div className="activity-directory__results" aria-live="polite">
        <span>{String(filteredActivities.length).padStart(2, "0")}</span>
        {filteredActivities.length === 1 ? ` ${t("experience to explore")}` : ` ${t("experiences to explore")}`}
      </div>

      {filteredActivities.length ? (
        <div className="activity-directory__grid">
          {filteredActivities.map((activity, index) => (
            <article key={activity.slug} className="directory-card">
              <Link href={`/activities/${activity.slug}`} className="directory-card__main">
                <figure className="directory-card__image">
                  <img
                    src={getActivityImageUrl(activity.image, 900)}
                    alt={activity.imageAlt}
                    loading={index < 3 ? "eager" : "lazy"}
                    decoding="async"
                  />
                  <span className="directory-card__category">{activity.category}</span>
                  {activity.popular && <span className="directory-card__popular">{t("Local favourite")}</span>}
                  <span className="directory-card__image-arrow" aria-hidden="true">↗</span>
                </figure>

                <div className="directory-card__content">
                  <div className="directory-card__title-row">
                    <h3>{activity.title}</h3>
                    {activity.duration && <span className="directory-card__duration">◷ {activity.duration}</span>}
                  </div>
                  <p className="directory-card__summary">{activity.summary}</p>

                  <div className="directory-card__location">
                    <span aria-hidden="true">⌖</span>
                    {activity.location}
                    {activity.pickup && (
                      <span className="directory-card__pickup">
                        · {t(activity.pickup.toLowerCase().includes("included") ? "Pickup included" : "Pickup on request")}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              <div className="directory-card__footer">
                {activity.priceOptions?.length ? (
                  <div className="directory-card__price">
                    {activity.priceOptions.map((option) => (
                      <div className="directory-card__price-option" key={option.label}>
                        <span>{option.label}</span>
                        <strong>{option.price}</strong>
                        {option.unit && <small>{option.unit}</small>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="directory-card__price directory-card__price--inquire">
                    <span>{t("Discover")}</span>
                    <strong>{t("Details")}</strong>
                  </div>
                )}
                <div className="directory-card__actions">
                  <Link href={`/activities/${activity.slug}`} className="directory-card__details">
                    {t("View details")} <span aria-hidden="true">↗</span>
                  </Link>
                  
                    <ActivityReserveButton activity={activity} className="directory-card__book">
                      {t("Reserve")} <span aria-hidden="true">↗</span>
                    </ActivityReserveButton>
                 
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="activity-directory__empty">
          <span aria-hidden="true">✳</span>
          <h3>{t("No experiences found just yet.")}</h3>
          <p>{t("Try a different search or browse all activities.")}</p>
          <button type="button" onClick={() => { setActiveCategory("All"); setSearchTerm(""); }}>
            {t("Show everything")}
          </button>
        </div>
      )}
    </section>
  );
}
