"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ChevronDown } from "lucide-react"
import { HeroBackdrop } from "@/components/hero-backdrop"
import { ResumeDownload } from "@/components/resume-download"
import { ModeToggle } from "@/components/mode-toggle"
import { LangToggle } from "@/components/lang-toggle"
import { TerminalTrigger } from "@/components/terminal"
import { usePillMode } from "@/components/pill-mode"
import { useContent, useLanguage } from "@/components/language"
import { modeColors, type ModeKey } from "@/lib/portfolio-data"

/* Duas vozes: Geist Mono fala como a máquina (eyebrow, locale, label, links),
 * Geist Sans fala como o humano (nome, taglines). Tudo que é colorido pertence
 * à esfera — eyebrow, régua do console, token de prova e toggle compartilham o
 * hex do modo ativo. O texto NÃO viaja entre modos: a esfera se move, o texto
 * ancora; só strings e cores trocam. */

/* A legenda pousa junto com a esfera: posição publicada pelo canvas
 * (--orb-caption-x/y), só no layout lateral do desktop. O modo "all" fica
 * sem legenda de propósito. */
const HAS_CAPTION: Record<ModeKey, boolean> = { fullstack: true, devops: true, all: false }

export function SiteHeader() {
  const { mode } = usePillMode()
  const { lang } = useLanguage()
  const { modes, profile, ui } = useContent()
  const reduce = useReducedMotion()
  const color = modeColors[mode]
  const captionText = mode === "fullstack" ? ui.header.captionFullstack : ui.header.captionDevops
  const fade = { duration: reduce ? 0.15 : 0.24, ease: "easeOut" as const }
  // reduced-motion: crossfade só de opacidade, sem viagem vertical do texto
  const swap = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -5 } }
  const parts = modes[mode].taglineParts

  return (
    <header data-hero className="group/hero relative z-10 flex min-h-screen min-h-dvh flex-col overflow-hidden border-b border-border">
      <HeroBackdrop />

      {/* terminal + idioma: canto superior direito, fora do caminho da esfera */}
      <div className="absolute right-6 top-6 z-20 flex items-center gap-2 sm:right-8 sm:top-8">
        <TerminalTrigger />
        <LangToggle />
      </div>

      {/* --orb-caption-o: a esfera publica ao rolar (a legenda some quando ela sai do hero) */}
      <div className="pointer-events-none absolute inset-0 z-[5]" style={{ opacity: "var(--orb-caption-o, 1)" }}>
      <AnimatePresence>
        {HAS_CAPTION[mode] ? (
          <motion.span
            key={`${mode}-${lang}`}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: reduce ? 0 : 0.9, duration: reduce ? 0.15 : 0.4 } }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            className="pointer-events-none absolute z-[5] hidden -translate-x-1/2 font-mono text-xs font-medium uppercase tracking-[0.22em] group-data-[orb-layout=side]/hero:block"
            style={{
              // posição publicada pelo canvas (measure): logo acima da esfera
              left: "var(--orb-caption-x, 72%)",
              top: "var(--orb-caption-y, 20%)",
              color,
            }}
          >
            {captionText}
          </motion.span>
        ) : null}
      </AnimatePresence>
      </div>

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
          {/* scrim: em telas estreitas a esfera divide o espaço com o console;
              closest-side garante que o gradiente zera ANTES da borda da caixa
              (sem retângulo visível cortando a esfera). No desktop a esfera
              vive à direita e o scrim não existe. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-14 -inset-y-12 -z-10 lg:hidden"
            style={{
              background:
                "radial-gradient(closest-side, rgba(3,3,3,0.92) 0%, rgba(3,3,3,0.7) 60%, transparent 100%)",
            }}
          />
          <div className="relative">
            {/* fantasmas invisíveis empilhados: reservam a altura exata da MAIOR
                tagline entre os modos, no idioma atual — o console não muda de
                altura ao trocar de modo e as três esferas ficam alinhadas */}
            <div aria-hidden="true" className="invisible grid">
              {(["devops", "fullstack", "all"] as const).map((k) => (
                <p
                  key={k}
                  className="col-start-1 row-start-1 max-w-[52ch] text-pretty text-[15px] leading-[1.6] sm:text-[17px]"
                >
                  {modes[k].tagline}
                </p>
              ))}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={`${mode}-${lang}`}
                className="absolute inset-x-0 top-0 max-w-[52ch] text-pretty text-[15px] leading-[1.6] text-foreground/85 sm:text-[17px]"
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
          </div>

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
