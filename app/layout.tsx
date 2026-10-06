import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
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
  metadataBase: new URL("https://changeverify.com"),
  title: "ChangeVerify - Verify AI Coding Agent Code Changes Before Shipping | Cursor",
  description:
    "Verify Git diffs from Cursor and Claude Code before you ship. Catch missing requirements, unexpected changes, and risky modifications from AI coding agents.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ChangeVerify - Verify AI Coding Agent Code Changes Before Shipping | Cursor",
    description:
      "Verify Git diffs from Cursor and Claude Code before you ship. Catch missing requirements, unexpected changes, and risky modifications from AI coding agents.",
    url: "https://changeverify.com",
    type: "website",
    siteName: "ChangeVerify",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChangeVerify - Verify AI Coding Agent Code Changes Before Shipping | Cursor",
    description:
      "Verify Git diffs from Cursor and Claude Code before you ship. Catch missing requirements, unexpected changes, and risky modifications from AI coding agents.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
     <body className="min-h-full flex flex-col">

<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-08ZLGNEC0T"
  strategy="afterInteractive"
/>

<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-08ZLGNEC0T');
  `}
</Script>

{children}
<Analytics />

</body>
    </html>
  );
}
