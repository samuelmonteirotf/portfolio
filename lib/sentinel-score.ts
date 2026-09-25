/* Porte fiel de sentinel/src/score.js + config.js (github.com/samuelmonteirotf/sentinel):
 * mesmos regex, pesos padrão e limiares. A demo do card do Sentinel roda
 * exatamente esta função no navegador do visitante. */

const BOT_UA =
  /(bot|crawl|spider|slurp|curl|wget|python-requests|httpx|aiohttp|axios|node-fetch|got\b|go-http-client|java\/|okhttp|scrapy|libwww|mechanize|headlesschrome|phantomjs|puppeteer|playwright|selenium|masscan|zgrab|nuclei|nikto|sqlmap)/i
const LOOKS_BROWSER = /mozilla\/5\.0/i
const CHROME_VER = /chrome\/(\d+)/i
const DATACENTER_ORG =
  /(amazon|aws|google|gcp|microsoft|azure|ovh|hetzner|digitalocean|linode|akamai|vultr|scaleway|contabo|oracle|alibaba|tencent|leaseweb|choopa|m247|cogent|datacamp|hostwinds| colocation|servers?\.com|cloud)/i

export const WEIGHTS = {
  noUa: 50,
  botUa: 65,
  noAccept: 20,
  noAcceptLanguage: 12,
  noAcceptEncoding: 10,
  noSecChUa: 22,
  noSecFetch: 18,
  http1Browser: 15,
  obsoleteTls: 20,
  datacenterBrowser: 28,
  datacenter: 14,
  threatMax: 25,
  chromeClientHintsMinVersion: 90,
  threatMinScore: 10,
}

export const THRESHOLDS = { challengeAt: 30, blockAt: 60 }

export type SimRequest = {
  ua: string
  headers: { accept: boolean; acceptLanguage: boolean; acceptEncoding: boolean; secChUa: boolean; secFetch: boolean }
  httpProtocol: "HTTP/1.1" | "HTTP/2" | "HTTP/3"
  tlsVersion: "TLSv1.3" | "TLSv1.2" | "TLSv1.1"
  asOrganization: string
  threatScore: number
}

export type Reason = { points: number; key: string; detail?: string }
export type Verdict = "ALLOW" | "CHALLENGE" | "BLOCK"

export function scoreRequest(req: SimRequest): { score: number; reasons: Reason[] } {
  const w = WEIGHTS
  const ua = req.ua.trim()
  const reasons: Reason[] = []
  let score = 0
  const add = (points: number, key: string, detail?: string) => {
    score += points
    reasons.push({ points, key, detail })
  }

  if (!ua) add(w.noUa, "noUa")
  else if (BOT_UA.test(ua)) add(w.botUa, "botUa")

  const claimsBrowser = LOOKS_BROWSER.test(ua)
  if (claimsBrowser) {
    if (!req.headers.accept) add(w.noAccept, "noAccept")
    if (!req.headers.acceptLanguage) add(w.noAcceptLanguage, "noAcceptLanguage")
    if (!req.headers.acceptEncoding) add(w.noAcceptEncoding, "noAcceptEncoding")
    const m = ua.match(CHROME_VER)
    const chromeMajor = m ? parseInt(m[1], 10) : 0
    if (chromeMajor >= w.chromeClientHintsMinVersion) {
      if (!req.headers.secChUa) add(w.noSecChUa, "noSecChUa", String(chromeMajor))
      if (!req.headers.secFetch) add(w.noSecFetch, "noSecFetch")
    }
  }

  if (claimsBrowser && req.httpProtocol === "HTTP/1.1") add(w.http1Browser, "http1Browser", req.httpProtocol)
  if (req.tlsVersion === "TLSv1.1") add(w.obsoleteTls, "obsoleteTls", req.tlsVersion)

  const org = req.asOrganization
  if (org && DATACENTER_ORG.test(org)) add(claimsBrowser ? w.datacenterBrowser : w.datacenter, "datacenter", org)

  if (req.threatScore >= w.threatMinScore) add(Math.min(w.threatMax, req.threatScore), "threat", String(req.threatScore))

  return { score: Math.max(0, Math.min(100, Math.round(score))), reasons }
}

export function verdictFor(score: number): Verdict {
  if (score >= THRESHOLDS.blockAt) return "BLOCK"
  if (score >= THRESHOLDS.challengeAt) return "CHALLENGE"
  return "ALLOW"
}

/* Textos dos motivos (PT/EN), compartilhados pela demo do card e pelo `curl`
 * do terminal. {d} recebe o detalhe (versão, rede, número). */
const REASONS = {
  pt: {
    noUa: "sem User-Agent",
    botUa: "User-Agent de automação, biblioteca ou scanner",
    noAccept: "UA de navegador sem Accept",
    noAcceptLanguage: "UA de navegador sem Accept-Language",
    noAcceptEncoding: "UA de navegador sem Accept-Encoding",
    noSecChUa: "diz ser Chrome {d} mas não manda Sec-CH-UA (UA forjado)",
    noSecFetch: "Chrome moderno sem metadados Sec-Fetch-*",
    http1Browser: "navegador moderno falando {d} (esperado h2/h3)",
    obsoleteTls: "TLS obsoleto ({d})",
    datacenter: "vem de rede de datacenter ({d})",
    threat: "threat score da Cloudflare {d}",
  },
  en: {
    noUa: "no User-Agent",
    botUa: "User-Agent matches an automation library or scanner",
    noAccept: "browser UA with no Accept",
    noAcceptLanguage: "browser UA with no Accept-Language",
    noAcceptEncoding: "browser UA with no Accept-Encoding",
    noSecChUa: "claims Chrome {d} but sends no Sec-CH-UA (spoofed UA)",
    noSecFetch: "modern Chrome with no Sec-Fetch-* metadata",
    http1Browser: "modern browser over {d} (expected h2/h3)",
    obsoleteTls: "obsolete TLS ({d})",
    datacenter: "from a datacenter network ({d})",
    threat: "Cloudflare threat score {d}",
  },
} as const

export function reasonText(r: Reason, lang: "pt" | "en"): string {
  const table = REASONS[lang] as Record<string, string>
  return (table[r.key] ?? r.key).replace("{d}", r.detail ?? "")
}
