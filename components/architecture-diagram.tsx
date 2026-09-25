"use client"

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"

/* Diagrama de arquitetura a partir de dados (nós com col/row, arestas).
 * Desenha em SVG com pacotes correndo pelas arestas na cor do modo. Largo:
 * fluxo da esquerda para a direita; estreito (< 560px de contêiner): o eixo
 * transpõe e o fluxo desce, em vez de encolher até ficar ilegível. */

export type DiagramNode = { id: string; label: string; sub: string; col: number; row: number }
export type DiagramEdge = { from: string; to: string; label: string | null }

const NODE_W = 156
const NODE_H = 54

export function ArchitectureDiagram({ nodes, edges, ariaLabel }: { nodes: DiagramNode[]; edges: DiagramEdge[]; ariaLabel: string }) {
  const reduce = useReducedMotion()
  const wrap = useRef<HTMLDivElement>(null)
  const [vertical, setVertical] = useState(false)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setVertical(e.contentRect.width < 560))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const cols = Math.max(...nodes.map((n) => n.col)) + 1
  const rows = Math.max(...nodes.map((n) => n.row)) + 1
  // passo entre colunas (eixo do fluxo) e entre linhas (eixo transversal)
  const FLOW = vertical ? 104 : 212
  const CROSS = vertical ? 176 : 80
  const flowCount = cols
  const crossCount = rows
  const W = vertical ? crossCount * CROSS + 16 : flowCount * FLOW + 16
  const H = vertical ? flowCount * FLOW + 8 : crossCount * CROSS + 16

  // centraliza cada coluna no eixo transversal conforme quantos nós ela tem
  const perCol = new Map<number, number>()
  nodes.forEach((n) => perCol.set(n.col, Math.max(perCol.get(n.col) ?? 0, n.row + 1)))
  const pos = new Map<string, { x: number; y: number }>()
  nodes.forEach((n) => {
    const inCol = perCol.get(n.col) ?? 1
    const crossOffset = ((crossCount - inCol) * CROSS) / 2
    const f = n.col * FLOW + FLOW / 2 + 8
    const c = crossOffset + n.row * CROSS + CROSS / 2 + 8
    pos.set(n.id, vertical ? { x: c, y: f - 4 } : { x: f, y: c })
  })

  const edgePath = (e: DiagramEdge) => {
    const a = pos.get(e.from)
    const b = pos.get(e.to)
    if (!a || !b) return ""
    if (vertical) {
      const forward = b.y > a.y
      const y1 = a.y + (forward ? NODE_H / 2 : -NODE_H / 2)
      const y2 = b.y + (forward ? -NODE_H / 2 : NODE_H / 2)
      const my = (y1 + y2) / 2
      return `M${a.x},${y1} C${a.x},${my} ${b.x},${my} ${b.x},${y2}`
    }
    const forward = b.x > a.x
    if (!forward && a.x === b.x) {
      // mesma coluna: arco pela direita
      const x = a.x + NODE_W / 2
      return `M${x},${a.y} C${x + 40},${a.y} ${x + 40},${b.y} ${x},${b.y}`
    }
    const x1 = a.x + (forward ? NODE_W / 2 : -NODE_W / 2)
    const x2 = b.x + (forward ? -NODE_W / 2 : NODE_W / 2)
    const mx = (x1 + x2) / 2
    return `M${x1},${a.y} C${mx},${a.y} ${mx},${b.y} ${x2},${b.y}`
  }

  const nodeW = vertical ? Math.min(NODE_W, CROSS - 14) : NODE_W
  const labelOf = (id: string) => nodes.find((n) => n.id === id)?.label ?? id

  return (
    <div ref={wrap} className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full" style={{ maxWidth: W }} role="img" aria-label={ariaLabel}>
        <defs>
          <marker id="arch-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L8,4 L0,8 z" fill="currentColor" className="text-muted-foreground" />
          </marker>
        </defs>
        {edges.map((e, i) => {
          const d = edgePath(e)
          if (!d) return null
          return (
            <g key={`${e.from}-${e.to}-${i}`}>
              <path id={`edge-${i}`} d={d} fill="none" stroke="currentColor" className="text-border" strokeWidth={1.2} markerEnd="url(#arch-arrow)" />
              {/* área de toque larga e invisível: o rótulo da conexão aparece
                  no hover (com até 8 nós, texto sobre as curvas se atropela) */}
              <path d={d} fill="none" stroke="transparent" strokeWidth={12}>
                <title>{`${labelOf(e.from)} → ${labelOf(e.to)}${e.label ? `: ${e.label}` : ""}`}</title>
              </path>
              {!reduce ? (
                <circle r={2.6} fill="var(--mode)">
                  <animateMotion dur={`${2.2 + (i % 3) * 0.5}s`} repeatCount="indefinite" begin={`${(i * 0.37) % 2}s`}>
                    <mpath href={`#edge-${i}`} />
                  </animateMotion>
                </circle>
              ) : null}
            </g>
          )
        })}
        {nodes.map((n) => {
          const p = pos.get(n.id)!
          return (
            <g key={n.id} transform={`translate(${p.x - nodeW / 2},${p.y - NODE_H / 2})`}>
              <title>{`${n.label} · ${n.sub}`}</title>
              <rect width={nodeW} height={NODE_H} rx={6} className="fill-card" stroke="var(--mode)" strokeOpacity={0.45} />
              <text x={nodeW / 2} y={22} textAnchor="middle" className="fill-foreground font-sans" style={{ fontSize: 12.5, fontWeight: 600 }}>
                {n.label}
              </text>
              <text x={nodeW / 2} y={38} textAnchor="middle" className="fill-muted-foreground font-mono" style={{ fontSize: 9.5 }}>
                {n.sub.length > 26 ? n.sub.slice(0, 25) + "…" : n.sub}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
