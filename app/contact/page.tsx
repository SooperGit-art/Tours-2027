import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact the 2027.tours editorial team — corrections, tour date tips, and takedown requests.'
}

export default function ContactPage() {
  return (
    <article className="prose prose-neutral max-w-none prose-headings:font-display">
      <h1>Contact</h1>
      <p>
        Found a wrong date, a tour we missed, or a rumor that needs debunking? We read every
        message and correct verified errors quickly.
      </p>
      <h2>Email</h2>
      <p>
        <a href="mailto:hello@2027.tours">hello@2027.tours</a>
      </p>
      <h2>What to include</h2>
      <ul>
        <li>The artist page URL the message is about</li>
        <li>What’s wrong or missing, with a link to the official source if you have one</li>
      </ul>
      <h2>Takedown requests</h2>
      <p>
        If you represent an artist, venue, or promoter and want a page corrected or removed,
        email us from an official address and we’ll act promptly.
      </p>
    </article>
  )
}
