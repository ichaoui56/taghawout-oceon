import type { Metadata } from "next";
import SurfLessonsPage from "../../src/components/SurfLessonsPage";
import "./surf-lessons.css";

export const metadata: Metadata = {
  title: "Surf Lessons in Taghazout",
  description: "Learn to surf in Taghazout with professional instructors, small groups and coaching for every level.",
  alternates: { canonical: "/surf-lessons" },
};

export default function Page() {
  return <SurfLessonsPage />;
}