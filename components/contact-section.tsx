import { GithubIcon, LinkedInIcon, MailIcon } from "@/components/brand-icons"
import { SectionHeading } from "@/components/section-heading"
import { RevealSection, RevealGroup, RevealItem } from "@/components/motion/reveal"
import { profile } from "@/lib/portfolio-data"

const channels = [
  { label: "E-mail", href: `mailto:${profile.email}`, Icon: MailIcon },
  { label: "GitHub", href: profile.github, Icon: GithubIcon },
  { label: "LinkedIn", href: profile.linkedin, Icon: LinkedInIcon },
]

export function ContactSection() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="border-t border-border py-14 md:py-16"
    >
      <RevealSection>
      <SectionHeading index="06" title="Contact" />
      <p className="mb-8 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
        Available to discuss infrastructure architecture, platform reliability, and delivery automation. Direct response through the channels below.
      </p>
      <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3" stagger={0.08}>
        {channels.map(({ label, href, Icon }) => (
          <RevealItem
            as="a"
            key={label}
            href={href}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
            className="group flex items-center gap-3 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <Icon className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-foreground">
              {label}
            </span>
          </RevealItem>
        ))}
      </RevealGroup>
      </RevealSection>
    </section>
  )
}
