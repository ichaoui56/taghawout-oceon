import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { getTransferDashboardData } from "../server/transfer-actions";
import { getManagedActivityCatalog, getManagedActivityCount } from "../server/activity-catalog";
import { getActivityReservationById, getActivityReservationCount, getActivityReservations } from "../server/activity-reservations";
import { getManagedBlogCatalog, getManagedBlogCount } from "../server/blog-catalog";
import { getSiteSeoSettings } from "../server/site-seo";
import { getConciergeSettings } from "../server/concierge";
import { getManagedGoogleReviewCount, getManagedGoogleReviews } from "../server/google-reviews";
import TransferDashboard from "./TransferDashboard";

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
  | "concierge";

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
    (page === "transfers" || page === "activities" || page === "activity-detail" || page === "activity-reservations" || page === "activity-reservation-detail" || page === "blogs" || page === "reviews" || page === "seo" || page === "concierge") &&
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
      transferRequestDetail={transferRequestDetail}
      activityReservationDetail={activityReservationDetail}
    />
  );
}
