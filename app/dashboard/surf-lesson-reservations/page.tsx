import type { Metadata } from "next";
import TransferDashboardWrapper from "../../../src/components/TransferDashboardWrapper";

export const metadata: Metadata = {
  title: "Surf lesson reservations",
  robots: { index: false, follow: false },
};

export default function SurfLessonReservationsPage() {
  return <TransferDashboardWrapper page="surf-lesson-reservations" />;
}
