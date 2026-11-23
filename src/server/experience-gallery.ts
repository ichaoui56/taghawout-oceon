import "server-only";

import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { MAX_EXPERIENCE_GALLERY_ENTRIES, type ExperienceGalleryEntry } from "../experience-gallery";
import { localizeTree } from "../i18n";
import { getPublicActivityCatalog } from "./activity-catalog";
import { prisma } from "./prisma";
import { getDashboardUser } from "./dashboard-auth";

const experienceGallerySettingId = "homepage";

function parseEntries(value: Prisma.JsonValue): ExperienceGalleryEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Prisma.JsonObject =>
    typeof item === "object" && item !== null && !Array.isArray(item)
  ).flatMap((item) => {
    const title = item.title;
    if (
      typeof item.id !== "string" ||
      typeof item.image !== "string" ||
      typeof title !== "object" || title === null || Array.isArray(title) ||
      typeof title.en !== "string" || typeof title.fr !== "string"
    ) return [];
    return [{ id: item.id, image: item.image, title: { en: title.en, fr: title.fr } }];
  });
}

async function getCurrentHomepageGallery(): Promise<ExperienceGalleryEntry[]> {
  const activities = await getPublicActivityCatalog();
  const englishActivities = localizeTree(activities, "en");
  const frenchActivities = localizeTree(activities, "fr");
  const entries: ExperienceGalleryEntry[] = [];

  for (const [activityIndex, activity] of englishActivities.entries()) {
    const englishImages = activity.gallery?.length
      ? activity.gallery
      : [{ src: activity.image, alt: activity.imageAlt }];
    const frenchActivity = frenchActivities[activityIndex];
    const frenchImages = frenchActivity.gallery?.length
      ? frenchActivity.gallery
      : [{ src: frenchActivity.image, alt: frenchActivity.imageAlt }];

    for (const [imageIndex, image] of englishImages.entries()) {
      if (!image.src || entries.some((entry) => entry.image === image.src)) continue;
      entries.push({
        id: `current-${entries.length + 1}`,
        image: image.src,
        title: {
          en: image.alt || activity.title,
          fr: frenchImages[imageIndex]?.alt || frenchActivity.title,
        },
      });
      if (entries.length >= MAX_EXPERIENCE_GALLERY_ENTRIES) return entries;
    }
  }

  return entries;
}

export const getPublicExperienceGallery = cache(async (): Promise<ExperienceGalleryEntry[] | null> => {
  if (!process.env.DATABASE_URL) return null;
  const row = await prisma.experienceGallerySetting.findUnique({ where: { id: experienceGallerySettingId } });
  return row ? parseEntries(row.data) : null;
});

export async function getManagedExperienceGallery(): Promise<ExperienceGalleryEntry[]> {
  const user = await getDashboardUser();
  if (!user || user.role !== "ADMIN") throw new Error("Only an administrator can manage the experience gallery.");
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before managing the experience gallery.");
  const row = await prisma.experienceGallerySetting.findUnique({ where: { id: experienceGallerySettingId } });
  return row ? parseEntries(row.data) : getCurrentHomepageGallery();
}

export { experienceGallerySettingId };