"use client"

import { useEffect, useRef } from "react"
import { usePillMode } from "@/components/pill-mode"
import type { ModeKey } from "@/lib/portfolio-data"

/* Campo de moléculas (Canvas 2D) em DOIS grupos com cor própria.
 *  · full-stack → um orbe AZUL à esquerda   · devops → um orbe VERMELHO à direita
 *  · all → Hollow Purple: grupo 0 forma azul e grupo 1 vermelho lado a lado,
 *          depois os dois deslizam pro CENTRO e fundem em ROXO.
 * Ao trocar de modo, tudo dispersa branco pela tela e reconverge. Motion por
 * lerp de 1ª ordem (sem momentum) → sem overshoot/pulso. */
const BLUE: RGB = [96, 156, 242]
const RED: RGB = [236, 92, 98]
const PURPLE: RGB = [150, 90, 235]
const COLORS: Record<ModeKey, RGB> = { fullstack: BLUE, devops: RED, all: PURPLE }
const COUNT = 4600
const DISPERSE_MS = 620 // fase branca espalhada
const MERGE_MS = 1380 // no modo all, quando os dois orbes começam a fundir

type RGB = [number, number, number]
type P = { x: number; y: number; ux: number; uy: number; uz: number; sz: number; hx: number; hy: number; grp: 0 | 1 }

export function HeroParticles() {
  const ref = useRef<HTMLCanvasElement>(null)
  const { mode } = usePillMode()
  const modeRef = useRef(mode)
  const burstRef = useRef(false)
  const prevMode = useRef<ModeKey | null>(null)

  useEffect(() => {
    modeRef.current = mode
    // compara com o modo anterior (não um boolean de mount): sob StrictMode o
    // efeito roda 2x com refs persistentes e um boolean dispararia burst à toa
    if (prevMode.current !== null && prevMode.current !== mode) burstRef.current = true
    prevMode.current = mode
  }, [mode])

  useEffect(() => {
    const canvas = ref.current!
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let w = 0, h = 0, dpr = 1

    // sprite branco base
    const S = 32
    const white = document.createElement("canvas"); white.width = white.height = S
    {
      const g = white.getContext("2d")!
      const rg = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
      rg.addColorStop(0, "rgba(255,255,255,1)"); rg.addColorStop(0.4, "rgba(255,255,255,0.5)"); rg.addColorStop(1, "rgba(255,255,255,0)")
      g.fillStyle = rg; g.fillRect(0, 0, S, S)
    }
    // dois sprites tintados (um por grupo)
    const makeTint = () => { const c = document.createElement("canvas"); c.width = c.height = S; return { c, x: c.getContext("2d")! } }
    const t0 = makeTint(), t1 = makeTint()
    function recolor(t: { c: HTMLCanvasElement; x: CanvasRenderingContext2D }, [r, g, b]: RGB) {
      t.x.globalCompositeOperation = "source-over"; t.x.clearRect(0, 0, S, S); t.x.drawImage(white, 0, 0)
      t.x.globalCompositeOperation = "source-in"; t.x.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`; t.x.fillRect(0, 0, S, S)
    }

    const ps: P[] = []
    function seed() {
      ps.length = 0
      for (let i = 0; i < COUNT; i++) {
        const u = Math.random() * 2 - 1
        const t = Math.random() * Math.PI * 2
        const rad = 0.16 + Math.random() * 0.84
        const sq = Math.sqrt(1 - u * u)
        ps.push({
          x: Math.random() * (w || 1200), y: Math.random() * (h || 800),
          ux: Math.cos(t) * sq * rad, uy: u * rad, uz: Math.sin(t) * sq * rad,
          sz: 0.55 + Math.random() * 0.95,
          hx: Math.random() * (w || 1200), hy: Math.random() * (h || 800),
          grp: (i % 2) as 0 | 1,
        })
      }
    }
    let running = true
    let resizedWhilePaused = false
    let remeasure: (() => void) | null = null // vira measure() depois do setup
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr)
      if (!ps.length) seed()
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = "#030303"; ctx.fillRect(0, 0, canvas.width, canvas.height)
      // com o loop pausado os alvos mudam mas ninguém converge — marca pra
      // assentar de uma vez na retomada, em vez de deslizar na frente do usuário
      if (!running) resizedWhilePaused = true
      remeasure?.()
    }
    resize()
    window.addEventListener("resize", resize)

    // cursor: as partículas se afastam do mouse (rastro/abertura)
    const mouse = { x: -1e4, y: -1e4, on: false }
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
      mouse.on = true
    }
    const onLeave = () => { mouse.on = false }
    window.addEventListener("mousemove", onMove)
    document.addEventListener("mouseleave", onLeave)

    // centros e cores correntes por grupo (lerpam até os alvos → glide da fusão)
    const gc: [number, number][] = [[0, 0], [0, 0]]
    const gcol: RGB[] = [[...RED] as RGB, [...RED] as RGB]
    const lastDc: RGB[] = [[-1, -1, -1], [-1, -1, -1]] // última cor aplicada nos sprites
    let formed = 0, first = true

    /* A esfera se encaixa no espaço LIVRE de verdade, medido no DOM — nunca
     * atrás de texto, em qualquer resolução. Um bloco de texto só restringe a
     * faixa vertical se a esfera cruzar a coluna dele HORIZONTALMENTE: no lado
     * sem texto ela usa a altura toda; no lado com texto, centro e raio se
     * ajustam à faixa entre identidade e console. Legendas seguem via CSS vars. */
    type BlockRect = { top: number; bottom: number; left: number; right: number } | null
    let topRect: BlockRect = null, botRect: BlockRect = null
    const header = canvas.closest("header")
    const clearTop = header?.querySelector("[data-orb-clear='top']") ?? null
    const clearBottom = header?.querySelector("[data-orb-clear='bottom']") ?? null

    const xsFor = (m: ModeKey, since: number): number[] => {
      const mob = w < 1024
      if (m === "fullstack") return [w * (mob ? 0.28 : 0.27)]
      if (m === "devops") return [w * (mob ? 0.72 : 0.73)]
      return since < MERGE_MS ? [w * 0.37, w * 0.63] : [w * 0.5]
    }

    function orbGeom(cxs: number[]): { cy: number; R: number } {
      const mob = w < 1024
      const baseR = Math.min(w, h) * (mob ? 0.15 : 0.125)
      const span = baseR * 1.15 // folga: partículas chegam a R + sprite
      const pad = h * 0.06
      let top = pad, bot = h - pad
      for (const cx of cxs) {
        if (topRect && cx + span > topRect.left && cx - span < topRect.right) top = Math.max(top, topRect.bottom)
        if (botRect && cx + span > botRect.left && cx - span < botRect.right) bot = Math.min(bot, botRect.top)
      }
      if (bot - top < 60) { top = pad; bot = h - pad } // salvaguarda: faixa degenerada
      const cy = (top + bot) / 2
      const R = Math.max(24, Math.min(baseR, (bot - top) / 2 / 1.15))
      return { cy, R }
    }

    function measure() {
      const cr = canvas.getBoundingClientRect()
      const rel = (el: Element): BlockRect => {
        const r = el.getBoundingClientRect()
        return { top: r.top - cr.top, bottom: r.bottom - cr.top, left: r.left - cr.left, right: r.right - cr.left }
      }
      topRect = clearTop ? rel(clearTop) : null
      botRect = clearBottom ? rel(clearBottom) : null
      // publica a geometria do modo ATUAL (posição final) pras legendas seguirem
      const { cy, R } = orbGeom(xsFor(modeRef.current, 99999))
      if (header instanceof HTMLElement) {
        header.style.setProperty("--orb-cy", `${Math.round(cy)}px`)
        header.style.setProperty("--orb-r", `${Math.round(R)}px`)
        // legenda: logo acima da borda das partículas (R * 1.15), sem invadir
        // o bloco de identidade (a própria faixa já respeita o topo)
        const captionY = Math.max(topRect ? topRect.bottom + 6 : h * 0.06, cy - R * 1.15 - 26)
        header.style.setProperty("--orb-caption-y", `${Math.round(captionY)}px`)
      }
    }

    // alvo de layout por modo/sub-fase
    function layout(m: ModeKey, since: number): { c: [number, number][]; col: RGB[]; R: number } {
      const cxs = xsFor(m, since)
      const { cy: cyM, R } = orbGeom(cxs)
      if (m === "fullstack") return { c: [[cxs[0], cyM], [cxs[0], cyM]], col: [BLUE, BLUE], R }
      if (m === "devops") return { c: [[cxs[0], cyM], [cxs[0], cyM]], col: [RED, RED], R }
      // all → split (dois orbes) e depois merge (centro, roxo)
      if (since < MERGE_MS) return { c: [[cxs[0], cyM], [cxs[1], cyM]], col: [BLUE, RED], R }
      return { c: [[cxs[0], cyM], [cxs[0], cyM]], col: [PURPLE, PURPLE], R }
    }

    measure()
    remeasure = measure
    // o console muda de altura quando a tagline troca de modo — re-mede sozinho
    const ro = new ResizeObserver(() => measure())
    if (clearTop) ro.observe(clearTop)
    if (clearBottom) ro.observe(clearBottom)
    ro.observe(canvas)

    let raf = 0, ang = 0, last = 0, sinceChange = 99999

    /* Aplica o estado final do modo atual de uma vez, sem animação: usado ao
     * retomar de pausa em que resize ou troca de modo aconteceu às cegas —
     * o usuário encontra a esfera já assentada, como se tivesse animado offscreen. */
    function snapToTarget() {
      burstRef.current = false
      sinceChange = 99999
      measure()
      const L = layout(modeRef.current, sinceChange)
      const ca = Math.cos(ang), sa = Math.sin(ang)
      formed = 1
      for (let g = 0; g < 2; g++) {
        gc[g][0] = L.c[g][0]; gc[g][1] = L.c[g][1]
        for (let k = 0; k < 3; k++) gcol[g][k] = L.col[g][k]
      }
      for (const p of ps) {
        const rx = p.ux * ca - p.uz * sa
        const c = gc[p.grp]
        p.x = c[0] + rx * L.R
        p.y = c[1] + p.uy * L.R
      }
    }

    function frame(now: number) {
      if (!running) return
      raf = requestAnimationFrame(frame)
      const dt = Math.min(50, now - last || 16); last = now
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      if (burstRef.current) {
        // reduced-motion: sem a fase de dispersão em tela cheia — assenta direto
        if (reduce) {
          snapToTarget()
          measure()
        } else {
          burstRef.current = false
          sinceChange = 0
          measure() // re-publica a geometria pro novo modo (legenda acompanha)
          for (const p of ps) { p.hx = Math.random() * w; p.hy = Math.random() * h }
        }
      }
      sinceChange += dt
      const dispersing = sinceChange < DISPERSE_MS
      formed += ((dispersing ? 0 : 1) - formed) * 0.06

      const L = layout(modeRef.current, sinceChange)
      const R = L.R
      const gr = first ? 1 : 0.07 // snap no 1º frame, glide depois
      for (let g = 0; g < 2; g++) {
        gc[g][0] += (L.c[g][0] - gc[g][0]) * gr
        gc[g][1] += (L.c[g][1] - gc[g][1]) * gr
        for (let k = 0; k < 3; k++) gcol[g][k] += (L.col[g][k] - gcol[g][k]) * gr
      }
      first = false

      // sprites com mix pro branco durante a dispersão
      const dc: RGB[] = [[0, 0, 0], [0, 0, 0]]
      for (let g = 0; g < 2; g++) for (let k = 0; k < 3; k++) dc[g][k] = 255 + (gcol[g][k] - 255) * formed
      // retinge só quando a cor de fato mudou — depois do assentamento ela é estável
      for (let g = 0; g < 2; g++) {
        const delta =
          Math.abs(dc[g][0] - lastDc[g][0]) + Math.abs(dc[g][1] - lastDc[g][1]) + Math.abs(dc[g][2] - lastDc[g][2])
        if (delta > 0.75) {
          recolor(g ? t1 : t0, dc[g])
          lastDc[g][0] = dc[g][0]; lastDc[g][1] = dc[g][1]; lastDc[g][2] = dc[g][2]
        }
      }

      if (!reduce) ang += dt * 0.00034
      const ca = Math.cos(ang), sa = Math.sin(ang)

      // trail
      ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = "rgba(3,3,3,0.32)"; ctx.fillRect(0, 0, w, h)

      // halo por grupo (fundem em roxo quando os centros coincidem)
      ctx.globalCompositeOperation = "lighter"
      for (let g = 0; g < 2; g++) {
        const [hx, hy] = gc[g]
        const HR = R * 1.7
        const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, HR)
        hg.addColorStop(0, `rgba(${dc[g][0] | 0},${dc[g][1] | 0},${dc[g][2] | 0},${0.22 * formed})`)
        hg.addColorStop(0.5, `rgba(${dc[g][0] | 0},${dc[g][1] | 0},${dc[g][2] | 0},${0.06 * formed})`)
        hg.addColorStop(1, "rgba(0,0,0,0)")
        ctx.fillStyle = hg; ctx.fillRect(hx - HR, hy - HR, HR * 2, HR * 2)
      }

      for (const p of ps) {
        const rx = p.ux * ca - p.uz * sa
        const rz = p.ux * sa + p.uz * ca
        const c = gc[p.grp]
        const tx = dispersing ? p.hx : c[0] + rx * R
        const ty = dispersing ? p.hy : c[1] + p.uy * R
        const rate = dispersing ? 0.11 : 0.07
        p.x += (tx - p.x) * rate; p.y += (ty - p.y) * rate
        // repulsão do cursor
        if (mouse.on && !dispersing) {
          const mdx = p.x - mouse.x, mdy = p.y - mouse.y
          const md2 = mdx * mdx + mdy * mdy
          if (md2 < 21000 && md2 > 1) {
            const md = Math.sqrt(md2)
            const f = (1 - md / 145) * 15
            p.x += (mdx / md) * f; p.y += (mdy / md) * f
          }
        }
        const depth = 0.5 + (rz + 1) * 0.3
        const size = p.sz * (2.2 + depth * 3.4)
        ctx.globalAlpha = 0.3 + depth * 0.6
        ctx.drawImage(p.grp ? t1.c : t0.c, p.x - size / 2, p.y - size / 2, size, size)
      }
      ctx.globalAlpha = 1
    }
    raf = requestAnimationFrame(frame)

    // fora da viewport a esfera é invisível — pausa o loop inteiro em vez de
    // queimar CPU com 4600 drawImage por frame. Retomar não dá salto: dt é
    // clampado em 50ms e `last` é rearmado aqui.
    const io = new IntersectionObserver(
      (entries) => {
        // registros chegam em lote em ordem cronológica — só o ÚLTIMO reflete
        // o estado atual; ler o primeiro pode travar o estado invertido
        const vis = entries[entries.length - 1].isIntersecting
        if (vis === running) return
        running = vis
        if (vis) {
          // mudanças acumuladas enquanto pausado (resize/troca de modo) são
          // aplicadas de uma vez — a esfera reaparece já assentada, sem deslizar
          if (resizedWhilePaused || burstRef.current) {
            resizedWhilePaused = false
            snapToTarget()
          }
          last = performance.now()
          raf = requestAnimationFrame(frame)
        } else {
          cancelAnimationFrame(raf)
        }
      },
      { rootMargin: "120px" },
    )
    io.observe(canvas)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseleave", onLeave)
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 block h-full w-full" />
}
