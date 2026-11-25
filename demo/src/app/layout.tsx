import type { Metadata } from "next";
import type { ReactNode } from "react";
import { homeDescription, homeTitle, siteName, siteUrl, structuredData, studioName, studioUrl } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: homeTitle, template: `%s · ${siteName}` },
  description: homeDescription,
  applicationName: siteName,
  authors: [{ name: studioName, url: studioUrl }],
  publisher: studioName,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: {
    type: "website",
    siteName,
    locale: "en_US",
    url: "/",
    title: homeTitle,
    description: homeDescription,
  },
  twitter: { card: "summary_large_image", title: homeTitle, description: homeDescription },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          // Static strings only; "<" is escaped so the JSON can never close the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()).replace(/</g, "\\u003c") }}
        />
        {children}
      </body>
    </html>
  );
}
