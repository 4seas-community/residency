import type { Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { withBasePath } from '@/lib/paths'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-serif' });

export const metadata: Metadata = {
  title: '4Seas Residency Programs | Chiang Mai',
  description: '4Seas Residency is a community-based residency program in Chiang Mai for builders, artists, researchers, founders, creators, and long-term thinkers.',
  generator: 'v0.app',
  openGraph: {
    title: '4Seas Residency Programs | Chiang Mai',
    description: '4Seas Residency is a community-based residency program in Chiang Mai for builders, artists, researchers, founders, creators, and long-term thinkers.',
    type: 'website',
  },
  icons: {
    icon: [
      {
        url: withBasePath('/4seas-favicon.jpg'),
        sizes: '32x32',
        type: 'image/jpeg',
      },
      {
        url: withBasePath('/4seas-icon.jpg'),
        sizes: '256x256',
        type: 'image/jpeg',
      },
    ],
    apple: withBasePath('/4seas-icon.jpg'),
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`bg-background ${_playfair.variable}`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
