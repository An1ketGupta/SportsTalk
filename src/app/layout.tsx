import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/Navbar";
import Avatar from "@/components/Avatar";
import SignInButton from "@/components/SignInButton";
import Providers from "@/components/Providers";
import { auth } from "@/auth";
import MobileBottomNav from "@/components/MobileBottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://letsportstalk.vercel.app"),
  title: {
    default: "SportsTalk - Sports Community",
    template: "%s | SportsTalk",
  },
  description: "Join thousands of fans discussing live matches, sharing passion, and connecting over the sports you love. Your ultimate sports community platform.",
  keywords: ["sports", "community", "live matches", "sports discussion", "sports social media", "NFL", "NBA", "football", "cricket", "tennis"],
  authors: [{ name: "SportsTalk Team" }],
  creator: "SportsTalk",
  publisher: "SportsTalk",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://letsportstalk.vercel.app",
    siteName: "SportsTalk",
    title: "SportsTalk - Your Sports Community Awaits",
    description: "Join thousands of fans discussing live matches, sharing passion, and connecting over the sports you love.",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "SportsTalk Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SportsTalk - Your Sports Community Awaits",
    description: "Join thousands of fans discussing live matches, sharing passion, and connecting over the sports you love.",
    images: ["/preview.png"],
    creator: "@sportstalk",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/logo.svg" },
    ],
  },
  manifest: "/manifest.json",
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
    google: "google-site-verification-code",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <NavBar authComponent={session?.user ? <Avatar /> : <SignInButton />} />
          {children}
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
