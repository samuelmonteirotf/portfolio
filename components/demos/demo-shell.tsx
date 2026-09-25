"use client"

import type { ReactNode } from "react"

/* Moldura comum das demos ao vivo dentro dos cards de projeto: faixa mono com
 * ponto pulsante na cor do modo, título e uma nota de procedência (de onde
 * vem a lógica que roda ali). */
export function DemoShell({
  title,
  source,
  children,
}: {
  title: string
  source: string
  children: ReactNode
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-md border border-mode/25 bg-background/70">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-4 py-2.5">
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mode opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mode" />
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">{title}</span>
        <span className="font-mono text-[10px] text-muted-foreground sm:ml-auto">{source}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

/* chip de alternância (header presente/ausente, opção de select curto) */
export function Chip({
  on,
  onClick,
  children,
  title,
}: {
  on: boolean
  onClick: () => void
  children: ReactNode
  title?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      title={title}
      onClick={onClick}
      className={`rounded border px-2 py-1 font-mono text-[11px] transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mode ${
        on
          ? "border-mode/60 bg-mode/10 text-foreground"
          : "border-border text-muted-foreground line-through decoration-muted-foreground/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}
