import type { Metadata } from "next";
import TransferDashboardWrapper from "../../../src/components/TransferDashboardWrapper";

export const metadata: Metadata = {
  title: "Experience gallery",
  robots: { index: false, follow: false },
};

export default function ExperienceGalleryPage() {
  return <TransferDashboardWrapper page="experience-gallery" />;
}