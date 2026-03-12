import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Serene Wellness | Book Your Treatment",
    template: "%s | Serene Wellness",
  },
  description:
    "Book premium massage and wellness treatments online. Instant confirmation, secure payments.",
  keywords: ["massage", "wellness", "booking", "spa", "therapy"],
  openGraph: {
    title: "Serene Wellness",
    description:
      "Book premium massage and wellness treatments online.",
    type: "website",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

