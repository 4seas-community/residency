import type { Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { withBasePath } from '@/lib/paths'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-serif' });

export const metadata: Metadata = {
  title: '4Seas Crypto Residency Program | Chiang Mai',
  description: 'A community-based residency program for crypto builders, researchers, and creators in Chiang Mai. Live with the community. Build in public, build in person.',
  generator: 'v0.app',
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
