import { SiteHeader } from "@/components/site-header"
import { ProfessionalSummary } from "@/components/professional-summary"
import { ConfigShowcase } from "@/components/config-showcase"
import { CoreCompetencies } from "@/components/core-competencies"
import { FeaturedProjects } from "@/components/featured-projects"
import { InfraControlRoom } from "@/components/infra-control-room"
import { ExperienceSection } from "@/components/experience-section"
import { ContactSection } from "@/components/contact-section"
import { ScrollSpine } from "@/components/motion/reveal"
import { profile } from "@/lib/portfolio-data"

export default function Page() {
  const year = new Date().getFullYear()
  return (
    <div className="min-h-screen bg-background">
      <ScrollSpine />
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
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{profile.name}</span>
            <span className="font-mono text-xs">{profile.role}</span>
          </div>
          <span className="font-mono text-xs sm:text-right">
            © {year} · All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  )
}
