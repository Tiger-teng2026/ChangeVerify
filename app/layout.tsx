import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://changeverify.vercel.app"),
  title: "ChangeVerify - Verify AI Coding Agent Changes Before Shipping",
  description:
    "Verify whether AI coding agents actually completed your request. Analyze Git diff to find missing requirements, unexpected changes, and risky modifications before shipping.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ChangeVerify - Verify AI Coding Agent Changes",
    description:
      "Check whether Cursor, Claude Code, and other AI coding agents actually did what you asked.",
  },
  twitter: {
    card: "summary",
    title: "ChangeVerify - Verify AI Coding Agent Changes",
    description:
      "Check whether Cursor, Claude Code, and other AI coding agents actually did what you asked.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
