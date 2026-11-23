import type { Metadata } from "next";
import TransferDashboardWrapper from "../../../src/components/TransferDashboardWrapper";

export const metadata: Metadata = {
  title: "Surf lessons",
  robots: { index: false, follow: false },
};

export default function SurfLessonsCatalogPage() {
  return <TransferDashboardWrapper page="surf-lessons" />;
}
