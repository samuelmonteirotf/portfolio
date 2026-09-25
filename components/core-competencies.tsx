"use client"

import { useEffect, useState } from "react"
import { SectionHeading } from "@/components/section-heading"
import { RevealSection } from "@/components/motion/reveal"
import { usePillMode } from "@/components/pill-mode"
import { useContent } from "@/components/language"

/* Competências: as partículas escrevem, no palco à direita, o nome da skill
 * da vez (cena "skills", data-word). Mouse ou foco numa skill escolhe o nome;
 * sem ninguém escolhendo, elas alternam sozinhas pela lista, e a skill da vez
 * acende aqui também. */
const CYCLE_MS = 2600

export function CoreCompetencies() {
  // settledMode: a grade remonta depois da animação do hero, não durante
  const { settledMode: mode } = usePillMode()
  const { competencies, ui } = useContent()
  const [hi, setHi] = useState(-1)
  const [auto, setAuto] = useState(0)
  // All = todas as categorias; senão, só as do lado escolhido
  const shown = mode === "all" ? competencies : competencies.filter((c) => c.tracks.includes(mode))

  let star = 0
  const cats = shown.map((c) => ({
    ...c,
    items: c.items.map((item) => ({ ...item, star: star++ })),
  }))

  const all = cats.flatMap((c) => c.items)
  const current = hi >= 0 ? hi : auto % Math.max(1, all.length)

  useEffect(() => {
    if (hi >= 0) return
    const t = window.setInterval(() => setAuto((a) => a + 1), CYCLE_MS)
    return () => window.clearInterval(t)
  }, [hi])

  return (
    <section
      id="competencies"
      aria-labelledby="competencies-heading"
      data-scene="skills"
      data-word={all[current]?.name.toUpperCase()}
      className="border-t border-border py-20 md:py-28"
    >
      <RevealSection className="lg:max-w-[34rem]">
        <SectionHeading section="competencies" title={ui.sections.competencies.title} description={ui.sections.competencies.description} />
        <div className="space-y-8" onMouseLeave={() => setHi(-1)}>
          {cats.map((cat) => (
            <div key={cat.title}>
              <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-mode">{cat.title}</h3>
              <ul className="flex flex-wrap gap-x-1.5 gap-y-2">
                {cat.items.map((item) => (
                  <li key={item.name}>
                    <span
                      tabIndex={0}
                      onMouseEnter={() => setHi(item.star)}
                      onFocus={() => setHi(item.star)}
                      onBlur={() => setHi(-1)}
                      title={item.detail}
                      className={`inline-flex cursor-default items-baseline gap-2 rounded-full border px-3 py-1 text-sm outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mode ${
                        current === item.star ? "border-mode/70 bg-mode/15 text-foreground" : "border-border text-foreground/85 hover:border-mode/40"
                      }`}
                    >
                      {item.name}
                      {item.detail && current === item.star ? <span className="font-mono text-[11px] text-muted-foreground">{item.detail}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </RevealSection>
    </section>
  )
}
