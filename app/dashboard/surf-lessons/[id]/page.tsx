import type { Metadata } from "next";
import TransferDashboardWrapper from "../../../../src/components/TransferDashboardWrapper";

export const metadata: Metadata = {
  title: "Surf lesson details",
  robots: { index: false, follow: false },
};

export default async function SurfLessonDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TransferDashboardWrapper page="surf-lesson-detail" detailId={id} />;
}
