import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { getTransferDashboardData } from "../server/transfer-actions";
import { getManagedActivityCatalog, getManagedActivityCount } from "../server/activity-catalog";
import { getActivityReservationById, getActivityReservationCount, getActivityReservations } from "../server/activity-reservations";
import { getManagedBlogCatalog, getManagedBlogCount } from "../server/blog-catalog";
import { getSiteSeoSettings } from "../server/site-seo";
import { getConciergeSettings } from "../server/concierge";
import { getHeroPresentationSettings } from "../server/hero-presentation";
import { getSurfPackageReservationCount, getSurfPackageReservations, getSurfPackages } from "../server/surf-package-catalog";
import type { SurfPackage } from "../surf-packages";
import { getSurfLessonReservationCount, getSurfLessonReservations, getSurfLessons } from "../server/surf-lesson-catalog";
import type { SurfLesson } from "../surf-lessons";
import { getManagedCustomers } from "../server/customer-directory";
import type { ManagedCustomer } from "../server/customer-directory";
import { getManagedGoogleReviewCount, getManagedGoogleReviews } from "../server/google-reviews";
import { getManagedExperienceGallery } from "../server/experience-gallery";
import { getManagedHomepageSectionsSettings } from "../server/homepage-sections";
import TransferDashboard from "./TransferDashboard";
import type { ExperienceGalleryEntry } from "../experience-gallery";
import type { HomepageSectionsSettings } from "../homepage-sections";

export type DashboardPage =
  | "overview"
  | "requests"
  | "request-detail"
  | "transfers"
  | "activities"
  | "activity-detail"
  | "activity-reservations"
  | "activity-reservation-detail"
  | "blogs"
  | "reviews"
  | "settings"
  | "seo"
  | "concierge"
  | "presentation"
  | "experience-gallery"
  | "homepage-content"
  | "surf-packages"
  | "surf-package-detail"
  | "surf-package-reservations"
  | "surf-lessons"
  | "surf-lesson-detail"
  | "surf-lesson-reservations"
  | "customers";

export default async function TransferDashboardWrapper({
  page,
  detailId,
}: {
  page: DashboardPage;
  detailId?: string;
}) {
  await connection();
  const result = await getTransferDashboardData();
  if (!result.authorized) redirect("/dashboard/loginP");
  if (
    (page === "transfers" || page === "activities" || page === "activity-detail" || page === "activity-reservations" || page === "activity-reservation-detail" || page === "blogs" || page === "reviews" || page === "seo" || page === "concierge" || page === "presentation" || page === "experience-gallery" || page === "homepage-content" || page === "surf-packages" || page === "surf-package-detail" || page === "surf-package-reservations" || page === "surf-lessons" || page === "surf-lesson-detail" || page === "surf-lesson-reservations" || page === "customers") &&
    result.user.role !== "ADMIN"
  ) {
    redirect("/dashboard/requests");
  }
  const transferRequestDetail = page === "request-detail"
    ? result.data.requests.find((request) => request.id === detailId) ?? null
    : null;
  if (page === "request-detail" && !transferRequestDetail) notFound();
  const activityReservationDetail = page === "activity-reservation-detail" && detailId
    ? await getActivityReservationById(detailId)
    : null;
  if (page === "activity-reservation-detail" && !activityReservationDetail) notFound();
  const activityCatalog = page === "activities" || page === "activity-detail"
    ? await getManagedActivityCatalog()
    : [];
  const managedActivities = page === "activities" ? activityCatalog : [];
  const activityDetail = page === "activity-detail"
    ? activityCatalog.find((item) => item.activity.slug === detailId) ?? null
    : null;
  if (page === "activity-detail" && !activityDetail) notFound();
  const managedActivityCount = page === "activities" || page === "activity-detail"
    ? activityCatalog.length
    : result.user.role === "ADMIN"
      ? await getManagedActivityCount()
      : 0;
  const activityReservations = page === "activity-reservations" ? await getActivityReservations() : [];
  const activityReservationCount = result.user.role !== "ADMIN"
    ? 0
    : page === "activity-reservations"
      ? activityReservations.length
      : await getActivityReservationCount();
  const managedBlogs = page === "blogs" ? await getManagedBlogCatalog() : [];
  const reviewManagement = page === "reviews" ? await getManagedGoogleReviews() : null;
  const managedGoogleReviewCount = result.user.role !== "ADMIN"
    ? 0
    : page === "reviews"
      ? reviewManagement?.reviews.length ?? 0
      : await getManagedGoogleReviewCount();
  const managedBlogCount = result.user.role === "ADMIN"
    ? page === "blogs"
      ? managedBlogs.length
      : await getManagedBlogCount()
    : 0;
  const siteSeoSettings = page === "seo" ? await getSiteSeoSettings() : null;
  const conciergeSettings = page === "concierge" ? await getConciergeSettings() : null;
  const heroPresentationSettings = page === "presentation" ? await getHeroPresentationSettings() : null;
  const experienceGallery: ExperienceGalleryEntry[] = page === "experience-gallery"
    ? await getManagedExperienceGallery()
    : [];
  const homepageSectionsSettings: HomepageSectionsSettings | null = page === "homepage-content"
    ? await getManagedHomepageSectionsSettings()
    : null;
  const surfPackages = page === "surf-packages" || page === "surf-package-detail" ? await getSurfPackages() : [];
  const isNewSurfPackage = page === "surf-package-detail" && detailId === "new";
  const surfPackageDetail: SurfPackage | null = page !== "surf-package-detail"
    ? null
    : isNewSurfPackage
      ? {
          id: `surf-package-${crypto.randomUUID().slice(0, 8)}`,
          title: { en: "New surf package", fr: "Nouvelle formule surf" },
          duration: { en: "", fr: "" },
          description: { en: "", fr: "" },
          image: "",
          imageAlt: { en: "", fr: "" },
          activities: [{ en: "", fr: "" }],
          pricePerPerson: null,
          startTimes: [],
          popular: false,
          showOnHomepage: false,
          published: false,
        }
      : surfPackages.find((item) => item.id === detailId) ?? null;
  if (page === "surf-package-detail" && !surfPackageDetail) notFound();
  const shouldLoadSurfPackageReservations = result.user.role === "ADMIN" && page === "surf-package-reservations";
  const surfPackageReservations = shouldLoadSurfPackageReservations ? await getSurfPackageReservations() : [];
  const surfPackageReservationCount = result.user.role === "ADMIN"
    ? shouldLoadSurfPackageReservations
      ? surfPackageReservations.length
      : await getSurfPackageReservationCount()
    : 0;
  const surfLessons = page === "surf-lessons" || page === "surf-lesson-detail" ? await getSurfLessons() : [];
  const isNewSurfLesson = page === "surf-lesson-detail" && detailId === "new";
  const surfLessonDetail: SurfLesson | null = page !== "surf-lesson-detail"
    ? null
    : isNewSurfLesson
      ? {
          id: `surf-lesson-${crypto.randomUUID().slice(0, 8)}`,
          title: { en: "New surf lesson", fr: "Nouveau cours de surf" },
          duration: { en: "", fr: "" },
          description: { en: "", fr: "" },
          image: "",
          imageAlt: { en: "", fr: "" },
          activities: [{ en: "", fr: "" }],
          pricePerPerson: null,
          startTimes: [],
          popular: false,
          showOnHomepage: false,
          published: false,
        }
      : surfLessons.find((item) => item.id === detailId) ?? null;
  if (page === "surf-lesson-detail" && !surfLessonDetail) notFound();
  const shouldLoadSurfLessonReservations = result.user.role === "ADMIN" && page === "surf-lesson-reservations";
  const surfLessonReservations = shouldLoadSurfLessonReservations ? await getSurfLessonReservations() : [];
  const surfLessonReservationCount = result.user.role === "ADMIN"
    ? shouldLoadSurfLessonReservations
      ? surfLessonReservations.length
      : await getSurfLessonReservationCount()
    : 0;
  const customers: ManagedCustomer[] = result.user.role === "ADMIN" && page === "customers"
    ? await getManagedCustomers()
    : [];
  return (
    <TransferDashboard
      user={result.user}
      data={result.data}
      page={page}
      managedActivities={managedActivities}
      managedActivityCount={managedActivityCount}
      activityDetail={activityDetail}
      activityReservations={activityReservations}
      activityReservationCount={activityReservationCount}
      managedBlogs={managedBlogs}
      managedGoogleReviews={reviewManagement?.reviews ?? []}
      managedGoogleReviewCount={managedGoogleReviewCount}
      googleReviewSettings={reviewManagement?.settings ?? null}
      managedBlogCount={managedBlogCount}
      siteSeoSettings={siteSeoSettings}
      conciergeSettings={conciergeSettings}
      heroPresentationSettings={heroPresentationSettings}
      experienceGallery={experienceGallery}
      homepageSectionsSettings={homepageSectionsSettings}
      surfPackages={surfPackages}
      surfPackageDetail={surfPackageDetail}
      isNewSurfPackage={isNewSurfPackage}
      surfPackageReservations={surfPackageReservations}
      surfPackageReservationCount={surfPackageReservationCount}
      surfLessons={surfLessons}
      surfLessonDetail={surfLessonDetail}
      isNewSurfLesson={isNewSurfLesson}
      surfLessonReservations={surfLessonReservations}
      surfLessonReservationCount={surfLessonReservationCount}
      customers={customers}
      transferRequestDetail={transferRequestDetail}
      activityReservationDetail={activityReservationDetail}
    />
  );
}
