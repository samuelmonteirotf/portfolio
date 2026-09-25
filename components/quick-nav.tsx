"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ArrowDown } from "lucide-react"
import { usePillMode } from "@/components/pill-mode"
import { useLanguage } from "@/components/language"
import { TerminalTrigger } from "@/components/terminal"

/* Atalho para quem tem 30 segundos: uma barra fixa que aparece depois do
 * hero, com as seções (a atual acesa), o CV do lado ativo sempre à mão e o
 * terminal. No celular, só Contato e CV. */

const LINKS = {
  pt: [
    { id: "projects", label: "Projetos" },
    { id: "summary", label: "Sobre" },
    { id: "competencies", label: "Stack" },
    { id: "control-room", label: "Infra" },
    { id: "experience", label: "Trajetória" },
    { id: "contact", label: "Contato" },
  ],
  en: [
    { id: "projects", label: "Projects" },
    { id: "summary", label: "About" },
    { id: "competencies", label: "Stack" },
    { id: "control-room", label: "Infra" },
    { id: "experience", label: "Career" },
    { id: "contact", label: "Contact" },
  ],
}

export function QuickNav() {
  const { mode } = usePillMode()
  const { lang } = useLanguage()
  const reduce = useReducedMotion()
  const [show, setShow] = useState(false)
  const [current, setCurrent] = useState("")
  const [present, setPresent] = useState<string[]>([])

  useEffect(() => {
    const onScroll = () => {
      const hero = document.querySelector("header[data-hero]")
      const h = hero ? hero.getBoundingClientRect().bottom : 0
      setShow(h < 80)
      // seção sob o terço de cima da tela
      const y = window.innerHeight * 0.35
      let cur = ""
      for (const { id } of LINKS.pt) {
        const r = document.getElementById(id)?.getBoundingClientRect()
        if (r && r.top <= y && r.bottom > y) cur = id
      }
      setCurrent(cur)
      setPresent(LINKS.pt.map((l) => l.id).filter((id) => document.getElementById(id)))
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [mode])

  const suffix = mode === "all" ? "" : `-${mode}`
  const cv = `/samuel-monteiro-cv${suffix}-${lang}.pdf`
  const links = LINKS[lang].filter((l) => present.includes(l.id))

  return (
    <AnimatePresence>
      {show ? (
        <motion.nav
          aria-label={lang === "pt" ? "Seções" : "Sections"}
          className="fixed inset-x-0 top-3 z-40 flex justify-center px-3"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={{ type: "spring", stiffness: 170, damping: 22 }}
        >
          <div className="flex items-center gap-1 rounded-full border border-border bg-background/80 p-1 backdrop-blur-md">
            {links.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                aria-current={current === l.id ? "true" : undefined}
                className={`rounded-full px-3 py-1.5 text-xs outline-none transition-colors focus-visible:outline-2 focus-visible:outline-mode ${
                  l.id === "contact" ? "" : "hidden md:inline-block"
                } ${current === l.id ? "bg-mode/15 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {l.label}
              </a>
            ))}
            <a
              href={cv}
              download
              className="inline-flex items-center gap-1 rounded-full border border-mode/50 bg-mode/10 px-3 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-mode/20 focus-visible:outline-2 focus-visible:outline-mode"
            >
              CV <ArrowDown className="h-3 w-3" aria-hidden="true" />
            </a>
            <span className="hidden sm:inline-flex">
              <TerminalTrigger />
            </span>
          </div>
        </motion.nav>
      ) : null}
    </AnimatePresence>
  )
}
