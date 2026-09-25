"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react"
import { LanguageProvider, useContent, useLanguage } from "@/components/language"
import { PillModeProvider } from "@/components/pill-mode"
import { LangToggle } from "@/components/lang-toggle"
import { Terminal, TerminalTrigger } from "@/components/terminal"
import { ArchitectureDiagram } from "@/components/architecture-diagram"
import { RevealSection } from "@/components/motion/reveal"
import { SentinelDemo } from "@/components/demos/sentinel-demo"
import { AegisDemo } from "@/components/demos/aegis-demo"
import { BacktestDemo } from "@/components/demos/backtest-demo"
import { CASE_SLUGS, getCase, sourceUrl } from "@/lib/case-studies"
import { modeColors, projectSlug } from "@/lib/portfolio-data"

/* Página de case de um projeto. A cor segue o lado do projeto (vermelho para
 * infra/edge, azul para produto), sobrescrevendo --mode só dentro da página:
 * a escolha salva do visitante na home não é tocada. */

const DEMOS = { sentinel: SentinelDemo, aegis: AegisDemo, backtest: BacktestDemo }

const T = {
  pt: {
    back: "monteirotf.com",
    problem: "O problema",
    approach: "A abordagem",
    architecture: "Arquitetura",
    archAria: "Diagrama de arquitetura",
    decisions: "Decisões",
    why: "Por quê",
    cost: "Custo",
    demo: "Ao vivo",
    numbers: "Números com fonte",
    numbersNote: "Cada número aponta para o arquivo do repositório de onde saiu.",
    source: "fonte",
    stack: "Stack",
    live: "Site no ar",
    prev: "Anterior",
    next: "Próximo",
  },
  en: {
    back: "monteirotf.com",
    problem: "The problem",
    approach: "The approach",
    architecture: "Architecture",
    archAria: "Architecture diagram",
    decisions: "Decisions",
    why: "Why",
    cost: "Cost",
    demo: "Live",
    numbers: "Numbers with sources",
    numbersNote: "Every number links to the repository file it came from.",
    source: "source",
    stack: "Stack",
    live: "Live site",
    prev: "Previous",
    next: "Next",
  },
}

function Heading({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-baseline gap-3">
      <span className="font-mono text-sm text-mode">{String(n).padStart(2, "0")}</span>
      <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">{children}</h2>
    </div>
  )
}

function Body({ slug }: { slug: string }) {
  const { lang } = useLanguage()
  const { projects, profile } = useContent()
  const t = T[lang]
  const project = projects.find((p) => projectSlug(p.title) === slug)
  const cs = getCase(slug, lang)
  if (!project || !cs) return null

  const accent = project.tracks.includes("devops") ? modeColors.devops : modeColors.fullstack
  const i = CASE_SLUGS.indexOf(slug)
  const prev = CASE_SLUGS[(i - 1 + CASE_SLUGS.length) % CASE_SLUGS.length]
  const next = CASE_SLUGS[(i + 1) % CASE_SLUGS.length]
  const titleOf = (s: string) => projects.find((p) => projectSlug(p.title) === s)?.title ?? s
  const Demo = project.demo ? DEMOS[project.demo] : null
  let n = 0

  return (
    <div className="min-h-screen bg-background" style={{ "--mode": accent } as React.CSSProperties}>
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-6 py-6">
        <Link
          href={`/#project-${slug}`}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-mode"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {t.back}
        </Link>
        <div className="flex items-center gap-2">
          <TerminalTrigger />
          <LangToggle />
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-6 pb-16">
        <header className="border-b border-border pb-12 pt-8 md:pt-14">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-mode">{project.context}</span>
          <h1 className="mt-3 text-balance text-[clamp(2rem,1rem+3.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground">
            {project.title}
          </h1>
          <p className="mt-4 max-w-[60ch] text-pretty text-lg leading-relaxed text-foreground/85">{cs.oneLiner}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {project.live ? (
              <a href={project.live} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-foreground hover:text-mode">
                {new URL(project.live).hostname}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : null}
            {project.repo ? (
              <a href={project.repo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-mode">
                {project.repo.replace("https://", "")}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : null}
          </div>
          {project.image ? (
            <figure className="mt-10">
              <div className="relative aspect-[1600/790] overflow-hidden rounded-lg border border-border">
                <Image src={project.image.src} alt={project.image.alt} fill priority sizes="(min-width: 896px) 848px, 100vw" className="object-cover object-top" />
              </div>
              <figcaption className="mt-2 font-mono text-[11px] text-muted-foreground">{project.image.alt}</figcaption>
            </figure>
          ) : null}

          <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
            {project.impact.map((item) => (
              <div key={item.label} className="bg-card p-4">
                <div className="font-mono text-base font-semibold text-foreground">{item.value}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </header>

        <RevealSection className="border-b border-border py-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">{t.problem}</h2>
              <p className="text-pretty leading-relaxed text-foreground/85">{project.problem}</p>
            </div>
            <div>
              <h2 className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">{t.approach}</h2>
              <p className="text-pretty leading-relaxed text-foreground/85">{project.solution}</p>
            </div>
          </div>
        </RevealSection>

        <RevealSection className="border-b border-border py-12">
          <Heading n={++n}>{t.architecture}</Heading>
          <div className="rounded-md border border-border bg-card/40 p-4 md:p-6">
            <ArchitectureDiagram nodes={cs.nodes} edges={cs.edges} ariaLabel={`${t.archAria}: ${project.title}`} />
          </div>
          {/* o fluxo em texto: rótulos das conexões (no diagrama só em hover) */}
          <ol className="mt-5 grid gap-x-8 gap-y-1.5 font-mono text-[11.5px] leading-relaxed md:grid-cols-2">
            {cs.edges.map((e, k) => {
              const from = cs.nodes.find((x) => x.id === e.from)?.label ?? e.from
              const to = cs.nodes.find((x) => x.id === e.to)?.label ?? e.to
              return (
                <li key={`${e.from}-${e.to}-${k}`} className="flex gap-2.5">
                  <span className="shrink-0 text-muted-foreground">{String(k + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="text-foreground">{from}</span> <span className="text-mode">→</span> <span className="text-foreground">{to}</span>
                    {e.label ? <span className="text-muted-foreground">: {e.label}</span> : null}
                  </span>
                </li>
              )
            })}
          </ol>
        </RevealSection>

        <RevealSection className="border-b border-border py-12">
          <Heading n={++n}>{t.decisions}</Heading>
          <ol className="space-y-6">
            {cs.decisions.map((d, k) => (
              <li key={d.title} className="grid gap-x-6 gap-y-2 md:grid-cols-[2.5rem_1fr]">
                <span className="font-mono text-sm text-muted-foreground">{String(k + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-pretty font-semibold text-foreground">{d.title}</h3>
                  <p className="mt-1.5 text-pretty leading-relaxed text-muted-foreground">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-mode">{t.why} </span>
                    {d.why}
                  </p>
                  {d.tradeoff ? (
                    <p className="mt-1.5 text-pretty leading-relaxed text-muted-foreground">
                      <span className="font-mono text-[11px] uppercase tracking-widest text-foreground/70">{t.cost} </span>
                      {d.tradeoff}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </RevealSection>

        {Demo ? (
          <RevealSection className="border-b border-border py-12">
            <Heading n={++n}>{t.demo}</Heading>
            <Demo />
          </RevealSection>
        ) : null}

        {cs.numbers.length ? (
          <RevealSection className="border-b border-border py-12">
            <Heading n={++n}>{t.numbers}</Heading>
            <p className="-mt-3 mb-5 text-sm text-muted-foreground">{t.numbersNote}</p>
            <dl className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
              {cs.numbers.map((x) => (
                <div key={x.label + x.value} className="flex flex-col bg-card px-4 py-3">
                  <dt className="text-xs text-muted-foreground">{x.label}</dt>
                  <dd className="mt-0.5 font-mono text-sm font-semibold text-foreground">{x.value}</dd>
                  {project.repo ? (
                    <dd className="mt-1 font-mono text-[10px] text-muted-foreground">
                      {t.source}:{" "}
                      {x.sources.map((s, k) => (
                        <span key={s}>
                          {k ? ", " : ""}
                          <a href={sourceUrl(project.repo!, s)} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-mode hover:underline">
                            {s}
                          </a>
                        </span>
                      ))}
                    </dd>
                  ) : null}
                </div>
              ))}
            </dl>
          </RevealSection>
        ) : null}

        <RevealSection className="py-12">
          <Heading n={++n}>{t.stack}</Heading>
          <ul className="flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <li key={tech} className="rounded-md border border-border bg-secondary px-2.5 py-1 font-mono text-xs text-secondary-foreground">
                {tech}
              </li>
            ))}
          </ul>
        </RevealSection>

        <nav className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-8" aria-label="Cases">
          <Link href={`/projects/${prev}`} className="group rounded-md border border-border p-4 transition-colors hover:border-mode/50">
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <ArrowLeft className="h-3 w-3" aria-hidden="true" /> {t.prev}
            </span>
            <span className="mt-1 block text-sm font-medium text-foreground group-hover:text-mode">{titleOf(prev)}</span>
          </Link>
          <Link href={`/projects/${next}`} className="group rounded-md border border-border p-4 text-right transition-colors hover:border-mode/50">
            <span className="flex items-center justify-end gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {t.next} <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </span>
            <span className="mt-1 block text-sm font-medium text-foreground group-hover:text-mode">{titleOf(next)}</span>
          </Link>
        </nav>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-8 font-mono text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            {profile.name}
          </Link>
          <a href={`mailto:${profile.email}`} className="hover:text-mode">
            {profile.email}
          </a>
        </div>
      </footer>
      <Terminal />
    </div>
  )
}

export function CaseStudyPage({ slug }: { slug: string }) {
  return (
    <LanguageProvider>
      <PillModeProvider>
        <Body slug={slug} />
      </PillModeProvider>
    </LanguageProvider>
  )
}
