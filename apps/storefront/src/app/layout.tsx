import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const tiSans = Inter({
  variable: "--font-ti-sans",
  subsets: ["latin"],
  display: "swap",
});

const tiDisplay = Sora({
  variable: "--font-ti-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TOYING IDEA — Toys for new Generation",
  description:
    "Premium 3D printed toys built like future collectibles. Print Your Own Toy, customized gifting, and collectible-ready drops.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${tiSans.variable} ${tiDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
