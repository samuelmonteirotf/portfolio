"use client"

import { useSectionIndex } from "@/components/pill-mode"

/* O número da seção vem do modo ativo (ver SECTION_ORDER em pill-mode.tsx):
 * se uma seção não existe naquele modo, as seguintes renumeram. */
export function SectionHeading({
  section,
  title,
  description,
}: {
  section: string
  title: string
  description?: string
}) {
  const index = useSectionIndex(section)
  return (
    <div className="mb-8">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-sm text-muted-foreground">{index ?? ""}</span>
        {/* id casa com o aria-labelledby="<section>-heading" das seções */}
        <h2 id={`${section}-heading`} className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          {title}
        </h2>
      </div>
      {description ? (
        <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  )
}
