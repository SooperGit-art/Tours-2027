import Link from 'next/link'
import { getAllTours } from '@/lib/tours'
import ToursTable, { type TourRow } from './ToursTable'

export const metadata = {
  title: 'Site Admin — 2027.tours',
  robots: { index: false, follow: false },
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className='rounded-2xl border border-white/10 bg-white/5 p-5'>
      <div className='text-3xl font-bold text-white'>{value}</div>
      <div className='mt-1 text-sm font-medium text-zinc-300'>{label}</div>
      {sub && <div className='mt-0.5 text-xs text-zinc-500'>{sub}</div>}
    </div>
  )
}

export default function AdminPage() {
  const tours = getAllTours()
  const total = tours.length
  const confirmed = tours.filter((t) => t.status === 'confirmed').length
  const rumored = tours.filter((t) => t.status === 'rumored').length
  const totalDates = tours.reduce((n, t) => n + (t.dates?.length ?? 0), 0)
  const genres = Array.from(new Set(tours.map((t) => t.genre).filter(Boolean) as string[]))
  const today = new Date().toISOString().slice(0, 10)
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
  const todayCount = tours.filter((t) => t.lastUpdated === today).length
  const weekCount = tours.filter((t) => t.lastUpdated >= weekAgo).length
  const latestDate = tours[0]?.lastUpdated ?? '—'
  const latestBatch = tours.filter((t) => t.lastUpdated === latestDate)
  const buildTime = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'

  const rows: TourRow[] = tours.map((t) => ({
    slug: t.slug,
    artist: t.artist,
    status: t.status,
    dates: t.dates?.length ?? 0,
    genre: t.genre ?? '',
    lastUpdated: t.lastUpdated,
  }))

  return (
    <main className='min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100'>
      <div className='mx-auto max-w-6xl'>
        <header className='mb-8'>
          <p className='text-xs uppercase tracking-widest text-zinc-500'>Backend panel</p>
          <h1 className='mt-1 text-3xl font-bold text-white'>2027.tours — Site Admin</h1>
          <p className='mt-2 text-sm text-zinc-400'>
            Live content inventory, publish activity and backend info. Panel built: {buildTime}
          </p>
        </header>

        <section className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6'>
          <StatCard label='Tour pages' value={total} />
          <StatCard label='Confirmed' value={confirmed} sub={`${totalDates} dates announced`} />
          <StatCard label='Rumored' value={rumored} />
          <StatCard label='Genres' value={genres.length} />
          <StatCard label='Published today' value={todayCount} sub={today} />
          <StatCard label='Updated last 7 days' value={weekCount} />
        </section>

        <section className='mt-10'>
          <h2 className='text-xl font-semibold text-white'>
            Latest batch <span className='text-sm font-normal text-zinc-500'>({latestDate})</span>
          </h2>
          <div className='mt-3 flex flex-wrap gap-2'>
            {latestBatch.map((t) => (
              <Link
                key={t.slug}
                href={`/tours/${t.slug}`}
                className='rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-200 hover:border-white/25 hover:text-white'
              >
                {t.artist} <span className='text-zinc-500'>· {t.status}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className='mt-10'>
          <h2 className='text-xl font-semibold text-white'>All pages</h2>
          <ToursTable rows={rows} />
        </section>

        <section className='mt-10 rounded-2xl border border-white/10 bg-white/5 p-6'>
          <h2 className='text-xl font-semibold text-white'>Backend info</h2>
          <dl className='mt-4 grid gap-3 text-sm md:grid-cols-2'>
            <div>
              <dt className='text-zinc-500'>Repository</dt>
              <dd>
                <a className='text-sky-300 hover:underline' href='https://github.com/SooperGit-art/Tours-2027'>
                  SooperGit-art/Tours-2027
                </a> <span className='text-zinc-500'>(branch main)</span>
              </dd>
            </div>
            <div>
              <dt className='text-zinc-500'>Hosting</dt>
              <dd className='text-zinc-200'>Vercel — project tours-2027 (SooperGit-Art Hobby)</dd>
            </div>
            <div>
              <dt className='text-zinc-500'>Domain</dt>
              <dd>
                <a className='text-sky-300 hover:underline' href='https://2027.tours'>2027.tours</a>
              </dd>
            </div>
            <div>
              <dt className='text-zinc-500'>Deploy source</dt>
              <dd className='text-zinc-200'>Auto-deploy on push to main</dd>
            </div>
            <div>
              <dt className='text-zinc-500'>Content source</dt>
              <dd className='text-zinc-200'>content/tours/*.mdx — this panel rebuilds on every deploy</dd>
            </div>
            <div>
              <dt className='text-zinc-500'>Genres covered</dt>
              <dd className='text-zinc-200'>{genres.join(', ')}</dd>
            </div>
          </dl>
          <div className='mt-5 flex flex-wrap gap-2 text-sm'>
            <a key='sitemap' href='/sitemap.xml' className='rounded-lg border border-white/10 bg-zinc-900 px-4 py-2 text-zinc-200 hover:border-white/25 hover:text-white'>Sitemap</a>
            <a key='llms' href='/llms.txt' className='rounded-lg border border-white/10 bg-zinc-900 px-4 py-2 text-zinc-200 hover:border-white/25 hover:text-white'>llms.txt</a>
            <a key='robots' href='/robots.txt' className='rounded-lg border border-white/10 bg-zinc-900 px-4 py-2 text-zinc-200 hover:border-white/25 hover:text-white'>robots.txt</a>
            <a key='commits' href='https://github.com/SooperGit-art/Tours-2027/commits/main' className='rounded-lg border border-white/10 bg-zinc-900 px-4 py-2 text-zinc-200 hover:border-white/25 hover:text-white'>Commits</a>
          </div>
        </section>

        <footer className='mt-10 text-xs text-zinc-600'>
          Protected by password · excluded from sitemap &amp; search indexing ·{" "}
          <Link href='/' className='hover:text-zinc-400'>
            ← back to site
          </Link>
        </footer>
      </div>
    </main>
  )
}
