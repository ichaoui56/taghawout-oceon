import type { Metadata } from "next";
import TransferDashboardWrapper from "../../../src/components/TransferDashboardWrapper";

export const metadata: Metadata = {
  title: "Surf packages",
  robots: { index: false, follow: false },
};

export default function SurfPackagesManagementPage() {
  return <TransferDashboardWrapper page="surf-packages" />;
}