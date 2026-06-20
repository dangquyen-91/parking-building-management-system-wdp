import { Navigate } from 'react-router-dom'
import { SkipLink } from '../../components/common/SkipLink'
import { AboutSection } from '../../components/home/AboutSection'
import { CtaSection } from '../../components/home/CtaSection'
import { FeaturesSection } from '../../components/home/FeaturesSection'
import { Footer } from '../../components/home/Footer'
import { Header } from '../../components/home/Header'
import { Hero } from '../../components/home/Hero'
import { HowItWorksSection } from '../../components/home/HowItWorksSection'
import { ResourcesSection } from '../../components/home/ResourcesSection'
import { ResidentPlansSection } from '../../components/home/ResidentPlansSection'
import { StatsSection } from '../../components/home/StatsSection'
import { getStoredAuthUser } from '../../services/authApi'

export function HomePage() {
  const authUser = getStoredAuthUser()

  if (authUser?.role === 'manager') {
    return <Navigate to="/manager" replace />
  }

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
