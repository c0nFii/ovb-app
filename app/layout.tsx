import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { PenProvider } from "@/components/layout/PenContext";
import { NotesProvider } from "@/components/layout/NotesContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OVB App",
  description: "created by Michael Hamader",
};

// Viewport als separate Export (Next.js 14+ Best Practice)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PenProvider>
          <NotesProvider>
            {children}
          </NotesProvider>
        </PenProvider>
      </body>
    </html>
  );
}
