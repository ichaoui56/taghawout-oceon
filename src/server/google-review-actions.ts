"use server";

import { revalidatePath } from "next/cache";
import { getDashboardUser } from "./dashboard-auth";
import { prisma } from "./prisma";

function inputRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("Review details are invalid.");
  return value as Record<string, unknown>;
}

function text(value: unknown, label: string, maximum: number, required = true): string {
  if (typeof value !== "string") {
    if (!required && (value === undefined || value === null)) return "";
    throw new Error(`${label} is invalid.`);
  }
  const result = value.trim();
  if (required && !result) throw new Error(`${label} is required.`);
  if (result.length > maximum) throw new Error(`${label} must be ${maximum} characters or fewer.`);
  return result;
}

function validateHttpsUrl(value: string, label: string) {
  if (!value) return;
  try {
    if (new URL(value).protocol !== "https:") throw new Error();
  } catch {
    throw new Error(`${label} must be a valid HTTPS URL.`);
  }
}

async function requireReviewAdmin() {
  const user = await getDashboardUser();
  if (!user || user.role !== "ADMIN") throw new Error("Only an administrator can manage customer reviews.");
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before managing customer reviews.");
}

function revalidateReviewPages() {
  revalidatePath("/", "page");
  revalidatePath("/dashboard/reviews", "page");
}

export async function saveManagedGoogleReview(id: string | null, value: unknown) {
  await requireReviewAdmin();
  const input = inputRecord(value);
  const name = text(input.name, "Customer name", 120);
  const dateAdded = text(input.dateAdded, "Review date", 10);
  const parsedDate = new Date(`${dateAdded}T00:00:00.000Z`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== dateAdded) {
    throw new Error("Enter a valid review date.");
  }
  const photoUrl = text(input.photoUrl, "Profile picture URL", 1200, false);
  validateHttpsUrl(photoUrl, "Profile picture URL");
  const message = text(input.message, "English review text", 5000);
  const messageFr = text(input.messageFr, "French review text", 5000, false);
  const rating = Number(input.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Choose a rating from 1 to 5 stars.");
  if (typeof input.isPublished !== "boolean") throw new Error("Publication status is invalid.");
  if (typeof input.isDemo !== "boolean") throw new Error("Demo status is invalid.");
  if (input.isDemo && input.isPublished) throw new Error("Demo reviews must be replaced with real customer content before publishing.");

  if (id) {
    const existing = await prisma.customerReview.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new Error("This review no longer exists.");
    await prisma.customerReview.update({
      where: { id },
      data: { name, dateAdded: parsedDate, photoUrl, message, messageFr, rating, isPublished: input.isPublished, isDemo: input.isDemo },
    });
  } else {
    await prisma.customerReview.create({
      data: { name, dateAdded: parsedDate, photoUrl, message, messageFr, rating, isPublished: input.isPublished, isDemo: input.isDemo },
    });
  }
  revalidateReviewPages();
}

export async function deleteManagedGoogleReview(id: string) {
  await requireReviewAdmin();
  const existing = await prisma.customerReview.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new Error("This review no longer exists.");
  await prisma.customerReview.delete({ where: { id } });
  revalidateReviewPages();
}

export async function saveGoogleReviewSettings(value: unknown) {
  await requireReviewAdmin();
  const input = inputRecord(value);
  const location = text(input.location, "Business location", 240, false);
  const googleUrl = text(input.googleUrl, "Google profile URL", 1200, false);
  const HostelGrowthUrl = text(input.HostelGrowthUrl, "HostelGrowth URL", 1200, false);
  validateHttpsUrl(googleUrl, "Google profile URL");
  validateHttpsUrl(HostelGrowthUrl, "HostelGrowth URL");

  await prisma.googleReviewSetting.upsert({
    where: { id: "homepage" },
    create: { id: "homepage", location, googleUrl, HostelGrowthUrl },
    update: { location, googleUrl, HostelGrowthUrl },
  });
  revalidateReviewPages();
}