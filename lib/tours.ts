import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const TOURS_DIR = path.join(process.cwd(), 'content/tours')

export type TourStatus = 'confirmed' | 'rescheduled' | 'cancelled' | 'rumored'

export type TourDate = {
  city: string
  venue: string
  date: string
  ticketLink?: string
}

export type TourFAQ = {
  q: string
  a: string
}

export type TourFrontmatter = {
  artist: string
  tourName: string
  status: TourStatus
  lastUpdated: string
  genre?: string
  primaryKeyword?: string
  metaDescription?: string
  dates: TourDate[]
  faqs?: TourFAQ[]
  slug: string
}

export function getAllTourSlugs(): string[] {
  if (!fs.existsSync(TOURS_DIR)) return []
  return fs
    .readdirSync(TOURS_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
}

export function getTourBySlug(slug: string) {
  const filePath = path.join(TOURS_DIR, `${slug}.mdx`)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return {
    frontmatter: { ...(data as Omit<TourFrontmatter, 'slug'>), slug },
    content
  }
}

export function getAllTours(): TourFrontmatter[] {
  return getAllTourSlugs()
    .map((slug) => getTourBySlug(slug).frontmatter)
    .sort((a, b) => (a.lastUpdated < b.lastUpdated ? 1 : -1))
}

