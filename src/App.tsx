import Link from "next/link";
import Nav from "./components/Nav";
import ScrollFilm from "./components/ScrollFilm";
import ScrollMotion from "./components/ScrollMotion";
import AirportTransferWrapper from "./components/AirportTransferWrapper";
import Stays from "./components/Stays";
import Experiences from "./components/Experiences";
import Concierge from "./components/Concierge";
import JourneySteps from "./components/JourneySteps";
import BlogSection from "./components/BlogSection";
import WhyChooseUs from "./components/WhyChooseUs";
import GoogleReviews from "./components/GoogleReviews";
import FinalCallToAction from "./components/FinalCallToAction";
import PageLoader from "./components/PageLoader";
import type { Activity } from "./activities";
import type { BlogPost } from "./blogs";
import { translate, type Locale } from "./i18n";
import type { ConciergeSectionSettings } from "./concierge";
import type { GoogleReviewsData } from "./server/google-reviews";

export default function App({ activities, posts, locale, concierge, reviews }: { activities: Activity[]; posts: BlogPost[]; locale: Locale; concierge: ConciergeSectionSettings; reviews: GoogleReviewsData | null }) {
  return (
    <>
      <PageLoader />
      <Link
        href="#transfer"
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
          <AirportTransferWrapper locale={locale} />
          <Stays locale={locale} />
          <Experiences activities={activities} locale={locale} />
          <Concierge locale={locale} settings={concierge} />
          <JourneySteps locale={locale} />
          <BlogSection locale={locale} posts={posts} />
          <GoogleReviews data={reviews} locale={locale} />
          <WhyChooseUs locale={locale} />
        </ScrollMotion>
        <FinalCallToAction locale={locale} />
      </main>
    </>
  );
}
