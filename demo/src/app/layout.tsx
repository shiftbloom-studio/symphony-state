import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Symphony State — Demo",
  description: "Orchestrate multiple state sources without a monolithic global store.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
