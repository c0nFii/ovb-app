import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        {/* FIX: Darstellung auf allen Geräten identisch */}
        <meta
          name="viewport"
          content="width=1123, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          margin: 0,
          padding: 0,
          overflow: "hidden",
          width: "1523px",   // <<< WICHTIG: gesamte Seite fixieren
          height: "400px",   // <<< WICHTIG: gesamte Seite fixieren
          backgroundColor: "#ffffff",
        }}
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
