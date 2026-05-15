import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PwaRegister } from "@/components/PwaRegister";
import { APP_VERSION } from "@/lib/app-version";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Public site origin for metadataBase and OG absolute URLs (WhatsApp/Facebook need HTTPS).
 *  Order: NEXT_PUBLIC_SITE_URL (set on Vercel to https://polycards.nl for production),
 *  else https://VERCEL_URL on Vercel builds, else https://polycards.nl in production,
 *  else http://localhost:3000 for local dev.
 *
 *  After replacing OG art: bump OG_IMAGE_CACHE_BUST below, deploy, then:
 *  - Production: View page source, confirm og:image is https and opens the new asset.
 *  - https://developers.facebook.com/tools/debug/ — paste URL, Scrape Again (2× if needed).
 *  - WhatsApp: retest; try mobile/web if Desktop preview is empty; page link ?x=1 can bust link cache. */
function resolveSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv && /^https?:\/\//i.test(fromEnv)) {
    return fromEnv.replace(/\/+$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//i, "");
    return `https://${host}`;
  }
  if (process.env.NODE_ENV === "production") {
    return "https://polycards.nl";
  }
  return "http://localhost:3000";
}

const siteUrl = resolveSiteUrl();
const metadataBase = new URL(siteUrl);
/** Increment when replacing public/og-image.png so crawlers/CDN fetch a new og:image URL. */
const OG_IMAGE_CACHE_BUST = "4";
const ogImageUrl = new URL(`/og-image.png?v=${OG_IMAGE_CACHE_BUST}`, metadataBase).href;
const ogPageUrl = new URL("/", metadataBase).href;

const ogTitle = "PolyCards - Learn Languages That Stick";
const ogDescription = "5 min/day • Science-backed • Real retention";

export const metadata: Metadata = {
  metadataBase,
  title: { default: ogTitle, template: "%s | PolyCards" },
  description: ogDescription,
  applicationName: "PolyCards",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PolyCards",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: ogPageUrl,
    siteName: "PolyCards",
    title: ogTitle,
    description: ogDescription,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "PolyCards - Spaced repetition for real life",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: ogTitle,
    description: ogDescription,
    images: [ogImageUrl],
    creator: "@polycards",
  },
};

export const viewport: Viewport = {
  themeColor: "#0057B8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <PwaRegister />
        <footer
          className="pointer-events-none fixed bottom-3 right-4 z-50 rounded-md border border-zinc-700/60 bg-zinc-950/85 px-2 py-1 text-xs text-zinc-400 backdrop-blur-sm"
          aria-label={`App version ${APP_VERSION}`}
        >
          {APP_VERSION}
        </footer>
      </body>
    </html>
  );
}
