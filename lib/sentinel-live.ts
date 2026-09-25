/* Cliente do Sentinel em produção (sentinel.monteirotf.com):
 *  · /api/stats  → totais reais do Durable Object de estatísticas
 *  · /api/check  → pontua a requisição do PRÓPRIO visitante (CORS por allow-list)
 * Os motivos chegam em inglês e com detalhe embutido ("UA claims Chrome 120
 * but..."); aqui viram chaves estáveis para agregar e traduzir. */

export const SENTINEL_URL = "https://sentinel.monteirotf.com"

export type LiveVerdict = "ALLOW" | "CHALLENGE" | "BLOCK" | "RATE_LIMITED"

export type StatsSnapshot = {
  totals: Record<LiveVerdict, number> & { total: number; reasons: Record<string, number>; since: number }
}

export type CheckResult = {
  verdict: LiveVerdict
  score: number
  reasons: { points: number; reason: string }[]
  threshold: { challengeAt: number; blockAt: number }
  signals?: { httpProtocol: string | null; tlsVersion: string | null; country: string | null }
}

export type ReasonKey =
  | "noUa"
  | "botUa"
  | "noAccept"
  | "noAcceptLanguage"
  | "noAcceptEncoding"
  | "noSecChUa"
  | "noSecFetch"
  | "http1Browser"
  | "obsoleteTls"
  | "datacenter"
  | "threat"
  | "rateLimited"
  | "other"

const PATTERNS: [RegExp, ReasonKey][] = [
  [/^no User-Agent/i, "noUa"],
  [/automation\/library\/scanner/i, "botUa"],
  [/no Accept header/i, "noAccept"],
  [/no Accept-Language/i, "noAcceptLanguage"],
  [/no Accept-Encoding/i, "noAcceptEncoding"],
  [/no Sec-CH-UA/i, "noSecChUa"],
  [/no Sec-Fetch/i, "noSecFetch"],
  [/modern browser UA over HTTP/i, "http1Browser"],
  [/obsolete TLS/i, "obsoleteTls"],
  [/datacenter network/i, "datacenter"],
  [/threat score/i, "threat"],
  [/rate limit exceeded/i, "rateLimited"],
]

export function reasonKey(text: string): ReasonKey {
  for (const [re, key] of PATTERNS) if (re.test(text)) return key
  return "other"
}

/* rótulos genéricos (sem o detalhe), para as barras agregadas */
const LABELS: Record<"pt" | "en", Record<ReasonKey, string>> = {
  pt: {
    noUa: "sem User-Agent",
    botUa: "UA de automação ou scanner",
    noAccept: "navegador sem Accept",
    noAcceptLanguage: "navegador sem Accept-Language",
    noAcceptEncoding: "navegador sem Accept-Encoding",
    noSecChUa: "Chrome forjado (sem Sec-CH-UA)",
    noSecFetch: "Chrome sem Sec-Fetch-*",
    http1Browser: "navegador em HTTP/1.1",
    obsoleteTls: "TLS obsoleto",
    datacenter: "rede de datacenter",
    threat: "threat score da Cloudflare",
    rateLimited: "rate limit estourado",
    other: "outros",
  },
  en: {
    noUa: "no User-Agent",
    botUa: "automation or scanner UA",
    noAccept: "browser with no Accept",
    noAcceptLanguage: "browser with no Accept-Language",
    noAcceptEncoding: "browser with no Accept-Encoding",
    noSecChUa: "spoofed Chrome (no Sec-CH-UA)",
    noSecFetch: "Chrome with no Sec-Fetch-*",
    http1Browser: "browser over HTTP/1.1",
    obsoleteTls: "obsolete TLS",
    datacenter: "datacenter network",
    threat: "Cloudflare threat score",
    rateLimited: "rate limit exceeded",
    other: "other",
  },
}

export const reasonLabel = (key: ReasonKey, lang: "pt" | "en") => LABELS[lang][key]

/* soma os motivos por regra (o Worker guarda "rate limit exceeded (8/8)",
 * "(11/11)"... como chaves diferentes) e devolve os mais frequentes */
export function topReasons(reasons: Record<string, number>, n = 5): { key: ReasonKey; count: number }[] {
  const acc = new Map<ReasonKey, number>()
  for (const [text, count] of Object.entries(reasons)) {
    const k = reasonKey(text)
    acc.set(k, (acc.get(k) ?? 0) + count)
  }
  return [...acc.entries()]
    .filter(([k]) => k !== "other")
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, count]) => ({ key, count }))
}

export async function fetchStats(signal?: AbortSignal): Promise<StatsSnapshot> {
  const r = await fetch(`${SENTINEL_URL}/api/stats`, { signal, cache: "no-store" })
  if (!r.ok) throw new Error(`stats ${r.status}`)
  return r.json()
}

/* 403/429 são respostas válidas (o veredito), não erro: só falha de rede ou
 * CORS rejeita a promise */
export async function checkMe(signal?: AbortSignal): Promise<CheckResult> {
  const r = await fetch(`${SENTINEL_URL}/api/check`, { signal, cache: "no-store", credentials: "omit" })
  return r.json()
}
