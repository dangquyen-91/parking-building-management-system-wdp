import { Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { SkipLink } from '../../components/common/SkipLink'
import { AboutSection } from '../../components/home/AboutSection'
import { CtaSection } from '../../components/home/CtaSection'
import { FeaturesSection } from '../../components/home/FeaturesSection'
import { Footer } from '../../components/home/Footer'
import { Header } from '../../components/home/Header'
import { Hero } from '../../components/home/Hero'
import { HowItWorksSection } from '../../components/home/HowItWorksSection'
import { ResidentPlansSection } from '../../components/home/ResidentPlansSection'
import { StatsSection } from '../../components/home/StatsSection'
import { getStoredAuthUser } from '../../services/authApi'

export function HomePage() {
  const authUser = getStoredAuthUser()

  useEffect(() => {
    if (!window.location.hash) return
    const target = document.querySelector(window.location.hash)
    target?.scrollIntoView({ block: 'start' })
  }, [])

  if (authUser?.role === 'manager') {
    return <Navigate to="/manager" replace />
  }

  if (authUser?.role === 'staff') {
    return <Navigate to="/staff/check-in" replace />
  }

  if (authUser?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="bg-page text-fg min-h-screen">
      <SkipLink />
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <StatsSection />
        <AboutSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ResidentPlansSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
