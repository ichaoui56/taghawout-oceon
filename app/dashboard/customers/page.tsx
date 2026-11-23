import type { Metadata } from "next";
import TransferDashboardWrapper from "../../../src/components/TransferDashboardWrapper";

export const metadata: Metadata = {
  title: "Customers",
  robots: { index: false, follow: false },
};

export default function CustomersPage() {
  return <TransferDashboardWrapper page="customers" />;
}