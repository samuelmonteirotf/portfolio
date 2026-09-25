"use client"

import { useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { SectionHeading } from "@/components/section-heading"
import { usePillMode } from "@/components/pill-mode"
import { useContent, useLanguage } from "@/components/language"
import { SentinelLive, useSentinelStats } from "@/components/sentinel-live"

/* ------------------------------------------------------------------ *
 * Sala de Controle. No palco à direita (cena "traffic" em hero-orb.tsx),
 * o tráfego real do Sentinel: entra pela esquerda, passa pelo portão e sai
 * em quatro correntes por veredito, com espessura = proporção real
 * (data-p1..p3: frações acumuladas), nas cores do painel. A legenda e o
 * inspector explicam cada peça da stack (ui.controlRoom, bilíngue).
 * ------------------------------------------------------------------ */

const GREEN = "#10b981"

/* Nomes próprios dos nós da stack (ordem da legenda) */
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
// sem telemetria: proporções neutras só para o desenho ter vida
const FALLBACK = { ALLOW: 0.55, CHALLENGE: 0.15, BLOCK: 0.15, RATE_LIMITED: 0.15 }

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
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{node.desc}</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {node.tags.map((t) => (
            <span key={t} className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-foreground/80">
              {t}
            </span>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export function InfraControlRoom() {
  const { settledMode } = usePillMode()
  const { lang } = useLanguage()
  const { ui } = useContent()
  const reduce = useReducedMotion()
  const [selected, setSelected] = useState("sentinel")
  const sectionRef = useRef<HTMLElement>(null)
  const show = settledMode !== "fullstack"

  // telemetria real do Sentinel: só busca com a seção na tela
  const live = useSentinelStats(sectionRef, show)
  const healthy = live.status !== "error"
  const statusColor = healthy ? GREEN : "#f59e0b"
  const tot = live.data?.totals
  const f = tot && tot.total > 0
    ? { ALLOW: tot.ALLOW / tot.total, CHALLENGE: tot.CHALLENGE / tot.total, BLOCK: tot.BLOCK / tot.total }
    : FALLBACK
  const c1 = f.ALLOW, c2 = c1 + f.CHALLENGE, c3 = c2 + f.BLOCK

  if (!show) return null

  return (
    <section
      ref={sectionRef}
      id="control-room"
      aria-labelledby="control-room-heading"
      data-scene="traffic"
      data-p1={c1.toFixed(4)}
      data-p2={c2.toFixed(4)}
      data-p3={c3.toFixed(4)}
      className="border-t border-border py-20 md:py-28"
    >
      <div className="lg:max-w-[34rem]">
        <SectionHeading section="control-room" title={ui.sections.controlRoom.title} description={ui.sections.controlRoom.description} />

        <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              {!reduce && (
                <motion.span
                  className="absolute inline-flex h-full w-full rounded-full"
                  style={{ background: statusColor }}
                  animate={{ opacity: [0.7, 0, 0.7], scale: [1, 2.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                />
              )}
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: statusColor }} />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
              {healthy ? ui.controlRoom.status : ui.controlRoom.noTelemetry}
            </span>
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">· {live.status === "ok" ? ui.controlRoom.live : "monteirotf.com"}</span>
        </div>

        {/* legenda: escolhe o nó que acende no palco (teclado / leitor de tela) */}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={ui.controlRoom.legendAria}>
          {ORDER.map((id) => {
            const active = selected === id
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(id)}
                onMouseEnter={() => setSelected(id)}
                className={`rounded-md border px-2.5 py-1 font-mono text-[11px] outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mode ${
                  active ? "border-mode/60 bg-mode/[0.08] text-foreground" : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {NODE_NAMES[id]}
              </button>
            )
          })}
        </div>

        <div className="mt-5 min-h-[9.5rem] border-t border-border pt-4" key={lang}>
          <Inspector id={selected} reduce={reduce} />
        </div>

        <SentinelLive live={live} />
      </div>
    </section>
  )
}
