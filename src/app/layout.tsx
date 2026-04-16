import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HerHealth AI",
  description:
    "A mobile-first women's health app focused on food, movement, life stages, and AI personalization."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
