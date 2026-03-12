import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

function getSiteUrl(): string {
  const raw = (
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  ).trim();

  // Vercel env vars are sometimes entered as "example.com" without scheme.
  // new URL("example.com") throws, so normalize to https://.
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw.replace(/^\/+/, "")}`;
}

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: (() => {
    try {
      return new URL(siteUrl);
    } catch {
      return new URL("http://localhost:3000");
    }
  })(),
  title: {
    default: "Serene Wellness | Premium Massage & Wellness Treatments",
    template: "%s | Serene Wellness",
  },
  description:
    "Book premium massage and wellness treatments online with instant confirmation and secure payment. Professional therapeutic services including deep tissue, aromatherapy, hot stone, and reflexology.",
  keywords: [
    "massage booking",
    "wellness treatments",
    "spa services",
    "therapeutic massage",
    "online booking",
    "deep tissue massage",
    "aromatherapy",
    "hot stone therapy",
    "reflexology",
    "wellness center",
  ],
  authors: [{ name: "Serene Wellness" }],
  category: "Health & Wellness",
  openGraph: {
    title: "Serene Wellness | Premium Massage & Wellness Treatments",
    description:
      "Book premium massage and wellness treatments online with instant confirmation and secure payment. Professional therapeutic services for your wellness journey.",
    type: "website",
    locale: "en_US",
    siteName: "Serene Wellness",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Serene Wellness - Premium Massage & Wellness Treatments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Serene Wellness | Premium Massage & Wellness Treatments",
    description:
      "Book premium massage and wellness treatments online with instant confirmation and secure payment.",
    images: ["/og-image.jpg"],
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
  verification: {
    google: "your-google-site-verification-code", // Replace with actual verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${openSans.variable} antialiased min-h-screen bg-background`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
