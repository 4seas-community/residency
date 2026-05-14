import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "")
const withBasePath = (path: string) => `${basePath}${path}`

export const metadata: Metadata = {
  title: '4Seas Crypto Residency Program | Chiang Mai',
  description: 'A community-based residency program for crypto builders, researchers, and creators in Chiang Mai. Live with the community. Build in public, build in person.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: withBasePath('/images/favicon.jpg'),
        type: 'image/x-icon',
      },
    ],
    shortcut: [
      {
        url: withBasePath('/images/favicon.jpg'),
        type: 'image/x-icon',
      },
    ],
    apple: [
      {
        url: withBasePath('/images/webclip.jpg'),
      },
    ],
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
