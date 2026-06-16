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
    sub: "inbound traffic",
    desc: "Real users and bots arrive here. Most of the traffic is malicious (scrapers, datacenter requests) and is dropped at the edge before hitting the origin.",
    tags: ["~80% bots", "filtered at edge"],
  },
  sentinel: {
    name: "Sentinel",
    sub: "Cloudflare Worker · edge",
    desc: "Edge bot-firewall. Scores each request (User-Agent · Accept-Language · HTTP version · TLS · ASN) and decides before hitting the origin: blocks (≥80), challenges (≥60) or allows. Durable Objects: RateLimiter per IP + Stats. Logged via ctx.waitUntil, outside the critical path.",
    tags: ["−94% malicious", "0ms latency", "$0 free tier", "Durable Objects"],
  },
  realscan: {
    name: "RealScan",
    sub: "Cloudflare Worker · edge",
    desc: "Sentinel's sibling worker: external security posture scanner (headers, SPF/DMARC/DNSSEC, exposed client-side secrets) with anti-SSRF guard that blocks private/reserved ranges (RFC1918).",
    tags: ["DoH 1.1.1.1", "SSRF-guard", "headers audit"],
  },
  caddy: {
    name: "Caddy 2",
    sub: "edge-1 · reverse proxy",
    desc: "Reverse proxy on the edge-1 VPS with automated TLS (ACME, no renewal cron). Enforces security headers on every response and performs active upstream health-checks.",
    tags: ["auto-TLS", "HSTS · CSP · XFO", "/healthz 10s", "round_robin"],
  },
  api: {
    name: "API",
    sub: "edge-1 · docker :8080",
    desc: "Hardened Docker container: read-only rootfs, non-root user (uid 10001), all capabilities dropped (cap_drop ALL), no-new-privileges, and tmpfs. SHA-versioned image on ghcr.",
    tags: ["uid 10001", "ro-rootfs", "cap_drop ALL", "0.5cpu / 256M"],
  },
  postgres: {
    name: "Postgres",
    sub: "self-hosted · docker",
    desc: "Primary relational database, self-hosted in Docker with persistent volume, WAL, and autovacuum.",
    tags: ["volume pg_data", "WAL", "autovacuum"],
  },
  redis: {
    name: "Redis",
    sub: "self-hosted · docker",
    desc: "Cache and pub/sub, self-hosted in Docker with persistent volume and memory limit.",
    tags: ["volume redis_data", "pub/sub", "maxmemory 256mb"],
  },
  tailscale: {
    name: "Tailscale",
    sub: "mTLS mesh · WireGuard",
    desc: "Private WireGuard mesh with mTLS connecting the machines (arch-ws · macOS · edge-1). Deployment SSH only travels through the tailnet — port 22 is never exposed to the public internet.",
    tags: ["WireGuard mTLS", "3 peers", "ssh-only", "no public :22"],
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
        title="Control Room"
        description="My edge-security infrastructure topology — from the edge to the origin. Drag to rotate; click on a node to inspect what it does, how it's hardened, and real metrics."
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
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">System healthy</span>
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
      <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Topology nodes">
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
