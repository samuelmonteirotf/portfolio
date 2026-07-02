"use client"

import { motion } from "motion/react"
import { useContent, useLanguage } from "@/components/language"
import type { Lang } from "@/lib/portfolio-data"
import { cn } from "@/lib/utils"

/* Seletor de idioma: os dois rótulos sempre visíveis (padrão universal),
 * o ativo destacado com a mesma pílula do mode-toggle. Voz mono, discreto. */
const OPTIONS: Lang[] = ["pt", "en"]

export function LangToggle() {
  const { lang, setLang } = useLanguage()
  const { ui } = useContent()

  return (
    <div
      role="group"
      aria-label={ui.langToggle.aria}
      className="inline-flex items-center gap-0.5 rounded-full border border-border bg-card/60 p-0.5 backdrop-blur-sm"
    >
      {OPTIONS.map((o) => {
        const active = lang === o
        return (
          <button
            key={o}
            type="button"
            aria-pressed={active}
            onClick={() => setLang(o)}
            className={cn(
              "relative rounded-full px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] outline-none transition-colors focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[#e9eef5]",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active ? (
              <motion.span
                layoutId="lang-active"
                className="absolute inset-0 rounded-full bg-secondary ring-1 ring-inset ring-border"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            ) : null}
            <span className="relative z-10">{o.toUpperCase()}</span>
          </button>
        )
      })}
    </div>
  )
}
