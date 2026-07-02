"use client"

import { ArrowUpRight } from "lucide-react"
import { SectionHeading } from "@/components/section-heading"
import { RevealSection, RevealGroup, RevealItem } from "@/components/motion/reveal"
import { usePillMode } from "@/components/pill-mode"
import { useContent, useLanguage } from "@/components/language"

export function FeaturedProjects() {
  const { mode } = usePillMode()
  const { lang } = useLanguage()
  const { modes, projects, ui } = useContent()
  // All = todos os projetos; senão, só os da categoria escolhida
  const shown = mode === "all" ? projects : projects.filter((p) => p.tracks.includes(mode))
  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="border-t border-border py-14 md:py-16"
    >
      <RevealSection>
      <SectionHeading
        section="projects"
        title={ui.sections.projects.title}
        description={modes[mode].projectsIntro}
      />
      {/* key: os cards trocam com modo e idioma — sem remontar o grupo, os
          novos filhos nasceriam invisíveis num reveal que já disparou */}
      <RevealGroup key={`${mode}-${lang}`} className="flex flex-col gap-4" stagger={0.1}>
        {shown.map((project) => (
          <RevealItem
            as="article"
            y={18}
            key={project.title}
            className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/60"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {project.context}
                </span>
                <h3 className="mt-2 text-balance text-lg font-semibold text-foreground md:text-xl">
                  {project.title}
                </h3>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                {project.live ? (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
                  >
                    {new URL(project.live).hostname}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                ) : null}
                {project.repo ? (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                    aria-label={`${project.repoLabel ?? ui.projectCard.repo}: ${project.title}`}
                  >
                    {project.repoLabel ?? ui.projectCard.repo}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            </div>

            <dl className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {ui.projectCard.problem}
                </dt>
                <dd className="mt-1.5 text-pretty leading-relaxed text-muted-foreground">
                  {project.problem}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {ui.projectCard.approach}
                </dt>
                <dd className="mt-1.5 text-pretty leading-relaxed text-muted-foreground">
                  {project.solution}
                </dd>
              </div>
            </dl>

            <div className="mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
              {project.impact.map((item) => (
                <div key={item.label} className="bg-secondary p-4">
                  <div className="font-mono text-lg font-semibold text-foreground">
                    {item.value}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            <ul className="mt-5 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-md border border-border bg-secondary px-2.5 py-1 font-mono text-xs text-secondary-foreground"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </RevealItem>
        ))}
      </RevealGroup>
      </RevealSection>
    </section>
  )
}
