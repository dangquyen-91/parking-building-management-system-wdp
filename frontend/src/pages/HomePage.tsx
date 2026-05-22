import { AboutSection } from '../components/home/AboutSection'
import { CtaSection } from '../components/home/CtaSection'
import { FeaturesSection } from '../components/home/FeaturesSection'
import { Footer } from '../components/home/Footer'
import { Header } from '../components/home/Header'
import { Hero } from '../components/home/Hero'
import { HowItWorksSection } from '../components/home/HowItWorksSection'
import { ResourcesSection } from '../components/home/ResourcesSection'
import { StatsSection } from '../components/home/StatsSection'

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
