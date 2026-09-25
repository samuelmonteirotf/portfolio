/* Teste de fumaça do canvas de partículas. Abre o site no Chromium (ou no
 * Chrome instalado) e no WebKit (motor do Safari, se baixado) e falha se o
 * shader não compilar: nesse caso o hero-orb cai no fallback em silêncio
 * e ninguém percebe, porque a página continua abrindo.
 *
 *   npm run build && npx serve out -l 4173   # em outro terminal
 *   npm run smoke                            # ou: npm run smoke -- http://localhost:3000
 *   npx playwright install webkit            # opcional, para testar o Safari
 */
import { chromium, webkit } from "playwright"

const url = process.argv[2] ?? "http://localhost:4173/"
let failed = false

async function check(name, launch) {
  let browser
  try {
    browser = await launch()
  } catch {
    console.log(`- ${name}: navegador não instalado, pulando`)
    return
  }
  const page = await browser.newPage()
  const warnings = []
  page.on("console", (m) => /hero-orb/.test(m.text()) && warnings.push(m.text().split("\n")[0]))
  page.on("pageerror", (e) => warnings.push(`pageerror: ${e.message}`))
  await page.goto(url, { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)
  const canvas = await page.evaluate(() => !!document.querySelector("canvas"))
  // rola pela página inteira: cenas novas entram no shader no meio do caminho
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight / 2) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 60))
    }
  })
  const ok = canvas && warnings.length === 0
  console.log(`${ok ? "✓" : "✗"} ${name}: canvas ${canvas ? "ok" : "AUSENTE"}${warnings.length ? `\n  ${warnings.join("\n  ")}` : ""}`)
  if (!ok) failed = true
  await browser.close()
}

await check("Chromium", () => chromium.launch().catch(() => chromium.launch({ channel: "chrome" })))
await check("WebKit (Safari)", () => webkit.launch())
process.exit(failed ? 1 : 0)
