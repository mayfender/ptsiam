import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PTS Back Office",
  description: "Back Office System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-Sarabun">{children}</body>
    </html>
  );
}
