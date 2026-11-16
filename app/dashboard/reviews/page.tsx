import type { Metadata } from "next";
import TransferDashboardWrapper from "../../../src/components/TransferDashboardWrapper";

export const metadata: Metadata = {
  title: "Manage customer reviews",
  robots: { index: false, follow: false },
};

export default function ManageReviewsPage() {
  return <TransferDashboardWrapper page="reviews" />;
}