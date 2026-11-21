"use client";

import { useEffect, useState } from "react";
import type { Activity } from "../activities";
import type { ActivityExperience } from "../activity-experiences";
import type { Locale } from "../i18n";
import ActivityExperienceCard from "./ActivityExperienceCard";

export default function ActivityDirectory({ activities, experiences, locale }: { activities: Activity[]; experiences: ActivityExperience[]; locale: Locale }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const categories = ["All", ...new Set(experiences.map((experience) => experience.category[locale]))];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    setActiveCategory(category && categories.includes(category) ? category : "All");
    setSearchTerm(params.get("search") ?? "");
  }, []);

  const query = searchTerm.trim().toLocaleLowerCase(locale);
  const filteredExperiences = experiences.filter((experience) => {
    const copy = experience[locale];
    const matchesCategory = activeCategory === "All" || copy.category === activeCategory;
    const matchesSearch = !query || [copy.title, copy.category, copy.summary].some((value) => value.toLocaleLowerCase(locale).includes(query));
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="activity-explorer" id="activity-list" aria-label={locale === "fr" ? "Explorer les activités" : "Explore activities"}>
      <div className="activity-explorer__toolbar">
        <div className="activity-explorer__filters" role="group" aria-label={locale === "fr" ? "Filtrer par catégorie" : "Filter by category"}>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={activeCategory === category}
              className={activeCategory === category ? "is-active" : ""}
              onClick={() => setActiveCategory(category)}
            >
              {category === "All" ? (locale === "fr" ? "Tout explorer" : "All activities") : category}
            </button>
          ))}
        </div>
        <label className="activity-explorer__search">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">{locale === "fr" ? "Rechercher des activités" : "Search activities"}</span>
          <input
            type="search"
            aria-label={locale === "fr" ? "Rechercher des activités" : "Search activities"}
            placeholder={locale === "fr" ? "Rechercher" : "Search activities"}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>
      </div>

      <p className="activity-explorer__count" aria-live="polite">
        <strong>{String(filteredExperiences.length).padStart(2, "0")}</strong>
        {locale === "fr" ? " expériences à découvrir" : " experiences to explore"}
      </p>

      {filteredExperiences.length ? (
        <div className="activity-experience-grid">
          {filteredExperiences.map((experience) => (
            <ActivityExperienceCard
              key={experience.slug}
              experience={experience}
              activity={activities.find((activity) => activity.slug === experience.slug)}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <div className="activity-explorer__empty">
          <h3>{locale === "fr" ? "Aucune activité trouvée." : "No activities found."}</h3>
          <button type="button" onClick={() => { setActiveCategory("All"); setSearchTerm(""); }}>
            {locale === "fr" ? "Tout explorer" : "Show all activities"}
          </button>
        </div>
      )}
    </section>
  );
}