import type { TourFrontmatter } from '@/lib/tours'
import TourCard from './TourCard'

// Curated related strip (same-genre first, then recently updated) — passed in
// by the tour page. Replaces the old render-everything directory grid.
export default function RelatedTours({
  tours
}: {
  tours: TourFrontmatter[]
}) {
  if (tours.length === 0) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {tours.map((tour) => (
        <TourCard key={tour.slug} tour={tour} />
      ))}
    </div>
  )
}
