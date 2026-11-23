import type { Metadata } from "next";
import TransferDashboardWrapper from "../../../src/components/TransferDashboardWrapper";

export const metadata: Metadata = {
  title: "Hero presentation",
  robots: { index: false, follow: false },
};

export default function HeroPresentationPage() {
  return <TransferDashboardWrapper page="presentation" />;
}