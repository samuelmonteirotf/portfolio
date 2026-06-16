"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { SectionHeading } from "@/components/section-heading"

/* ------------------------------------------------------------------ *
 * Sala de Controle — topologia da infra em WebGL (cena em
 * control-room-scene.tsx), sem caixa, com inspector embaixo.
 * ------------------------------------------------------------------ */

const ControlRoomScene = dynamic(() => import("@/components/control-room-scene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0" style={{ background: "#030303" }} aria-hidden="true" />,
})

const GREEN = "#10b981"

type NodeInfo = { name: string; sub: string; desc: string; tags: string[] }

const NODES: Record<string, NodeInfo> = {
  internet: {
    name: "Internet",
    sub: "tráfego de entrada",
    desc: "Usuários reais e bots chegam por aqui. A maior parte do tráfego é maliciosa (scrapers, requisições de datacenter) e é barrada na borda antes de tocar a origem.",
    tags: ["~80% bots", "filtrado na borda"],
  },
  sentinel: {
    name: "Sentinel",
    sub: "Cloudflare Worker · borda",
    desc: "Bot-firewall na borda. Pontua cada requisição (User-Agent · Accept-Language · versão HTTP · TLS · ASN) e decide antes de tocar a origem: bloqueia (≥80), desafia (≥60) ou libera. Durable Objects: RateLimiter por IP + Stats. Log via ctx.waitUntil, fora do caminho crítico.",
    tags: ["−94% malicioso", "0ms latência", "$0 free tier", "Durable Objects"],
  },
  realscan: {
    name: "RealScan",
    sub: "Cloudflare Worker · borda",
    desc: "Worker irmão do Sentinel: scanner externo de postura de segurança (headers, SPF/DMARC/DNSSEC, segredos expostos no client-side) com guarda anti-SSRF que bloqueia faixas privadas/reservadas (RFC1918).",
    tags: ["DoH 1.1.1.1", "SSRF-guard", "headers audit"],
  },
  caddy: {
    name: "Caddy 2",
    sub: "edge-1 · reverse proxy",
    desc: "Reverse proxy no VPS edge-1 com TLS automático (ACME, sem cron de renovação). Aplica headers de segurança em toda resposta e faz health-check ativo do upstream.",
    tags: ["auto-TLS", "HSTS · CSP · XFO", "/healthz 10s", "round_robin"],
  },
  api: {
    name: "API",
    sub: "edge-1 · docker :8080",
    desc: "Container Docker endurecido: rootfs read-only, usuário não-root (uid 10001), todas as capabilities removidas (cap_drop ALL), no-new-privileges e tmpfs. Imagem versionada por SHA no ghcr.",
    tags: ["uid 10001", "ro-rootfs", "cap_drop ALL", "0.5cpu / 256M"],
  },
  postgres: {
    name: "Postgres",
    sub: "self-hosted · docker",
    desc: "Banco relacional primário, self-hosted em Docker com volume persistente, WAL e autovacuum.",
    tags: ["volume pg_data", "WAL", "autovacuum"],
  },
  redis: {
    name: "Redis",
    sub: "self-hosted · docker",
    desc: "Cache e pub/sub, self-hosted em Docker com volume persistente e limite de memória.",
    tags: ["volume redis_data", "pub/sub", "maxmemory 256mb"],
  },
  tailscale: {
    name: "Tailscale",
    sub: "malha mTLS · WireGuard",
    desc: "Malha privada WireGuard com mTLS conectando as máquinas (arch-ws · macOS · edge-1). O SSH de deploy só trafega pelo tailnet — a porta 22 nunca fica exposta na internet.",
    tags: ["WireGuard mTLS", "3 peers", "ssh-only", "sem :22 público"],
  },
}

const ORDER = ["internet", "sentinel", "realscan", "caddy", "api", "postgres", "redis", "tailscale"]

function Inspector({ id, reduce }: { id: string; reduce: boolean | null }) {
  const node = NODES[id]
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
          <span className="font-mono text-sm font-medium text-foreground">{node.name}</span>
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
  const reduce = useReducedMotion()
  const [selected, setSelected] = useState("sentinel")

  return (
    <section
      id="control-room"
      aria-labelledby="control-room-heading"
      className="relative border-t border-border py-14 md:py-16"
    >
      <SectionHeading
        index="04"
        title="Sala de Controle"
        description="Topologia da minha infra de edge-security — da borda até a origem. Arraste pra girar; clique num nó pra inspecionar o que ele faz, como está endurecido e os números reais."
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
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">Sistema saudável</span>
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">· monteirotf.com</span>
        <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
          uptime 99.98% · malicious −94%
        </span>
      </div>

      {/* canvas WebGL — full-bleed, sem borda */}
      <div className="relative h-[58svh] min-h-[420px] w-full" aria-hidden="true">
        <ControlRoomScene selected={selected} onSelect={setSelected} reduce={!!reduce} />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(120% 80% at 50% 45%, transparent 55%, #030303 100%)" }}
        />
      </div>

      {/* legenda navegável (teclado / leitor de tela) — controla a mesma seleção */}
      <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Nós da topologia">
        {ORDER.map((id) => {
          const active = selected === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelected(id)}
              className={`rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors ${
                active
                  ? "border-foreground/50 bg-foreground/[0.05] text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {NODES[id].name}
            </button>
          )
        })}
      </div>

      {/* inspector */}
      <div className="mt-4 border-t border-border pt-4">
        <Inspector id={selected} reduce={reduce} />
      </div>
    </section>
  )
}
