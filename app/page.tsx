import type { Metadata } from 'next'
import NextLink from 'next/link'
import { CheckCircle2, SearchX, Link2, ShieldCheck, HelpCircle, Mail } from 'lucide-react'
import { getAllTours } from '@/lib/tours'
import { homepageFaqs } from '@/lib/homepageFaqs'
import JsonLd from '@/components/JsonLd'
import TourExplorer from '@/components/TourExplorer'
import FAQAccordion from '@/components/FAQAccordion'
import NewsletterForm from '@/components/NewsletterForm'

export const metadata: Metadata = {
  title: '2027 Concert Tours: Confirmed Dates, Tickets & Tour News',
  description:
    'Track every confirmed and rumored 2027 tour and concert in one place. Real dates, official ticket links, and honest status updates on 2027 concert tours — no fabricated schedules.'
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-2">{children}</p>
}

export default function HomePage() {
  const tours = getAllTours()
  const confirmedCount = tours.filter((t) => t.status === 'confirmed').length
  const confirmedTours = tours.filter((t) => t.status === 'confirmed')
  const unconfirmedTours = tours.filter((t) => t.status !== 'confirmed')
  const genres = Array.from(new Set(tours.map((t) => t.genre).filter(Boolean) as string[]))
  const totalDates = tours.reduce((sum, t) => sum + (t.dates?.length || 0), 0)

  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '2027.tours',
    url: 'https://2027.tours',
    description: 'Independent tracker for 2027 concert tour announcements, dates, venues, and ticket updates.'
  }

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: tours.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://2027.tours/tours/${t.slug}`,
      name: `${t.artist} Tour 2027`
    }))
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: homepageFaqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  }

  return (
    <div>
      <JsonLd data={websiteLd} />
      {tours.length > 0 && <JsonLd data={itemListLd} />}
      <JsonLd data={faqLd} />

      {/* Hero */}
      <section className="relative -mx-4 px-4 sm:mx-0 sm:px-0 pt-10 pb-14 sm:pb-16 mb-4 overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-accent/10 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute -top-10 right-0 w-64 h-64 rounded-full bg-accent/5 blur-3xl pointer-events-none"
        />
        <div className="relative animate-fade-in-up">
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight max-w-2xl leading-[1.1]">
            Find the latest <span className="text-accent">2027</span> concert tours
          </h1>
          <p className="text-muted mt-5 max-w-xl text-lg leading-relaxed">
            Real dates when they're confirmed. Honest "nothing announced yet" when they're not.
            No fabricated schedules, ever.
          </p>
          <p className="text-muted mt-4 max-w-xl text-sm leading-relaxed">
            This is a running tracker of 2027 tours and 2027 concerts across every genre — from
            confirmed stadium runs to artists who haven't announced anything yet. Use it as your 2027
            tour calendar: search an artist, filter by status or genre, and get the real story behind
            every upcoming 2027 concert.
          </p>

          <div className="flex items-center gap-3 mt-8 flex-wrap">
            <div className="bg-white border border-black/10 rounded-xl px-4 py-2.5 shadow-sm">
              <span className="text-lg font-bold text-ink">{tours.length}</span>
              <span className="text-xs text-muted ml-1.5">artists tracked</span>
            </div>
            <div className="bg-white border border-black/10 rounded-xl px-4 py-2.5 shadow-sm">
              <span className="text-lg font-bold text-green-600">{confirmedCount}</span>
              <span className="text-xs text-muted ml-1.5">with confirmed dates</span>
            </div>
            <div className="bg-white border border-black/10 rounded-xl px-4 py-2.5 shadow-sm">
              <span className="text-lg font-bold text-ink">{totalDates}</span>
              <span className="text-xs text-muted ml-1.5">tour dates listed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search + filter + grid */}
      <section className="mb-16">
        <TourExplorer tours={tours} />
      </section>

      {/* Crawlable genre content */}
      {genres.length > 0 && (
        <section className="mb-16 py-10 border-t border-black/10">
          <Eyebrow>By genre</Eyebrow>
          <h2 className="font-display text-2xl font-bold mb-4">2027 tours and concerts by genre</h2>
          <p className="text-muted mb-6 max-w-2xl">
            Browse 2027 concert tours by genre — from confirmed stadium runs to artists who haven't
            announced 2027 plans yet.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {genres.map((genre) => {
              const genreTours = tours.filter((t) => t.genre === genre)
              return (
                <div key={genre}>
                  <h3 className="font-display text-base font-semibold mb-2">{genre} 2027 tours</h3>
                  <ul className="space-y-1">
                    {genreTours.map((t) => (
                      <li key={t.slug}>
                        <NextLink href={`/tours/${t.slug}`} className="text-sm text-accent hover:underline">
                          {t.artist} Tour 2027
                        </NextLink>
                        <span className="text-xs text-muted"> — {t.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Crawlable summary content - confirmed tours */}
      {confirmedTours.length > 0 && (
        <section className="mb-16 py-10 border-t border-black/10">
          <Eyebrow>Confirmed</Eyebrow>
          <h2 className="font-display text-2xl font-bold mb-4">Confirmed 2027 tour dates so far</h2>
          <p className="text-muted mb-6 max-w-2xl">
            As of {tours[0]?.lastUpdated}, {confirmedCount} of the {tours.length} artists we're tracking
            have officially confirmed 2027 tour dates{genres.length > 0 ? `, spanning genres including ${genres.join(', ')}` : ''}.
            Here's the current confirmed list:
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {confirmedTours.map((t) => (
              <li key={t.slug}>
                <NextLink
                  href={`/tours/${t.slug}`}
                  className="flex items-start gap-2.5 text-sm p-3 rounded-lg border border-black/10 bg-white hover:border-green-300 hover:bg-green-50/50 transition-colors"
                >
                  <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" />
                  <span>
                    <span className="font-semibold text-ink">{t.artist}</span>
                    <span className="text-muted"> — {t.tourName}, {t.dates.length} date{t.dates.length !== 1 ? 's' : ''}, first show {t.dates[0]?.date}</span>
                  </span>
                </NextLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Crawlable summary content - unconfirmed / rumored */}
      {unconfirmedTours.length > 0 && (
        <section className="mb-16 py-10 border-t border-black/10">
          <Eyebrow>Not confirmed yet</Eyebrow>
          <h2 className="font-display text-2xl font-bold mb-4">2027 tours that haven't been confirmed yet</h2>
          <p className="text-muted mb-6 max-w-2xl">
            Not every artist has announced 2027 tour plans yet. These pages track the real status of
            each artist's 2027 concerts — rumors, hints from the artist, or a plain "nothing
            announced" — updated as new information comes out.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {unconfirmedTours.map((t) => (
              <li key={t.slug}>
                <NextLink
                  href={`/tours/${t.slug}`}
                  className="flex items-start gap-2.5 text-sm p-3 rounded-lg border border-black/10 bg-white hover:border-black/20 transition-colors"
                >
                  <SearchX size={18} className="text-muted shrink-0 mt-0.5" />
                  <span>
                    <span className="font-semibold text-ink">{t.artist}</span>
                    <span className="text-muted capitalize"> — status: {t.status}</span>
                  </span>
                </NextLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Why this site */}
      <section className="mb-16 py-12 -mx-4 px-4 sm:mx-0 sm:px-0 bg-black/[0.02] rounded-2xl">
        <Eyebrow>Our approach</Eyebrow>
        <h2 className="font-display text-2xl font-bold mb-8">Why trust this over other tour sites</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <ShieldCheck size={20} className="text-green-700" />
            </div>
            <p className="font-semibold mb-1.5">Confirmed vs. rumor, always separated</p>
            <p className="text-sm text-muted leading-relaxed">We never present a fan tweet as an official announcement. Every page tells you exactly how certain each piece of information is.</p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-3">
              <SearchX size={20} className="text-amber-700" />
            </div>
            <p className="font-semibold mb-1.5">Misinformation gets called out</p>
            <p className="text-sm text-muted leading-relaxed">When a fake "leaked" schedule is circulating for an artist, we name it and explain why it isn't real — not just stay silent on it.</p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <Link2 size={20} className="text-blue-700" />
            </div>
            <p className="font-semibold mb-1.5">Official sources, every time</p>
            <p className="text-sm text-muted leading-relaxed">Every page links directly to the artist's official site or verified press coverage — never resale sites or unverified aggregators.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-16 py-10 border-t border-black/10">
        <Eyebrow>Questions</Eyebrow>
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle size={22} className="text-accent" />
          <h2 className="font-display text-2xl font-bold">2027 tour and concert FAQs</h2>
        </div>
        <FAQAccordion />
      </section>

      {/* Newsletter */}
      <section className="py-10 mb-4">
        <div className="rounded-2xl bg-ink text-paper p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Mail size={20} className="text-accent" />
              <h2 className="font-display text-2xl font-bold">Never miss a tour announcement</h2>
            </div>
            <p className="text-paper/70 max-w-md">Get notified when a tracked artist's tour status changes.</p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </div>
  )
}
