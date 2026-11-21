import Link from "next/link";
import type { Activity } from "../activities";
import type { Locale } from "../i18n";

const copy = {
  en: {
    eyebrow: "LEARN IN THE LINEUP",
    heading: "YOUR NEXT WAVE STARTS HERE",
    description: "Whether you’re catching your first wave or improving your surfing skills, discover the right surf experience for you.",
    groupTitle: "GROUP SURF LESSONS",
    groupDescription: "Learn to surf in a fun, social environment alongside other participants.",
    privateTitle: "PRIVATE SURF LESSONS",
    privateFallback: "Enjoy a personalized surfing experience with individual attention from an instructor.",
    guidanceTitle: "SURF GUIDANCE",
    guidanceDescription: "Discover local surf spots and improve your surfing experience with dedicated guidance.",
    viewAll: "VIEW ALL SURF LESSONS",
  },
  fr: {
    eyebrow: "APPRENDRE DANS LES VAGUES",
    heading: "VOTRE PROCHAINE VAGUE COMMENCE ICI",
    description: "Pour prendre votre première vague ou progresser, découvrez l'expérience surf qui vous correspond.",
    groupTitle: "COURS DE SURF EN GROUPE",
    groupDescription: "Apprenez le surf dans une ambiance conviviale aux côtés d'autres participants.",
    privateTitle: "COURS DE SURF PRIVÉ",
    privateFallback: "Profitez d'une expérience personnalisée avec l'attention individuelle d'un moniteur.",
    guidanceTitle: "ACCOMPAGNEMENT SURF",
    guidanceDescription: "Découvrez les spots locaux et profitez de conseils dédiés pour vos sessions.",
    viewAll: "VOIR TOUS LES COURS DE SURF",
  },
} as const;

export default function SurfLessonsSection({ activities, locale }: { activities: Activity[]; locale: Locale }) {
  const text = copy[locale];
  const privateLesson = activities.find((activity) => activity.slug === "surfing");
  const lessons = [
    { number: "01", title: text.groupTitle, description: text.groupDescription, image: "https://images.unsplash.com/photo-1455729552865-3658a5d39692?auto=format&fit=crop&w=1000&q=88", href: "/activities" },
    { number: "02", title: text.privateTitle, description: privateLesson?.summary ?? text.privateFallback, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=88", href: privateLesson ? `/activities/${privateLesson.slug}` : "/activities" },
    { number: "03", title: text.guidanceTitle, description: text.guidanceDescription, image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=88", href: "/activities" },
  ];

  return (
    <section id="surf-lessons" className="service-section surf-lessons" aria-labelledby="surf-lessons-title">
      <div className="service-section__inner">
        <div className="surf-lessons__layout">
          <div className="surf-lessons__options" data-stagger>
            {lessons.map((lesson) => (
              <Link href={lesson.href} className="surf-lesson-option" key={lesson.number} data-card>
                <img src={lesson.image} alt="" loading={lesson.number === "01" ? "eager" : "lazy"} />
                <span className="surf-lesson-option__shade" />
                <span className="surf-lesson-option__number">{lesson.number}</span>
                <span className="surf-lesson-option__copy">
                  <strong>{lesson.title}</strong>
                  <span>{lesson.description}</span>
                </span>
                <span className="surf-lesson-option__arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>

          <header className="surf-lessons__intro" data-reveal>
            <p className="service-section__eyebrow">{text.eyebrow}</p>
            <h2 id="surf-lessons-title">{text.heading}</h2>
            <p>{text.description}</p>
            <Link href="/activities" className="service-section__button surf-lessons__button">
              {text.viewAll} <span aria-hidden="true">→</span>
            </Link>
          </header>
        </div>
      </div>
    </section>
  );
}
