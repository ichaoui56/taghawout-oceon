"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { getDashboardUser } from "./dashboard-auth";
import { prisma } from "./prisma";
import { heroPresentationSettingId } from "./hero-presentation";
import { defaultHeroPresentationSettings, type HeroLocalizedText, type HeroPresentationSettings } from "../hero-presentation";

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

function localized(value: unknown, label: string, maxLength: number): HeroLocalizedText {
  const input = object(value, label);
  return {
    en: text(input.en, `${label} (English)`, maxLength),
    fr: text(input.fr, `${label} (French)`, maxLength),
  };
}

function href(value: unknown, label: string): string {
  const result = text(value, label, 1200);
  if (/^(#[a-zA-Z][\w-]*|\/(?!\/)[\w\-/#?=&.%]*)$/.test(result)) return result;
  try {
    if (new URL(result).protocol === "https:") return result;
  } catch {
    // Reject malformed or non-HTTPS external destinations below.
  }
  throw new Error(`${label} must be a page anchor, a local path, or an HTTPS URL.`);
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

function parseSettings(value: unknown): HeroPresentationSettings {
  const input = object(value, "Hero presentation settings");
  const parseAction = (key: "primaryAction" | "secondaryAction") => {
    const item = object(input[key], key);
    return {
      label: localized(item.label, `${key} label`, 100),
      href: href(item.href, `${key} destination`),
    };
  };
  if (!Array.isArray(input.cards) || input.cards.length !== 3) {
    throw new Error("The hero presentation must contain exactly three cards.");
  }

  return {
    kicker: localized(input.kicker, "Hero label", 120),
    coordinates: input.coordinates === undefined
      ? defaultHeroPresentationSettings.coordinates
      : text(input.coordinates, "Hero coordinates", 120),
    title: localized(input.title, "Hero title", 180),
    subtitle: localized(input.subtitle, "Hero description", 1200),
    mobileSubtitle: localized(input.mobileSubtitle, "Mobile hero description", 500),
    primaryAction: parseAction("primaryAction"),
    secondaryAction: parseAction("secondaryAction"),
    cards: input.cards.map((value, index) => {
      const card = object(value, `Card ${index + 1}`);
      const fallbackIcon = ["wave", "lesson", "mountain"][index] as HeroPresentationSettings["cards"][number]["icon"];
      return {
        title: localized(card.title, `Card ${index + 1} title`, 120),
        description: localized(card.description, `Card ${index + 1} description`, 500),
        image: image(card.image, `Card ${index + 1} image`),
        href: href(card.href, `Card ${index + 1} destination`),
        icon: fallbackIcon,
      };
    }),
  };
}

export async function saveHeroPresentationSettings(value: unknown) {
  const user = await getDashboardUser();
  if (!user || user.role !== "ADMIN") throw new Error("Only an administrator can manage the hero presentation.");
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before managing the hero presentation.");
  const settings = parseSettings(value);
  await prisma.heroPresentationSetting.upsert({
    where: { id: heroPresentationSettingId },
    create: { id: heroPresentationSettingId, data: settings as Prisma.InputJsonValue },
    update: { data: settings as Prisma.InputJsonValue },
  });
  revalidatePath("/");
  revalidatePath("/dashboard/presentation");
  return { ok: true as const };
}