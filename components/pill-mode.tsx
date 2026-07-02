"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { ModeKey } from "@/lib/portfolio-data"

/* Estado global do "modo" (pílula azul = full-stack · vermelha = devops).
 * Contexto client compartilhado entre hero, resumo e projetos. A escolha
 * persiste em localStorage; o SSR sempre parte de "devops" pra não dar
 * hydration mismatch, e o valor salvo entra depois do mount. */
type PillModeContextValue = { mode: ModeKey; setMode: (mode: ModeKey) => void }

const PillModeContext = createContext<PillModeContextValue | null>(null)
const STORAGE_KEY = "pill-mode"

export function PillModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ModeKey>("devops")

  useEffect(() => {
    // storage bloqueado (navegação privada restrita) não pode derrubar o site
    let saved: string | null = null
    try {
      saved = window.localStorage.getItem(STORAGE_KEY)
    } catch {
      /* sem storage: segue no modo padrão */
    }
    if (saved === "devops" || saved === "fullstack") setModeState(saved)
  }, [])

  const setMode = (next: ModeKey) => {
    setModeState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* localStorage indisponível — ignora */
    }
  }

  return <PillModeContext.Provider value={{ mode, setMode }}>{children}</PillModeContext.Provider>
}

export function usePillMode() {
  const ctx = useContext(PillModeContext)
  if (!ctx) throw new Error("usePillMode must be used within a PillModeProvider")
  return ctx
}

/* Ordem canônica das seções e em quais modos cada uma não aparece.
 * O índice exibido (01, 02…) é recalculado por modo pra numeração nunca
 * pular quando uma seção some. */
const SECTION_ORDER: { key: string; hiddenIn?: ModeKey[] }[] = [
  { key: "infra-code", hiddenIn: ["fullstack"] },
  { key: "competencies" },
  { key: "projects" },
  { key: "control-room", hiddenIn: ["fullstack"] },
  { key: "experience" },
  { key: "contact" },
]

export function useSectionIndex(key: string): string | null {
  const { mode } = usePillMode()
  const visible = SECTION_ORDER.filter((s) => !s.hiddenIn?.includes(mode))
  const i = visible.findIndex((s) => s.key === key)
  return i === -1 ? null : String(i + 1).padStart(2, "0")
}
