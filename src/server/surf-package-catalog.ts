import "server-only";

import { cache } from "react";
import type { SurfPackageReservationStatus } from "@prisma/client";
import { normalizeSurfPackages, defaultSurfPackages, type SurfPackage } from "../surf-packages";
import { prisma } from "./prisma";

export const surfPackageCatalogId = "catalog";

export const getSurfPackages = cache(async (): Promise<SurfPackage[]> => {
  if (!process.env.DATABASE_URL) return defaultSurfPackages;
  const row = await prisma.surfPackageCatalogSetting.findUnique({ where: { id: surfPackageCatalogId } });
  return row ? normalizeSurfPackages(row.data) : defaultSurfPackages;
});

export type ManagedSurfPackageReservation = {
  id: string;
  status: SurfPackageReservationStatus;
  packageId: string;
  packageTitle: string;
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

export async function getSurfPackageReservations(): Promise<ManagedSurfPackageReservation[]> {
  if (!process.env.DATABASE_URL) return [];
  const rows = await prisma.surfPackageReservation.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((row) => ({
    ...row,
    bookingDate: row.bookingDate.toISOString().slice(0, 10),
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function getSurfPackageReservationCount() {
  if (!process.env.DATABASE_URL) return 0;
  return prisma.surfPackageReservation.count();
}