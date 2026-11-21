import Link from "next/link";
import Nav from "./components/Nav";
import ScrollFilm from "./components/ScrollFilm";
import ScrollMotion from "./components/ScrollMotion";
import SurfPackagesSection from "./components/SurfPackagesSection";
import SurfLessonsSection from "./components/SurfLessonsSection";
import ActivitiesAdventuresSection from "./components/ActivitiesAdventuresSection";
import TeamMembersSection from "./components/TeamMembersSection";
import BlogSection from "./components/BlogSection";
import WhyChooseUs from "./components/WhyChooseUs";
import GoogleReviews from "./components/GoogleReviews";
import FinalCallToAction from "./components/FinalCallToAction";
import PageLoader from "./components/PageLoader";
import type { Activity } from "./activities";
import type { BlogPost } from "./blogs";
import { translate, type Locale } from "./i18n";
import type { GoogleReviewsData } from "./server/google-reviews";
import ExperienceGallery from "./components/ExperienceGallery";
import HeroPresentation from "./components/HeroPresentation";

export default function App({ activities, posts, locale, reviews }: { activities: Activity[]; posts: BlogPost[]; locale: Locale; reviews: GoogleReviewsData | null }) {
  return (
    <>
      <PageLoader />
      <Link
        href="#ocean-experience"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-paper focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to the content
      </Link>
      <Nav />
      <Link href="#top" className="back-to-top" aria-label={translate(locale, "Back to top")} title={translate(locale, "Back to top")}>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 19V5m-6 6 6-6 6 6" />
        </svg>
      </Link>
      <main>
        <ScrollFilm locale={locale} />
        <ScrollMotion>
          <HeroPresentation locale={locale} />
          <ExperienceGallery activities={activities} locale={locale} />
          <SurfPackagesSection locale={locale} />
          <div className="surf-section-transition" aria-hidden="true" />
          <SurfLessonsSection activities={activities} locale={locale} />
          <div className="surf-section-transition" aria-hidden="true" />
          <ActivitiesAdventuresSection activities={activities} locale={locale} />
          <div className="surf-section-transition" aria-hidden="true" />
          <TeamMembersSection locale={locale} />
          <div className="surf-section-transition" aria-hidden="true" />
          <div className="surf-section-transition" aria-hidden="true" />
          <BlogSection locale={locale} posts={posts} />
          <div className="surf-section-transition" aria-hidden="true" />
          <div className="surf-section-transition" aria-hidden="true" />
          <GoogleReviews data={reviews} locale={locale} />
          <WhyChooseUs locale={locale} />
        </ScrollMotion>
        <FinalCallToAction locale={locale} />
      </main>
    </>
  );
}
