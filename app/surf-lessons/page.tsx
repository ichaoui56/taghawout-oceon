import type { Metadata } from "next";
import SurfLessonsPage from "../../src/components/SurfLessonsPage";
import { getSurfLessons } from "../../src/server/surf-lesson-catalog";
import "./surf-lessons.css";

export const metadata: Metadata = {
  title: "Surf Lessons in Taghazout",
  description: "Learn to surf in Taghazout with professional instructors, small groups and coaching for every level.",
  alternates: { canonical: "/surf-lessons" },
};

export default async function Page() {
  const lessons = await getSurfLessons();
  return <SurfLessonsPage lessons={lessons.filter((lesson) => lesson.published)} />;
}