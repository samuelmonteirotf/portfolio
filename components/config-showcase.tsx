"use client"

import { useState } from "react"
import { SectionHeading } from "@/components/section-heading"
import { RevealSection } from "@/components/motion/reveal"
import { configSnippets } from "@/lib/portfolio-data"

export function ConfigShowcase() {
  const [active, setActive] = useState(configSnippets[0].id)
  const current = configSnippets.find((s) => s.id === active) ?? configSnippets[0]

  return (
    <section
      id="infraestrutura"
      aria-labelledby="infraestrutura-heading"
      className="border-t border-border py-14 md:py-16"
    >
      <RevealSection>
      <SectionHeading
        index="01"
        title="Infrastructure as Code"
        description="Configuração real do meu stack: reverse proxy com TLS automático, containers endurecidos, bot-firewall na borda e CI/CD com scan de supply chain."
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div
          className="flex items-center gap-2 border-b border-border bg-secondary px-4 py-2.5"
          role="tablist"
          aria-label="Exemplos de configuração"
        >
          <div className="mr-2 hidden items-center gap-1.5 sm:flex" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-border" />
            <span className="h-3 w-3 rounded-full bg-border" />
            <span className="h-3 w-3 rounded-full bg-border" />
          </div>
          <div className="flex flex-wrap gap-1">
            {configSnippets.map((snippet) => (
              <button
                key={snippet.id}
                type="button"
                role="tab"
                aria-selected={active === snippet.id}
                onClick={() => setActive(snippet.id)}
                className={`rounded-md px-3 py-1 font-mono text-xs transition-colors ${
                  active === snippet.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              >
                {snippet.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="font-mono text-xs text-muted-foreground">
            {current.filename}
          </span>
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {current.language}
          </span>
        </div>

        <pre className="overflow-x-auto p-4 text-sm leading-relaxed md:p-6">
          <code className="font-mono text-foreground">{current.code}</code>
        </pre>
      </div>
      </RevealSection>
    </section>
  )
}
