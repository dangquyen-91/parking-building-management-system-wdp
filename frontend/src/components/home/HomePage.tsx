import { AboutSection } from './AboutSection'
import { CtaSection } from './CtaSection'
import { FeaturesSection } from './FeaturesSection'
import { Footer } from './Footer'
import { Header } from './Header'
import { Hero } from './Hero'
import { HowItWorksSection } from './HowItWorksSection'
import { ResourcesSection } from './ResourcesSection'
import { StatsSection } from './StatsSection'

export function HomePage() {
  return (
    <div className="bg-[#121212] text-white min-h-screen">
      <Header />
      <main>
        <Hero />
        <AboutSection />
        <HowItWorksSection />
        <FeaturesSection />
        <StatsSection />
        <ResourcesSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
