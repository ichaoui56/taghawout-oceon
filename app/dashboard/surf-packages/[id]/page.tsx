import type { Metadata } from "next";
import TransferDashboardWrapper from "../../../../src/components/TransferDashboardWrapper";

export const metadata: Metadata = {
  title: "Edit surf package",
  robots: { index: false, follow: false },
};

export default async function SurfPackageEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TransferDashboardWrapper page="surf-package-detail" detailId={id} />;
}