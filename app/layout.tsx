"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/providers/theme-provider";
import { WalletProvider } from "@/providers/wallet-provider";
import { Layout } from "@/layout";
import { QueryProvider } from "@/providers/query-provider";
import { ProgramInitializer } from "@/components/program-initializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <WalletProvider>
            <ProgramInitializer />
            <ThemeProvider>
              <Layout>{children}</Layout>
            </ThemeProvider>
          </WalletProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
