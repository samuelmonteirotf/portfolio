import { BadgeCheck } from "lucide-react"
import { SectionHeading } from "@/components/section-heading"
import { RevealSection, RevealGroup, RevealItem } from "@/components/motion/reveal"
import { TimelineItem } from "@/components/timeline-item"
import { certifications, experiences } from "@/lib/portfolio-data"

export function ExperienceSection() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="border-t border-border py-14 md:py-16"
    >
      <RevealSection>
      <SectionHeading
        index="05"
        title="Trajectory & Certifications"
        description="8 years evolving from infrastructure operations to platform and reliability engineering."
      />

      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <RevealGroup as="ol" className="relative self-start border-l border-border" stagger={0.09}>
          {experiences.map((exp) => (
            <RevealItem as="li" key={exp.role} className="relative ml-6 pb-8 last:pb-0">
              <span
                className="absolute -left-[31px] top-2 h-3 w-3 rounded-full border-2 border-background bg-muted-foreground"
                aria-hidden="true"
              />
              <TimelineItem
                role={exp.role}
                period={exp.period}
                company={exp.company}
                description={exp.description}
              />
            </RevealItem>
          ))}
        </RevealGroup>

        <div>
          <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Certifications
          </h3>
          <RevealGroup as="ul" className="flex flex-col gap-3" stagger={0.06}>
            {certifications.map((cert) => (
              <RevealItem
                as="li"
                key={cert.name}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
              >
                <BadgeCheck
                  className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium leading-snug text-foreground">
                    {cert.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {cert.issuer}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
      </RevealSection>
    </section>
  )
}
