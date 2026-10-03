import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import JsonLd from '@/components/JsonLd'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#FAFAF8',
  width: 'device-width',
  initialScale: 1
}

export const metadata: Metadata = {
  title: {
    default: '2027 Tours | Concert & Tour Updates',
    template: '%s | 2027.tours'
  },
  description: 'The latest 2027 concert tour announcements, dates, venues, and ticket updates.',
  metadataBase: new URL('https://2027.tours'),
  alternates: { canonical: 'https://2027.tours' },
  verification: {
    google: 'zHpaHieB2SETvADltZmNbIQqPrP_HzkjoqrFkLYORs8'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' }
  },
  openGraph: {
    title: '2027 Tours | Concert & Tour Updates',
    description: 'The latest 2027 concert tour announcements, dates, venues, and ticket updates.',
    url: 'https://2027.tours',
    siteName: '2027.tours',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: '2027 Tours | Concert & Tour Updates',
    description: 'The latest 2027 concert tour announcements, dates, venues, and ticket updates.'
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '2027.tours',
    url: 'https://2027.tours',
    description:
      'Independent tracker for 2027 concert tour announcements, dates, venues, and ticket updates. Not affiliated with any artist or ticketing platform.',
    foundingDate: '2026',
    knowsAbout: ['concert tours', '2027 tour dates', 'live music', 'ticketing']
  }

  return (
    <html lang="en">
      <body className="min-h-screen font-body antialiased">
        <JsonLd data={organizationLd} />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6G017KHLTE"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6G017KHLTE');
          `}
        </Script>
        <header className="border-b border-black/10 sticky top-0 bg-paper/95 backdrop-blur z-50">
          <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
            <Link href="/" className="font-display text-2xl font-bold tracking-tight">
              2027<span className="text-accent">.</span>tours
            </Link>
            <nav className="text-sm text-muted flex items-center gap-5">
              <Link href="/" className="hover:text-ink">All Tours</Link>
              <Link href="/about" className="hover:text-ink">About</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-10">{children}</main>
        <footer className="border-t border-black/10 mt-20">
          <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-muted">
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
              <Link href="/about" className="hover:text-ink">About</Link>
              <Link href="/privacy" className="hover:text-ink">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-ink">Terms</Link>
              <Link href="/disclaimer" className="hover:text-ink">Disclaimer</Link>
            </div>
            <p>&copy; {new Date().getFullYear()} 2027.tours — Independent tour update tracker. Not affiliated with any artist or ticketing platform.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}

