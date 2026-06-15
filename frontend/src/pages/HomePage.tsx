import { SkipLink } from '../components/common/SkipLink'
import { AboutSection } from '../components/home/AboutSection'
import { CtaSection } from '../components/home/CtaSection'
import { FeaturesSection } from '../components/home/FeaturesSection'
import { Footer } from '../components/home/Footer'
import { Header } from '../components/home/Header'
import { Hero } from '../components/home/Hero'
import { HowItWorksSection } from '../components/home/HowItWorksSection'
import { ResourcesSection } from '../components/home/ResourcesSection'
import { ResidentPlansSection } from '../components/home/ResidentPlansSection'
import { StatsSection } from '../components/home/StatsSection'

export function HomePage() {
  return (
    <div className="bg-page text-fg min-h-screen">
      <SkipLink />
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <AboutSection />
        <HowItWorksSection />
        <FeaturesSection />
        <ResidentPlansSection />
        <StatsSection />
        <ResourcesSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
