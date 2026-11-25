import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TeliPally — Free Live TV from Around the World",
  description:
    "Browse and stream thousands of free live TV channels by country or category. Live news, sports and entertainment — no subscription, no sign-up. Installable progressive web app.",
  applicationName: "TeliPally",
  manifest: "/manifest.json",
  keywords: ["live TV", "streaming", "iptv", "PWA", "free TV", "news channels"],
  authors: [{ name: "TeliPally" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TeliPally",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "TeliPally — Free Live TV from Around the World",
    description:
      "Browse thousands of global TV channels by country or category and stream live news, sports and entertainment for free.",
    siteName: "TeliPally",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "TeliPally — Free Live TV",
    description: "Thousands of free live TV channels, installable as an app.",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1e2e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
