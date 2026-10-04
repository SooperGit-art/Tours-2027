'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

export type TourRow = {
  slug: string
  artist: string
  status: string
  dates: number
  genre: string
  lastUpdated: string
}

const badge: Record<string, string> = {
  confirmed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  rumored: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  rescheduled: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  cancelled: 'bg-red-500/15 text-red-300 border-red-500/30',
}

export default function ToursTable({ rows }: { rows: TourRow[] }) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (status === 'all' || r.status === status) &&
          (r.artist.toLowerCase().includes(q.toLowerCase()) ||
            r.genre.toLowerCase().includes(q.toLowerCase()))
      ),
    [rows, q, status]
  )
  return (
    <div className='mt-4'>
      <div className='flex flex-col gap-3 sm:flex-row'>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Search artist or genre…'
          className='w-full rounded-lg border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-white/30 focus:outline-none'
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className='rounded-lg border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-white/30 focus:outline-none'
        >
          <option value='all'>All statuses</option>
          <option value='confirmed'>Confirmed</option>
          <option value='rumored'>Rumored</option>
        </select>
      </div>
      <p className='mt-2 text-xs text-zinc-500'>
        {filtered.length} of {rows.length} pages
      </p>
      <div className='mt-2 overflow-x-auto rounded-xl border border-white/10'>
        <table className='w-full min-w-[640px] text-left text-sm'>
          <thead>
            <tr className='border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-zinc-400'>
              <th className='px-4 py-3'>Artist</th>
              <th className='px-4 py-3'>Status</th>
              <th className='px-4 py-3'>Dates</th>
              <th className='px-4 py-3'>Genre</th>
              <th className='px-4 py-3'>Last updated</th>
              <th className='px-4 py-3'>
                <span className='sr-only'>View</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.slug} className='border-b border-white/5 last:border-0 hover:bg-white/5'>
                <td className='px-4 py-2.5 font-medium text-white'>{r.artist}</td>
                <td className='px-4 py-2.5'>
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${
                      badge[r.status] ?? 'bg-white/10 text-zinc-300 border-white/20'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className='px-4 py-2.5 text-zinc-300'>{r.dates}</td>
                <td className='px-4 py-2.5 text-zinc-400'>{r.genre || '—'}</td>
                <td className='px-4 py-2.5 text-zinc-400'>{r.lastUpdated}</td>
                <td className='px-4 py-2.5 text-right'>
                  <Link href={`/tours/${r.slug}`} className='text-sky-300 hover:underline'>
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
