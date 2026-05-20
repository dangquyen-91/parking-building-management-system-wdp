import { Header } from './Header'
import { Hero } from './Hero'
import { StatsBar } from './StatsBar'
import { Features } from './Features'
import { CtaBanner } from './CtaBanner'
import { Footer } from './Footer'
import { ScrollReveal } from './ScrollReveal'
import '../../../styles/home/home.css'
import '../../../styles/home/scroll-reveal.css'

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Parking',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, iOS, Android',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'Building parking management system for a single property — basement level maps, slot assignment, live occupancy, and tenant reservations.',
}

export function HomePage() {
  return (
    <div className="landing">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Header />
      <main id="main-content">
        <ScrollReveal delay={0}>
          <Hero />
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <StatsBar />
        </ScrollReveal>
        <Features />
        <ScrollReveal delay={60}>
          <CtaBanner />
        </ScrollReveal>
      </main>
      <ScrollReveal delay={100}>
        <Footer />
      </ScrollReveal>
    </div>
  )
}
