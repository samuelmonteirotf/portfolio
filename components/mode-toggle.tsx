"use client"

import { useRef } from "react"
import { motion } from "motion/react"
import { usePillMode } from "@/components/pill-mode"
import { useContent } from "@/components/language"
import { modeColors, type ModeKey } from "@/lib/portfolio-data"
import { cn } from "@/lib/utils"

/* O toggle é a história, não configuração: "escolha um lado". A ordem das
 * opções é o destino da esfera (azul esquerda · roxo centro · vermelho
 * direita). Hover/foco numa opção inativa acende o ponto — preview da cor que
 * a página inteira vai assumir. Setas navegam o radiogroup (roving tabindex). */
const RINGS: Record<ModeKey, string> = {
  fullstack: "rgba(79,139,224,0.45)",
  all: "rgba(157,107,240,0.45)",
  devops: "rgba(224,85,90,0.45)",
}

export function ModeToggle() {
  const { mode, setMode } = usePillMode()
  const { ui } = useContent()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const options: { key: ModeKey; label: string; shortLabel?: string; title?: string }[] = [
    { key: "fullstack", label: "Full-Stack" },
    { key: "all", label: ui.modeToggle.optionAll, title: ui.modeToggle.optionAllTitle },
    { key: "devops", label: "DevOps · Edge", shortLabel: "DevOps" },
  ]

  const onKeyDown = (e: React.KeyboardEvent) => {
    const dir =
      e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const i = options.findIndex((o) => o.key === mode)
    const next = (i + dir + options.length) % options.length
    setMode(options[next].key)
    refs.current[next]?.focus()
  }

  return (
    <div>
      <span className="mb-2 block font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
        {ui.modeToggle.label}
      </span>
      <div
        role="radiogroup"
        aria-label={ui.modeToggle.groupAria}
        onKeyDown={onKeyDown}
        className="grid w-full grid-cols-3 items-center gap-1 rounded-full border border-border bg-card/60 p-1 backdrop-blur-sm sm:inline-flex sm:w-auto"
      >
        {options.map((o, i) => {
          const active = mode === o.key
          return (
            <button
              key={o.key}
              ref={(el) => {
                refs.current[i] = el
              }}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={o.shortLabel ? o.label : undefined}
              tabIndex={active ? 0 : -1}
              title={o.title}
              onClick={() => setMode(o.key)}
              style={{ "--dot": modeColors[o.key], outlineColor: modeColors[o.key] } as React.CSSProperties}
              className={cn(
                "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-2 py-2.5 text-[13px] font-medium outline-none transition-colors focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 sm:px-4 sm:py-1.5 sm:text-sm",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="mode-active"
                  className="absolute inset-0 rounded-full bg-secondary"
                  style={{ boxShadow: `inset 0 0 0 1px ${RINGS[o.key]}` }}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 h-1.5 w-1.5 rounded-full bg-[var(--dot)] transition-all",
                  active
                    ? "opacity-100 shadow-[0_0_8px_var(--dot)]"
                    : "opacity-50 group-hover:opacity-100 group-hover:shadow-[0_0_8px_var(--dot)] group-focus-visible:opacity-100 group-focus-visible:shadow-[0_0_8px_var(--dot)]",
                )}
              />
              {/* no grid mobile a célula não comporta "DevOps · Edge" — encurta até o sm */}
              {o.shortLabel ? (
                <span className="relative z-10" aria-hidden="true">
                  <span className="sm:hidden">{o.shortLabel}</span>
                  <span className="hidden sm:inline">{o.label}</span>
                </span>
              ) : (
                <span className="relative z-10">{o.label}</span>
              )}
            </button>
          )
        })}
      </div>
      <p className="mt-2.5 max-w-[30rem] text-[13px] leading-relaxed text-muted-foreground">
        {ui.modeToggle.hint}
      </p>
    </div>
  )
}
