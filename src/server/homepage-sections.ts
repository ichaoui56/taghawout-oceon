import "server-only";

import { cache } from "react";
import { defaultHomepageSectionsSettings, normalizeHomepageSectionsSettings, type HomepageSectionsSettings } from "../homepage-sections";
import { prisma } from "./prisma";
import { getDashboardUser } from "./dashboard-auth";

const homepageSectionsSettingId = "homepage";

export const getHomepageSectionsSettings = cache(async (): Promise<HomepageSectionsSettings> => {
  if (!process.env.DATABASE_URL) return defaultHomepageSectionsSettings;
  const row = await prisma.homepageSectionsSetting.findUnique({ where: { id: homepageSectionsSettingId } });
  return row ? normalizeHomepageSectionsSettings(row.data) : defaultHomepageSectionsSettings;
});

export async function getManagedHomepageSectionsSettings(): Promise<HomepageSectionsSettings> {
  const user = await getDashboardUser();
  if (!user || user.role !== "ADMIN") throw new Error("Only an administrator can manage homepage sections.");
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before managing homepage sections.");
  return getHomepageSectionsSettings();
}

export { homepageSectionsSettingId };