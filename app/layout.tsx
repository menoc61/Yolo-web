import type { Metadata, Viewport } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { I18nProvider } from "@/context/I18nContext";
import { SiteHeader } from "@/components/cms/SiteHeader";
import { SiteFooter } from "@/components/cms/SiteFooter";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { PageTransition } from "@/components/cms/PageTransition";
import { Newsletter } from "@/components/cms/Newsletter";
import { PwaInstall } from "@/components/PwaInstall";
import { BackToTop } from "@/components/BackToTop";
import { OfflineBanner } from "@/components/cms/OfflineBanner";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import { AuthModalGlobal } from "@/components/auth/AuthModalGlobal";
import { Toaster } from "sonner";

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "YOLO — Avenue Kennedy, Yaoundé | yolo.co",
    template: "%s — YOLO Cameroun",
  },
  description: "YOLO Cameroun — Avenue Kennedy, Yaoundé. Premium electronics and smart accessories. Prix en FCFA, livraison express Cameroun, WhatsApp +7 901 180 53 50. Shop yolo.co — Boutique physique · Retrait 1h · Livraison CEMAC · Mobile Money.",
  metadataBase: new URL("https://yolo-cm.vercel.app"),
  alternates: { canonical: "https://yolo-cm.vercel.app", languages: { "fr-CM": "https://yolo-cm.vercel.app", "en-CM": "https://yolo-cm.vercel.app/en" } },
  category: "ecommerce",
  classification: "E-commerce Cameroun",
  referrer: "origin-when-cross-origin",
  keywords: ["YOLO", "yolo.co", "Avenue Kennedy", "Yaoundé", "Cameroun", "FCFA", "XAF", "e-commerce", "electronics", "smart accessories", "Boutique Yaoundé", "CEMAC"],
  authors: [{ name: "YOLO", url: "https://yolo-cm.vercel.app" }],
  creator: "YOLO",
  publisher: "YOLO",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    title: "YOLO — Avenue Kennedy, Yaoundé | yolo.co",
    description: "Premium goods · FCFA · Livraison Cameroun · Boutique Avenue Kennedy",
    url: "https://yolo-cm.vercel.app",
    siteName: "YOLO",
    locale: "fr_CM",
    type: "website",
    images: [{ url: "https://yolo-cm.vercel.app/og.png", width: 1200, height: 630, alt: "YOLO Avenue Kennedy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "YOLO — Avenue Kennedy | yolo.co",
    description: "Premium e-commerce Cameroun — FCFA — Avenue Kennedy, Yaoundé",
    creator: "@yolo_co",
    images: ["https://yolo-cm.vercel.app/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  verification: { google: "yolo-google-verification" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "YOLO",
  },
  icons: {
    icon: [
      { url: "/icons/logo-dark-32.png", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: light)" },
      { url: "/icons/logo-white-32.png", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: dark)" },
      { url: "/icons/logo-dark-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/logo-white-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/logo-dark-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/logo-white-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0b0b",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={josefin.variable} data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col bg-[#0b0b0b] text-[#fff] antialiased">
        <OrganizationJsonLd />

        <QueryProvider>
          <I18nProvider>
            <SiteHeader />
            <OfflineBanner />
            <Toaster theme="dark" position="top-center" />
            <CartDrawer />
            <AuthModalGlobal />
            <PageTransition>
              <main className="flex-1">{children}</main>
            </PageTransition>
            <Newsletter />
            <SiteFooter />
            <BackToTop />
            <PwaInstall />
          </I18nProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
