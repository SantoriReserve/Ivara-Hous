import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import { RecoveryLinkHandler } from "@/components/auth/RecoveryLinkHandler";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Ivara Hous is a luxury travel agency connecting creators, luxury properties, travelers, and creative partners through curated partnerships and premium experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${sourceSans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <RecoveryLinkHandler />
        <Header />
        <main className="flex-1 overflow-x-hidden">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
