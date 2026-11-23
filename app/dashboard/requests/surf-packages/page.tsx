import type { Metadata } from "next";
import TransferDashboardWrapper from "../../../../src/components/TransferDashboardWrapper";

export const metadata: Metadata = {
  title: "Surf package reservations",
  robots: { index: false, follow: false },
};

export default function SurfPackageRequestsPage() {
  return <TransferDashboardWrapper page="surf-package-reservations" />;
}