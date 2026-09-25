"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useLanguage } from "@/components/language"
import { Chip, DemoShell } from "@/components/demos/demo-shell"
import { orbPulse } from "@/lib/orb-bus"
import { scoreRequest, verdictFor, reasonText, THRESHOLDS, type SimRequest, type Verdict } from "@/lib/sentinel-score"

/* Simulador do Sentinel: o visitante monta uma requisição (ou escolhe um
 * perfil pronto) e vê a pontuação e o veredito calculados pela MESMA função
 * de score do Worker em produção (lib/sentinel-score.ts). */

const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
const ALL_HEADERS = { accept: true, acceptLanguage: true, acceptEncoding: true, secChUa: true, secFetch: true }
const NO_HEADERS = { accept: false, acceptLanguage: false, acceptEncoding: false, secChUa: false, secFetch: false }

const RESIDENTIAL = "Claro NXT Telecomunicacoes"
const DATACENTER = "Hetzner Online GmbH"

type PresetKey = "human" | "curl" | "python" | "spoofed" | "headless"
const PRESETS: Record<PresetKey, SimRequest> = {
  human: { ua: CHROME_UA, headers: ALL_HEADERS, httpProtocol: "HTTP/2", tlsVersion: "TLSv1.3", asOrganization: RESIDENTIAL, threatScore: 0 },
  curl: { ua: "curl/8.7.1", headers: { ...NO_HEADERS, accept: true }, httpProtocol: "HTTP/1.1", tlsVersion: "TLSv1.3", asOrganization: RESIDENTIAL, threatScore: 0 },
  python: { ua: "python-requests/2.32.3", headers: { ...NO_HEADERS, accept: true, acceptEncoding: true }, httpProtocol: "HTTP/1.1", tlsVersion: "TLSv1.2", asOrganization: DATACENTER, threatScore: 0 },
  spoofed: { ua: CHROME_UA, headers: { ...NO_HEADERS, accept: true, acceptEncoding: true }, httpProtocol: "HTTP/1.1", tlsVersion: "TLSv1.2", asOrganization: RESIDENTIAL, threatScore: 0 },
  headless: { ua: CHROME_UA, headers: { ...ALL_HEADERS, secFetch: false }, httpProtocol: "HTTP/2", tlsVersion: "TLSv1.3", asOrganization: DATACENTER, threatScore: 14 },
}

const T = {
  pt: {
    title: "Simulador · Sentinel",
    source: "mesma função de score do Worker",
    presets: { human: "Pessoa no Chrome", curl: "curl", python: "python-requests", spoofed: "UA do Chrome forjado", headless: "Chrome headless em datacenter" },
    ua: "User-Agent",
    headers: "Headers enviados",
    transport: "Transporte",
    network: "Rede de origem (ASN)",
    residential: "residencial",
    datacenter: "datacenter",
    threat: "Threat score da Cloudflare",
    score: "pontuação",
    reasonsNone: "Nenhum sinal suspeito. Segue para a origem.",
    verdict: { ALLOW: "libera", CHALLENGE: "desafia", BLOCK: "bloqueia" },
  },
  en: {
    title: "Simulator · Sentinel",
    source: "same score function as the Worker",
    presets: { human: "Person on Chrome", curl: "curl", python: "python-requests", spoofed: "Spoofed Chrome UA", headless: "Headless Chrome in a datacenter" },
    ua: "User-Agent",
    headers: "Headers sent",
    transport: "Transport",
    network: "Source network (ASN)",
    residential: "residential",
    datacenter: "datacenter",
    threat: "Cloudflare threat score",
    score: "score",
    reasonsNone: "No suspicious signal. Forwarded to the origin.",
    verdict: { ALLOW: "allow", CHALLENGE: "challenge", BLOCK: "block" },
  },
}

const VERDICT_COLOR: Record<Verdict, string> = { ALLOW: "#10b981", CHALLENGE: "#f59e0b", BLOCK: "#ef4444" }
const HTTP_CODE: Record<Verdict, string> = { ALLOW: "200 → origin", CHALLENGE: "403 · managed challenge", BLOCK: "403 Forbidden" }

function Segmented<V extends string>({ value, options, onChange }: { value: V; options: { v: V; label: string }[]; onChange: (v: V) => void }) {
  return (
    <div className="inline-flex rounded border border-border p-0.5">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          aria-pressed={value === o.v}
          onClick={() => onChange(o.v)}
          className={`rounded-sm px-2 py-0.5 font-mono text-[11px] transition-colors outline-none focus-visible:outline-2 focus-visible:outline-mode ${
            value === o.v ? "bg-mode/15 text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function SentinelDemo() {
  const { lang } = useLanguage()
  const t = T[lang]
  const reduce = useReducedMotion()
  const [preset, setPreset] = useState<PresetKey | null>("spoofed")
  const [req, setReq] = useState<SimRequest>(PRESETS.spoofed)
  const { score, reasons } = useMemo(() => scoreRequest(req), [req])
  const verdict = verdictFor(score)
  const vColor = VERDICT_COLOR[verdict]

  // a esfera pisca na cor do veredito quando ele muda (não na montagem)
  const firstVerdict = useRef(true)
  useEffect(() => {
    if (firstVerdict.current) {
      firstVerdict.current = false
      return
    }
    orbPulse(VERDICT_COLOR[verdict], 0.9)
  }, [verdict])

  const edit = (patch: Partial<SimRequest>) => {
    setPreset(null)
    setReq((r) => ({ ...r, ...patch }))
  }
  const toggleHeader = (k: keyof SimRequest["headers"]) => edit({ headers: { ...req.headers, [k]: !req.headers[k] } })
  const isDc = req.asOrganization === DATACENTER

  return (
    <DemoShell title={t.title} source={t.source}>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="presets">
        {(Object.keys(PRESETS) as PresetKey[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={preset === k}
            onClick={() => {
              setPreset(k)
              setReq(PRESETS[k])
            }}
            className={`rounded-full border px-2.5 py-1 text-xs transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mode ${
              preset === k ? "border-mode/70 bg-mode/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.presets[k]}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-[1fr_15rem]">
        <div className="space-y-3.5 text-xs">
          <label className="block">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t.ua}</span>
            <input
              value={req.ua}
              onChange={(e) => edit({ ua: e.target.value })}
              spellCheck={false}
              className="w-full rounded border border-border bg-card px-2.5 py-1.5 font-mono text-[11px] text-foreground outline-none focus:border-mode/60"
            />
          </label>
          <div>
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t.headers}</span>
            <div className="flex flex-wrap gap-1.5">
              <Chip on={req.headers.accept} onClick={() => toggleHeader("accept")}>Accept</Chip>
              <Chip on={req.headers.acceptLanguage} onClick={() => toggleHeader("acceptLanguage")}>Accept-Language</Chip>
              <Chip on={req.headers.acceptEncoding} onClick={() => toggleHeader("acceptEncoding")}>Accept-Encoding</Chip>
              <Chip on={req.headers.secChUa} onClick={() => toggleHeader("secChUa")}>Sec-CH-UA</Chip>
              <Chip on={req.headers.secFetch} onClick={() => toggleHeader("secFetch")}>Sec-Fetch-*</Chip>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            <div>
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t.transport}</span>
              <div className="flex flex-wrap gap-1.5">
                <Segmented
                  value={req.httpProtocol}
                  onChange={(v) => edit({ httpProtocol: v })}
                  options={[{ v: "HTTP/1.1", label: "h1.1" }, { v: "HTTP/2", label: "h2" }, { v: "HTTP/3", label: "h3" }]}
                />
                <Segmented
                  value={req.tlsVersion}
                  onChange={(v) => edit({ tlsVersion: v })}
                  options={[{ v: "TLSv1.1", label: "TLS 1.1" }, { v: "TLSv1.2", label: "1.2" }, { v: "TLSv1.3", label: "1.3" }]}
                />
              </div>
            </div>
            <div>
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t.network}</span>
              <Segmented
                value={isDc ? "dc" : "res"}
                onChange={(v) => edit({ asOrganization: v === "dc" ? DATACENTER : RESIDENTIAL })}
                options={[{ v: "res", label: t.residential }, { v: "dc", label: t.datacenter }]}
              />
            </div>
          </div>
          <label className="block max-w-xs">
            <span className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {t.threat}
              <span className="text-foreground">{req.threatScore}</span>
            </span>
            <input
              type="range"
              min={0}
              max={50}
              value={req.threatScore}
              onChange={(e) => edit({ threatScore: Number(e.target.value) })}
              className="w-full accent-[var(--mode)]"
            />
          </label>
        </div>

        {/* painel de veredito */}
        <div className="flex flex-col rounded border border-border bg-card p-3.5" aria-live="polite">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t.score}</span>
            <span className="font-mono text-3xl font-semibold tabular-nums" style={{ color: vColor, transition: "color 200ms" }}>
              {score}
            </span>
          </div>
          {/* régua 0–100 com as marcas dos limiares reais */}
          <div className="relative mt-2 h-1.5 rounded-full bg-secondary">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: vColor }}
              animate={{ width: `${score}%` }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 170, damping: 22 }}
            />
            {[THRESHOLDS.challengeAt, THRESHOLDS.blockAt].map((x) => (
              <span key={x} className="absolute -top-1 h-3.5 w-px bg-foreground/50" style={{ left: `${x}%` }} aria-hidden="true" />
            ))}
          </div>
          <div className="relative mt-1 h-3 font-mono text-[9px] text-muted-foreground" aria-hidden="true">
            <span className="absolute left-0">0</span>
            {[THRESHOLDS.challengeAt, THRESHOLDS.blockAt].map((x) => (
              <span key={x} className="absolute -translate-x-1/2" style={{ left: `${x}%` }}>
                {x}
              </span>
            ))}
            <span className="absolute right-0">100</span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={verdict}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="mt-3 rounded border px-2.5 py-2 text-center"
              style={{ borderColor: `${vColor}66`, background: `${vColor}14` }}
            >
              <div className="font-mono text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: vColor }}>
                {t.verdict[verdict]}
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{HTTP_CODE[verdict]}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <ul className="mt-4 space-y-1 border-t border-border pt-3 font-mono text-[11px]">
        {reasons.length === 0 ? (
          <li className="text-muted-foreground">{t.reasonsNone}</li>
        ) : (
          reasons.map((r) => (
            <li key={r.key} className="flex gap-3">
              <span className="w-8 shrink-0 text-right tabular-nums text-foreground">+{r.points}</span>
              <span className="text-muted-foreground">{reasonText(r, lang)}</span>
            </li>
          ))
        )}
      </ul>
    </DemoShell>
  )
}
