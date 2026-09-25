import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { ProfessionalSummary } from "@/components/professional-summary"
import { ConfigShowcase } from "@/components/config-showcase"
import { CoreCompetencies } from "@/components/core-competencies"
import { ProjectChapters } from "@/components/project-chapters"
import { InfraControlRoom } from "@/components/infra-control-room"
import { ExperienceSection } from "@/components/experience-section"
import { ContactSection } from "@/components/contact-section"
import { PillModeProvider } from "@/components/pill-mode"
import { LanguageProvider } from "@/components/language"
import { ScrollSpine } from "@/components/motion/reveal"
import { Terminal } from "@/components/terminal"
import { HeroOrb } from "@/components/hero-orb"

export default function Page() {
  return (
    <div className="relative min-h-screen bg-background">
      <ScrollSpine />
      <LanguageProvider>
      <PillModeProvider>
        {/* a esfera: camada fixa atrás de tudo (lvh: não realoca o canvas quando
            a barra do navegador móvel aparece/some) */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[100lvh]">
          <HeroOrb />
        </div>
        <SiteHeader />
        {/* projetos primeiro: capítulos de tela cheia onde as partículas
            escrevem o nome e desenham a figura de cada projeto */}
        <ProjectChapters />
        {/* seções com data-scene: texto à esquerda, a cena de partículas no
            palco à direita (o canvas lê a posição de cada uma) */}
        <main className="relative z-10 mx-auto max-w-6xl px-6">
          <ProfessionalSummary />
          <ConfigShowcase />
          <CoreCompetencies />
          <InfraControlRoom />
          <ExperienceSection />
          <ContactSection />
        </main>
        <SiteFooter />
        <Terminal />
      </PillModeProvider>
      </LanguageProvider>
    </div>
  )
}
