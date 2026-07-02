"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ChevronDown } from "lucide-react"
import { HeroBackdrop } from "@/components/hero-backdrop"
import { ResumeDownload } from "@/components/resume-download"
import { ModeToggle } from "@/components/mode-toggle"
import { LangToggle } from "@/components/lang-toggle"
import { usePillMode } from "@/components/pill-mode"
import { useContent, useLanguage } from "@/components/language"
import { modeColors, type ModeKey } from "@/lib/portfolio-data"

/* Duas vozes: Geist Mono fala como a máquina (eyebrow, locale, label, links),
 * Geist Sans fala como o humano (nome, taglines). Tudo que é colorido pertence
 * à esfera — eyebrow, régua do console, token de prova e toggle compartilham o
 * hex do modo ativo. O texto NÃO viaja entre modos: a esfera se move, o texto
 * ancora; só strings e cores trocam. */

/* Posição da legenda que pousa junto com a esfera (27% / 73%, os mesmos
 * alvos de layout do canvas). O modo "all" fica sem legenda de propósito. */
const CAPTION_LEFT: Partial<Record<ModeKey, string>> = {
  fullstack: "27%",
  devops: "73%",
}

export function SiteHeader() {
  const { mode } = usePillMode()
  const { lang } = useLanguage()
  const { modes, profile, ui } = useContent()
  const reduce = useReducedMotion()
  const color = modeColors[mode]
  const captionLeft = CAPTION_LEFT[mode]
  const captionText = mode === "fullstack" ? ui.header.captionFullstack : ui.header.captionDevops
  const fade = { duration: reduce ? 0.15 : 0.24, ease: "easeOut" as const }
  // reduced-motion: crossfade só de opacidade, sem viagem vertical do texto
  const swap = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -5 } }
  const parts = modes[mode].taglineParts

  return (
    <header
      className="relative flex min-h-screen min-h-dvh flex-col overflow-hidden border-b border-border"
      style={{ "--mode": color } as React.CSSProperties}
    >
      <HeroBackdrop />

      {/* seletor de idioma: canto superior direito, fora do caminho da esfera */}
      <div className="absolute right-6 top-6 z-20 sm:right-8 sm:top-8">
        <LangToggle />
      </div>

      <AnimatePresence>
        {captionLeft ? (
          <motion.span
            key={`${mode}-${lang}`}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: reduce ? 0 : 0.9, duration: reduce ? 0.15 : 0.4 } }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            className="pointer-events-none absolute z-[5] hidden -translate-x-1/2 font-mono text-xs font-medium uppercase tracking-[0.22em] [@media(min-width:1024px)_and_(min-height:780px)]:block"
            style={{
              left: captionLeft,
              // posição publicada pelo canvas (measure): logo acima da esfera
              // encaixada no espaço livre, já sem risco de encostar no texto
              top: "var(--orb-caption-y, 30%)",
              color,
            }}
          >
            {captionText}
          </motion.span>
        ) : null}
      </AnimatePresence>

      {/* topo = identidade (a constante) · meio = palco da esfera · base = console (o que a escolha reescreve) */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-between gap-10 px-6 py-16 sm:py-20">
        {/* data-orb-clear: o canvas mede estes blocos e encaixa a esfera no
            espaço livre entre eles — nunca atrás do texto, em qualquer tela */}
        <div data-orb-clear="top" className="flex max-w-xl flex-col gap-3">
          <span className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                background: color,
                boxShadow: `0 0 8px ${color}`,
                transition: "background-color 620ms ease-out, box-shadow 620ms ease-out",
              }}
            />
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={`${mode}-${lang}`}
                className="font-mono text-xs font-medium uppercase tracking-[0.18em]"
                style={{ color }}
                {...swap}
                transition={fade}
              >
                {modes[mode].role}
              </motion.span>
            </AnimatePresence>
          </span>
          <h1 className="text-[clamp(2.75rem,1rem+5.5vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.02em] text-foreground sm:tracking-[-0.03em] [@media(max-height:820px)]:text-[clamp(2.5rem,1rem+4.5vw,4rem)]">
            {profile.name}
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground sm:text-[13px]">
            {ui.header.localeLine}
          </p>
        </div>

        {/* console: régua de 2px na cor do modo — a transição de 620ms é o
            DISPERSE_MS das partículas, texto e esfera reconvergem juntos */}
        <div
          data-orb-clear="bottom"
          className="relative flex max-w-xl flex-col gap-5 border-l-2 pl-5"
          style={{ borderColor: color, transition: "border-color 620ms ease-out" }}
        >
          {/* scrim: em viewports baixas (~≤750px) a esfera assenta atrás deste
              bloco — sem isso o texto fica ilegível sobre o núcleo branco */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-14 -inset-y-10 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 130% 160% at 30% 50%, rgba(3,3,3,0.9) 0%, rgba(3,3,3,0.6) 50%, transparent 100%)",
            }}
          />
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={`${mode}-${lang}`}
              className="max-w-[52ch] text-pretty text-[15px] leading-[1.6] text-foreground/85 sm:text-[17px]"
              {...swap}
              transition={{ ...fade, delay: reduce ? 0 : 0.12 }}
            >
              {parts.before}
              <span className={parts.voice === "mono" ? "font-mono font-medium" : "font-medium"} style={{ color }}>
                {parts.token}
              </span>
              {parts.after}
            </motion.p>
          </AnimatePresence>

          <ModeToggle />

          <nav
            aria-label={ui.header.navAria}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs font-medium uppercase tracking-[0.14em]"
          >
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="-my-2 py-2 -mx-1 px-1 text-muted-foreground underline-offset-4 outline-none transition-colors hover:text-foreground hover:underline hover:decoration-[color:var(--mode)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--mode)]"
            >
              GitHub <span aria-hidden="true">↗</span>
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="-my-2 py-2 -mx-1 px-1 text-muted-foreground underline-offset-4 outline-none transition-colors hover:text-foreground hover:underline hover:decoration-[color:var(--mode)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--mode)]"
            >
              LinkedIn <span aria-hidden="true">↗</span>
            </a>
            <a
              href={`mailto:${profile.email}`}
              title={profile.email}
              className="-my-2 py-2 -mx-1 px-1 text-muted-foreground underline-offset-4 outline-none transition-colors hover:text-foreground hover:underline hover:decoration-[color:var(--mode)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--mode)]"
            >
              {ui.header.email}
            </a>
            <ResumeDownload />
          </nav>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-1.5 text-muted-foreground">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em]">{ui.header.scrollCue}</span>
        <ChevronDown className="h-4 w-4 animate-bounce motion-reduce:animate-none" aria-hidden="true" />
      </div>
    </header>
  )
}
