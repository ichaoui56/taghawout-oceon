import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import "../index.css";

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

export const metadata: Metadata = {
  title: "Freight / Forward — Every mile, considered.",
  description:
    "Freight / Forward. An independent cinematic logistics concept — one connected journey from origin to destination.",
};

export const viewport: Viewport = {
  themeColor: "#0a0b0c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <head>
        <link rel="preconnect" href="https://media.scrollhaus.ai" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
