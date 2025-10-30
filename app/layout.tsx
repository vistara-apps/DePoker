import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DePoker Pro - Provably Fair Poker on BSC",
  description: "Play No-Limit Hold'em with provably fair shuffling and instant settlements on Binance Smart Chain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-bg text-text-light antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
