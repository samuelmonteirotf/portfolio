"use client"

import { useEffect, useRef, useState } from "react"
import { useLanguage } from "@/components/language"
import { DemoShell } from "@/components/demos/demo-shell"
import { orbPulse } from "@/lib/orb-bus"

/* Token bucket do Aegis ao vivo. A regra é a do .env.example do repositório
 * (AEGIS_ROUTE_LIMITS=/api=10:20 → 10 req/s sustentadas, rajada de 20) e o
 * algoritmo é o de limiter.rs: recarga preguiçosa no acesso,
 * tokens = min(cap, tokens + elapsed * rate), passa se tokens >= 1. */

const RATE = 10
const CAPACITY = 20
const RETRY_AFTER = Math.max(1, Math.ceil(1 / RATE))
const LOG_MAX = 7

type Entry = { id: number; t: number; ok: boolean }

const T = {
  pt: {
    title: "Token bucket · Aegis",
    source: "limiter.rs · regra /api=10:20",
    one: "1 requisição",
    burst: "Rajada de 30",
    abuse: "Cliente abusivo (40 req/s)",
    stop: "Parar abuso",
    tokens: "tokens no balde",
    passed: "repassadas",
    limited: "limitadas",
    idle: "Dispare requisições contra GET /api/orders.",
  },
  en: {
    title: "Token bucket · Aegis",
    source: "limiter.rs · rule /api=10:20",
    one: "1 request",
    burst: "Burst of 30",
    abuse: "Abusive client (40 req/s)",
    stop: "Stop abuse",
    tokens: "tokens in bucket",
    passed: "forwarded",
    limited: "limited",
    idle: "Fire requests at GET /api/orders.",
  },
}

export function AegisDemo() {
  const { lang } = useLanguage()
  const t = T[lang]
  const bucket = useRef({ tokens: CAPACITY, last: 0 })
  const queue = useRef<number[]>([])
  const abuseNext = useRef(0)
  const seq = useRef(0)
  const t0 = useRef(0)
  const [abuse, setAbuse] = useState(false)
  const abuseRef = useRef(false)
  const [view, setView] = useState({ tokens: CAPACITY, passed: 0, limited: 0, log: [] as Entry[] })
  const counts = useRef({ passed: 0, limited: 0, log: [] as Entry[] })
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    abuseRef.current = abuse
    if (abuse) abuseNext.current = performance.now()
  }, [abuse])

  useEffect(() => {
    t0.current = performance.now()
    bucket.current.last = t0.current
    let raf = 0
    let visible = false
    let lastPaint = 0
    let lastPulse = 0

    const check = (now: number) => {
      const b = bucket.current
      const elapsed = Math.max(0, now - b.last) / 1000
      b.tokens = Math.min(CAPACITY, b.tokens + elapsed * RATE)
      b.last = now
      const ok = b.tokens >= 1
      if (ok) b.tokens -= 1
      const c = counts.current
      if (ok) c.passed++
      else {
        c.limited++
        // cada 429 empurra a esfera (limitado a ~5/s para não virar estroboscópio)
        if (now - lastPulse > 180) {
          lastPulse = now
          orbPulse("#ef4444", 0.45)
        }
      }
      c.log = [{ id: seq.current++, t: now - t0.current, ok }, ...c.log].slice(0, LOG_MAX)
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (abuseRef.current) {
        while (abuseNext.current <= now) {
          queue.current.push(abuseNext.current)
          abuseNext.current += 25
        }
      }
      queue.current.sort((a, b) => a - b)
      while (queue.current.length && queue.current[0] <= now) check(queue.current.shift()!)
      if (now - lastPaint > 33) {
        lastPaint = now
        // leitura sem consumir: mostra a recarga acontecendo em tempo real
        const b = bucket.current
        const shown = Math.min(CAPACITY, b.tokens + (Math.max(0, now - b.last) / 1000) * RATE)
        const c = counts.current
        setView({ tokens: shown, passed: c.passed, limited: c.limited, log: c.log })
      }
    }
    const io = new IntersectionObserver((es) => {
      const v = es[es.length - 1].isIntersecting
      if (v === visible) return
      visible = v
      if (v) raf = requestAnimationFrame(loop)
      else {
        cancelAnimationFrame(raf)
        abuseRef.current = false
        setAbuse(false)
      }
    })
    if (wrap.current) io.observe(wrap.current)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [])

  const fire = (n: number, spacing: number) => {
    const now = performance.now()
    for (let i = 0; i < n; i++) queue.current.push(now + i * spacing)
  }

  const cells = Array.from({ length: CAPACITY }, (_, i) => Math.max(0, Math.min(1, view.tokens - i)))

  return (
    <DemoShell title={t.title} source={t.source}>
      <div ref={wrap} className="grid gap-5 md:grid-cols-[1fr_16rem]">
        <div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => fire(1, 0)}
              className="rounded-full border border-border px-3 py-1 text-xs text-foreground transition-colors hover:border-mode/60 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mode"
            >
              {t.one}
            </button>
            <button
              type="button"
              onClick={() => fire(30, 12)}
              className="rounded-full border border-border px-3 py-1 text-xs text-foreground transition-colors hover:border-mode/60 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mode"
            >
              {t.burst}
            </button>
            <button
              type="button"
              aria-pressed={abuse}
              onClick={() => setAbuse((a) => !a)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mode ${
                abuse ? "border-[#ef4444]/70 bg-[#ef4444]/10 text-foreground" : "border-border text-foreground hover:border-mode/60"
              }`}
            >
              {abuse ? t.stop : t.abuse}
            </button>
          </div>

          {/* o balde: 20 células, a última parcial mostra a recarga contínua */}
          <div className="mt-4 grid grid-cols-10 gap-1" role="img" aria-label={`${Math.floor(view.tokens)} / ${CAPACITY} ${t.tokens}`}>
            {cells.map((f, i) => (
              <div key={i} className="relative h-5 overflow-hidden rounded-sm border border-border bg-secondary">
                <div className="absolute inset-x-0 bottom-0 bg-mode" style={{ height: `${f * 100}%`, opacity: 0.35 + f * 0.55 }} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-1 font-mono text-[11px]">
            <span className="text-muted-foreground">
              <span className="tabular-nums text-foreground">{view.tokens.toFixed(1)}</span> / {CAPACITY} {t.tokens}
            </span>
            <span className="text-muted-foreground">
              <span className="tabular-nums text-[#10b981]">{view.passed}</span> {t.passed}
            </span>
            <span className="text-muted-foreground">
              <span className="tabular-nums text-[#ef4444]">{view.limited}</span> {t.limited}
            </span>
          </div>
        </div>

        {/* log de respostas, mais recente em cima */}
        <ol className="min-h-[9.5rem] rounded border border-border bg-card p-2.5 font-mono text-[10.5px] leading-[1.55]" aria-live="off">
          {view.log.length === 0 ? (
            <li className="text-muted-foreground">{t.idle}</li>
          ) : (
            view.log.map((e) => (
              <li key={e.id} className="flex gap-2 whitespace-nowrap">
                <span className="w-12 shrink-0 text-right tabular-nums text-muted-foreground">{(e.t / 1000).toFixed(2)}s</span>
                {e.ok ? (
                  <span className="text-[#10b981]">200 → upstream</span>
                ) : (
                  <span className="text-[#ef4444]">
                    429 <span className="text-muted-foreground">retry-after: {RETRY_AFTER}</span>
                  </span>
                )}
              </li>
            ))
          )}
        </ol>
      </div>
    </DemoShell>
  )
}
