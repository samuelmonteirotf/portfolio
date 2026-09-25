"use client"

import { useState } from "react"
import { ArrowUpRight, Check, Copy } from "lucide-react"
import { SectionHeading } from "@/components/section-heading"
import { RevealSection } from "@/components/motion/reveal"
import { useContent } from "@/components/language"
import { orbPulseMode } from "@/lib/orb-bus"

/* Contato: a esfera volta a se formar no palco (cena "orb"), fechando a
 * página como ela começou. Tela cheia para a cena assentar inteira. */
export function ContactSection() {
  const { profile, ui } = useContent()
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard?.writeText(profile.email).then(() => {
      setCopied(true)
      orbPulseMode(1)
      window.setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      data-scene="orb"
      className="flex min-h-[100svh] items-center border-t border-border py-20"
    >
      <RevealSection className="w-full lg:max-w-[34rem]">
        <SectionHeading section="contact" title={ui.sections.contact.title} />
        <p className="text-balance text-[clamp(2.2rem,1.2rem+3vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-foreground">
          {ui.contactSection.lead}
        </p>
        <p className="mt-5 max-w-[30rem] text-pretty leading-relaxed text-muted-foreground">{ui.sections.contact.description}</p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={`mailto:${profile.email}`}
            className="rounded-full border border-mode/60 bg-mode/10 px-5 py-2.5 font-mono text-sm text-foreground outline-none transition-colors hover:bg-mode/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mode"
          >
            {profile.email}
          </a>
          <button
            type="button"
            onClick={copy}
            aria-live="polite"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2.5 text-xs text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mode"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#10b981]" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
            {copied ? ui.contactSection.copied : ui.contactSection.copy}
          </button>
        </div>

        <div className="mt-8 flex gap-6 font-mono text-xs uppercase tracking-[0.14em]">
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-mode">
            GitHub <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-mode">
            LinkedIn <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </RevealSection>
    </section>
  )
}
