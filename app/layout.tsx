import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: '4Seas Crypto Residency Program | Chiang Mai',
  description: 'A community-based residency program for crypto builders, researchers, and creators in Chiang Mai. Live with the community. Build in public, build in person.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/residency/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/residency/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/residency/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/residency/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
