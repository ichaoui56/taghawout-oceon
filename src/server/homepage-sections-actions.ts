"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import {
  type AboutOceanHighlight,
  type AboutOceanSettings,
  type HomepageSectionsSettings,
  type LocalizedText,
  type TeamMember,
} from "../homepage-sections";
import { getDashboardUser } from "./dashboard-auth";
import { homepageSectionsSettingId } from "./homepage-sections";
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

function localized(value: unknown, label: string, maxLength: number): LocalizedText {
  const input = object(value, label);
  return {
    en: text(input.en, `${label} (English)`, maxLength),
    fr: text(input.fr, `${label} (French)`, maxLength),
  };
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

function parseSettings(value: unknown): HomepageSectionsSettings {
  const input = object(value, "Homepage content");
  const aboutInput = object(input.about, "About Ocean content");
  const heroInput = object(aboutInput.hero, "About Ocean introduction");
  const impactInput = object(aboutInput.impact, "Community impact content");
  const teamInput = object(input.team, "Team section");
  const logInput = object(input.oceanLog, "Ocean log section");

  if (!Array.isArray(heroInput.images) || heroInput.images.length !== 3) {
    throw new Error("About Ocean must have exactly three introduction images.");
  }
  if (!Array.isArray(impactInput.title) || impactInput.title.length !== 2) {
    throw new Error("The community impact title must have two lines.");
  }
  if (!Array.isArray(impactInput.highlights) || impactInput.highlights.length !== 3) {
    throw new Error("The community impact section must have exactly three highlights.");
  }
  if (!Array.isArray(teamInput.members) || teamInput.members.length > 12) {
    throw new Error("The team section can contain at most 12 members.");
  }

  const ids = new Set<string>();
  const members: TeamMember[] = teamInput.members.map((value, index) => {
    const member = object(value, `Team member ${index + 1}`);
    const id = text(member.id, `Team member ${index + 1} ID`, 100);
    if (ids.has(id)) throw new Error("Each team member must have a unique ID.");
    ids.add(id);
    const name = text(member.name, `Team member ${index + 1} name`, 100);
    return {
      id,
      name,
      role: localized(member.role, `Team member ${index + 1} role`, 120),
      detail: localized(member.detail, `Team member ${index + 1} description`, 360),
      image: image(member.image, `Team member ${index + 1} image`),
      imageAlt: localized(member.imageAlt, `Team member ${index + 1} image description`, 180),
    };
  });

  const about: AboutOceanSettings = {
    hero: {
      eyebrow: localized(heroInput.eyebrow, "About Ocean label", 120),
      titleLead: localized(heroInput.titleLead, "About Ocean title", 180),
      titleAccent: localized(heroInput.titleAccent, "About Ocean title accent", 180),
      introduction: localized(heroInput.introduction, "About Ocean description", 1200),
      discoverStory: localized(heroInput.discoverStory, "About Ocean button", 120),
      signature: localized(heroInput.signature, "About Ocean signature", 180),
      images: heroInput.images.map((value, index) => {
        const entry = object(value, `About Ocean image ${index + 1}`);
        return {
          image: image(entry.image, `About Ocean image ${index + 1}`),
          alt: localized(entry.alt, `About Ocean image ${index + 1} description`, 180),
        };
      }),
    },
    impact: {
      eyebrow: localized(impactInput.eyebrow, "Community label", 120),
      title: impactInput.title.map((value, index) => localized(value, `Community title line ${index + 1}`, 180)),
      description: localized(impactInput.description, "Community description", 1000),
      cta: localized(impactInput.cta, "Community button", 120),
      image: image(impactInput.image, "Community background image"),
      highlights: impactInput.highlights.map((value, index): AboutOceanHighlight => {
        const highlight = object(value, `Community highlight ${index + 1}`);
        return {
          title: localized(highlight.title, `Community highlight ${index + 1} title`, 120),
          detail: localized(highlight.detail, `Community highlight ${index + 1} description`, 200),
        };
      }),
    },
  };

  return {
    about,
    team: {
      localCrew: localized(teamInput.localCrew, "Team label", 120),
      eyebrow: localized(teamInput.eyebrow, "Team eyebrow", 120),
      titleLead: localized(teamInput.titleLead, "Team title", 120),
      titleAccent: localized(teamInput.titleAccent, "Team title accent", 120),
      summary: localized(teamInput.summary, "Team description", 600),
      outroLabel: localized(teamInput.outroLabel, "Team outro label", 120),
      outro: localized(teamInput.outro, "Team closing line", 200),
      members,
    },
    oceanLog: {
      eyebrow: localized(logInput.eyebrow, "Ocean log label", 120),
      titleLead: localized(logInput.titleLead, "Ocean log title", 120),
      titleBridge: localized(logInput.titleBridge, "Ocean log title connector", 120),
      titleAccent: localized(logInput.titleAccent, "Ocean log title accent", 120),
      description: localized(logInput.description, "Ocean log description", 1000),
      button: localized(logInput.button, "Ocean log button", 120),
      signature: localized(logInput.signature, "Ocean log signature", 180),
    },
  };
}

export async function saveHomepageSectionsSettings(value: unknown) {
  const user = await getDashboardUser();
  if (!user || user.role !== "ADMIN") throw new Error("Only an administrator can manage homepage sections.");
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before managing homepage sections.");
  const settings = parseSettings(value);
  await prisma.homepageSectionsSetting.upsert({
    where: { id: homepageSectionsSettingId },
    create: { id: homepageSectionsSettingId, data: settings as Prisma.InputJsonValue },
    update: { data: settings as Prisma.InputJsonValue },
  });
  revalidatePath("/");
  revalidatePath("/dashboard/homepage-content");
  return { ok: true as const };
}