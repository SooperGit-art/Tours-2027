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

const BASE_URL = 'https://2027.tours'

const homepageAnchors = [
  '2027 tour tracker',
  'list of 2027 concerts',
  '2027 concert tour calendar',
  '2027 tours and concerts',
  'full list of 2027 tours'
]

function homepageAnchorText(slug: string): string {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) % homepageAnchors.length
  }
  return homepageAnchors[hash]
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
    const title = `${primaryKeyword}: Dates, Tickets & News | 2027.tours`
    const description =
      frontmatter.metaDescription ||
      `Is ${frontmatter.artist} touring in 2027? ${statusDescriptions[frontmatter.status] || ''} Track the ${frontmatter.tourName} — honest status updates, last verified ${frontmatter.lastUpdated}.`
    const url = `${BASE_URL}/tours/${params.slug}`

    return {
      title,
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

const statusBarColors: Record<string, string> = {
  confirmed: 'bg-green-500',
  rescheduled: 'bg-yellow-500',
  cancelled: 'bg-red-500',
  rumored: 'bg-gray-300'
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

  const upcomingDates = (frontmatter.dates || [])
    .filter((d) => daysUntil(d.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
  const nextShow = upcomingDates[0]
  const trendingTours = allTours
    .filter((t) => t.slug !== params.slug && t.status === 'confirmed')
    .sort((a, b) => (b.dates?.length || 0) - (a.dates?.length || 0))
    .slice(0, 5)
  const sameGenreTours = allTours
    .filter((t) => t.slug !== params.slug && t.genre && t.genre === frontmatter.genre)
    .slice(0, 5)
  const moreTours =
    sameGenreTours.length >= 3
      ? sameGenreTours
      : [...allTours]
          .filter((t) => t.slug !== params.slug)
          .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
          .slice(0, 5)

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'All Tours', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: primaryKeyword, item: pageUrl }
    ]
  }

  const webPageLd = {
    '@context': 'https://schema.org',
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

  const eventLd =
    frontmatter.dates?.length > 0
      ? frontmatter.dates.map((d) => ({
          '@context': 'https://schema.org',
          '@type': 'MusicEvent',
          name: `${frontmatter.artist}: ${frontmatter.tourName}`,
          startDate: d.date,
          eventStatus: statusToEventStatus[frontmatter.status] || 'https://schema.org/EventScheduled',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          image: [`${BASE_URL}/tours/${params.slug}/opengraph-image`],
          location: {
            '@type': 'Place',
            name: d.venue,
            address: {
              '@type': 'PostalAddress',
              addressLocality: d.city
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
        }))
      : []

  const faqLd =
    frontmatter.faqs && frontmatter.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: frontmatter.faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.a
            }
          }))
        }
      : null

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 lg:items-start">
    <article>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={webPageLd} />
      {eventLd.map((e, i) => (
        <JsonLd key={i} data={e} />
      ))}
      {faqLd && <JsonLd data={faqLd} />}

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        All Tours
      </Link>

      <div className="relative rounded-2xl border border-black/10 bg-white overflow-hidden mb-8 animate-fade-in-up">
        <div className={`h-1.5 w-full ${statusBarColors[frontmatter.status] || 'bg-gray-300'}`} />
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="font-display text-3xl sm:text-4xl font-bold">{frontmatter.artist}</h1>
            <span
              className={`shrink-0 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium capitalize ${statusColors[frontmatter.status] || ''}`}
            >
              <StatusIcon size={14} />
              {frontmatter.status}
            </span>
          </div>
          <h2 className="font-display text-lg font-semibold text-accent mb-3">{primaryKeyword}</h2>
          <div className="flex items-center gap-1.5 text-sm text-muted">
            <Clock size={14} />
            <span>{frontmatter.tourName} — Updated {frontmatter.lastUpdated}</span>
          </div>
        </div>
      </div>

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
                        {d.date}
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
          Looking for other artists? Browse the full{' '}
          <Link href="/" className="text-accent hover:underline font-medium">
            {homepageAnchorText(params.slug)}
          </Link>{' '}
          for every confirmed and rumored show we're tracking.
        </p>
        <h2 className="font-display text-2xl font-bold mb-5">Other 2027 tours we're tracking</h2>
        <RelatedTours currentSlug={params.slug} allTours={allTours} />
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
                <span className="block text-muted font-normal text-xs">{nextShow.date}</span>
              </dd>
            </div>
          )}
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Last verified</dt>
            <dd className="font-semibold">{frontmatter.lastUpdated}</dd>
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

