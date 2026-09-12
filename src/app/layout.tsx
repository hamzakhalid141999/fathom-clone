import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fathom — Meeting Notetaker",
  description: "Post-meeting experience clone of Fathom AI",
  icons: {
    icon: "/assets/logo/logo.svg",
    shortcut: "/assets/logo/logo.svg",
    apple: "/assets/logo/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh bg-bg font-sans text-text antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
