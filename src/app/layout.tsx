import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fix it AI",
  description:
    "Tenant-first property maintenance app with photo intake, AI triage, manager approval, and vendor dispatch."
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
