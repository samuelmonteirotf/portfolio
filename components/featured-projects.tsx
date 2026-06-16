import { ArrowUpRight } from "lucide-react"
import { SectionHeading } from "@/components/section-heading"
import { RevealSection, RevealGroup, RevealItem } from "@/components/motion/reveal"
import { projects } from "@/lib/portfolio-data"

export function FeaturedProjects() {
  return (
    <section
      id="projetos"
      aria-labelledby="projetos-heading"
      className="border-t border-border py-14 md:py-16"
    >
      <RevealSection>
      <SectionHeading
        index="03"
        title="Projetos de Produção"
        description="Casos reais com problema, abordagem técnica e impacto medido. Cada um resolveu um gargalo concreto de plataforma."
      />
      <RevealGroup className="flex flex-col gap-4" stagger={0.1}>
        {projects.map((project) => (
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
              {project.repo ? (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                  aria-label={`Abrir repositório do projeto ${project.title}`}
                >
                  Repositório
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : null}
            </div>

            <dl className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Problema
                </dt>
                <dd className="mt-1.5 text-pretty leading-relaxed text-muted-foreground">
                  {project.problem}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Abordagem
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
