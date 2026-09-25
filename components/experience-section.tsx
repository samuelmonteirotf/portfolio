"use client"

import { SectionHeading } from "@/components/section-heading"
import { RevealSection, RevealGroup, RevealItem } from "@/components/motion/reveal"
import { useContent, useLanguage } from "@/components/language"

/* Trajetória: o texto aberto à esquerda (sem acordeão escondendo o que
 * importa) e, no palco, a linha que se desenha com a rolagem e acende um nó
 * por experiência (cena "timeline", data-p2 = quantidade). */
export function ExperienceSection() {
  const { lang } = useLanguage()
  const { experiences, certifications, ui } = useContent()
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      data-scene="timeline"
      data-p2={experiences.length}
      className="border-t border-border py-20 md:py-28"
    >
      <RevealSection className="lg:max-w-[34rem]">
        <SectionHeading section="experience" title={ui.sections.experience.title} description={ui.sections.experience.description} />

        <RevealGroup key={`t-${lang}`} as="ol" className="relative border-l border-border" stagger={0.09}>
          {experiences.map((exp, i) => (
            <RevealItem as="li" key={exp.company} className="relative ml-6 pb-10 last:pb-0">
              <span
                className={`absolute -left-[31px] top-2 h-3 w-3 rounded-full border-2 border-background ${i === 0 ? "bg-mode shadow-[0_0_10px_var(--mode)]" : "bg-muted-foreground"}`}
                aria-hidden="true"
              />
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-semibold text-foreground">{exp.role}</h3>
                <span className="font-mono text-xs text-muted-foreground">{exp.period}</span>
              </div>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-mode">{exp.company}</p>
              <p className="mt-3 text-pretty text-[15px] leading-relaxed text-muted-foreground">{exp.description}</p>
            </RevealItem>
          ))}
        </RevealGroup>

        <h3 className="mb-4 mt-14 font-mono text-xs uppercase tracking-widest text-muted-foreground">{ui.experienceSection.certifications}</h3>
        <ul className="divide-y divide-border border-y border-border">
          {certifications.map((cert) => (
            <li key={cert.name} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-3">
              <span className="text-sm font-medium text-foreground">{cert.name}</span>
              <span className="font-mono text-[11px] text-muted-foreground">{cert.issuer}</span>
            </li>
          ))}
        </ul>
      </RevealSection>
    </section>
  )
}
