import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") || incoming.get("host") || "localhost:3000";
  const protocol = incoming.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;

  return {
    title: "BarcaManyak",
    description: "A private FC Barcelona prediction league for friends.",
    manifest: "/manifest.webmanifest",
    applicationName: "BarcaManyak",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "BarcaManyak",
    },
    icons: {
      icon: [{ url: "/icon-192.png", type: "image/png", sizes: "192x192" }],
      shortcut: "/icon-192.png",
      apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
    },
    openGraph: {
      title: "BarcaManyak",
      description: "Every Barça game. Every silly prediction.",
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "BarcaManyak",
      description: "Every Barça game. Every silly prediction.",
      images: [image],
    },
  };
}

/* iOS zooms the whole page when a field smaller than 16px gets focus, and often does
   not zoom back — that is what cut off the tab labels. Pinning the scale stops it. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0A0C10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Next emits these from the metadata above, but older iOS builds only honour
            the literal tags, and some read /manifest.json rather than .webmanifest. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="BarcaManyak" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
