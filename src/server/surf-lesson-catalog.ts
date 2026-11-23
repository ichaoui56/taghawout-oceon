import "server-only";

import { cache } from "react";
import type { SurfLessonReservationStatus } from "@prisma/client";
import { normalizeSurfLessons, defaultSurfLessons, type SurfLesson } from "../surf-lessons";
import { prisma } from "./prisma";

export const surfLessonCatalogId = "catalog";

export const getSurfLessons = cache(async (): Promise<SurfLesson[]> => {
  if (!process.env.DATABASE_URL) return defaultSurfLessons;
  const row = await prisma.surfLessonCatalogSetting.findUnique({ where: { id: surfLessonCatalogId } });
  return row ? normalizeSurfLessons(row.data) : defaultSurfLessons;
});

export type ManagedSurfLessonReservation = {
  id: string;
  status: SurfLessonReservationStatus;
  lessonId: string;
  lessonTitle: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  notes: string | null;
  bookingDate: string;
  bookingTime: string;
  guests: number;
  pricePerPerson: number;
  estimatedTotal: number;
  currency: string;
  createdAt: string;
};

export async function getSurfLessonReservations(): Promise<ManagedSurfLessonReservation[]> {
  if (!process.env.DATABASE_URL) return [];
  const rows = await prisma.surfLessonReservation.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((row) => ({
    ...row,
    bookingDate: row.bookingDate.toISOString().slice(0, 10),
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function getSurfLessonReservationCount() {
  if (!process.env.DATABASE_URL) return 0;
  return prisma.surfLessonReservation.count();
}