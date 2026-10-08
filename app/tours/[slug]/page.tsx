import type { Metadata } from 'next'
import NextLink from 'next/link'
import { ShieldCheck, SearchX, Link2, HelpCircle, ArrowRight, BadgeCheck, LayoutGrid, Clock, Music2, ArrowUpRight } from 'lucide-react'
import { getAllTours, type TourFrontmatter } from '@/lib/tours'
import { homepageFaqs } from '@/lib/homepageFaqs'
import JsonLd from '@/components/JsonLd'
import TourExplorer from '@/components/TourExplorer'
import TrendingStrip from '@/components/TrendingStrip'
import { genreGradient } from '@/components/genreArt'
import FAQAccordion from '@/components/FAQAccordion'

export const metadata: Metadata = {
  title: '2027 Concert Tours: Confirmed Dates, Tickets & Tour News',
  description:
    'Every confirmed and rumored 2027 concert tour in one place — real dates, official ticket links, honest status updates.'
}


const statusDot: Record<string, string> = {
  confirmed: 'bg-green-500',
  rescheduled: 'bg-amber-400',
  cancelled: 'bg-red-500',
  rumored: 'bg-gray-300'
}

function LatestUpdates({ tours }: { tours: TourFrontmatter[] }) {
  if (tours.length === 0) return null
  return (
    <section className="mb-16">
      <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-2 flex items-center gap-1.5">
        <Clock size={14} /> Freshly verified
      </p>
      <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">Latest tour updates</h2>
      <p className="text-muted mb-6 max-w-2xl">
        Every page is re-checked against official sources. Here are the most recently verified
        2027 tour trackers.
      </p>
      <ul className="divide-y divide-black/10 border-y border-black/10">
        {tours.map((t) => (
          <li key={t.slug}>
            <NextLink
              href={`/tours/${t.slug}`}
              className="group flex items-center gap-4 py-3.5 hover:bg-black/[0.02] -mx-2 px-2 rounded-lg transition-colors"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusDot[t.status] || 'bg-gray-300'}`}
                aria-hidden
              />
              <span className="flex-1 min-w-0">
                <span className="font-semibold group-hover:text-accent transition-colors">
                  {t.artist}
                </span>
                <span className="text-sm text-muted"> — {t.tourName}</span>
              </span>
              <span className="hidden sm:block text-xs text-muted capitalize shrink-0">
                {t.status}
              </span>
              <span className="text-xs text-muted shrink-0">Updated {t.lastUpdated}</span>
              <ArrowRight
                size={16}
                className="text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0"
              />
            </NextLink>
          </li>
        ))}
      </ul>
    </section>
  )
}



function GenreCards({ tours }: { tours: TourFrontmatter[] }) {
  const genres = Array.from(
    new Set(tours.map((t) => t.genre).filter(Boolean) as string[])
  ).sort()
  if (genres.length === 0) return null

  return (
    <section className="mb-16">
      <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-2">
        By genre
      </p>
      <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
        2027 tours and concerts by genre
      </h2>
      <p className="text-muted mb-6 max-w-2xl">
        Jump to the sound you care about — from confirmed stadium runs to artists who
        haven't announced 2027 plans yet.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {genres.map((genre) => {
          const genreTours = tours.filter((t) => t.genre === genre)
          const confirmed = genreTours.filter((t) => t.status === 'confirmed').length
          const sample = genreTours.slice(0, 3).map((t) => t.artist).join(', ')
          return (
            <a
              key={genre}
              href="#tours"
              className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div
                aria-hidden
                className={`absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br ${genreGradient(genre)} opacity-20 blur-xl group-hover:opacity-35 transition-opacity`}
              />
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${genreGradient(genre)} flex items-center justify-center mb-3`}
                >
                  <Music2 size={18} className="text-white" />
                </div>
                <h3 className="font-display text-lg font-bold group-hover:text-accent transition-colors">
                  {genre}
                </h3>
                <p className="text-sm text-muted mt-1">
                  {genreTours.length} artist{genreTours.length !== 1 ? 's' : ''} tracked
                  {confirmed > 0 && (
                    <span className="text-green-700 font-medium"> · {confirmed} confirmed</span>
                  )}
                </p>
                <p className="text-xs text-muted mt-2 truncate">{sample}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent mt-3">
                  Browse {genre.toLowerCase()} tours
                  <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}


function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-2">{children}</p>
}

export default function HomePage() {
  const tours = getAllTours()
  const confirmedTours = tours.filter((t) => t.status === 'confirmed')
  const confirmedCount = confirmedTours.length
  const totalDates = tours.reduce((sum, t) => sum + (t.dates?.length || 0), 0)

  // Trending: top confirmed tours by date count + big-name rumored acts
  const bigRumoredSlugs = ['drake-2027-tour', 'coldplay-2027-tour', 'justin-bieber-2027-tour', 'morgan-wallen-2027-tour']
  const trending: TourFrontmatter[] = [
    ...[...confirmedTours].sort((a, b) => (b.dates?.length || 0) - (a.dates?.length || 0)).slice(0, 6),
    ...bigRumoredSlugs
      .map((slug) => tours.find((t) => t.slug === slug))
      .filter((t): t is TourFrontmatter => Boolean(t))
  ]
    .filter((t, i, arr) => arr.indexOf(t) === i)
    .slice(0, 8)

  const latestUpdates = [...tours]
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated) || a.artist.localeCompare(b.artist))
    .slice(0, 5)

  const azTours = [...tours].sort((a, b) => a.artist.localeCompare(b.artist))
  const marqueeArtists = [...tours].sort((a, b) => a.artist.localeCompare(b.artist))

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
      <section className="relative overflow-hidden rounded-3xl bg-ink text-paper px-6 py-12 sm:px-12 sm:py-16 mb-10 animate-fade-in-up">
        <div
          aria-hidden
          className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-accent/25 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute -bottom-40 -left-24 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none"
        />
        <div className="relative max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-paper/70 border border-white/15 rounded-full px-3.5 py-1.5 mb-5">
            <BadgeCheck size={14} className="text-accent" />
            Independent 2027 tour tracker
          </p>
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
            Every 2027 tour.<br />
            One <span className="text-accent">honest</span> tracker.
          </h1>
          <p className="text-paper/70 mt-5 max-w-xl text-lg leading-relaxed">
            Real dates when they're confirmed. A clear "nothing announced yet" when they're
            not. No fabricated schedules, ever.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <a
              href="#tours"
              className="inline-flex items-center gap-2 bg-accent text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-accent/90 transition-colors"
            >
              <LayoutGrid size={16} />
              Browse all {tours.length} tours
            </a>
            <a
              href="#approach"
              className="inline-flex items-center gap-2 border border-white/20 text-paper font-semibold text-sm px-6 py-3 rounded-full hover:bg-white/10 transition-colors"
            >
              How we verify
              <ArrowRight size={16} />
            </a>
          </div>
          <div className="flex items-center gap-6 sm:gap-8 mt-10 flex-wrap">
            <div>
              <p className="font-display text-3xl font-bold">{tours.length}</p>
              <p className="text-xs text-paper/60 mt-0.5">artists tracked</p>
            </div>
            <div className="w-px h-10 bg-white/15" aria-hidden />
            <div>
              <p className="font-display text-3xl font-bold text-green-400">{confirmedCount}</p>
              <p className="text-xs text-paper/60 mt-0.5">with confirmed dates</p>
            </div>
            <div className="w-px h-10 bg-white/15" aria-hidden />
            <div>
              <p className="font-display text-3xl font-bold">{totalDates}</p>
              <p className="text-xs text-paper/60 mt-0.5">tour dates listed</p>
            </div>
          </div>
        </div>

        {/* Artist marquee */}
        <div className="relative mt-10 -mx-6 sm:-mx-12 overflow-hidden" aria-hidden>
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-ink to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-ink to-transparent z-10 pointer-events-none" />
          <div className="flex whitespace-nowrap animate-marquee w-max">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0">
                {marqueeArtists.map((t) => (
                  <span key={`${copy}-${t.slug}`} className="mx-5 text-sm font-display italic text-paper/40">
                    {t.artist}
                    <span className="not-italic text-accent/60 ml-10">•</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      <TrendingStrip tours={trending} />

      {/* Search + filter + grid */}
      <section id="tours" className="mb-16 scroll-mt-24">
        <Eyebrow>Tour finder</Eyebrow>
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">Browse all 2027 tours</h2>
        <p className="text-muted mb-6 max-w-2xl">
          Search any artist, filter by confirmation status or genre. Green badge means real,
          officially announced dates — everything else tells you exactly what is rumor and
          what isn't.
        </p>
        <TourExplorer tours={tours} />
      </section>

      {/* Latest updates */}
      <LatestUpdates tours={latestUpdates} />

      {/* Genres */}
      <GenreCards tours={tours} />

      {/* Tour spotlight - in-text links to top pages */}
      <section className="mb-16 py-10 border-t border-black/10">
        <Eyebrow>Spotlight</Eyebrow>
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">2027 tours worth watching right now</h2>
        <div className="max-w-3xl space-y-4 text-muted leading-relaxed">
          <p>
            A few 2027 tours are already shaping up to be the year's biggest stories. K-pop fans
            should watch the{' '}
            <NextLink href="/tours/bts-2027-tour" className="text-accent hover:underline font-medium">
              BTS Tour 2027
            </NextLink>
            , the closing leg of the record-breaking ARIRANG World Tour, while pop's biggest
            arena draw is covered on our{' '}
            <NextLink href="/tours/olivia-rodrigo-2027-tour" className="text-accent hover:underline font-medium">
              Olivia Rodrigo 2027 tour dates
            </NextLink>{' '}
            page — 46 confirmed shows and counting.
          </p>
          <p>
            Country dominates the confirmed list: the{' '}
            <NextLink href="/tours/luke-combs-2027-tour" className="text-accent hover:underline font-medium">
              Luke Combs 2027 tour
            </NextLink>{' '}
            and{' '}
            <NextLink href="/tours/teddy-swims-2027-tour" className="text-accent hover:underline font-medium">
              Teddy Swims 2027 tour dates
            </NextLink>{' '}
            both have real schedules posted. On the heavier side,{' '}
            <NextLink href="/tours/megadeth-2027-tour" className="text-accent hover:underline font-medium">
              Megadeth's 2027 European tour
            </NextLink>
            , the{' '}
            <NextLink href="/tours/foo-fighters-2027-tour" className="text-accent hover:underline font-medium">
              Foo Fighters 2027 tour
            </NextLink>
            , and{' '}
            <NextLink href="/tours/system-of-a-down-2027-tour" className="text-accent hover:underline font-medium">
              System of a Down 2027 tour
            </NextLink>{' '}
            are the metal and rock dates to track. Every page is re-verified against official
            sources — check the "Updated" date at the top of each tour page.
          </p>
        </div>
      </section>

      {/* Why this site */}
      <section id="approach" className="mb-16 py-12 px-6 sm:px-10 bg-black/[0.02] rounded-3xl scroll-mt-24">
        <Eyebrow>Our approach</Eyebrow>
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">Why trust this over other tour sites</h2>
        <p className="text-muted mb-8 max-w-2xl">
          Most tour sites either copy unverified schedules or stay vague. We do the
          unglamorous work: checking primary sources and telling you what we actually know.
        </p>
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="w-11 h-11 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
              <ShieldCheck size={20} className="text-green-700" />
            </div>
            <p className="font-semibold mb-1.5">Confirmed vs. rumor, always separated</p>
            <p className="text-sm text-muted leading-relaxed">We never present a fan tweet as an official announcement. Every page tells you exactly how certain each piece of information is.</p>
          </div>
          <div>
            <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
              <SearchX size={20} className="text-amber-700" />
            </div>
            <p className="font-semibold mb-1.5">Misinformation gets called out</p>
            <p className="text-sm text-muted leading-relaxed">When a fake "leaked" schedule is circulating for an artist, we name it and explain why it isn't real — not just stay silent on it.</p>
          </div>
          <div>
            <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
              <Link2 size={20} className="text-blue-700" />
            </div>
            <p className="font-semibold mb-1.5">Official sources, every time</p>
            <p className="text-sm text-muted leading-relaxed">Every page links directly to the artist's official site or verified press coverage — never resale sites or unverified aggregators.</p>
          </div>
        </div>
      </section>

      {/* A–Z directory */}
      <section className="mb-16 py-10 border-t border-black/10">
        <Eyebrow>Directory</Eyebrow>
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">All 2027 tours A–Z</h2>
        <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {azTours.map((t) => (
            <li key={t.slug} className="flex items-baseline gap-2 text-sm border-b border-black/5 pb-2">
              <NextLink href={`/tours/${t.slug}`} className="font-medium hover:text-accent transition-colors">
                {t.artist.endsWith('Tour') ? t.artist + ' 2027' : t.artist + ' Tour 2027'}
              </NextLink>
              <span className="text-xs text-muted capitalize ml-auto shrink-0">{t.status}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="mb-16 py-10 border-t border-black/10">
        <Eyebrow>Questions</Eyebrow>
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle size={22} className="text-accent" />
          <h2 className="font-display text-2xl sm:text-3xl font-bold">2027 tour and concert FAQs</h2>
        </div>
        <FAQAccordion />
      </section>

    </div>
  )
}
