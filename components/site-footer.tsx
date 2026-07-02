"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { usePillMode } from "@/components/pill-mode"
import { useContent, useLanguage } from "@/components/language"

/* Rodapé acompanha o modo e o idioma ativos: o cargo cruza em fade junto com
 * o resto da página (mesma linguagem do eyebrow do hero). */
export function SiteFooter() {
  const { mode } = usePillMode()
  const { lang } = useLanguage()
  const { modes, profile, ui } = useContent()
  const reduce = useReducedMotion()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{profile.name}</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`${mode}-${lang}`}
              className="font-mono text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0.1 : 0.2, ease: "easeOut" }}
            >
              {modes[mode].role}
            </motion.span>
          </AnimatePresence>
        </div>
        <span className="font-mono text-xs sm:text-right">
          © {year} · {ui.footer.rights}
        </span>
      </div>
    </footer>
  )
}
