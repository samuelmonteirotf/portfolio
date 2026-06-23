"use client"

import { useEffect, useRef, useState } from "react"
import { DownloadIcon } from "@/components/brand-icons"
import { cn } from "@/lib/utils"

/* Currículo: um botão na nav que, ao clicar, revela ali mesmo (sem modal) duas
 * opções minimalistas — EN e PT. Cada chip baixa o PDF no idioma. Fecha ao
 * clicar fora ou apertar Esc. */
const resumes = [
  { lang: "EN", file: "/samuel-monteiro-cv-en.pdf", filename: "Samuel Monteiro EN.pdf", aria: "English resume (PDF)" },
  { lang: "PT", file: "/samuel-monteiro-cv-pt.pdf", filename: "Samuel Monteiro.pdf", aria: "Portuguese resume (PDF)" },
] as const

export function ResumeDownload() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
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
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="resume-options"
        aria-label="Download resume"
        title="Download resume"
        className={cn(
          "inline-flex items-center justify-center rounded-md border bg-card p-2.5 transition-colors hover:border-primary hover:text-primary",
          open ? "border-primary text-primary" : "border-border text-foreground",
        )}
      >
        <DownloadIcon className="h-5 w-5" />
      </button>

      {/* opções inline — aparecem ali mesmo, sem modal */}
      <div
        id="resume-options"
        aria-hidden={!open}
        className={cn(
          "flex items-center gap-1.5 overflow-hidden transition-all duration-300 ease-out",
          open ? "ml-1.5 max-w-[10rem] opacity-100" : "ml-0 max-w-0 opacity-0",
        )}
      >
        {resumes.map((r) => (
          <a
            key={r.lang}
            href={r.file}
            download={r.filename}
            tabIndex={open ? 0 : -1}
            aria-label={`Download ${r.aria}`}
            onClick={() => setOpen(false)}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-3 font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {r.lang}
          </a>
        ))}
      </div>
    </div>
  )
}
