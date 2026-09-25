"use client"

import { useState } from "react"
import { SectionHeading } from "@/components/section-heading"
import { RevealSection } from "@/components/motion/reveal"
import { usePillMode } from "@/components/pill-mode"
import { useContent } from "@/components/language"

export function ConfigShowcase() {
  // settledMode: a seção aparece/some depois da animação do hero, não durante
  const { settledMode: mode } = usePillMode()
  const { configSnippets, ui } = useContent()
  const [active, setActive] = useState(configSnippets[0].id)
  const current = configSnippets.find((s) => s.id === active) ?? configSnippets[0]

  // seção de infra: só faz sentido no lado vermelho (devops) e no "os dois"
  if (mode === "fullstack") return null

  return (
    <section
      id="infraestrutura"
      aria-labelledby="infra-code-heading"
      data-scene="dust"
      className="border-t border-border py-14 md:py-16"
    >
      <RevealSection>
      <SectionHeading
        section="infra-code"
        title={ui.sections.infra.title}
        description={ui.sections.infra.description}
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {/* grupo de botões (não o padrão ARIA de tabs, que exigiria roving
            tabindex + tabpanels): cada botão alterna o snippet exibido */}
        <div
          className="flex items-center gap-2 border-b border-border bg-secondary px-4 py-2.5"
          role="group"
          aria-label={ui.configShowcase.tablistAria}
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
                aria-pressed={active === snippet.id}
                onClick={() => setActive(snippet.id)}
                className={`rounded-md px-3 py-1 font-mono text-xs transition-colors ${
                  active === snippet.id
                    ? "bg-mode text-background"
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

        {/* região rolável horizontalmente precisa ser focável por teclado */}
        <pre
          tabIndex={0}
          role="region"
          aria-label={current.filename}
          className="overflow-x-auto p-4 text-sm leading-relaxed outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mode"
        >
          <code className="font-mono text-foreground">{current.code}</code>
        </pre>
      </div>
      </RevealSection>
    </section>
  )
}
