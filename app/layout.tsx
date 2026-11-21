import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import { getLocale } from "../src/server/locale";
import "../src/index.css";
import { ActivityReservationProvider } from "../src/components/ActivityReservations";
import { LocaleProvider } from "../src/components/LocaleProvider";
import { getSeoImageUrl } from "../src/seo";
import { getSiteSeoSettings } from "../src/server/site-seo";

const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const displayFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [locale, settings] = await Promise.all([getLocale(), getSiteSeoSettings()]);
  const french = locale === "fr";
  const title = french ? settings.titleFr : settings.titleEn;
  const description = french ? settings.descriptionFr : settings.descriptionEn;
  const openGraphTitle = (french ? settings.openGraphTitleFr : settings.openGraphTitleEn) || title;
  const openGraphDescription = (french ? settings.openGraphDescriptionFr : settings.openGraphDescriptionEn) || description;
  const openGraphImage = settings.openGraphImage ? [getSeoImageUrl(settings.openGraphImage)] : undefined;
  return {
    metadataBase: new URL(settings.siteUrl),
    title: { default: title, template: settings.titleTemplate },
    description,
    keywords: (french ? settings.keywordsFr : settings.keywordsEn).split(",").map((keyword) => keyword.trim()).filter(Boolean),
    icons: settings.favicon ? { icon: settings.favicon } : undefined,
    robots: { index: settings.allowIndexing, follow: settings.allowFollowing },
    verification: {
      google: settings.googleVerification || undefined,
      other: settings.bingVerification ? { "msvalidate.01": settings.bingVerification } : undefined,
    },
    openGraph: {
      type: "website",
      siteName: settings.siteName,
      url: settings.siteUrl,
      locale: french ? "fr_FR" : "en_US",
      title: openGraphTitle,
      description: openGraphDescription,
      images: openGraphImage,
    },
    twitter: {
      card: openGraphImage ? "summary_large_image" : "summary",
      site: settings.twitterHandle || undefined,
      creator: settings.twitterHandle || undefined,
      title: openGraphTitle,
      description: openGraphDescription,
      images: openGraphImage,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#f5fafc",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const settings = await getSiteSeoSettings();
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: settings.organizationName,
        url: settings.siteUrl,
        logo: settings.organizationLogo ? getSeoImageUrl(settings.organizationLogo) : undefined,
        sameAs: settings.socialProfiles.length ? settings.socialProfiles : undefined,
      },
      { "@type": "WebSite", name: settings.siteName, url: settings.siteUrl },
    ],
  }).replace(/</g, "\\u003c");
  return (
    <html lang={locale} className={`${bodyFont.variable} ${displayFont.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
      </head>
      <body>
        <LocaleProvider initialLocale={locale}>
          <ActivityReservationProvider>{children}</ActivityReservationProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
