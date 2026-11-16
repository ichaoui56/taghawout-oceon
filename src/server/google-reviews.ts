import "server-only";

import type { Locale } from "../i18n";
import { getDashboardUser } from "./dashboard-auth";
import { prisma } from "./prisma";

export type GoogleReview = {
  id: string;
  author: string;
  photoUrl: string | null;
  rating: number;
  text: string;
  publishedAt: string | null;
  relativeDate: string | null;
};

export type GoogleReviewsData = {
  businessName: string;
  rating: number | null;
  reviewCount: number | null;
  googleUrl: string | null;
  location: string;
  HostelGrowthUrl: string | null;
  reviews: GoogleReview[];
};

export type ManagedGoogleReview = {
  id: string;
  name: string;
  dateAdded: string;
  photoUrl: string;
  message: string;
  messageFr: string;
  rating: number;
  isPublished: boolean;
  isDemo: boolean;
};

export type GoogleReviewsSettings = {
  location: string;
  googleUrl: string;
  HostelGrowthUrl: string;
};

type PlacesReview = {
  name?: string;
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  publishTime?: string;
  relativePublishTimeDescription?: string;
  authorAttribution?: {
    displayName?: string;
    photoUri?: string;
  };
};

type PlaceDetails = {
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlacesReview[];
};

export async function getGoogleReviews(locale: Locale): Promise<GoogleReviewsData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return null;

  try {
    const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "displayName,rating,userRatingCount,googleMapsUri,reviews",
        "Accept-Language": locale,
      },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;

    const place = (await response.json()) as PlaceDetails;
    return {
      businessName: place.displayName?.text ?? "Mh Traveling",
      rating: typeof place.rating === "number" ? place.rating : null,
      reviewCount: typeof place.userRatingCount === "number" ? place.userRatingCount : null,
      googleUrl: place.googleMapsUri ?? null,
      location: "",
      HostelGrowthUrl: process.env.HostelGrowth_PROFILE_URL ?? null,
      reviews: (place.reviews ?? []).map((review, index) => ({
        id: review.name ?? `${review.authorAttribution?.displayName ?? "review"}-${index}`,
        author: review.authorAttribution?.displayName ?? "Google user",
        photoUrl: review.authorAttribution?.photoUri ?? null,
        rating: typeof review.rating === "number" ? review.rating : 0,
        text: review.text?.text ?? review.originalText?.text ?? "",
        publishedAt: review.publishTime ?? null,
        relativeDate: review.relativePublishTimeDescription ?? null,
      })),
    };
  } catch {
    return null;
  }
}

async function requireReviewAdmin() {
  const user = await getDashboardUser();
  if (!user || user.role !== "ADMIN") throw new Error("Only an administrator can manage customer reviews.");
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before managing customer reviews.");
}

export async function getManagedGoogleReviews(): Promise<{ reviews: ManagedGoogleReview[]; settings: GoogleReviewsSettings }> {
  await requireReviewAdmin();
  const [reviews, settings] = await Promise.all([
    prisma.customerReview.findMany({ orderBy: [{ dateAdded: "desc" }, { createdAt: "desc" }] }),
    prisma.googleReviewSetting.findUnique({ where: { id: "homepage" } }),
  ]);
  return {
    reviews: reviews.map((review) => ({
      id: review.id,
      name: review.name,
      dateAdded: review.dateAdded.toISOString().slice(0, 10),
      photoUrl: review.photoUrl,
      message: review.message,
      messageFr: review.messageFr,
      rating: review.rating,
      isPublished: review.isPublished,
      isDemo: review.isDemo,
    })),
    settings: {
      location: settings?.location ?? "",
      googleUrl: settings?.googleUrl ?? "",
      HostelGrowthUrl: settings?.HostelGrowthUrl ?? "",
    },
  };
}

export async function getManagedGoogleReviewCount(): Promise<number> {
  await requireReviewAdmin();
  return prisma.customerReview.count();
}

export async function getHomepageGoogleReviews(locale: Locale): Promise<GoogleReviewsData | null> {
  const placesPromise = getGoogleReviews(locale);
  let savedSettings: Awaited<ReturnType<typeof prisma.googleReviewSetting.findUnique>> = null;
  let managedReviews: Awaited<ReturnType<typeof prisma.customerReview.findMany>> = [];
  if (process.env.DATABASE_URL) {
    try {
      [savedSettings, managedReviews] = await Promise.all([
        prisma.googleReviewSetting.findUnique({ where: { id: "homepage" } }),
        prisma.customerReview.findMany({
          where: { isPublished: true, isDemo: false },
          orderBy: [{ dateAdded: "desc" }, { createdAt: "desc" }],
        }),
      ]);
    } catch {
      console.error("Could not load dashboard-managed reviews. Check that the customer reviews migration has been applied.");
      return placesPromise;
    }
  }
  const placesData = await placesPromise;
  const location = savedSettings?.location ?? "";
  const googleUrl = savedSettings?.googleUrl || placesData?.googleUrl || null;
  const HostelGrowthUrl = savedSettings?.HostelGrowthUrl || placesData?.HostelGrowthUrl || null;

  if (managedReviews.length) {
    const average = managedReviews.reduce((sum, review) => sum + review.rating, 0) / managedReviews.length;
    return {
      businessName: "Mh Traveling",
      rating: average,
      reviewCount: managedReviews.length,
      googleUrl,
      location,
      HostelGrowthUrl,
      reviews: managedReviews.map((review) => ({
        id: review.id,
        author: review.name,
        photoUrl: review.photoUrl || null,
        rating: review.rating,
        text: locale === "fr" ? review.messageFr || review.message : review.message,
        publishedAt: review.dateAdded.toISOString(),
        relativeDate: null,
      })),
    };
  }

  if (placesData) return { ...placesData, googleUrl, location, HostelGrowthUrl };
  if (!location && !googleUrl && !HostelGrowthUrl) return null;
  return {
    businessName: "Mh Traveling",
    rating: null,
    reviewCount: null,
    googleUrl,
    location,
    HostelGrowthUrl,
    reviews: [],
  };
}