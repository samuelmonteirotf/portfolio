import { SectionHeading } from "@/components/section-heading"
import { RevealSection, RevealGroup, RevealItem } from "@/components/motion/reveal"
import { competencies } from "@/lib/portfolio-data"

export function CoreCompetencies() {
  return (
    <section
      id="competencies"
      aria-labelledby="competencies-heading"
      className="border-t border-border py-14 md:py-16"
    >
      <RevealSection>
      <SectionHeading
        index="02"
        title="Core Competencies"
        description="End-to-end platform stack: from provisioning to operation and reliability."
      />
      <RevealGroup className="rounded-md border border-border bg-card" stagger={0.08}>
        {competencies.map((category) => (
          <RevealItem
            as="div"
            dir="down"
            key={category.title}
            className="grid grid-cols-1 gap-x-6 gap-y-3 border-b border-border px-5 py-6 last:border-b-0 sm:grid-cols-[12rem_1fr] sm:px-6"
          >
            <h3 className="pt-px font-mono text-xs uppercase leading-relaxed tracking-widest text-muted-foreground">
              {category.title}
            </h3>
            <ul className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
              {category.items.map((item) => (
                <li
                  key={item.name}
                  className="group flex items-baseline gap-x-3 border-t border-border/60 py-1.5 text-sm first:border-t-0 first:pt-0 sm:[&:nth-child(2)]:border-t-0 sm:[&:nth-child(2)]:pt-0"
                >
                  <span className="font-medium text-foreground transition-colors group-hover:text-primary">
                    {item.name}
                  </span>
                  {item.detail ? (
                    <span className="font-mono text-xs leading-relaxed text-muted-foreground">
                      {item.detail}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </RevealItem>
        ))}
      </RevealGroup>
      </RevealSection>
    </section>
  )
}
