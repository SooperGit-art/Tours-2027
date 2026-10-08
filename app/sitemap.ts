import type { MetadataRoute } from 'next'
import { getAllTours } from '@/lib/tours'

const BASE_URL = 'https://2027.tours'

export default function sitemap(): MetadataRoute.Sitemap {
  const tours = getAllTours()
  const mostRecentUpdate = tours[0]?.lastUpdated ? new Date(tours[0].lastUpdated) : new Date()

  return [
    {
      url: BASE_URL,
      lastModified: mostRecentUpdate,
      changeFrequency: 'daily',
      priority: 1
    },
    { url: `${BASE_URL}/about`, lastModified: mostRecentUpdate, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: mostRecentUpdate, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${BASE_URL}/terms`, lastModified: mostRecentUpdate, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${BASE_URL}/disclaimer`, lastModified: mostRecentUpdate, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${BASE_URL}/contact`, lastModified: mostRecentUpdate, changeFrequency: 'yearly', priority: 0.1 },
    ...tours.map((tour) => ({
      url: `${BASE_URL}/tours/${tour.slug}`,
      lastModified: new Date(tour.lastUpdated),
      changeFrequency: 'daily' as const,
      priority: tour.status === 'confirmed' ? 0.9 : 0.7
    }))
  ]
}
