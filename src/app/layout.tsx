import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import NextAuthSessionProvider from "@/components/providers/SessionProvider";
import { CartProvider } from "@/context/CartContext";

/* ─── Google Fonts ────────────────────────────────────────── */
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

/* ─── SEO Metadata ────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: "CraveBite – Food Delivered Fast",
    template: "%s | CraveBite",
  },
  description:
    "Order from your favorite local restaurants with lightning-fast delivery. Discover the best cuisine in your city with CraveBite.",
  keywords: [
    "food delivery",
    "order food online",
    "restaurants near me",
    "fast delivery",
    "CraveBite",
    "online food ordering",
    "pizza delivery",
    "burger delivery",
    "Indian food",
    "cuisine",
  ],
  authors: [{ name: "CraveBite Team" }],
  creator: "CraveBite",
  publisher: "CraveBite",
  metadataBase: new URL("https://cravebite.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cravebite.app",
    siteName: "CraveBite",
    title: "CraveBite – Food Delivered Fast",
    description:
      "Order from your favorite local restaurants with lightning-fast delivery. Discover the best cuisine in your city.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CraveBite – Food Delivered Fast",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CraveBite – Food Delivered Fast",
    description:
      "Order from your favorite local restaurants with lightning-fast delivery.",
    images: ["/og-image.png"],
    creator: "@cravebite",
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  category: "food",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0f" },
    { media: "(prefers-color-scheme: light)", color: "#0d0d0f" },
  ],
};

/* ─── Root Layout ─────────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <NextAuthSessionProvider>
          <CartProvider>{children}</CartProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
