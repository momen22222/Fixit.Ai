import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FieldFix PM",
  description:
    "Mobile-first property maintenance triage, manager approvals, and vendor scheduling for property management teams."
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
