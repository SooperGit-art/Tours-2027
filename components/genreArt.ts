// Deterministic gradient art per genre — no images needed, works with the site's palette.
const GRADIENTS = [
  'from-rose-500 via-red-500 to-orange-400',
  'from-violet-500 via-purple-500 to-fuchsia-400',
  'from-sky-500 via-blue-500 to-indigo-400',
  'from-emerald-500 via-teal-500 to-cyan-400',
  'from-amber-500 via-orange-500 to-rose-400',
  'from-indigo-500 via-blue-600 to-sky-400',
  'from-fuchsia-500 via-pink-500 to-rose-400',
  'from-lime-500 via-green-500 to-emerald-400'
]

export function genreGradient(genre?: string | null): string {
  if (!genre) return GRADIENTS[0]
  let h = 0
  for (let i = 0; i < genre.length; i++) h = (h * 31 + genre.charCodeAt(i)) % 997
  return GRADIENTS[h % GRADIENTS.length]
}
