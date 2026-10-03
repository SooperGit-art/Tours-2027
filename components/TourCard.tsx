import Link from 'next/link'
import { CalendarDays, MapPin } from 'lucide-react'
import type { TourFrontmatter } from '@/lib/tours'
import { genreGradient } from './genreArt'

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800',
  rescheduled: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  rumored: 'bg-gray-100 text-gray-700'
}

const statusBorderColors: Record<string, string> = {
  confirmed: 'border-l-green-500',
  rescheduled: 'border-l-yellow-500',
  cancelled: 'border-l-red-500',
  rumored: 'border-l-gray-300'
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00Z').getTime()
  const now = Date.now()
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

export default function TourCard({ tour }: { tour: TourFrontmatter }) {
  const nextDate = tour.dates
    ?.filter((d) => daysUntil(d.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))[0]
  const countdown = nextDate ? daysUntil(nextDate.date) : null
  const dateCount = tour.dates?.length || 0

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className={`group block border border-l-4 border-black/10 ${statusBorderColors[tour.status] || 'border-l-gray-300'} rounded-xl bg-white overflow-hidden hover:border-accent/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
    >
      <div aria-hidden className={`h-1.5 bg-gradient-to-r ${genreGradient(tour.genre)}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold group-hover:text-accent transition-colors truncate">
              {tour.artist}
            </h2>
            <p className="text-muted text-sm mt-1 truncate">{tour.tourName}</p>
          </div>
          <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${statusColors[tour.status] || ''}`}>
            {tour.status}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {tour.genre && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/5 text-ink/70 font-medium">{tour.genre}</span>
          )}
          {dateCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/5 text-ink/70 font-medium inline-flex items-center gap-1">
              <CalendarDays size={12} /> {dateCount} date{dateCount !== 1 ? 's' : ''}
            </span>
          )}
          {countdown !== null && countdown <= 60 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">
              {countdown === 0 ? 'On stage today' : `Starts in ${countdown} days`}
            </span>
          )}
        </div>

        {nextDate ? (
          <p className="text-sm text-muted mt-3 flex items-center gap-1.5">
            <MapPin size={14} className="shrink-0" />
            <span className="truncate">Next: {nextDate.city} — {nextDate.venue}</span>
          </p>
        ) : (
          <p className="text-sm text-muted mt-3">No dates announced yet — we track the rumors</p>
        )}
        <p className="text-xs text-muted mt-3">Updated {tour.lastUpdated}</p>
      </div>
    </Link>
  )
}
