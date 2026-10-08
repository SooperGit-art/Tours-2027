import Link from 'next/link'
import { ArrowLeft, CheckCircle2, SearchX, RefreshCw, XCircle, Calendar, Clock, HelpCircle, Ticket, TrendingUp } from 'lucide-react'
import { getAllTourSlugs, getAllTours, getTourBySlug } from '@/lib/tours'
import { MDXRemote } from 'next-mdx-remote/rsc'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Callout from '@/components/Callout'
import JsonLd from '@/components/JsonLd'
import FAQAccordion from '@/components/FAQAccordion'
import RelatedTours from '@/components/RelatedTours'
import { genreGradient } from '@/components/genreArt'

const BASE_URL = 'https://2027.tours'

const homepageAnchors = [
  '2027 tour tracker',
  'list of 2027 concerts',
  '2027 concert tour calendar',
  '2027 tours and concerts',
  'full list of 2027 tours'
]

function hashStr(s: string): number {
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0
  }
  return hash
}

function homepageAnchorText(slug: string): string {
  return homepageAnchors[hashStr(slug) % homepageAnchors.length]
}

// Rotating natural title templates (absolute — bypasses the "| 2027.tours"
// layout suffix so every title stays <= 60 chars). Assigned deterministically
// by slug so titles are stable across builds.
function pageTitle(slug: string, artist: string, status: string, dateCount: number): string {
  switch (hashStr(slug) % 6) {
    case 0:
      return status === 'confirmed' && dateCount > 0
        ? `${artist} Tour 2027: ${dateCount} Dates, Tickets & News`
        : `${artist} Tour 2027: Dates, Tickets & News`
    case 1:
      return `Is ${artist} Touring in 2027? Latest Updates`
    case 2:
      return `${artist} 2027 Concerts: Schedule & Ticket Info`
    case 3:
      return `${artist} Live in 2027: Tour Dates & News`
    case 4:
      return `${artist} 2027 Tour Schedule: Dates & Tickets`
    default:
      return `${artist} Concert Tour 2027: Dates & Updates`
  }
}

// H1 uses a different hash salt than the title so the two never share a
// template on the same page.
function pageH1(slug: string, artist: string): string {
  switch (hashStr(slug + ':h1') % 3) {
    case 0:
      return `${artist} Tour 2027`
    case 1:
      return `${artist} 2027 Tour Dates & Schedule`
    default:
      return `Is ${artist} Touring in 2027?`
  }
}

// Never show "(Not Announced)" on a confirmed page — a data-level guard in
// case a tourName was never updated after confirmation.
function displayTourName(status: string, tourName: string): string {
  if (status !== 'rumored') {
    return tourName.replace(/\s*\(Not Announced\)\s*$/i, '').trim() || '2027 Tour'
  }
  return tourName
}

// Split "City, ST" / "City, ST, USA" / "City, Country" into schema.org address parts.
function splitAddress(city: string): { addressLocality: string; addressRegion?: string; addressCountry?: string } {
  const parts = city.split(',').map((s) => s.trim()).filter(Boolean)
  if (parts.length === 1) return { addressLocality: parts[0] }
  const last = parts[parts.length - 1]
  const secondLast = parts[parts.length - 2]
  const isStateCode = /^[A-Z]{2}$/.test(secondLast)
  if (parts.length === 3 && isStateCode) {
    return {
      addressLocality: parts[0],
      addressRegion: secondLast,
      addressCountry: /^(USA|United States)$/i.test(last) ? 'US' : last
    }
  }
  if (parts.length === 2) {
    if (isStateCode) return { addressLocality: parts[0], addressRegion: secondLast }
    if (/^(USA|United States)$/i.test(last)) return { addressLocality: parts[0], addressCountry: 'US' }
    return { addressLocality: parts[0], addressCountry: last }
  }
  return { addressLocality: parts[0], addressRegion: parts.slice(1, -1).join(', '), addressCountry: last }
}

export async function generateStaticParams() {
  return getAllTourSlugs().map((slug) => ({ slug }))
}

const statusDescriptions: Record<string, string> = {
  confirmed: 'Yes — confirmed dates are listed below with venues and ticket links.',
  rescheduled: 'Dates have been rescheduled — see the updated schedule below.',
  cancelled: 'The tour has been cancelled — details and what we know below.',
  rumored: 'Nothing officially confirmed yet — here is what is real and what is rumor.'
}

export async function generateMetadata({
  params
}: {
  params: { slug: string }
}): Promise<Metadata> {
  try {
    const { frontmatter } = getTourBySlug(params.slug)
    const primaryKeyword = frontmatter.primaryKeyword || `${frontmatter.artist} Tour 2027`
    const dateCount = (frontmatter.dates || []).length
    const title = pageTitle(params.slug, frontmatter.artist, frontmatter.status, dateCount)
    const description =
      frontmatter.metaDescription ||
      `Is ${frontmatter.artist} touring in 2027? ${statusDescriptions[frontmatter.status] || ''} Track the ${displayTourName(frontmatter.status, frontmatter.tourName)} — honest status updates, last verified ${frontmatter.lastUpdated}.`
    const url = `${BASE_URL}/tours/${params.slug}`

    return {
      title: { absolute: title },
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        siteName: '2027.tours',
        type: 'article',
        modifiedTime: frontmatter.lastUpdated
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description
      }
    }
  } catch {
    return {}
  }
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800',
  rescheduled: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  rumored: 'bg-gray-100 text-gray-700'
}

const statusIcons: Record<string, typeof CheckCircle2> = {
  confirmed: CheckCircle2,
  rescheduled: RefreshCw,
  cancelled: XCircle,
  rumored: SearchX
}

const statusDotColors: Record<string, string> = {
  confirmed: 'bg-green-500',
  rescheduled: 'bg-amber-400',
  cancelled: 'bg-red-500',
  rumored: 'bg-gray-300'
}

const statusToEventStatus: Record<string, string> = {
  confirmed: 'https://schema.org/EventScheduled',
  rescheduled: 'https://schema.org/EventRescheduled',
  cancelled: 'https://schema.org/EventCancelled',
  rumored: 'https://schema.org/EventScheduled'
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00Z').getTime()
  return Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24))
}

export default function TourPage({ params }: { params: { slug: string } }) {
  let tour
  try {
    tour = getTourBySlug(params.slug)
  } catch {
    notFound()
  }

  const { frontmatter, content } = tour!
  const primaryKeyword = frontmatter.primaryKeyword || `${frontmatter.artist} Tour 2027`
  const pageUrl = `${BASE_URL}/tours/${params.slug}`
  const allTours = getAllTours()
  const StatusIcon = statusIcons[frontmatter.status] || SearchX
  const tourName = displayTourName(frontmatter.status, frontmatter.tourName)
  const h1 = pageH1(params.slug, frontmatter.artist)

  const upcomingDates = (frontmatter.dates || [])
    .filter((d) => daysUntil(d.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
  const nextShow = upcomingDates[0]
  const dateCount = (frontmatter.dates || []).length
  const sortedAllDates = [...(frontmatter.dates || [])].sort((a, b) => a.date.localeCompare(b.date))
  const dateRange =
    dateCount === 0
      ? 'To be announced'
      : dateCount === 1
        ? sortedAllDates[0].date
        : `${sortedAllDates[0].date} – ${sortedAllDates[dateCount - 1].date}`
  const trendingTours = allTours
    .filter((t) => t.slug !== params.slug && t.status === 'confirmed')
    .sort((a, b) => (b.dates?.length || 0) - (a.dates?.length || 0))
    .slice(0, 5)
  const sameGenreTours = allTours
    .filter((t) => t.slug !== params.slug && t.genre && t.genre === frontmatter.genre)
  const moreTours =
    sameGenreTours.length >= 3
      ? sameGenreTours.slice(0, 5)
      : [...allTours]
          .filter((t) => t.slug !== params.slug)
          .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
          .slice(0, 5)

  // Curated related strip: same genre first (up to 8), then recently updated.
  const relatedStrip = (() => {
    const rest = [...allTours]
      .filter((t) => t.slug !== params.slug && !sameGenreTours.some((g) => g.slug === t.slug))
      .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    return [...sameGenreTours, ...rest].slice(0, 8)
  })()
  const relatedHeading =
    sameGenreTours.length >= 5 && frontmatter.genre
      ? `More ${frontmatter.genre} tours in 2027`
      : 'Related 2027 tours'

  // Single @graph block instead of one <script> per entity.
  const graphNodes: Record<string, unknown>[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'All Tours', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: primaryKeyword, item: pageUrl }
      ]
    },
    {
      '@type': 'WebPage',
      name: primaryKeyword,
      url: pageUrl,
      dateModified: frontmatter.lastUpdated,
      isPartOf: {
        '@type': 'WebSite',
        name: '2027.tours',
        url: BASE_URL
      },
      about: {
        '@type': 'MusicGroup',
        name: frontmatter.artist
      }
    }
  ]
  if (frontmatter.dates?.length > 0) {
    for (const d of frontmatter.dates) {
      graphNodes.push({
        '@type': 'MusicEvent',
        name: `${frontmatter.artist}: ${tourName}`,
        startDate: d.date,
        eventStatus: statusToEventStatus[frontmatter.status] || 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        image: [`${BASE_URL}/tours/${params.slug}/opengraph-image`],
        location: {
          '@type': 'Place',
          name: d.venue,
          address: {
            '@type': 'PostalAddress',
            ...splitAddress(d.city)
          }
        },
        performer: {
          '@type': 'MusicGroup',
          name: frontmatter.artist
        },
        ...(d.ticketLink && {
          offers: {
            '@type': 'Offer',
            url: d.ticketLink,
            availability: 'https://schema.org/InStock'
          }
        })
      })
    }
  }
  if (frontmatter.faqs && frontmatter.faqs.length > 0) {
    graphNodes.push({
      '@type': 'FAQPage',
      mainEntity: frontmatter.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a
        }
      }))
    })
  }
  const graphLd = {
    '@context': 'https://schema.org',
    '@graph': graphNodes
  }

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 lg:items-start">
    <article>
      <JsonLd data={graphLd} />

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        All Tours
      </Link>

      <div className="relative rounded-2xl border border-black/10 bg-white overflow-hidden mb-8 animate-fade-in-up">
        <figure
          className={`relative h-36 sm:h-44 bg-gradient-to-br ${genreGradient(frontmatter.genre)}`}
          role="img"
          aria-label={`${primaryKeyword}: ${tourName}`}
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center font-display text-6xl sm:text-7xl font-bold text-white/90 select-none"
          >
            {frontmatter.artist.charAt(0)}
          </span>
          <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold capitalize bg-white/95 text-ink shadow-sm">
            <span className={`w-2 h-2 rounded-full ${statusDotColors[frontmatter.status] || 'bg-gray-300'}`} aria-hidden="true" />
            {frontmatter.status}
          </span>
        </figure>
        <div className="p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-2">{frontmatter.artist}</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">{h1}</h1>
          <div className="flex items-center gap-1.5 text-sm text-muted">
            <Clock size={14} />
            <span>{tourName} — Updated <time dateTime={frontmatter.lastUpdated}>{frontmatter.lastUpdated}</time></span>
          </div>
          <p className="text-xs text-muted mt-2">
            Researched by the <Link href="/about" className="text-accent hover:underline font-medium">2027.tours editorial team</Link> · verified against official sources
          </p>
        </div>
      </div>

      {/* Key facts — quick GEO/AIEO answer block */}
      <section aria-label="Key facts" className="mb-8 rounded-2xl border border-black/10 bg-black/[0.02] p-5 sm:p-6">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-muted mb-4">Key facts</h2>
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <dt className="text-xs text-muted mb-1">Status</dt>
            <dd className="font-semibold text-sm capitalize">{frontmatter.status}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted mb-1">Dates announced</dt>
            <dd className="font-semibold text-sm">{dateCount > 0 ? `${dateCount} shows` : 'None yet'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted mb-1">Tour window</dt>
            <dd className="font-semibold text-sm">{dateRange}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted mb-1">Last verified</dt>
            <dd className="font-semibold text-sm"><time dateTime={frontmatter.lastUpdated}>{frontmatter.lastUpdated}</time></dd>
          </div>
        </dl>
      </section>

      {frontmatter.dates?.length > 0 ? (
        <div className="mb-10 border border-black/10 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 bg-black/[0.03] px-4 py-3 border-b border-black/10">
            <Calendar size={16} className="text-accent" />
            <span className="text-sm font-semibold">Tour dates</span>
            <span className="text-xs text-muted ml-auto">{frontmatter.dates.length} show{frontmatter.dates.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/[0.02] text-left">
                <tr>
                  <th className="px-4 py-2.5 font-medium text-muted">Date</th>
                  <th className="px-4 py-2.5 font-medium text-muted">City</th>
                  <th className="px-4 py-2.5 font-medium text-muted">Venue</th>
                  <th className="px-4 py-2.5 font-medium text-muted">Tickets</th>
                </tr>
              </thead>
              <tbody>
                {frontmatter.dates.map((d, i) => {
                  const days = daysUntil(d.date)
                  const soon = days >= 0 && days <= 30
                  return (
                    <tr key={i} className="border-t border-black/10 hover:bg-accent/[0.03] transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <time dateTime={d.date}>{d.date}</time>
                        {soon && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                            {days === 0 ? 'Today' : `${days}d`}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">{d.city}</td>
                      <td className="px-4 py-3">{d.venue}</td>
                      <td className="px-4 py-3">
                        {d.ticketLink ? (
                          <a
                            href={d.ticketLink}
                            className="inline-flex items-center gap-1 text-accent hover:underline font-medium"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Ticket size={14} />
                            Tickets
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mb-10 flex items-start gap-3 border border-black/10 rounded-xl p-5 bg-black/[0.02]">
          <SearchX size={20} className="text-muted shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">No dates announced yet</p>
            <p className="text-sm text-muted mt-0.5">
              We'll add real dates here the moment they're officially confirmed — no placeholders, no guesses.
            </p>
          </div>
        </div>
      )}

      <div className="prose prose-neutral max-w-none prose-headings:font-display prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-black/10 prose-h2:pb-2 prose-h3:text-lg prose-h3:mt-6 prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-ink prose-table:text-sm prose-blockquote:border-accent prose-blockquote:not-italic prose-blockquote:font-normal prose-blockquote:text-muted">
        <MDXRemote source={content} components={{ Callout }} />
      </div>

      {frontmatter.sources && frontmatter.sources.length > 0 && (
        <div className="mt-10 pt-8 border-t border-black/10">
          <h2 className="font-display text-2xl font-bold mb-4">Sources</h2>
          <ul className="space-y-2">
            {frontmatter.sources.map((s) => (
              <li key={s.url} className="text-sm">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline font-medium"
                >
                  {s.label}
                </a>
                <span className="text-muted"> — official source</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted mt-3">
            Tour dates and announcements on this page are verified against the sources above.
            Last checked <time dateTime={frontmatter.lastUpdated}>{frontmatter.lastUpdated}</time>.
          </p>
        </div>
      )}

      {frontmatter.faqs && frontmatter.faqs.length > 0 && (
        <div className="mt-10 pt-8 border-t border-black/10">
          <div className="flex items-center gap-2 mb-5">
            <HelpCircle size={20} className="text-accent" />
            <h2 className="font-display text-2xl font-bold">Frequently asked questions</h2>
          </div>
          <FAQAccordion faqs={frontmatter.faqs} />
        </div>
      )}

      <div className="mt-10 pt-8 border-t border-black/10">
        <p className="text-sm text-muted mb-5">
          Looking for other artists? Browse the{' '}
          <Link href="/" className="text-accent hover:underline font-medium">
            {homepageAnchorText(params.slug)}
          </Link>{' '}
          for every confirmed and rumored show we're tracking.
        </p>
        <h2 className="font-display text-2xl font-bold mb-5">{relatedHeading}</h2>
        <RelatedTours tours={relatedStrip} />
      </div>
    </article>

    <aside className="mt-10 lg:mt-0 space-y-6 lg:sticky lg:top-24">
      {/* At a glance */}
      <div className="rounded-2xl border border-black/10 bg-white p-5">
        <h3 className="text-xs font-semibold tracking-widest uppercase text-muted mb-4">At a glance</h3>
        <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium capitalize mb-4 ${statusColors[frontmatter.status] || ''}`}>
          <StatusIcon size={14} />
          {frontmatter.status}
        </span>
        <dl className="space-y-2.5 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Dates listed</dt>
            <dd className="font-semibold">{frontmatter.dates?.length ? `${frontmatter.dates.length}` : 'None yet'}</dd>
          </div>
          {nextShow && (
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Next show</dt>
              <dd className="font-semibold text-right">
                {nextShow.city}
                <span className="block text-muted font-normal text-xs"><time dateTime={nextShow.date}>{nextShow.date}</time></span>
              </dd>
            </div>
          )}
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Last verified</dt>
            <dd className="font-semibold"><time dateTime={frontmatter.lastUpdated}>{frontmatter.lastUpdated}</time></dd>
          </div>
        </dl>
      </div>

      {/* Trending */}
      {trendingTours.length > 0 && (
        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <h3 className="text-xs font-semibold tracking-widest uppercase text-muted mb-2 flex items-center gap-1.5">
            <TrendingUp size={13} className="text-accent" /> Trending tours
          </h3>
          <ul className="divide-y divide-black/5">
            {trendingTours.map((t) => (
              <li key={t.slug}>
                <Link href={`/tours/${t.slug}`} className="group flex items-center gap-2.5 py-2.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${statusDotColors[t.status] || 'bg-gray-300'}`} aria-hidden />
                  <span className="text-sm font-medium group-hover:text-accent transition-colors truncate">{t.artist}</span>
                  <span className="text-xs text-muted ml-auto shrink-0">{t.dates?.length || 0} dates</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* More like this */}
      {moreTours.length > 0 && (
        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <h3 className="text-xs font-semibold tracking-widest uppercase text-muted mb-2">
            {sameGenreTours.length >= 3 && frontmatter.genre ? `More ${frontmatter.genre} tours` : 'Recently updated'}
          </h3>
          <ul className="divide-y divide-black/5">
            {moreTours.map((t) => (
              <li key={t.slug}>
                <Link href={`/tours/${t.slug}`} className="group flex items-center gap-2.5 py-2.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${statusDotColors[t.status] || 'bg-gray-300'}`} aria-hidden />
                  <span className="text-sm font-medium group-hover:text-accent transition-colors truncate">{t.artist}</span>
                  <span className="text-xs text-muted ml-auto shrink-0 capitalize">{t.status}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/" className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline mt-3">
            View all {allTours.length} tours <ArrowLeft size={12} className="rotate-180" />
          </Link>
        </div>
      )}
    </aside>
    </div>
  )
}
