"use client"

import { useMemo, useState } from "react"
import { useLanguage } from "@/components/language"
import { DemoShell } from "@/components/demos/demo-shell"
import { orbPulseMode } from "@/lib/orb-bus"

/* Mini Monte Carlo de estratégia, no navegador: o mesmo tipo de pergunta que
 * a engine da TessTrade responde em Rust com dados reais ("com essa taxa de
 * acerto e esse payoff, qual a distribuição de resultados e de drawdown?"),
 * aqui em escala de brinquedo. RNG com semente → SSR e cliente batem. */

const TRADES = 250
const PATHS = 400
const W = 640
const H = 220
const PAD = { l: 8, r: 8, t: 10, b: 10 }

function mulberry32(a: number) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function simulate(winRate: number, payoff: number, risk: number, seed: number) {
  const rnd = mulberry32(seed)
  const paths: Float32Array[] = []
  const maxDD: number[] = []
  for (let p = 0; p < PATHS; p++) {
    const eq = new Float32Array(TRADES + 1)
    let e = 100, peak = 100, dd = 0
    eq[0] = e
    for (let i = 1; i <= TRADES; i++) {
      e *= rnd() < winRate ? 1 + risk * payoff : 1 - risk
      eq[i] = e
      if (e > peak) peak = e
      dd = Math.max(dd, 1 - e / peak)
    }
    paths.push(eq)
    maxDD.push(dd)
  }
  // percentis por passo
  const qs = [0.05, 0.25, 0.5, 0.75, 0.95]
  const bands = qs.map(() => new Float32Array(TRADES + 1))
  const col = new Float32Array(PATHS)
  for (let i = 0; i <= TRADES; i++) {
    for (let p = 0; p < PATHS; p++) col[p] = paths[p][i]
    col.sort()
    qs.forEach((q, k) => (bands[k][i] = col[Math.min(PATHS - 1, Math.floor(q * PATHS))]))
  }
  const finals = paths.map((p) => p[TRADES])
  return {
    samples: paths.slice(0, 14),
    bands,
    medianFinal: bands[2][TRADES],
    pProfit: finals.filter((f) => f > 100).length / PATHS,
    pDeepDD: maxDD.filter((d) => d >= 0.3).length / PATHS,
  }
}

const T = {
  pt: {
    title: "Monte Carlo · estratégia",
    source: "400 cenários × 250 trades, no seu navegador",
    winRate: "Taxa de acerto",
    payoff: "Payoff (ganho/perda)",
    risk: "Risco por trade",
    rerun: "Sortear de novo",
    expectancy: "expectativa por trade",
    median: "capital final (mediana)",
    profit: "cenários no lucro",
    deep: "chance de drawdown ≥ 30%",
    note: "Na TessTrade, isso roda na engine em Rust, multithread, sobre séries históricas reais.",
  },
  en: {
    title: "Monte Carlo · strategy",
    source: "400 scenarios × 250 trades, in your browser",
    winRate: "Win rate",
    payoff: "Payoff (win/loss)",
    risk: "Risk per trade",
    rerun: "Resample",
    expectancy: "expectancy per trade",
    median: "final equity (median)",
    profit: "profitable scenarios",
    deep: "chance of drawdown ≥ 30%",
    note: "At TessTrade this runs on the multithreaded Rust engine, over real historical series.",
  },
}

function Slider({ label, value, display, min, max, step, onChange }: { label: string; value: number; display: string; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
        <span className="tabular-nums text-foreground">{display}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[var(--mode)]" />
    </label>
  )
}

export function BacktestDemo() {
  const { lang } = useLanguage()
  const t = T[lang]
  const [winRate, setWinRate] = useState(0.42)
  const [payoff, setPayoff] = useState(1.8)
  const [risk, setRisk] = useState(0.01)
  const [seed, setSeed] = useState(7)
  const sim = useMemo(() => simulate(winRate, payoff, risk, seed), [winRate, payoff, risk, seed])

  const lo = Math.min(100, sim.bands[0].reduce((m, v) => Math.min(m, v), Infinity))
  const hi = Math.max(100, sim.bands[4].reduce((m, v) => Math.max(m, v), -Infinity))
  const x = (i: number) => PAD.l + (i / TRADES) * (W - PAD.l - PAD.r)
  const y = (v: number) => PAD.t + (1 - (v - lo) / (hi - lo || 1)) * (H - PAD.t - PAD.b)
  const line = (a: ArrayLike<number>) => {
    let d = ""
    for (let i = 0; i <= TRADES; i += 2) d += `${i ? "L" : "M"}${x(i).toFixed(1)},${y(a[i]).toFixed(1)}`
    return d
  }
  const area = (top: ArrayLike<number>, bot: ArrayLike<number>) => {
    let d = ""
    for (let i = 0; i <= TRADES; i += 2) d += `${i ? "L" : "M"}${x(i).toFixed(1)},${y(top[i]).toFixed(1)}`
    for (let i = TRADES; i >= 0; i -= 2) d += `L${x(i).toFixed(1)},${y(bot[i]).toFixed(1)}`
    return d + "Z"
  }
  const expectancy = winRate * payoff - (1 - winRate)
  const pct = (v: number) => `${Math.round(v * 100)}%`
  const fmtPct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`

  return (
    <DemoShell title={t.title} source={t.source}>
      <div className="grid gap-5 md:grid-cols-[13rem_1fr]">
        <div className="space-y-3.5">
          <Slider label={t.winRate} value={winRate} display={pct(winRate)} min={0.25} max={0.7} step={0.01} onChange={setWinRate} />
          <Slider label={t.payoff} value={payoff} display={`${payoff.toFixed(1)}R`} min={0.6} max={3.5} step={0.1} onChange={setPayoff} />
          <Slider label={t.risk} value={risk} display={fmtPct(risk)} min={0.0025} max={0.04} step={0.0025} onChange={setRisk} />
          <button
            type="button"
            onClick={() => {
              setSeed((s) => s + 1)
              orbPulseMode(0.8)
            }}
            className="rounded-full border border-border px-3 py-1 text-xs text-foreground transition-colors hover:border-mode/60 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mode"
          >
            {t.rerun}
          </button>
        </div>

        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${t.median}: ${sim.medianFinal.toFixed(0)}`}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(100)} y2={y(100)} stroke="currentColor" className="text-border" strokeDasharray="3 4" />
            <path d={area(sim.bands[4], sim.bands[0])} fill="var(--mode)" opacity={0.1} />
            <path d={area(sim.bands[3], sim.bands[1])} fill="var(--mode)" opacity={0.18} />
            {sim.samples.map((p, i) => (
              <path key={i} d={line(p)} fill="none" stroke="var(--mode)" strokeWidth={0.8} opacity={0.28} />
            ))}
            <path d={line(sim.bands[2])} fill="none" stroke="var(--mode)" strokeWidth={2} />
          </svg>
          <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded border border-border bg-border sm:grid-cols-4">
            {[
              { k: t.expectancy, v: `${expectancy >= 0 ? "+" : ""}${expectancy.toFixed(2)}R`, bad: expectancy < 0 },
              { k: t.median, v: `${sim.medianFinal >= 100 ? "+" : ""}${(sim.medianFinal - 100).toFixed(0)}%`, bad: sim.medianFinal < 100 },
              { k: t.profit, v: pct(sim.pProfit), bad: sim.pProfit < 0.5 },
              { k: t.deep, v: pct(sim.pDeepDD), bad: sim.pDeepDD > 0.25 },
            ].map((s) => (
              <div key={s.k} className="flex flex-col-reverse bg-card px-3 py-2">
                <dt className="mt-0.5 text-[10.5px] leading-tight text-muted-foreground">{s.k}</dt>
                <dd className="font-mono text-sm font-semibold tabular-nums" style={{ color: s.bad ? "#ef4444" : undefined }}>
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">{t.note}</p>
        </div>
      </div>
    </DemoShell>
  )
}
