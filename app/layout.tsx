import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { OnboardingGate } from '@/components/onboarding-gate'
import { SubscriptionProvider } from '@/components/subscription-provider'
import { Toaster } from "@/components/ui/sonner"
import { OfflineIndicator } from '@/components/offline-indicator'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'WeBook - Manage Your Business',
  description: 'Simple business management for solo entrepreneurs',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'WeBook',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WeBook',
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <OnboardingGate>
          <SubscriptionProvider>
            {children}
            <Toaster />
            <OfflineIndicator />
          </SubscriptionProvider>
        </OnboardingGate>
        <Analytics />
      </body>
    </html>
  )
}
