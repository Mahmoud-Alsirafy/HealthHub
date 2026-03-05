import { LandingHero } from "@/components/landing/hero"
import { TrustedBy } from "@/components/landing/trusted-by"
import { ProblemSection } from "@/components/landing/problem-section"
import { SolutionSection } from "@/components/landing/solution-section"
import { FeaturesGrid } from "@/components/landing/features-grid"
import { HowItWorks } from "@/components/landing/how-it-works"
import { CTASection } from "@/components/landing/cta-section"
import { LandingNav } from "@/components/landing/landing-nav"
import { LandingFooter } from "@/components/landing/landing-footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main>
        <LandingHero />
        <TrustedBy />
        <ProblemSection />
        <SolutionSection />
        <FeaturesGrid />
        <HowItWorks />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  )
}
