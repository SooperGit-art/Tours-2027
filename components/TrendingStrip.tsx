'use client'

import { useRef } from 'react'
import NextLink from 'next/link'
import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Flame } from 'lucide-react'
import type { TourFrontmatter } from '@/lib/tours'
import { genreGradient } from './genreArt'

const statusBadge: Record<string, string> = {
  confirmed: 'bg-green-500/95 text-white',
  rescheduled: 'bg-amber-400/95 text-black',
  cancelled: 'bg-red-500/95 text-white',
  rumored: 'bg-black/60 text-white backdrop-blur-sm'
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00Z').getTime()
  return Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24))
}

export default function TrendingStrip({ tours }: { tours: TourFrontmatter[] }) {
  const scroller = useRef<HTMLDivElement>(null)
  const scrollBy = (dir: number) =>
    scroller.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })

  if (tours.length === 0) return null

  return (
    <section className="mb-16">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-2 flex items-center gap-1.5">
            <Flame size={14} /> Trending now
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">
            The 2027 tours everyone is watching
          </h2>
        </div>
        <div className="hidden sm:flex gap-2 shrink-0">
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Scroll trending tours left"
            className="w-10 h-10 rounded-full border border-black/15 bg-white flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="Scroll trending tours right"
            className="w-10 h-10 rounded-full border border-black/15 bg-white flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 sm:mx-0 sm:px-1 scrollbar-hide"
      >
        {tours.map((t) => {
          const dateCount = t.dates?.length || 0
          const nextDate = t.dates
            ?.filter((d) => daysUntil(d.date) >= 0)
            .sort((a, b) => a.date.localeCompare(b.date))[0]
          const countdown = nextDate ? daysUntil(nextDate.date) : null
          return (
            <NextLink
              key={t.slug}
              href={`/tours/${t.slug}`}
              className="group snap-start shrink-0 w-[270px] rounded-2xl bg-white border border-black/10 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            >
              <div className={`relative h-24 bg-gradient-to-br ${genreGradient(t.genre)}`}>
                <span className="absolute inset-0 flex items-center justify-center font-display text-5xl font-bold text-white/90 select-none">
                  {t.artist.charAt(0)}
                </span>
                <span
                  className={`absolute top-3 left-3 text-[11px] px-2.5 py-1 rounded-full font-semibold capitalize ${statusBadge[t.status] || statusBadge.rumored}`}
                >
                  {t.status}
                </span>
                {countdown !== null && countdown <= 90 && (
                  <span className="absolute top-3 right-3 text-[11px] px-2.5 py-1 rounded-full font-semibold bg-white/95 text-ink">
                    {countdown === 0 ? 'Today' : `${countdown}d to go`}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display text-lg font-bold leading-tight group-hover:text-accent transition-colors">
                  {t.artist}
                </h3>
                <p className="text-xs text-muted mt-0.5 truncate">{t.tourName}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={13} />
                    {dateCount > 0 ? `${dateCount} dates` : 'No dates yet'}
                  </span>
                  {nextDate && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin size={13} className="shrink-0" />
                      <span className="truncate">{nextDate.city}</span>
                    </span>
                  )}
                </div>
              </div>
            </NextLink>
          )
        })}
      </div>
    </section>
  )
}
