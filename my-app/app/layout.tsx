import type React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { SessionProvider } from "@/components/providers/session-provider";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "CareerSmart AI - Intelligent Career Analysis",
  description:
    "AI-powered platform for contract analysis, salary benchmarking, and job matching",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <SessionProvider>
          <AuthProvider>{children}</AuthProvider>
        </SessionProvider>
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
