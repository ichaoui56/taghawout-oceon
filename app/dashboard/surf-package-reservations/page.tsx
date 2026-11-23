import type { Metadata } from "next";
import TransferDashboardWrapper from "../../../src/components/TransferDashboardWrapper";

export const metadata: Metadata = {
  title: "Surf package reservations",
  robots: { index: false, follow: false },
};

export default function SurfPackageReservationsPage() {
  return <TransferDashboardWrapper page="surf-package-reservations" />;
}