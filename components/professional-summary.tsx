"use client"

import Image from "next/image"
import { RevealSection } from "@/components/motion/reveal"
import { usePillMode } from "@/components/pill-mode"
import { useContent } from "@/components/language"

/* Sobre: texto à esquerda, a foto à direita (no palco das outras seções).
 * O fundo desta seção é só a poeira fraca (cena "dust"). */
const AVATAR = "/avatar-480.jpg"

export function ProfessionalSummary() {
  const { mode } = usePillMode()
  const { modes, profile, ui } = useContent()
  const highlights = [
    { label: ui.summary.experienceLabel, value: ui.summary.experienceValue },
    { label: ui.summary.focusLabel, value: modes[mode].focus },
    { label: ui.summary.locationLabel, value: profile.location },
  ]
  return (
    <section
      id="summary"
      aria-labelledby="summary-heading"
      data-scene="dust"
      className="flex min-h-[100svh] items-center border-t border-border py-20"
    >
      <h2 id="summary-heading" className="sr-only">
        {ui.summary.srHeading}
      </h2>

      <RevealSection className="grid w-full items-center gap-12 lg:grid-cols-[34rem_1fr] lg:gap-16">
        <div>
          <div className="space-y-5 text-pretty">
            {modes[mode].summary.map((para, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "text-xl font-normal leading-[1.6] text-foreground md:text-2xl md:leading-[1.5]"
                    : "text-[17px] font-normal leading-[1.7] text-foreground/80"
                }
              >
                {para}
              </p>
            ))}
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6">
            {highlights.map((h) => (
              <div key={h.label}>
                <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{h.label}</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{h.value}</dd>
              </div>
            ))}
          </dl>
          {profile.available ? (
            <div className="mt-6 flex items-center gap-2">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10b981] opacity-50 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10b981]" />
              </span>
              <span className="text-sm text-foreground">{ui.summary.available}</span>
            </div>
          ) : null}
        </div>

        <div className="relative isolate order-first aspect-[4/5] w-full max-w-[14rem] overflow-hidden rounded-2xl border border-border lg:order-none lg:mx-auto lg:max-w-[24rem]">
          <Image
            src={AVATAR}
            alt={profile.name}
            fill
            sizes="(min-width: 1024px) 384px, 224px"
            className="object-cover object-[center_35%]"
          />
        </div>
      </RevealSection>
    </section>
  )
}
