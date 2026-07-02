"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { getContent, type Lang, type SiteContent } from "@/lib/portfolio-data"

/* Idioma do site (PT ⇄ EN), no mesmo padrão do pill-mode: o SSR parte de "pt"
 * (Brasil é o público primário), a primeira visita autodetecta pelo navegador
 * e a escolha manual persiste em localStorage. <html lang> acompanha o idioma
 * ativo para leitores de tela e buscadores. */
const STORAGE_KEY = "site-lang"

type LanguageContextValue = { lang: Lang; setLang: (lang: Lang) => void }
const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt")

  useEffect(() => {
    let saved: string | null = null
    try {
      saved = window.localStorage.getItem(STORAGE_KEY)
    } catch {
      /* storage indisponível: segue na autodetecção */
    }
    if (saved === "pt" || saved === "en") {
      setLangState(saved)
    } else if (!(navigator.language ?? "pt").toLowerCase().startsWith("pt")) {
      setLangState("en")
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en"
  }, [lang])

  const setLang = (next: Lang) => {
    setLangState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* localStorage indisponível: a escolha vale só para a sessão */
    }
  }

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider")
  return ctx
}

/* Árvore de conteúdo já resolvida para o idioma ativo. */
export function useContent(): SiteContent {
  const { lang } = useLanguage()
  return useMemo(() => getContent(lang), [lang])
}
