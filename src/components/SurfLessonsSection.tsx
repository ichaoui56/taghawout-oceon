import Link from "next/link";
import type { Locale } from "../i18n";
import type { SurfLesson } from "../surf-lessons";

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

export default function SurfLessonsSection({ lessons, locale }: { lessons: SurfLesson[]; locale: Locale }) {
  const text = copy[locale];

  return (
    <section id="surf-lessons" className="service-section surf-lessons" aria-labelledby="surf-lessons-title">
      <div className="service-section__inner">
        <div className="surf-lessons__layout">
          <div className="surf-lessons__options" data-stagger>
            {lessons.map((lesson, index) => (
              <Link href={`/surf-lessons#lesson-${lesson.id}`} className="surf-lesson-option" key={lesson.id} data-card>
                <img src={lesson.image} alt="" loading={index === 0 ? "eager" : "lazy"} />
                <span className="surf-lesson-option__shade" />
                <span className="surf-lesson-option__number">{String(index + 1).padStart(2, "0")}</span>
                <span className="surf-lesson-option__copy">
                  <strong>{lesson.title[locale]}</strong>
                  <span>{lesson.description[locale]}</span>
                </span>
                <span className="surf-lesson-option__arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>

          <header className="surf-lessons__intro" data-reveal>
            <p className="service-section__eyebrow">{text.eyebrow}</p>
            <h2 id="surf-lessons-title">{text.heading}</h2>
            <p>{text.description}</p>
            <Link href="/surf-lessons" className="service-section__button surf-lessons__button">
              {text.viewAll} <span aria-hidden="true">→</span>
            </Link>
          </header>
        </div>
      </div>
    </section>
  );
}
