import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import { CircleCursor } from "@/components/ui/circle-cursor";
import { GlobalSmoothScroll } from "@/components/layout/global-smooth-scroll";

import { portfolioMetadata } from "@/lib/site-metadata";

import "lenis/dist/lenis.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = portfolioMetadata;

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        {children}
        <GlobalSmoothScroll />
        <CircleCursor />
      </body>
    </html>
  );
}
