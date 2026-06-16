import Image from "next/image"
import { RevealSection } from "@/components/motion/reveal"
import { profile } from "@/lib/portfolio-data"

const highlights = [
  { label: "Experiência", value: "4+ anos" },
  { label: "Foco", value: "Edge Security & Infra" },
  { label: "Base", value: profile.location },
]

export function ProfessionalSummary() {
  return (
    <section
      id="resumo"
      aria-labelledby="resumo-heading"
      className="border-t border-border py-14 md:py-16"
    >
      <h2 id="resumo-heading" className="sr-only">
        Resumo profissional
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
          <div className="relative isolate aspect-square w-full overflow-hidden rounded-xl border border-border ring-1 ring-inset ring-[#00f5ff]/20">
            <Image
              src="/avatar.jpg"
              alt={profile.name}
              fill
              sizes="240px"
              priority
              className="object-cover object-[center_38%] saturate-[0.9] brightness-[0.96] contrast-[1.04]"
            />
            {/* vinheta: foca o rosto e disfarça a estante do fundo */}
            <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 50% 42%, transparent 34%, rgba(3,3,3,0.92) 100%)" }} />
            {/* toque frio BEM sutil (sem virar smurf), integra à paleta */}
            <div className="pointer-events-none absolute inset-0 mix-blend-soft-light" style={{ background: "#0b3a48", opacity: 0.3 }} />
            {/* funde a base no preto */}
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
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50" style={{ background: "#00f5ff" }} />
                  <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#00f5ff" }} />
                </span>
                <span className="text-sm text-foreground">Disponível para projetos</span>
              </div>
            ) : null}
          </dl>
        </aside>
      </div>
      </RevealSection>
    </section>
  )
}
