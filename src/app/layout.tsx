import type { Metadata } from "next";
import "./globals.css";
import { ClientLayoutWrapper } from "@/components/layout/ClientLayoutWrapper";

export const metadata: Metadata = {
  title: "My Journal - AI Forex Trading Intelligence",
  description: "Production-grade AI Forex & Crypto Personal Trading Journal PWA",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen selection:bg-[#D4C4A8] selection:text-[#0D1B2A]">
        {/* Ambient Starlight Background Orbs */}
        <div className="ambient-orbs">
          <div className="ambient-orb-1" />
          <div className="ambient-orb-2" />
        </div>

        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
