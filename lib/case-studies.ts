import raw from "./case-studies.json"
import type { Lang } from "@/lib/portfolio-data"

/* Conteúdo das páginas de case (/projects/[slug]). Extraído dos próprios
 * repositórios: arquitetura, decisões com o porquê e o custo, e números que
 * apontam para o arquivo de onde saíram. Nada aqui é métrica solta. */

type L = { pt: string; en: string }
type RawCase = {
  oneLiner: L
  architecture: {
    nodes: { id: string; label: L; sub: L; col: number; row: number }[]
    edges: { from: string; to: string; label: L | null }[]
  }
  decisions: { title: L; why: L; tradeoff: L | null }[]
  numbers: { label: L; value: string; source: string }[]
  sources: string[]
}

const CASES = raw as Record<string, RawCase>

export const CASE_SLUGS = Object.keys(CASES)

export type CaseStudy = {
  oneLiner: string
  nodes: { id: string; label: string; sub: string; col: number; row: number }[]
  edges: { from: string; to: string; label: string | null }[]
  decisions: { title: string; why: string; tradeoff: string | null }[]
  numbers: { label: string; value: string; sources: string[] }[]
}

export function getCase(slug: string, lang: Lang): CaseStudy | null {
  const c = CASES[slug]
  if (!c) return null
  return {
    oneLiner: c.oneLiner[lang],
    nodes: c.architecture.nodes.map((n) => ({ ...n, label: n.label[lang], sub: n.sub[lang] })),
    edges: c.architecture.edges.map((e) => ({ ...e, label: e.label ? e.label[lang] : null })),
    decisions: c.decisions.map((d) => ({ title: d.title[lang], why: d.why[lang], tradeoff: d.tradeoff ? d.tradeoff[lang] : null })),
    // "src/config.js, wrangler.toml" → um link por arquivo
    numbers: c.numbers.map((n) => ({ label: n.label[lang], value: n.value, sources: n.source.split(",").map((s) => s.trim()) })),
  }
}

/* link para o arquivo no GitHub (todos os repositórios usam main) */
export const sourceUrl = (repo: string, path: string) => `${repo.replace(/\/$/, "")}/blob/main/${path}`
