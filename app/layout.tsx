import type { Metadata, Viewport } from 'next'
import { Ubuntu } from 'next/font/google'
import Script from "next/script";
import "../styles/index.css";
import "tailwindcss/tailwind.css";

const ubuntu = Ubuntu({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#E95420",
};

export const metadata: Metadata = {
  title: "vcto's portfolio",
  description: "vcto's (notvcto) Personal Portfolio Website",
  keywords: ["notvcto", "notvcto's portfolio", "notvcto linux", "ubuntu portfolio", "notvcto protfolio", "notvcto computer", "notvcto", "notvcto ubuntu", "notvcto ubuntu portfolio"],
  authors: [{ name: "vcto (notvcto)" }],
  robots: "index, follow",
  openGraph: {
    title: "vcto's portfolio",
    description: "vcto's (notvcto) Personal Portfolio Website",
    url: "http://notvcto.github.io/",
    siteName: "vcto's Personal Portfolio",
    images: [
      {
        url: "images/logos/logo_1200.png",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "vcto",
    description: "vcto's (notvcto) Personal Portfolio Website",
    creator: "notvcto",
    images: ["images/logos/logo_1024.png"],
  },
  icons: {
    icon: "/images/logos/fevicon.png",
    apple: "/images/logos/logo.png",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={ubuntu.className}>
        {children}
        <Script
          src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
          data-name="BMC-Widget"
          data-cfasync="false"
          data-id="vcto"
          data-description="Support me on Buy me a coffee!"
          data-message=""
          data-color="#FF813F"
          data-position="Right"
          data-x_margin="18"
          data-y_margin="18"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  )
}
