"use client"

import { useEffect, useRef, useState } from "react"
import { usePillMode } from "@/components/pill-mode"
import { useContent } from "@/components/language"
import type { ModeKey } from "@/lib/portfolio-data"
import { cn } from "@/lib/utils"

/* Currículo na voz mono do console: "CV ↓" revela ali mesmo (sem modal) as
 * opções EN e PT. O arquivo servido segue o modo ativo do toggle — quem lê o
 * lado DevOps baixa o CV DevOps (gerados por scripts/generate-cvs.mjs).
 * Fecha ao clicar fora ou apertar Esc. */
const SUFFIX: Record<ModeKey, string> = { devops: "-devops", fullstack: "-fullstack", all: "" }

const linkStyle =
  "-my-2 py-2 -mx-1 px-1 font-mono text-xs font-medium uppercase tracking-[0.14em] underline-offset-4 outline-none transition-colors hover:text-foreground hover:underline hover:decoration-[color:var(--mode,#e9eef5)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--mode,#e9eef5)]"

export function ResumeDownload() {
  const { mode } = usePillMode()
  const { ui } = useContent()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  // fechar não pode deixar o foco preso dentro de um bloco aria-hidden
  const close = () => {
    if (ref.current?.contains(document.activeElement)) btnRef.current?.focus()
    setOpen(false)
  }

  const resumes = [
    { lang: "EN", filename: "Samuel Monteiro EN.pdf", aria: ui.resume.enAria },
    { lang: "PT", filename: "Samuel Monteiro.pdf", aria: ui.resume.ptAria },
  ] as const

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("pointerdown", onPointer)
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("pointerdown", onPointer)
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="flex items-center">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="resume-options"
        aria-label={ui.resume.buttonAria}
        className={cn(linkStyle, open ? "text-foreground" : "text-muted-foreground")}
      >
        CV ↓
      </button>

      {/* opções inline — aparecem ali mesmo, sem modal */}
      <div
        id="resume-options"
        aria-hidden={!open}
        className={cn(
          "flex items-center gap-3 overflow-hidden transition-all duration-300 ease-out",
          open ? "ml-3 max-w-[8rem] opacity-100" : "ml-0 max-w-0 opacity-0",
        )}
      >
        {resumes.map((r) => (
          <a
            key={r.lang}
            href={`/samuel-monteiro-cv${SUFFIX[mode]}-${r.lang.toLowerCase()}.pdf`}
            download={r.filename}
            tabIndex={open ? 0 : -1}
            aria-label={r.aria}
            onClick={close}
            className={cn(linkStyle, "text-muted-foreground")}
          >
            {r.lang}
          </a>
        ))}
      </div>
    </div>
  )
}
