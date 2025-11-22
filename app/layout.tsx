import type React from "react";
import type { Metadata, Viewport } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";

import { Toaster } from "@/components/ui/toaster";
import ScrollToTop from "@/components/scroll-to-top";
import SchemaOrg from "@/components/seo/schema-org";
import PreloadData from "@/components/preload-data";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-quicksand",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 5.0,
  userScalable: true,
  themeColor: "#cf8b9d",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://creasoka.com"),
  title: {
    default: "Crea'Soka - Créations Artisanales Uniques",
    template: "%s | Crea'Soka",
  },
  description:
    "Découvrez des créations artisanales uniques et pleines de charme pour ajouter une touche de magie à votre quotidien.",
  generator: "Next.js",
  applicationName: "Crea'Soka",
  referrer: "origin-when-cross-origin",
  keywords: [
    "créations artisanales",
    "bijoux faits main",
    "artisanat",
    "figurines miniatures",
    "accessoires",
    "cadeaux personnalisés",
    "créations uniques",
    "fait main",
    "handmade",
    "bijoux",
  ],
  authors: [{ name: "Crea'Soka" }],
  creator: "Crea'Soka",
  publisher: "Crea'Soka",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://creasoka.com",
    title: "Crea'Soka - Créations Artisanales Uniques",
    description:
      "Découvrez des créations artisanales uniques et pleines de charme pour ajouter une touche de magie à votre quotidien.",
    siteName: "Crea'Soka",
    images: [
      {
        url: "https://creasoka.com/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Crea'Soka - Créations Artisanales",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crea'Soka - Créations Artisanales Uniques",
    description:
      "Découvrez des créations artisanales uniques et pleines de charme pour ajouter une touche de magie à votre quotidien.",
    images: ["https://creasoka.com/images/twitter-image.jpg"],
  },
  verification: {
    // À compléter si vous avez des codes de vérification
    // google: "google-site-verification-code",
    // yandex: "yandex-verification-code",
  },
  alternates: {
    canonical: "https://creasoka.com",
    languages: {
      "fr-FR": "https://creasoka.com",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import QueryProvider from "@/components/providers/query-provider";
import { cn } from "@/lib/utils";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          quicksand.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <QueryProvider>
              <CartProvider>
                <SchemaOrg
                  url="https://creasoka.com"
                  title="Crea'Soka - Créations Artisanales Uniques"
                  description="Découvrez des créations artisanales uniques et pleines de charme pour ajouter une touche de magie à votre quotidien."
                  type="Organization"
                />

                <PreloadData />
                <div className="flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
                <Toaster />
                <ScrollToTop />
              </CartProvider>
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
