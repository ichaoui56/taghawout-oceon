import "server-only";

import { cache } from "react";
import { normalizeHeroPresentationSettings, defaultHeroPresentationSettings, type HeroPresentationSettings } from "../hero-presentation";
import { prisma } from "./prisma";

const heroPresentationSettingId = "homepage";

export const getHeroPresentationSettings = cache(async (): Promise<HeroPresentationSettings> => {
  if (!process.env.DATABASE_URL) return defaultHeroPresentationSettings;
  const row = await prisma.heroPresentationSetting.findUnique({ where: { id: heroPresentationSettingId } });
  return row ? normalizeHeroPresentationSettings(row.data) : defaultHeroPresentationSettings;
});

export { heroPresentationSettingId };