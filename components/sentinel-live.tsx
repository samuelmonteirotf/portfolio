"use client"

import { useEffect, useRef, useState, type RefObject } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useLanguage } from "@/components/language"
import {
  checkMe,
  fetchStats,
  reasonKey,
  reasonLabel,
  topReasons,
  SENTINEL_URL,
  type CheckResult,
  type LiveVerdict,
  type StatsSnapshot,
} from "@/lib/sentinel-live"

/* Telemetria real do Sentinel dentro da Sala de Controle. Nada aqui é
 * mockado: os números vêm do Durable Object de estatísticas em produção e o
 * botão pontua a requisição do próprio visitante. Só busca com a seção na
 * tela (e repete a cada 20s enquanto ela estiver visível). */

const POLL_MS = 20000

export const VERDICT_COLORS: Record<LiveVerdict, string> = {
  ALLOW: "#10b981",
  CHALLENGE: "#f59e0b",
  BLOCK: "#ef4444",
  RATE_LIMITED: "#f97316",
}

const T = {
  pt: {
    title: "Tráfego real",
    evaluated: "requisições avaliadas",
    since: "desde",
    updated: (s: number) => (s < 5 ? "agora" : `há ${s}s`),
    verdicts: { ALLOW: "liberadas", CHALLENGE: "desafiadas", BLOCK: "bloqueadas", RATE_LIMITED: "rate limit" },
    top: "o que mais pega",
    me: "Pontuar minha requisição",
    meAgain: "Pontuar de novo",
    meLoading: "consultando a edge…",
    meVerdict: { ALLOW: "liberada", CHALLENGE: "desafiada", BLOCK: "bloqueada", RATE_LIMITED: "limitada" },
    meClean: "Nenhum sinal suspeito: seu navegador manda tudo que um navegador de verdade manda.",
    meFail: "O Sentinel não respondeu a esta origem agora. O painel acima segue valendo.",
    privacy: "Sua requisição entra nas estatísticas públicas do Sentinel, com o IP truncado.",
    via: "via",
    offline: "Telemetria indisponível agora.",
  },
  en: {
    title: "Real traffic",
    evaluated: "requests evaluated",
    since: "since",
    updated: (s: number) => (s < 5 ? "just now" : `${s}s ago`),
    verdicts: { ALLOW: "allowed", CHALLENGE: "challenged", BLOCK: "blocked", RATE_LIMITED: "rate limited" },
    top: "most common catches",
    me: "Score my request",
    meAgain: "Score again",
    meLoading: "asking the edge…",
    meVerdict: { ALLOW: "allowed", CHALLENGE: "challenged", BLOCK: "blocked", RATE_LIMITED: "rate limited" },
    meClean: "No suspicious signal: your browser sends everything a real browser sends.",
    meFail: "Sentinel did not answer this origin right now. The panel above still stands.",
    privacy: "Your request joins Sentinel's public stats, with the IP truncated.",
    via: "via",
    offline: "Telemetry unavailable right now.",
  },
}

export type LiveState = { status: "idle" | "ok" | "error"; data: StatsSnapshot | null; at: number }

/* busca /api/stats enquanto `ref` estiver visível */
export function useSentinelStats(ref: RefObject<HTMLElement | null>, enabled: boolean): LiveState {
  const [state, setState] = useState<LiveState>({ status: "idle", data: null, at: 0 })
  useEffect(() => {
    const el = ref.current
    if (!enabled || !el) return
    let timer = 0
    let ctrl: AbortController | null = null
    const load = () => {
      ctrl?.abort()
      ctrl = new AbortController()
      fetchStats(ctrl.signal)
        .then((data) => setState({ status: "ok", data, at: Date.now() }))
        .catch((e) => {
          if (e?.name !== "AbortError") setState((s) => ({ ...s, status: s.data ? "ok" : "error" }))
        })
    }
    const io = new IntersectionObserver(
      (es) => {
        window.clearInterval(timer)
        if (es[es.length - 1].isIntersecting) {
          load()
          timer = window.setInterval(load, POLL_MS)
        }
      },
      { rootMargin: "200px" },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      window.clearInterval(timer)
      ctrl?.abort()
    }
  }, [ref, enabled])
  return state
}

function Ago({ at, fmt }: { at: number; fmt: (s: number) => string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])
  return <>{fmt(Math.max(0, Math.round((now - at) / 1000)))}</>
}

export function SentinelLive({ live }: { live: LiveState }) {
  const { lang } = useLanguage()
  const t = T[lang]
  const reduce = useReducedMotion()
  const nf = new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US")
  const [me, setMe] = useState<{ status: "idle" | "loading" | "ok" | "error"; res?: CheckResult }>({ status: "idle" })
  const meCtrl = useRef<AbortController | null>(null)

  useEffect(() => () => meCtrl.current?.abort(), [])

  const scoreMe = () => {
    meCtrl.current?.abort()
    meCtrl.current = new AbortController()
    setMe({ status: "loading" })
    checkMe(meCtrl.current.signal)
      .then((res) => setMe({ status: "ok", res }))
      .catch((e) => {
        if (e?.name !== "AbortError") setMe({ status: "error" })
      })
  }

  if (live.status === "error") return <p className="mt-6 font-mono text-[11px] text-muted-foreground">{t.offline}</p>
  if (!live.data) return <div className="mt-6 h-40" aria-hidden="true" />

  const tot = live.data.totals
  const order: LiveVerdict[] = ["ALLOW", "CHALLENGE", "BLOCK", "RATE_LIMITED"]
  const reasons = topReasons(tot.reasons, 5)
  const maxR = reasons[0]?.count ?? 1
  const since = new Date(tot.since).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", { day: "numeric", month: "short", year: "numeric" })

  return (
    <div className="mt-6 rounded-md border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">{t.title}</span>
        <a href={SENTINEL_URL} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-muted-foreground hover:text-mode">
          sentinel.monteirotf.com ↗
        </a>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          <Ago at={live.at} fmt={t.updated} />
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
        <span className="font-mono text-3xl font-semibold tabular-nums text-foreground">{nf.format(tot.total)}</span>
        <span className="text-sm text-muted-foreground">
          {t.evaluated} · {t.since} {since}
        </span>
      </div>

      {/* barra empilhada por veredito */}
      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-secondary" role="img" aria-label={order.map((v) => `${t.verdicts[v]} ${tot[v]}`).join(", ")}>
        {order.map((v) => (
          <motion.div
            key={v}
            style={{ background: VERDICT_COLORS[v] }}
            initial={false}
            animate={{ width: `${(tot[v] / Math.max(1, tot.total)) * 100}%` }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 22 }}
          />
        ))}
      </div>
      <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
        {order.map((v) => (
          <div key={v} className="flex items-baseline gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: VERDICT_COLORS[v] }} aria-hidden="true" />
            <dt className="text-xs text-muted-foreground">{t.verdicts[v]}</dt>
            <dd className="ml-auto font-mono text-xs tabular-nums text-foreground sm:ml-0">{nf.format(tot[v])}</dd>
          </div>
        ))}
      </dl>

      {reasons.length ? (
        <div className="mt-5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t.top}</span>
          <ul className="mt-2 space-y-1.5">
            {reasons.map((r) => (
              <li key={r.key} className="grid grid-cols-[minmax(0,13rem)_1fr_auto] items-center gap-3 text-xs">
                <span className="truncate text-foreground/85">{reasonLabel(r.key, lang)}</span>
                <span className="h-1 rounded-full bg-secondary">
                  <span className="block h-full rounded-full bg-mode/70" style={{ width: `${(r.count / maxR) * 100}%` }} />
                </span>
                <span className="font-mono tabular-nums text-muted-foreground">{nf.format(r.count)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* a requisição do próprio visitante, pontuada pela edge de verdade */}
      <div className="mt-5 border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={scoreMe}
            disabled={me.status === "loading"}
            className="rounded-full border border-mode/50 bg-mode/10 px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors outline-none hover:bg-mode/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mode disabled:opacity-60"
          >
            {me.status === "loading" ? t.meLoading : me.status === "ok" ? t.meAgain : t.me}
          </button>
          <span className="text-[11px] text-muted-foreground">{t.privacy}</span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {me.status === "ok" && me.res ? (
            <motion.div
              key={`${me.res.verdict}-${me.res.score}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 font-mono text-xs"
              aria-live="polite"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-2xl font-semibold tabular-nums" style={{ color: VERDICT_COLORS[me.res.verdict] }}>
                  {me.res.score}
                </span>
                <span className="uppercase tracking-[0.2em]" style={{ color: VERDICT_COLORS[me.res.verdict] }}>
                  {t.meVerdict[me.res.verdict]}
                </span>
                {me.res.signals ? (
                  <span className="text-muted-foreground">
                    {t.via} {[me.res.signals.httpProtocol, me.res.signals.tlsVersion, me.res.signals.country].filter(Boolean).join(" · ")}
                  </span>
                ) : null}
              </div>
              {me.res.reasons.length === 0 ? (
                <p className="mt-1.5 font-sans text-muted-foreground">{t.meClean}</p>
              ) : (
                <ul className="mt-1.5 space-y-0.5 text-muted-foreground">
                  {me.res.reasons.map((r) => (
                    <li key={r.reason}>
                      +{r.points} {reasonKey(r.reason) === "other" ? r.reason : reasonLabel(reasonKey(r.reason), lang)}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ) : me.status === "error" ? (
            <motion.p key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-xs text-muted-foreground">
              {t.meFail}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
