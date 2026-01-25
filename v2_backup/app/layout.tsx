import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Catppuccin Desktop Portfolio',
  description: 'A web-based desktop OS portfolio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect"/>
        <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=JetBrains+Mono:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
      </head>
      <body className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-sans h-screen w-screen overflow-hidden selection:bg-primary selection:text-background-dark transition-colors duration-300 relative">
        {children}
      </body>
    </html>
  )
}
