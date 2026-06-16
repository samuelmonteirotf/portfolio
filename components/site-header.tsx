import { ChevronDown, Globe } from "lucide-react"
import { GithubIcon, LinkedInIcon, MailIcon } from "@/components/brand-icons"
import { HeroBackdrop } from "@/components/hero-backdrop"
import { profile } from "@/lib/portfolio-data"

export function SiteHeader() {
  return (
    <header className="relative flex min-h-screen min-h-dvh flex-col overflow-hidden border-b border-border">
      <HeroBackdrop />
      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-6 px-6 py-20">
        <div className="flex max-w-xl flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {profile.role}
          </span>
          <h1 className="text-balance text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
            {profile.name}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" aria-hidden="true" />
            <span>{profile.location}</span>
          </div>
        </div>

        <nav aria-label="Professional links" className="pointer-events-auto flex flex-wrap items-center gap-3">
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            title="GitHub"
            className="inline-flex items-center justify-center rounded-md border border-border bg-card p-2.5 text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <GithubIcon className="h-5 w-5" />
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            title="LinkedIn"
            className="inline-flex items-center justify-center rounded-md border border-border bg-card p-2.5 text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <LinkedInIcon className="h-5 w-5" />
          </a>
          <a
            href={`mailto:${profile.email}`}
            aria-label={`E-mail: ${profile.email}`}
            title={profile.email}
            className="inline-flex items-center justify-center rounded-md border border-border bg-card p-2.5 text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <MailIcon className="h-5 w-5" />
          </a>
        </nav>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex flex-col items-center text-muted-foreground">
        <ChevronDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
      </div>
    </header>
  )
}
