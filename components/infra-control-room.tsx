"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { SectionHeading } from "@/components/section-heading"
import { usePillMode } from "@/components/pill-mode"
import { useContent, useLanguage } from "@/components/language"

/* ------------------------------------------------------------------ *
 * Sala de Controle — topologia da infra em WebGL (cena em
 * control-room-scene.tsx), sem caixa, com inspector embaixo.
 * Os textos dos nós vivem em ui.controlRoom (bilíngue).
 * ------------------------------------------------------------------ */

const ControlRoomScene = dynamic(() => import("@/components/control-room-scene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0" style={{ background: "#030303" }} aria-hidden="true" />,
})

const GREEN = "#10b981"

/* Nomes próprios dos nós (iguais nos dois idiomas); a ordem é a da legenda */
const NODE_NAMES: Record<string, string> = {
  internet: "Internet",
  sentinel: "Sentinel",
  realscan: "RealScan",
  caddy: "Caddy 2",
  api: "API",
  postgres: "Postgres",
  redis: "Redis",
  tailscale: "Tailscale",
}
const ORDER = ["internet", "sentinel", "realscan", "caddy", "api", "postgres", "redis", "tailscale"]

function Inspector({ id, reduce }: { id: string; reduce: boolean | null }) {
  const { ui } = useContent()
  const node = ui.controlRoom.nodes[id]
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-mono text-sm font-medium text-foreground">{NODE_NAMES[id]}</span>
          <span className="font-mono text-xs text-muted-foreground">· {node.sub}</span>
        </div>
        <p className="mt-2 max-w-prose text-pretty text-xs leading-relaxed text-muted-foreground">
          {node.desc}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {node.tags.map((t) => (
            <span
              key={t}
              className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-foreground/80"
            >
              {t}
            </span>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export function InfraControlRoom() {
  // settledMode: montar/esconder WebGL durante a dispersão do hero era a
  // principal causa da travada na troca de modo
  const { settledMode } = usePillMode()
  const { lang } = useLanguage()
  const { ui } = useContent()
  const reduce = useReducedMotion()
  const [selected, setSelected] = useState("sentinel")

  /* Perf: o WebGL (com Bloom full-screen) só renderiza com a seção na viewport.
   * Nos primeiros 2,6s após a primeira montagem, roda sempre — a entrada
   * escalonada dos nós acontece como sempre. Depois de montada, a cena NUNCA
   * desmonta: no lado full-stack ela fica hidden (display:none, frameloop
   * congelado) — o teardown do WebGL travava o main thread por ~1,8s. */
  const showScene = settledMode !== "fullstack"
  const [everShown, setEverShown] = useState(false)
  const canvasWrap = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(true)
  const [entryDone, setEntryDone] = useState(false)

  useEffect(() => {
    if (showScene) setEverShown(true)
  }, [showScene])

  useEffect(() => {
    if (!everShown) return
    const t = window.setTimeout(() => setEntryDone(true), 2600)
    return () => window.clearTimeout(t)
  }, [everShown])

  useEffect(() => {
    if (!everShown) return
    const el = canvasWrap.current
    if (!el) return
    // lote de registros em ordem cronológica: só o último reflete o estado
    // atual; com display:none o elemento não intersecta → frameloop congela
    const io = new IntersectionObserver((es) => setInView(es[es.length - 1].isIntersecting), { rootMargin: "160px" })
    io.observe(el)
    return () => io.disconnect()
  }, [everShown])

  // visitante que nunca saiu do full-stack não paga o custo do WebGL
  if (!showScene && !everShown) return null

  return (
    <section
      id="control-room"
      aria-labelledby="control-room-heading"
      hidden={!showScene}
      className="relative border-t border-border py-14 md:py-16"
    >
      <SectionHeading
        section="control-room"
        title={ui.sections.controlRoom.title}
        description={ui.sections.controlRoom.description}
      />

      {/* status — slim, sem caixa */}
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="flex items-center gap-2">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            {!reduce && (
              <motion.span
                className="absolute inline-flex h-full w-full rounded-full"
                style={{ background: GREEN }}
                animate={{ opacity: [0.7, 0, 0.7], scale: [1, 2.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              />
            )}
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: GREEN }} />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
            {ui.controlRoom.status}
          </span>
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">· monteirotf.com</span>
        <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
          {ui.controlRoom.uptime}
        </span>
      </div>

      {/* canvas WebGL — full-bleed, sem borda */}
      <div ref={canvasWrap} className="relative h-[58svh] min-h-[420px] w-full" aria-hidden="true">
        <ControlRoomScene
          selected={selected}
          onSelect={setSelected}
          reduce={!!reduce}
          frameloop={inView || !entryDone ? "always" : "never"}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(120% 80% at 50% 45%, transparent 55%, #030303 100%)" }}
        />
      </div>

      {/* legenda navegável (teclado / leitor de tela) — controla a mesma
          seleção; grupo de botões, não o padrão ARIA de tabs */}
      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={ui.controlRoom.legendAria}>
        {ORDER.map((id) => {
          const active = selected === id
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => setSelected(id)}
              className={`rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors ${
                active
                  ? "border-foreground/50 bg-foreground/[0.05] text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {NODE_NAMES[id]}
            </button>
          )
        })}
      </div>

      <div className="mt-4 border-t border-border pt-4" key={lang}>
        <Inspector id={selected} reduce={reduce} />
      </div>
    </section>
  )
}
