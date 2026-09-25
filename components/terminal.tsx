"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { usePillMode } from "@/components/pill-mode"
import { useContent, useLanguage } from "@/components/language"
import { modeColors, projectSlug, type Lang, type ModeKey } from "@/lib/portfolio-data"
import { reasonText, scoreRequest, verdictFor, type SimRequest } from "@/lib/sentinel-score"
import { SENTINEL_URL, reasonKey, reasonLabel } from "@/lib/sentinel-live"

/* Terminal do site (⌘K / Ctrl+K, ou o botão ">_" no hero). Não é enfeite:
 * cada comando mexe na página de verdade (mode, lang, goto, open) e o `curl`
 * passa a requisição forjada pelo score real do Sentinel, então dá para
 * tentar "furar o firewall" montando headers. Tab completa, ↑/↓ navega o
 * histórico, Esc fecha. Outros componentes abrem com openTerminal(). */

const OPEN_EVENT = "terminal:open"
export const openTerminal = () => window.dispatchEvent(new Event(OPEN_EVENT))

const SECTIONS: Record<string, { id: string; hiddenIn?: ModeKey }> = {
  top: { id: "top" },
  summary: { id: "summary" },
  infra: { id: "infraestrutura", hiddenIn: "fullstack" },
  skills: { id: "competencies" },
  projects: { id: "projects" },
  "control-room": { id: "control-room", hiddenIn: "fullstack" },
  experience: { id: "experience" },
  contact: { id: "contact" },
}
const COMMANDS = ["help", "whoami", "ls", "cat", "open", "goto", "mode", "lang", "curl", "contact", "email", "cv", "history", "clear", "exit"]
const MODES: ModeKey[] = ["fullstack", "devops", "all"]
const SETTLE_WAIT = 900 // > SETTLE_MS do pill-mode: espera a seção existir antes de rolar

const S = {
  pt: {
    dialog: "Terminal do site",
    input: "Comando",
    banner: "shell do monteirotf.com · digite help ou escolha abaixo",
    notFound: (c: string) => `comando não encontrado: ${c}. digite help`,
    usage: (u: string) => `uso: ${u}`,
    noProject: (p: string) => `projeto não encontrado: ${p}. tente ls projects`,
    noSection: (s: string) => `seção não encontrada: ${s}`,
    modeSet: (m: string) => `modo → ${m}. a página inteira mudou.`,
    langSet: "idioma → português",
    copied: (e: string) => `${e} copiado para a área de transferência`,
    copyFail: (e: string) => `não consegui copiar. o e-mail é ${e}`,
    cv: (f: string) => `baixando ${f}`,
    sudo: "sudo: permissão negada. este incidente será reportado ao Sentinel.",
    available: "disponível para projetos",
    help: [
      ["whoami", "quem é, o que faz, onde está"],
      ["ls [projects|skills]", "lista o conteúdo"],
      ["cat <projeto>", "resumo técnico de um projeto"],
      ["open <projeto>", "abre a página de case do projeto"],
      ["goto <seção>", Object.keys(SECTIONS).join(" · ")],
      ["mode <lado>", "fullstack · devops · all"],
      ["lang <pt|en>", "troca o idioma do site"],
      ["curl [-A ua] [-H h] [--http1.1]", "passa uma requisição pelo Sentinel"],
      ["contact · email", "canais · copia o e-mail"],
      ["cv [pt|en]", "baixa o currículo do lado ativo"],
      ["history · clear · exit", ""],
    ],
    curlHint: "dica: tente curl -A \"Mozilla/5.0 ... Chrome/128.0\" -H \"Accept-Language: pt-BR\" ... ou o de verdade: curl sentinel.monteirotf.com/api/check",
    realRequest: "requisição real, do seu navegador",
    realFail: "a edge não respondeu a esta origem (CORS ou rede)",
  },
  en: {
    dialog: "Site terminal",
    input: "Command",
    banner: "monteirotf.com shell · type help or pick one below",
    notFound: (c: string) => `command not found: ${c}. type help`,
    usage: (u: string) => `usage: ${u}`,
    noProject: (p: string) => `project not found: ${p}. try ls projects`,
    noSection: (s: string) => `section not found: ${s}`,
    modeSet: (m: string) => `mode → ${m}. the whole page changed.`,
    langSet: "language → english",
    copied: (e: string) => `${e} copied to clipboard`,
    copyFail: (e: string) => `could not copy. the email is ${e}`,
    cv: (f: string) => `downloading ${f}`,
    sudo: "sudo: permission denied. this incident will be reported to Sentinel.",
    available: "available for projects",
    help: [
      ["whoami", "who, what, where"],
      ["ls [projects|skills]", "list content"],
      ["cat <project>", "technical summary of a project"],
      ["open <project>", "open the project case study page"],
      ["goto <section>", Object.keys(SECTIONS).join(" · ")],
      ["mode <side>", "fullstack · devops · all"],
      ["lang <pt|en>", "switch the site language"],
      ["curl [-A ua] [-H h] [--http1.1]", "send a request through Sentinel"],
      ["contact · email", "channels · copy the email"],
      ["cv [pt|en]", "download the resume for the active side"],
      ["history · clear · exit", ""],
    ],
    curlHint: "hint: try curl -A \"Mozilla/5.0 ... Chrome/128.0\" -H \"Accept-Language: en\" ... or the real one: curl sentinel.monteirotf.com/api/check",
    realRequest: "real request, from your browser",
    realFail: "the edge did not answer this origin (CORS or network)",
  },
}

const SUGGESTIONS = ["help", "whoami", "ls projects", "curl monteirotf.com", "mode all"]

/* separa argumentos respeitando aspas simples e duplas */
function tokenize(raw: string): string[] {
  const out: string[] = []
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(raw))) out.push(m[1] ?? m[2] ?? m[3])
  return out
}

/* curl → SimRequest: o que o curl de verdade manda (Accept: *\/*, h2, TLS 1.3,
 * rede residencial), mais o que o visitante forjar com -A / -H / --http1.1 */
function curlToRequest(args: string[]): { req: SimRequest; target: string } {
  let ua = "curl/8.7.1"
  let target = "monteirotf.com"
  const headers = { accept: true, acceptLanguage: false, acceptEncoding: false, secChUa: false, secFetch: false }
  let httpProtocol: SimRequest["httpProtocol"] = "HTTP/2"
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === "-A" || a === "--user-agent") ua = args[++i] ?? ""
    else if (a === "-H" || a === "--header") {
      const name = (args[++i] ?? "").split(":")[0].trim().toLowerCase()
      if (name === "accept-language") headers.acceptLanguage = true
      else if (name === "accept-encoding") headers.acceptEncoding = true
      else if (name === "sec-ch-ua") headers.secChUa = true
      else if (name.startsWith("sec-fetch-")) headers.secFetch = true
    } else if (a === "--http1.1") httpProtocol = "HTTP/1.1"
    else if (a === "--http3") httpProtocol = "HTTP/3"
    else if (a === "--compressed") headers.acceptEncoding = true
    else if (!a.startsWith("-")) target = a.replace(/^https?:\/\//, "")
  }
  return {
    target,
    req: { ua, headers, httpProtocol, tlsVersion: "TLSv1.3", asOrganization: "Claro NXT Telecomunicacoes", threatScore: 0 },
  }
}

type Line = { id: number; node: ReactNode }

const Dim = ({ children }: { children: ReactNode }) => <span className="text-muted-foreground">{children}</span>
const Hi = ({ children }: { children: ReactNode }) => <span className="text-mode">{children}</span>
const Err = ({ children }: { children: ReactNode }) => <span className="text-[#ef4444]">{children}</span>

export function Terminal() {
  const { mode, setMode } = usePillMode()
  const { lang, setLang } = useLanguage()
  const content = useContent()
  const reduce = useReducedMotion()
  const t = S[lang]

  const [open, setOpen] = useState(false)
  const [lines, setLines] = useState<Line[]>([])
  const [input, setInput] = useState("")
  const history = useRef<string[]>([])
  const hIndex = useRef(-1)
  const seq = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  const print = useCallback((...nodes: ReactNode[]) => {
    setLines((ls) => [...ls, ...nodes.map((node) => ({ id: seq.current++, node }))].slice(-200))
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    returnFocus.current?.focus?.()
  }, [])

  const show = useCallback(() => {
    returnFocus.current = document.activeElement as HTMLElement | null
    setOpen(true)
  }, [])

  // atalhos globais + evento de abertura vindo de outros componentes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        if (open) close()
        else show()
      }
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener(OPEN_EVENT, show)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener(OPEN_EVENT, show)
    }
  }, [open, close, show])

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [lines])

  /* rola até um elemento; se ele não existe no modo atual, troca para "all"
   * e espera as seções remontarem */
  const scrollToId = (id: string, needsAll: boolean) => {
    close()
    const go = () => {
      const el = id === "top" ? document.body : document.getElementById(id)
      // fora da home (página de case) a seção não existe: volta para a home nela
      if (!el) return window.location.assign(id === "top" ? "/" : `/#${id}`)
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
    }
    if (needsAll) {
      setMode("all")
      window.setTimeout(go, SETTLE_WAIT)
    } else window.setTimeout(go, 60)
  }

  const findProject = (q: string) => content.projects.find((p) => projectSlug(p.title) === q.toLowerCase())

  const run = (raw: string) => {
    const [cmd = "", ...args] = tokenize(raw.trim())
    const c = cmd.toLowerCase()
    switch (c) {
      case "":
        return
      case "help":
        print(
          ...t.help.map(([k, d]) => (
            <span key={k} className="flex gap-3">
              <span className="w-[15.5rem] shrink-0 text-foreground">{k}</span>
              <Dim>{d}</Dim>
            </span>
          )),
        )
        return
      case "whoami":
        print(
          <span>
            <span className="text-foreground">{content.profile.name}</span> <Dim>·</Dim> <Hi>{content.modes[mode].role}</Hi>
          </span>,
          <Dim>
            {content.profile.location} · {content.ui.summary.experienceValue} · {content.modes[mode].focus}
          </Dim>,
          content.profile.available ? <span className="text-[#10b981]">● {t.available}</span> : null,
        )
        return
      case "ls": {
        const what = (args[0] ?? "").replace(/\/$/, "")
        if (what === "projects") {
          print(
            ...content.projects.map((p) => (
              <span key={p.title} className="flex gap-3">
                <span className="w-32 shrink-0 text-foreground">{projectSlug(p.title)}</span>
                <Dim>{p.context}</Dim>
              </span>
            )),
          )
        } else if (what === "skills") {
          print(
            ...content.competencies.map((cat) => (
              <span key={cat.title}>
                <Hi>{cat.title}</Hi> <Dim>{cat.items.map((i) => i.name).join(" · ")}</Dim>
              </span>
            )),
          )
        } else {
          print(
            <span>
              <Hi>projects/</Hi> &nbsp; <Hi>skills/</Hi> &nbsp; <span className="text-foreground">contact</span> &nbsp;{" "}
              <span className="text-foreground">cv.pdf</span>
            </span>,
          )
        }
        return
      }
      case "cat":
      case "open": {
        if (!args[0]) return print(<Err>{t.usage(`${c} <${lang === "pt" ? "projeto" : "project"}>`)}</Err>)
        const p = findProject(args[0])
        if (!p) return print(<Err>{t.noProject(args[0])}</Err>)
        if (c === "open") {
          close()
          window.location.assign(`/projects/${projectSlug(p.title)}`)
          return
        }
        print(
          <span>
            <span className="font-semibold text-foreground">{p.title}</span> <Dim>· {p.context}</Dim>
          </span>,
          <span className="block max-w-[70ch] text-foreground/85">{p.solution}</span>,
          <Dim>{p.stack.join(" · ")}</Dim>,
          p.live || p.repo ? (
            <span>
              {p.live ? (
                <a href={p.live} target="_blank" rel="noopener noreferrer" className="text-mode underline-offset-2 hover:underline">
                  {p.live}
                </a>
              ) : null}
              {p.live && p.repo ? <Dim> · </Dim> : null}
              {p.repo ? (
                <a href={p.repo} target="_blank" rel="noopener noreferrer" className="text-mode underline-offset-2 hover:underline">
                  {p.repo.replace("https://", "")}
                </a>
              ) : null}
            </span>
          ) : null,
        )
        return
      }
      case "goto":
      case "cd": {
        const key = (args[0] ?? "").replace(/^\/|\/$/g, "").toLowerCase()
        const sec = SECTIONS[key]
        if (!sec) return print(<Err>{args[0] ? t.noSection(args[0]) : t.usage("goto <section>")}</Err>)
        scrollToId(sec.id, sec.hiddenIn === mode)
        return
      }
      case "mode": {
        const m = (args[0] ?? "").toLowerCase() as ModeKey
        if (!MODES.includes(m)) return print(<Err>{t.usage("mode fullstack|devops|all")}</Err>)
        setMode(m)
        print(<span style={{ color: modeColors[m] }}>{t.modeSet(m)}</span>)
        return
      }
      case "lang": {
        const l = (args[0] ?? "").toLowerCase() as Lang
        if (l !== "pt" && l !== "en") return print(<Err>{t.usage("lang pt|en")}</Err>)
        setLang(l)
        print(<Dim>{S[l].langSet}</Dim>)
        return
      }
      case "curl": {
        const { req, target } = curlToRequest(args)
        // alvo real: a requisição sai do navegador do visitante para a edge de
        // verdade (headers forjados não se aplicam: quem manda é o navegador)
        if (target.startsWith("sentinel.monteirotf.com")) {
          const path = target.slice("sentinel.monteirotf.com".length) || "/api/check"
          print(<Dim>{`> GET ${path} · Host: sentinel.monteirotf.com · ${t.realRequest}`}</Dim>)
          fetch(`${SENTINEL_URL}${path}`, { cache: "no-store", credentials: "omit" })
            .then(async (r) => {
              const body = await r.json().catch(() => null)
              const color = r.ok ? "#10b981" : r.status === 429 ? "#f97316" : "#ef4444"
              print(<span style={{ color }}>{`< ${r.status} ${r.statusText || ""}`.trim()}</span>)
              if (body?.verdict) {
                print(
                  <span>
                    <Dim>{"< "}x-sentinel-score:</Dim> <span className="text-foreground">{body.score}</span>{" "}
                    <Dim>verdict:</Dim> <span style={{ color }}>{body.verdict}</span>
                  </span>,
                  ...(body.reasons ?? []).map((x: { points: number; reason: string }) => (
                    <Dim key={x.reason}>
                      {"  # +"}
                      {x.points} {reasonKey(x.reason) === "other" ? x.reason : reasonLabel(reasonKey(x.reason), lang)}
                    </Dim>
                  )),
                )
              } else if (body?.totals) {
                print(<Dim>{`  total ${body.totals.total} · allow ${body.totals.ALLOW} · block ${body.totals.BLOCK} · rate-limited ${body.totals.RATE_LIMITED}`}</Dim>)
              }
            })
            .catch(() => print(<Err>{t.realFail}</Err>))
          return
        }
        const { score, reasons } = scoreRequest(req)
        const v = verdictFor(score)
        const status = v === "ALLOW" ? "200 OK" : "403 Forbidden"
        const color = v === "ALLOW" ? "#10b981" : v === "CHALLENGE" ? "#f59e0b" : "#ef4444"
        print(
          <Dim>
            {"> "}GET / {req.httpProtocol} · Host: {target} · User-Agent: {req.ua || "-"}
          </Dim>,
          <span style={{ color }}>
            {"< "}
            {req.httpProtocol} {status}
          </span>,
          <span>
            <Dim>{"< "}x-sentinel-score:</Dim> <span className="text-foreground">{score}</span>
          </span>,
          <span>
            <Dim>{"< "}x-sentinel-verdict:</Dim> <span style={{ color }}>{v === "CHALLENGE" ? "CHALLENGE (managed)" : v}</span>
          </span>,
          ...reasons.map((r) => (
            <Dim key={r.key}>
              {"  # +"}
              {r.points} {reasonText(r, lang)}
            </Dim>
          )),
          v !== "ALLOW" ? <Dim>{t.curlHint}</Dim> : null,
        )
        return
      }
      case "contact":
        print(
          <span>
            <Dim>email </Dim>
            <a href={`mailto:${content.profile.email}`} className="text-mode hover:underline">
              {content.profile.email}
            </a>
          </span>,
          <span>
            <Dim>github </Dim>
            <a href={content.profile.github} target="_blank" rel="noopener noreferrer" className="text-mode hover:underline">
              {content.profile.github.replace("https://", "")}
            </a>
          </span>,
          <span>
            <Dim>linkedin </Dim>
            <a href={content.profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-mode hover:underline">
              {content.profile.linkedin.replace("https://www.", "")}
            </a>
          </span>,
        )
        return
      case "email": {
        const e = content.profile.email
        navigator.clipboard?.writeText(e).then(
          () => print(<span className="text-[#10b981]">{t.copied(e)}</span>),
          () => print(<Dim>{t.copyFail(e)}</Dim>),
        ) ?? print(<Dim>{t.copyFail(e)}</Dim>)
        return
      }
      case "cv": {
        const l = (args[0] ?? lang).toLowerCase() === "en" ? "en" : "pt"
        const suffix = mode === "all" ? "" : `-${mode}`
        const file = `samuel-monteiro-cv${suffix}-${l}.pdf`
        const a = document.createElement("a")
        a.href = `/${file}`
        a.download = file
        a.click()
        print(<Dim>{t.cv(file)}</Dim>)
        return
      }
      case "history":
        print(
          ...history.current.map((h, i) => (
            <Dim key={i}>
              {String(i + 1).padStart(3, " ")} {h}
            </Dim>
          )),
        )
        return
      case "clear":
        setLines([])
        return
      case "exit":
        close()
        return
      case "sudo":
        print(<Err>{t.sudo}</Err>)
        return
      default:
        print(<Err>{t.notFound(cmd)}</Err>)
    }
  }

  const submit = (raw: string) => {
    print(
      <span>
        <span className="text-mode">samuel@monteirotf</span>
        <Dim>:~$ </Dim>
        <span className="text-foreground">{raw}</span>
      </span>,
    )
    if (raw.trim()) history.current = [...history.current, raw].slice(-50)
    hIndex.current = -1
    setInput("")
    run(raw)
  }

  /* Tab: completa comando, depois argumentos conforme o comando */
  const complete = () => {
    const parts = input.split(" ")
    const last = parts[parts.length - 1].toLowerCase()
    let pool: string[] = []
    if (parts.length === 1) pool = COMMANDS
    else {
      const c = parts[0].toLowerCase()
      if (c === "cat" || c === "open") pool = content.projects.map((p) => projectSlug(p.title))
      else if (c === "goto" || c === "cd") pool = Object.keys(SECTIONS)
      else if (c === "mode") pool = MODES
      else if (c === "lang" || c === "cv") pool = ["pt", "en"]
      else if (c === "ls") pool = ["projects", "skills"]
    }
    const hits = pool.filter((p) => p.startsWith(last))
    if (hits.length === 1) {
      parts[parts.length - 1] = hits[0]
      setInput(parts.join(" ") + " ")
    } else if (hits.length > 1) print(<Dim>{hits.join("  ")}</Dim>)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit(input)
    else if (e.key === "Escape") close()
    else if (e.key === "Tab") {
      e.preventDefault()
      complete()
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault()
      const h = history.current
      if (!h.length) return
      let i = hIndex.current === -1 ? h.length : hIndex.current
      i = e.key === "ArrowUp" ? Math.max(0, i - 1) : i + 1
      if (i >= h.length) {
        hIndex.current = -1
        setInput("")
      } else {
        hIndex.current = i
        setInput(h[i])
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="terminal"
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) close()
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t.dialog}
            className="w-full max-w-2xl overflow-hidden rounded-lg border border-mode/30 bg-[#050608] shadow-[0_0_40px_color-mix(in_srgb,var(--mode)_14%,transparent)]"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 170, damping: 22 }}
          >
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]/80" aria-hidden="true" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]/80" aria-hidden="true" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]/80" aria-hidden="true" />
              <span className="ml-2 font-mono text-[11px] text-muted-foreground">samuel@monteirotf: ~</span>
              <button
                type="button"
                onClick={close}
                className="ml-auto rounded px-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-mode"
              >
                esc
              </button>
            </div>

            <div
              ref={scrollRef}
              className="max-h-[52vh] min-h-[12rem] overflow-y-auto px-4 py-3 font-mono text-[12.5px] leading-[1.65]"
              onClick={() => inputRef.current?.focus()}
            >
              <p className="text-muted-foreground">{t.banner}</p>
              {lines.length === 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => submit(s)}
                      className="rounded border border-border px-2 py-0.5 text-[11.5px] text-foreground outline-none transition-colors hover:border-mode/60 focus-visible:outline-2 focus-visible:outline-mode"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}
              <div aria-live="polite" className="mt-1">
                {lines.map((l) => (
                  <div key={l.id} className="whitespace-pre-wrap break-words">
                    {l.node}
                  </div>
                ))}
              </div>
              <div className="flex items-center">
                <span className="text-mode">samuel@monteirotf</span>
                <span className="text-muted-foreground">:~$&nbsp;</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  aria-label={t.input}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="min-w-0 flex-1 bg-transparent text-foreground caret-[var(--mode)] outline-none"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

/* Botão de abertura (hero): mostra o atalho do sistema */
export function TerminalTrigger() {
  const [mac, setMac] = useState(true)
  useEffect(() => {
    setMac(/mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent))
  }, [])
  return (
    <button
      type="button"
      onClick={openTerminal}
      aria-label="Terminal (⌘K)"
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-1 font-mono text-[11px] text-muted-foreground backdrop-blur-sm transition-colors outline-none hover:border-mode/60 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mode"
    >
      <span className="text-mode">&gt;_</span>
      <kbd className="hidden font-mono sm:inline">{mac ? "⌘K" : "Ctrl K"}</kbd>
    </button>
  )
}
