import type { Metadata } from "next";
import TransferDashboardWrapper from "../../../src/components/TransferDashboardWrapper";

export const metadata: Metadata = {
  title: "Homepage content",
  robots: { index: false, follow: false },
};

export default function HomepageContentPage() {
  return <TransferDashboardWrapper page="homepage-content" />;
}