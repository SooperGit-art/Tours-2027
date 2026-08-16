import Link from 'next/link'
import { ArrowLeft, CheckCircle2, SearchX, RefreshCw, XCircle, Calendar, Clock, HelpCircle, Ticket } from 'lucide-react'
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

export async function generateMetadata({
  params
}: {
  params: { slug: string }
}): Promise<Metadata> {
  try {
    const { frontmatter } = getTourBySlug(params.slug)
    const primaryKeyword = frontmatter.primaryKeyword || `${frontmatter.artist} Tour 2027`
    const title = `${primaryKeyword}: Dates, Tickets & News | 2027.tours`
    const description = `Latest updates on ${frontmatter.artist}'s ${frontmatter.tourName}: dates, venues, and status.`
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
  )
}
