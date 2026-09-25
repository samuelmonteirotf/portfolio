"use client"

import { createContext, startTransition, useContext, useEffect, useState, type ReactNode } from "react"
import { modeColors, type ModeKey } from "@/lib/portfolio-data"

/* Estado global do "modo" (pílula azul = full-stack · vermelha = devops).
 * Contexto client compartilhado entre hero, resumo e projetos. A escolha
 * persiste em localStorage; o SSR sempre parte de "devops" pra não dar
 * hydration mismatch, e o valor salvo entra depois do mount.
 *
 * `mode` muda no clique (hero, toggle, rodapé reagem na hora). `settledMode`
 * muda ~750ms depois: as seções pesadas abaixo da dobra (grades que remontam,
 * WebGL) trocam com ele, DEPOIS que a dispersão da esfera terminou — montar
 * essas seções durante a animação era o que causava a travada no clique. */
type PillModeContextValue = { mode: ModeKey; settledMode: ModeKey; setMode: (mode: ModeKey) => void }

const PillModeContext = createContext<PillModeContextValue | null>(null)
const STORAGE_KEY = "pill-mode"
const SETTLE_MS = 750 // > DISPERSE_MS (620ms) das partículas do hero

export function PillModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ModeKey>("devops")
  const [settledMode, setSettledMode] = useState<ModeKey>("devops")

  useEffect(() => {
    // storage bloqueado (navegação privada restrita) não pode derrubar o site
    let saved: string | null = null
    try {
      saved = window.localStorage.getItem(STORAGE_KEY)
    } catch {
      /* sem storage: segue no modo padrão */
    }
    if (saved === "devops" || saved === "fullstack" || saved === "all") {
      setModeState(saved)
      setSettledMode(saved) // na carga não há animação: os dois juntos
    }
  }, [])

  // a cor do modo vive no :root (var --mode, animada via @property em
  // globals.css): hero, seções, seleção de texto e barra de scroll herdam
  useEffect(() => {
    document.documentElement.style.setProperty("--mode", modeColors[mode])
  }, [mode])

  useEffect(() => {
    if (settledMode === mode) return
    const t = window.setTimeout(() => {
      // transition: o React pode fatiar a remontagem pesada sem segurar input
      startTransition(() => setSettledMode(mode))
    }, SETTLE_MS)
    return () => window.clearTimeout(t)
  }, [mode, settledMode])

  const setMode = (next: ModeKey) => {
    setModeState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* localStorage indisponível — ignora */
    }
  }

  return (
    <PillModeContext.Provider value={{ mode, settledMode, setMode }}>{children}</PillModeContext.Provider>
  )
}

export function usePillMode() {
  const ctx = useContext(PillModeContext)
  if (!ctx) throw new Error("usePillMode must be used within a PillModeProvider")
  return ctx
}

/* Ordem canônica das seções e em quais modos cada uma não aparece.
 * O índice exibido (01, 02…) é recalculado por modo pra numeração nunca
 * pular quando uma seção some. Segue o settledMode: os números trocam
 * junto com as seções, não antes. */
const SECTION_ORDER: { key: string; hiddenIn?: ModeKey[] }[] = [
  { key: "projects" },
  { key: "infra-code", hiddenIn: ["fullstack"] },
  { key: "competencies" },
  { key: "control-room", hiddenIn: ["fullstack"] },
  { key: "experience" },
  { key: "contact" },
]

export function useSectionIndex(key: string): string | null {
  const { settledMode } = usePillMode()
  const visible = SECTION_ORDER.filter((s) => !s.hiddenIn?.includes(settledMode))
  const i = visible.findIndex((s) => s.key === key)
  return i === -1 ? null : String(i + 1).padStart(2, "0")
}
