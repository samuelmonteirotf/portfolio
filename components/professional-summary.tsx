import Image from "next/image"
import { RevealSection } from "@/components/motion/reveal"
import { profile } from "@/lib/portfolio-data"

const highlights = [
  { label: "Experience", value: "4+ years" },
  { label: "Focus", value: "Edge Security & Infra" },
  { label: "Location", value: profile.location },
]

export function ProfessionalSummary() {
  return (
    <section
      id="summary"
      aria-labelledby="summary-heading"
      className="border-t border-border py-14 md:py-16"
    >
      <h2 id="summary-heading" className="sr-only">
        Professional summary
      </h2>

      <RevealSection>
      <div className="grid gap-10 md:grid-cols-[1fr_15rem] md:gap-12 lg:gap-16">
        <div className="max-w-[60ch] space-y-5 text-pretty">
          {profile.summary.map((para, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "text-lg font-normal leading-[1.7] text-foreground md:text-xl md:leading-[1.65]"
                  : "text-[17px] font-normal leading-[1.7] text-foreground/85 md:text-lg md:leading-[1.7]"
              }
            >
              {para}
            </p>
          ))}
        </div>

        <aside className="flex max-w-[15rem] flex-col gap-5">
          <div className="relative isolate aspect-square w-full overflow-hidden rounded-xl border border-border ring-1 ring-inset ring-[#e9eef5]/15">
            <Image
              src="/avatar.jpg"
              alt={profile.name}
              fill
              sizes="240px"
              priority
              className="object-cover object-[center_38%] saturate-[0.9] brightness-[0.96] contrast-[1.04]"
            />
            {/* vignette: focuses the face and hides the background shelf */}
            <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 50% 42%, transparent 34%, rgba(3,3,3,0.92) 100%)" }} />
            {/* subtle cool steel sheen (neutral, no color cast), integrates into the palette */}
            <div className="pointer-events-none absolute inset-0 mix-blend-soft-light" style={{ background: "#2a3340", opacity: 0.3 }} />
            {/* melts the base into black */}
            <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, #030303 0%, transparent 48%)" }} />
          </div>

          <dl className="flex flex-col gap-3.5 border-l border-border pl-4">
            {highlights.map((h) => (
              <div key={h.label}>
                <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {h.label}
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">{h.value}</dd>
              </div>
            ))}
            {profile.available ? (
              <div className="flex items-center gap-2 pt-0.5">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50" style={{ background: "#e9eef5" }} />
                  <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#e9eef5" }} />
                </span>
                <span className="text-sm text-foreground">Available for projects</span>
              </div>
            ) : null}
          </dl>
        </aside>
      </div>
      </RevealSection>
    </section>
  )
}
