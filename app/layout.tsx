import type React from "react"
import type { Metadata, Viewport } from "next"
import { Playfair_Display, Geist_Mono } from "next/font/google"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://notvc.to"),
  title: {
    default: "NOTVCTO // SYSTEMS ARCHITECT",
    template: "%s | NOTVCTO",
  },
  description: "Victor Soto - System Architect & Interface Designer crafting intelligent digital experiences",
  openGraph: {
    title: "NOTVCTO // SYSTEMS ARCHITECT",
    description: "Victor Soto - System Architect & Interface Designer crafting intelligent digital experiences",
    url: "https://notvc.to",
    siteName: "Victor Soto Portfolio",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og/portfolio.png",
        width: 1200,
        height: 630,
        alt: "NOTVCTO // SYSTEMS ARCHITECT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NOTVCTO // SYSTEMS ARCHITECT",
    description: "Victor Soto - System Architect & Interface Designer crafting intelligent digital experiences",
    creator: "@notvcto",
    images: ["/og/portfolio.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    other: [
      { rel: "android-chrome-192x192", url: "/favicon-192.png" },
      { rel: "android-chrome-512x512", url: "/favicon-512.png" },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
}

import { SmoothScroll } from "@/components/smooth-scroll"
import { CustomCursor } from "@/components/custom-cursor"
import { Navbar } from "@/components/navbar"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased overflow-x-hidden">
        <div className="noise-overlay" />
        <SmoothScroll>
          <CustomCursor />
          <Navbar />
          {children}
        </SmoothScroll>
      </body>
    </html>
  )
}
