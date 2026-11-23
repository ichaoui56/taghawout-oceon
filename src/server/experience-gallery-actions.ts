"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { MAX_EXPERIENCE_GALLERY_ENTRIES, type ExperienceGalleryEntry } from "../experience-gallery";
import { getDashboardUser } from "./dashboard-auth";
import { experienceGallerySettingId } from "./experience-gallery";
import { prisma } from "./prisma";

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

function image(value: unknown, label: string): string {
  const result = text(value, label, 1200);
  if (result.startsWith("/") && !result.startsWith("//")) return result;
  try {
    if (new URL(result).protocol === "https:") return result;
  } catch {
    // Reject malformed or non-HTTPS image URLs below.
  }
  throw new Error(`${label} must be a local path or HTTPS URL.`);
}

function parseEntries(value: unknown): ExperienceGalleryEntry[] {
  if (!Array.isArray(value)) throw new Error("The experience gallery is invalid.");
  if (value.length > MAX_EXPERIENCE_GALLERY_ENTRIES) {
    throw new Error(`The experience gallery can contain at most ${MAX_EXPERIENCE_GALLERY_ENTRIES} images.`);
  }
  const ids = new Set<string>();
  return value.map((entry, index) => {
    const item = object(entry, `Image ${index + 1}`);
    const id = text(item.id, `Image ${index + 1} ID`, 100);
    if (ids.has(id)) throw new Error("Each gallery image must have a unique ID.");
    ids.add(id);
    const title = object(item.title, `Image ${index + 1} title`);
    return {
      id,
      image: image(item.image, `Image ${index + 1} URL`),
      title: {
        en: text(title.en, `Image ${index + 1} English title`, 120),
        fr: text(title.fr, `Image ${index + 1} French title`, 120),
      },
    };
  });
}

export async function saveExperienceGallery(value: unknown) {
  const user = await getDashboardUser();
  if (!user || user.role !== "ADMIN") throw new Error("Only an administrator can manage the experience gallery.");
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before managing the experience gallery.");
  const entries = parseEntries(value);
  await prisma.experienceGallerySetting.upsert({
    where: { id: experienceGallerySettingId },
    create: { id: experienceGallerySettingId, data: entries as Prisma.InputJsonValue },
    update: { data: entries as Prisma.InputJsonValue },
  });
  revalidatePath("/");
  revalidatePath("/dashboard/experience-gallery");
  return { ok: true as const };
}