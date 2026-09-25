"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { usePillMode, useSectionIndex } from "@/components/pill-mode"
import { useContent, useLanguage } from "@/components/language"
import { getCase } from "@/lib/case-studies"
import { projectSlug, type Project } from "@/lib/portfolio-data"

/* Projetos como capítulos, num palco fixo único. As partículas (hero-orb.tsx)
 * leem a rolagem deste trilho via data-chapters e fazem a coreografia:
 *   nome sozinho no centro → nome vira figura e desliza à direita → a
 *   figura fica, e SÓ ENTÃO o texto entra pela esquerda → o texto sai antes
 *   de a figura virar o próximo nome.
 * O texto segue a mesma rolagem suavizada (mola ω≈7, igual à do canvas).
 * Altura: CHAPTER_SVH por capítulo + uma tela no fim (o último também fica
 * preso); o canvas calcula a unidade como (altura − tela) / capítulos. */

const CHAPTER_SVH = 160

const T = {
  pt: { of: "de", case: "Case completo", section: "Projetos" },
  en: { of: "of", case: "Full case study", section: "Projects" },
}

function ChapterText({
  project,
  slug,
  i,
  n,
  s,
}: {
  project: Project
  slug: string
  i: number
  n: number
  s: MotionValue<number>
}) {
  const { lang } = useLanguage()
  const { ui } = useContent()
  const index = useSectionIndex("projects")
  const t = T[lang]
  const cs = getCase(slug, lang)
  const [name, sub] = project.title.split(" (")

  // janela do texto dentro do capítulo i (u = s − i): entra quando a figura
  // assenta (.28–.38) e sai antes do próximo nome começar (.62–.7)
  const opacity = useTransform(s, [i + 0.28, i + 0.38, i + 0.62, i + 0.7], [0, 1, 1, 0])
  const x = useTransform(s, [i + 0.28, i + 0.4, i + 0.62, i + 0.7], [-28, 0, 0, -16])
  const visibility = useTransform(opacity, (o) => (o < 0.02 ? "hidden" : "visible"))

  return (
    <motion.div
      className="absolute inset-0 flex items-end lg:items-center"
      style={{ opacity, visibility }}
    >
      <div className="mx-auto w-full max-w-6xl px-6 pb-[7svh] lg:pb-0">
        <motion.div className="relative max-w-[30rem] lg:max-w-[26rem] xl:max-w-[30rem]" style={{ x }}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-6 -inset-y-8 -z-10 lg:hidden"
            style={{ background: "linear-gradient(to top, #030303 55%, rgba(3,3,3,0.75) 80%, transparent)" }}
          />
          <div className="flex items-baseline gap-3 font-mono text-xs uppercase tracking-[0.18em]">
            <span className="text-mode">{index}</span>
            <span className="text-muted-foreground">
              {t.section} · {String(i + 1).padStart(2, "0")} {t.of} {String(n).padStart(2, "0")}
            </span>
          </div>
          {/* o nome é escrito pelas partículas; aqui só para leitor de tela e busca */}
          <h3 className="sr-only">{name}</h3>
          {sub ? (
            <p className="mt-4 text-balance text-2xl font-semibold leading-tight tracking-[-0.015em] text-foreground md:text-[1.75rem]">
              {sub.replace(/\)$/, "")}
            </p>
          ) : null}
          <p className="mt-4 text-pretty text-[17px] leading-relaxed text-foreground/85">{cs?.oneLiner ?? project.solution}</p>

          <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-5">
            {project.impact.map((item) => (
              <div key={item.label}>
                <dt className="text-[11px] leading-tight text-muted-foreground">{item.label}</dt>
                <dd className="mt-1 font-mono text-[13px] font-medium leading-snug text-foreground">{item.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href={`/projects/${slug}`}
              className="group inline-flex items-center gap-2 rounded-full border border-mode/60 bg-mode/10 px-4 py-2 text-sm font-medium text-foreground outline-none transition-colors hover:bg-mode/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mode"
            >
              {t.case}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            {project.live ? (
              <a href={project.live} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-foreground hover:text-mode">
                {new URL(project.live).hostname}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : null}
            {project.repo ? (
              <a href={project.repo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-mode">
                {project.repoLabel ?? ui.projectCard.repo}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export function ProjectChapters() {
  const { settledMode: mode, setMode } = usePillMode()
  const { projects, ui } = useContent()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const shown = mode === "all" ? projects : projects.filter((p) => p.tracks.includes(mode))
  const slugs = shown.map((p) => projectSlug(p.title))
  const n = shown.length

  // s = posição em capítulos (0 = topo do trilho no topo da tela), igual ao
  // canvas: a rolagem sobre (altura − tela) mapeada em n capítulos
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const raw = useTransform(scrollYProgress, (p) => p * n)
  const sprung = useSpring(raw, { stiffness: 49, damping: 14, restDelta: 0.0005 })
  const s = reduce ? raw : sprung

  // volta de uma página de case (/#project-<slug>): se o capítulo não existe
  // no modo atual, abre "os dois"; espera o provider restaurar o modo salvo
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id.startsWith("project-")) return
    const go = () => document.getElementById(id)?.scrollIntoView({ block: "start" })
    const tm = window.setTimeout(() => {
      if (document.getElementById(id)) return go()
      setMode("all")
      window.setTimeout(go, 900)
    }, 150)
    return () => window.clearTimeout(tm)
    // só na chegada à página
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section
      ref={ref}
      id="projects"
      aria-labelledby="projects-heading"
      className="relative z-10"
      data-chapters={slugs.join(",")}
      style={{ height: `calc(${n * CHAPTER_SVH}svh + 100svh)` }}
    >
      <h2 id="projects-heading" className="sr-only">
        {ui.sections.projects.title}
      </h2>
      {/* âncoras: o início de cada capítulo (cases voltam para cá) */}
      {slugs.map((slug, i) => (
        <span
          key={slug}
          id={`project-${slug}`}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 h-px w-px"
          // + 0.3 capítulo: chega com a figura e o texto já montados
          style={{ top: `${(i + 0.3) * CHAPTER_SVH}svh` }}
        />
      ))}
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {shown.map((project, i) => (
          <ChapterText key={slugs[i]} project={project} slug={slugs[i]} i={i} n={n} s={s} />
        ))}
      </div>
    </section>
  )
}
