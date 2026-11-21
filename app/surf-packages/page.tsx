import type { Metadata } from "next";
import SurfPackagesPage from "../../src/components/SurfPackagesPage";
import "./surf-packages.css";

export const metadata: Metadata = {
  title: "Surf Packages in Taghazout",
  description: "Find your perfect surf holiday in Taghazout, Morocco, with surf, coaching, yoga and local experiences by the Atlantic.",
  alternates: { canonical: "/surf-packages" },
};

export default function Page() {
  return <SurfPackagesPage />;
}