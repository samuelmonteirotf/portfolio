import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { ProfessionalSummary } from "@/components/professional-summary"
import { ConfigShowcase } from "@/components/config-showcase"
import { CoreCompetencies } from "@/components/core-competencies"
import { FeaturedProjects } from "@/components/featured-projects"
import { InfraControlRoom } from "@/components/infra-control-room"
import { ExperienceSection } from "@/components/experience-section"
import { ContactSection } from "@/components/contact-section"
import { PillModeProvider } from "@/components/pill-mode"
import { LanguageProvider } from "@/components/language"
import { ScrollSpine } from "@/components/motion/reveal"

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <ScrollSpine />
      <LanguageProvider>
      <PillModeProvider>
        <SiteHeader />
        <main className="mx-auto max-w-4xl px-6">
          <ProfessionalSummary />
          <ConfigShowcase />
          <CoreCompetencies />
          <FeaturedProjects />
          <InfraControlRoom />
          <ExperienceSection />
          <ContactSection />
        </main>
        <SiteFooter />
      </PillModeProvider>
      </LanguageProvider>
    </div>
  )
}
