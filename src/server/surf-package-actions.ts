"use server";

import { Prisma, type SurfPackageReservationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getDashboardUser } from "./dashboard-auth";
import { prisma } from "./prisma";
import { surfPackageCatalogId } from "./surf-package-catalog";
import { defaultSurfPackages, normalizeSurfPackages } from "../surf-packages";
import type { SurfPackage, SurfPackageLocaleText } from "../surf-packages";

function object(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(`${label} is invalid.`);
  return value as Record<string, unknown>;
}

function text(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== "string") throw new Error(`${label} is invalid.`);
  const result = value.trim();
  if (!result) throw new Error(`${label} is required.`);
  if (result.length > maxLength) throw new Error(`${label} must be ${maxLength} characters or fewer.`);
  return result;
}

function localized(value: unknown, label: string, maxLength: number): SurfPackageLocaleText {
  const input = object(value, label);
  return {
    en: text(input.en, `${label} (English)`, maxLength),
    fr: text(input.fr, `${label} (French)`, maxLength),
  };
}

function image(value: unknown, label: string) {
  const result = text(value, label, 1200);
  if (result.startsWith("/") && !result.startsWith("//")) return result;
  try {
    if (new URL(result).protocol === "https:") return result;
  } catch {
    // Reject malformed and non-HTTPS external image URLs.
  }
  throw new Error(`${label} must be a local path or HTTPS URL.`);
}

function parsePackages(value: unknown): SurfPackage[] {
  if (!Array.isArray(value) || value.length > 50) {
    throw new Error("Add no more than 50 packages.");
  }
  const ids = new Set<string>();
  const packages = value.map((value, index): SurfPackage => {
    const input = object(value, `Package ${index + 1}`);
    const id = text(input.id, `Package ${index + 1} ID`, 80);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || ids.has(id)) throw new Error(`Package ${index + 1} needs a unique URL-safe ID.`);
    ids.add(id);
    if (typeof input.pricePerPerson !== "number" && input.pricePerPerson !== null) {
      throw new Error(`Package ${index + 1} price is invalid.`);
    }
    const pricePerPerson = input.pricePerPerson;
    if (pricePerPerson !== null && (!Number.isFinite(pricePerPerson) || pricePerPerson <= 0 || pricePerPerson > 100000)) {
      throw new Error(`Package ${index + 1} price must be greater than zero and at most €100,000.`);
    }
    if (!Array.isArray(input.activities) || input.activities.length < 1 || input.activities.length > 30) {
      throw new Error(`Package ${index + 1} must include between 1 and 30 activities.`);
    }
    if (!Array.isArray(input.startTimes) || input.startTimes.length > 20) {
      throw new Error(`Package ${index + 1} can have up to 20 start times.`);
    }
    const startTimes = input.startTimes.map((value, timeIndex) => text(value, `Package ${index + 1} start time ${timeIndex + 1}`, 5));
    const invalidTimeIndex = startTimes.findIndex((time) => !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time));
    if (invalidTimeIndex >= 0) throw new Error(`Package ${index + 1} start time ${invalidTimeIndex + 1} is invalid. Use 24-hour time.`);
    const duplicateTimeIndex = startTimes.findIndex((time, timeIndex) => startTimes.indexOf(time) !== timeIndex);
    if (duplicateTimeIndex >= 0) throw new Error(`Package ${index + 1} start time ${duplicateTimeIndex + 1} duplicates start time ${startTimes.indexOf(startTimes[duplicateTimeIndex]) + 1}.`);
    if (typeof input.popular !== "boolean" || typeof input.showOnHomepage !== "boolean" || typeof input.published !== "boolean") {
      throw new Error(`Package ${index + 1} publication options are invalid.`);
    }
    if (input.showOnHomepage && !input.published) throw new Error(`Unpublished package ${index + 1} cannot appear on the homepage.`);

    return {
      id,
      title: localized(input.title, `Package ${index + 1} name`, 120),
      duration: localized(input.duration, `Package ${index + 1} duration`, 80),
      description: localized(input.description, `Package ${index + 1} description`, 700),
      image: image(input.image, `Package ${index + 1} image`),
      imageAlt: localized(input.imageAlt, `Package ${index + 1} image description`, 200),
      activities: input.activities.map((activity, activityIndex) => localized(activity, `Package ${index + 1} activity ${activityIndex + 1}`, 120)),
      pricePerPerson,
      startTimes,
      popular: input.popular,
      showOnHomepage: input.showOnHomepage,
      published: input.published,
    };
  });
  if (packages.filter((item) => item.popular).length > 1) throw new Error("Only one package can be marked most popular.");
  if (packages.filter((item) => item.showOnHomepage).length > 3) throw new Error("Choose no more than three homepage packages.");
  return packages;
}

async function requireAdmin() {
  const user = await getDashboardUser();
  if (!user || user.role !== "ADMIN") throw new Error("Only an administrator can manage surf packages.");
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before managing surf packages.");
}

export async function saveSurfPackage(id: string, value: unknown, isNew: boolean) {
  await requireAdmin();
  if (typeof isNew !== "boolean") throw new Error("Package operation is invalid.");
  const [packageItem] = parsePackages([value]);
  if (packageItem.id !== id) throw new Error("The package ID cannot be changed while editing.");
  const row = await prisma.surfPackageCatalogSetting.findUnique({ where: { id: surfPackageCatalogId } });
  const current = row ? normalizeSurfPackages(row.data) : defaultSurfPackages;
  const existingIndex = current.findIndex((item) => item.id === id);
  if (isNew && existingIndex >= 0) throw new Error("A package with this ID already exists.");
  if (!isNew && existingIndex < 0) throw new Error("This package was deleted or no longer exists.");
  const next = existingIndex < 0
    ? [...current, packageItem]
    : current.map((item, index) => index === existingIndex ? packageItem : item);
  if (packageItem.popular) {
    next.forEach((item) => {
      if (item.id !== id) item.popular = false;
    });
  }
  if (next.filter((item) => item.showOnHomepage).length > 3) throw new Error("Choose no more than three homepage packages.");
  await prisma.surfPackageCatalogSetting.upsert({
    where: { id: surfPackageCatalogId },
    create: { id: surfPackageCatalogId, data: next as Prisma.InputJsonValue },
    update: { data: next as Prisma.InputJsonValue },
  });
  revalidateSurfPackagePaths();
  return { ok: true as const };
}

export async function deleteSurfPackage(id: string) {
  await requireAdmin();
  const row = await prisma.surfPackageCatalogSetting.findUnique({ where: { id: surfPackageCatalogId } });
  const current = row ? normalizeSurfPackages(row.data) : defaultSurfPackages;
  if (!current.some((item) => item.id === id)) throw new Error("This package no longer exists.");
  const next = current.filter((item) => item.id !== id);
  await prisma.surfPackageCatalogSetting.upsert({
    where: { id: surfPackageCatalogId },
    create: { id: surfPackageCatalogId, data: next as Prisma.InputJsonValue },
    update: { data: next as Prisma.InputJsonValue },
  });
  revalidateSurfPackagePaths();
  return { ok: true as const };
}

function revalidateSurfPackagePaths() {
  revalidatePath("/");
  revalidatePath("/surf-packages");
  revalidatePath("/dashboard/surf-packages");
  revalidatePath("/dashboard/surf-package-reservations");
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function submitSurfPackageReservation(value: unknown) {
  if (!process.env.DATABASE_URL) throw new Error("Reservations are temporarily unavailable. Please contact our team.");
  const input = object(value, "Package reservation");
  const packageId = text(input.packageId, "Package", 80);
  const packagesRow = await prisma.surfPackageCatalogSetting.findUnique({ where: { id: surfPackageCatalogId } });
  const packages = packagesRow ? normalizeSurfPackages(packagesRow.data) : defaultSurfPackages;
  const selectedPackage = packages.find((item) => item.id === packageId && item.published);
  if (!selectedPackage) throw new Error("This surf package is no longer available.");
  if (selectedPackage.pricePerPerson === null) throw new Error("This package is not accepting reservations until its per-person price is set.");
  const bookingDate = text(input.bookingDate, "Date", 10);
  if (!validDate(bookingDate) || bookingDate < new Date().toISOString().slice(0, 10)) throw new Error("Choose a valid future date.");
  const bookingTime = text(input.bookingTime, "Time", 5);
  if (!selectedPackage.startTimes.includes(bookingTime)) throw new Error("Choose an available start time for this package.");
  const guests = Number(input.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > 30) throw new Error("Choose between 1 and 30 guests.");
  const customerName = text(input.customerName, "Your name", 120);
  const customerPhone = text(input.customerPhone, "Phone number", 80);
  const customerEmail = input.customerEmail === undefined || input.customerEmail === ""
    ? null
    : text(input.customerEmail, "Email address", 254);
  if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) throw new Error("Enter a valid email address.");
  const notes = typeof input.notes === "string" ? input.notes.trim().slice(0, 1500) : "";
  const estimatedTotal = selectedPackage.pricePerPerson * guests;
  await prisma.surfPackageReservation.create({
    data: {
      packageId: selectedPackage.id,
      packageTitle: selectedPackage.title.en,
      customerName,
      customerPhone,
      customerEmail,
      notes: notes || null,
      bookingDate: new Date(`${bookingDate}T00:00:00.000Z`),
      bookingTime,
      guests,
      pricePerPerson: selectedPackage.pricePerPerson,
      estimatedTotal,
      currency: "EUR",
    },
  });
  revalidatePath("/dashboard/surf-package-reservations");
  return { ok: true as const, estimatedTotal };
}

export async function updateSurfPackageReservationStatus(id: string, status: SurfPackageReservationStatus) {
  await requireAdmin();
  if (!id || !["NEW", "CONFIRMED", "COMPLETED", "CANCELLED"].includes(status)) throw new Error("Reservation update is invalid.");
  await prisma.surfPackageReservation.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard/surf-package-reservations");
  return { ok: true as const };
}