"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";

import { ThemeProvider } from "@/providers/theme-provider";
import { Layout } from "@/layout";
import { QueryProvider } from "@/providers/query-provider";
import { ProgramInitializer } from "@/components/program-initializer";

const WalletProvider = dynamic(
  () =>
    import("@/providers/wallet-provider").then(
      ({ WalletProvider }) => WalletProvider
    ),
  {
    ssr: false,
  }
);

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
