/* Conteúdo do site em DOIS idiomas. Todo campo de texto visível é um par
 * { pt, en }; getContent(lang) resolve a árvore inteira para o idioma ativo
 * (com cache), então os componentes continuam lendo strings simples.
 * Regras de voz (valem para os dois idiomas): natural e profissional, zero
 * travessões, zero emojis, nenhuma métrica não verificável nova. */

export type Lang = "pt" | "en"
export type ModeKey = "devops" | "fullstack" | "all"

type L = { pt: string; en: string }
const l = (pt: string, en: string): L => ({ pt, en })
const same = (s: string): L => ({ pt: s, en: s })

/* Tipos genéricos: T = L na fonte, string depois de localizado */
export type TaglineParts<T = string> = {
  before: T
  token: T
  after: T
  voice: "mono" | "sans"
}

export type Mode<T = string> = {
  role: T
  tagline: T
  taglineParts: TaglineParts<T>
  focus: T
  summary: T[]
  projectsIntro: T
}

export type Competency<T = string> = { name: T; detail?: T }
export type CompetencyCategory<T = string> = {
  title: T
  items: Competency<T>[]
  // em quais lados a categoria aparece ("all" sempre mostra tudo)
  tracks: ModeKey[]
}

export type ConfigSnippet<T = string> = {
  id: string
  label: string
  filename: string
  language: string
  code: T
}

export type Project<T = string> = {
  title: T
  context: T
  problem: T
  solution: T
  impact: { label: T; value: T }[]
  stack: string[]
  repo?: string
  // rótulo do link do repo (padrão: "Repositório"); os corporativos de código
  // fechado usam "Case técnico" para o clique não frustrar
  repoLabel?: T
  live?: string
  // print do produto no ar (capítulo e página de case)
  image?: { src: string; alt: T }
  // demo interativa embutida no card (components/demos)
  demo?: "sentinel" | "aegis" | "backtest"
  tracks: ModeKey[]
}

export type Experience<T = string> = { role: T; company: string; period: T; description: T }
export type Certification<T = string> = { name: T; issuer: T }

export type ControlRoomNode<T = string> = { sub: T; desc: T; tags: T[] }

export type UiStrings<T = string> = {
  header: {
    localeLine: T
    captionFullstack: T
    captionDevops: T
    navAria: T
    email: T
    scrollCue: T
  }
  langToggle: { aria: T }
  modeToggle: {
    label: T
    groupAria: T
    optionAll: T
    optionAllTitle: T
    hint: T
  }
  resume: { buttonAria: T; enAria: T; ptAria: T }
  summary: {
    srHeading: T
    experienceLabel: T
    experienceValue: T
    focusLabel: T
    locationLabel: T
    available: T
  }
  sections: {
    infra: { title: T; description: T }
    competencies: { title: T; description: T }
    projects: { title: T }
    controlRoom: { title: T; description: T }
    experience: { title: T; description: T }
    contact: { title: T; description: T }
  }
  projectCard: { problem: T; approach: T; repo: T; caseStudy: T }
  controlRoom: {
    status: T
    noTelemetry: T
    live: T
    uptime: T
    legendAria: T
    nodes: Record<string, ControlRoomNode<T>>
  }
  experienceSection: { certifications: T }
  contactSection: { lead: T; copy: T; copied: T }
  configShowcase: { tablistAria: T }
  footer: { rights: T }
}

export type Profile = {
  name: string
  location: string
  email: string
  github: string
  linkedin: string
  available: boolean
}

export type SiteContent = {
  profile: Profile
  modes: Record<ModeKey, Mode>
  competencies: CompetencyCategory[]
  configSnippets: ConfigSnippet[]
  projects: Project[]
  experiences: Experience[]
  certifications: Certification[]
  ui: UiStrings
}

/* Identificador curto e estável de projeto (igual nos dois idiomas): o nome
 * antes do parêntese. Usado no id do card e nos comandos do terminal. */
export const projectSlug = (title: string) => title.split(" (")[0].trim().toLowerCase()

/* Cor única por modo — esfera, eyebrow, régua, token e toggle usam o mesmo hex.
 * Hex cheio sempre: em alpha reduzida o vermelho falha contraste AA no #030303. */
export const modeColors: Record<ModeKey, string> = {
  fullstack: "#4f8be0",
  all: "#9d6bf0",
  devops: "#e0555a",
}

export const profile = {
  name: "Samuel Monteiro",
  location: l("Curitiba, Brasil", "Curitiba, Brazil"),
  email: "samuel@monteirotf.com",
  github: "https://github.com/samuelmonteirotf",
  linkedin: "https://www.linkedin.com/in/samuel-monteiro-2534802a0/",
  available: true,
}

/* ------------------------------------------------------------------ *
 * Identidade dupla: pílula azul = o produto (full-stack), vermelha = a
 * máquina por trás (devops/edge). O modo reescreve headline, tagline,
 * foco, resumo e quais projetos e seções aparecem.
 * ------------------------------------------------------------------ */
const modes: Record<ModeKey, Mode<L>> = {
  devops: {
    role: l("Engenheiro DevOps e Segurança na Edge", "DevOps & Edge Security Engineer"),
    tagline: l(
      "Defendo sistemas na borda da rede. Meu firewall de bots roda em Cloudflare Workers e decide na própria edge o que passa, o que é desafiado e o que é bloqueado, sem pagar por Bot Management.",
      "I defend systems at the network edge. My bot firewall runs on Cloudflare Workers and decides right at the edge what passes, what gets challenged, and what gets blocked, without paying for Bot Management.",
    ),
    taglineParts: {
      before: l(
        "Defendo sistemas na borda da rede. Meu firewall de bots roda em ",
        "I defend systems at the network edge. My bot firewall runs on ",
      ),
      token: same("Cloudflare Workers"),
      after: l(
        " e decide na própria edge o que passa, o que é desafiado e o que é bloqueado, sem pagar por Bot Management.",
        " and decides right at the edge what passes, what gets challenged, and what gets blocked, without paying for Bot Management.",
      ),
      voice: "sans",
    },
    focus: l("Segurança de edge e infra", "Edge security and infra"),
    summary: [
      l(
        "Engenheiro de software com mais de 4 anos de experiência em automação de infraestrutura, administração de sistemas Linux e segurança de redes.",
        "Software engineer with 4+ years of experience in infrastructure automation, Linux systems administration, and network security.",
      ),
      l(
        "No dia a dia, provisiono servidores com Docker e Docker Compose, configuro redes mesh seguras com Tailscale e WireGuard e desenvolvo APIs em Python com FastAPI e em Node.js.",
        "Day to day, I provision servers with Docker and Docker Compose, configure secure mesh networks with Tailscale and WireGuard, and build APIs in Python with FastAPI and in Node.js.",
      ),
      l(
        "Trabalho com foco em SRE, hardening e na eliminação de tarefas manuais repetitivas usando código e telemetria.",
        "I focus on SRE, hardening, and eliminating repetitive manual work with code and telemetry.",
      ),
    ],
    projectsIntro: l(
      "Infraestrutura, edge e os sistemas que mantêm produtos vivos: cada projeto com o problema, a abordagem técnica e o resultado.",
      "Infrastructure, edge, and the systems that keep products alive: each project with the problem, the technical approach, and the result.",
    ),
  },
  fullstack: {
    role: l("Engenheiro Full-Stack", "Full-Stack Engineer"),
    tagline: l(
      "Construo a parte que as pessoas usam: interfaces em React e Next.js, com APIs tipadas em FastAPI e Node por trás. No 6ID, meu ecossistema de licenças para plataformas de trading, a mesma API atende do console web ao cliente desktop porque eu cuido de todas as camadas.",
      "I build the part people use: React and Next.js interfaces, with typed FastAPI and Node APIs behind them. On 6ID, my license ecosystem for trading platforms, the same API serves the web console and the desktop client because I take care of every layer.",
    ),
    taglineParts: {
      before: l(
        "Construo a parte que as pessoas usam: interfaces em React e Next.js, com APIs tipadas em FastAPI e Node por trás. No 6ID, meu ecossistema de licenças para plataformas de trading, a mesma API atende do console web ao cliente desktop porque eu cuido de ",
        "I build the part people use: React and Next.js interfaces, with typed FastAPI and Node APIs behind them. On 6ID, my license ecosystem for trading platforms, the same API serves the web console and the desktop client because I take care of ",
      ),
      token: l("todas as camadas", "every layer"),
      after: same("."),
      voice: "sans",
    },
    focus: l("Produto e APIs", "Product and APIs"),
    summary: [
      l(
        "Engenheiro full-stack que entrega o caminho inteiro: da interface em Next.js e React que o usuário usa até os serviços em FastAPI e Node e o schema do PostgreSQL embaixo de tudo.",
        "Full-stack engineer who ships the entire path: from the Next.js and React interface users touch to the FastAPI and Node services and the PostgreSQL schema underneath.",
      ),
      l(
        "Transito bem por toda a stack: APIs REST tipadas, tempo real com WebSockets, jobs em segundo plano com BullMQ e a modelagem de dados que mantém tudo rápido sob carga.",
        "Comfortable across the stack: typed REST APIs, real time over WebSockets, background jobs with BullMQ, and the data modeling that keeps everything fast under load.",
      ),
      l(
        "Sou o mesmo engenheiro do lado DevOps. Por isso, o que eu construo já chega em produção com a própria infraestrutura confiável, sem repasse para outro time.",
        "I am the same engineer as the DevOps side. What I build reaches production with its own reliable infrastructure, without handing it off to another team.",
      ),
    ],
    projectsIntro: l(
      "Produtos construídos de ponta a ponta: o problema, a abordagem técnica e o resultado.",
      "Products built end to end: the problem, the technical approach, and the result.",
    ),
  },
  all: {
    role: l("Engenheiro Full-Stack e DevOps", "Full-Stack & DevOps Engineer"),
    tagline: l(
      "A maioria dos produtos precisa de dois engenheiros: um para construir e outro para manter no ar. Eu faço os dois. A interface em Next.js e o firewall que a protege saem das mesmas mãos.",
      "Most products need two engineers: one to build it and one to keep it running. I do both. The Next.js interface and the firewall protecting it come from the same pair of hands.",
    ),
    taglineParts: {
      before: l(
        "A maioria dos produtos precisa de dois engenheiros: um para construir e outro para manter no ar. Eu faço os dois. A interface em Next.js e o firewall que a protege saem ",
        "Most products need two engineers: one to build it and one to keep it running. I do both. The Next.js interface and the firewall protecting it come from ",
      ),
      token: l("das mesmas mãos", "the same pair of hands"),
      after: same("."),
      voice: "sans",
    },
    focus: l("A stack inteira", "The whole stack"),
    summary: [
      l(
        "Engenheiro full-stack e especialista em DevOps e edge na mesma pessoa: entrego o produto e a plataforma em que ele roda.",
        "Full-stack engineer and DevOps and edge specialist in one: I deliver the product and the platform it runs on.",
      ),
      l(
        "Vou do frontend ao banco de dados (Next.js, React, FastAPI, Node, PostgreSQL) e cuido da infraestrutura por baixo (Docker, Cloudflare Workers, Tailscale, WireGuard, Caddy, hardening).",
        "I go from the frontend to the database (Next.js, React, FastAPI, Node, PostgreSQL) and take care of the infrastructure underneath (Docker, Cloudflare Workers, Tailscale, WireGuard, Caddy, hardening).",
      ),
      l(
        "Uma pessoa cobrindo o caminho inteiro: da ideia à produção e à rotina de manter tudo no ar.",
        "One person covering the whole path: from idea to production to keeping it all running.",
      ),
    ],
    projectsIntro: l(
      "Tudo: os produtos e a infraestrutura que os sustenta, com o problema, a abordagem e o resultado.",
      "Everything: the products and the infrastructure that keeps them running, with the problem, the approach, and the result.",
    ),
  },
}

const competencies: CompetencyCategory<L>[] = [
  {
    title: l("DevOps & Infraestrutura", "DevOps & Infrastructure"),
    tracks: ["devops"],
    items: [
      { name: same("Docker") },
      { name: same("Docker Compose") },
      { name: same("Linux/Unix SysAdmin"), detail: same("Debian, Arch Linux, macOS") },
      { name: same("Caddy Server"), detail: l("Proxy reverso, SSL automático", "Reverse proxy, automated SSL") },
      { name: same("VPN Mesh"), detail: same("Tailscale, WireGuard") },
      { name: l("Redes e Firewalls", "Networks & Firewalls"), detail: same("IPTables") },
      { name: same("SSH Hardening") },
      { name: same("Git") },
    ],
  },
  {
    title: l("Frontend & Produto", "Frontend & Product"),
    tracks: ["fullstack"],
    items: [
      { name: same("React") },
      { name: same("Next.js") },
      { name: same("TypeScript") },
      { name: same("Vite") },
      { name: same("Tailwind CSS") },
      { name: same("Zustand"), detail: l("estado atômico", "atomic state") },
      { name: same("TanStack Query") },
      { name: same("Zod"), detail: l("validação espelhada com Pydantic", "validation mirrored with Pydantic") },
      { name: same("Shadcn UI") },
      { name: same("Three.js"), detail: l("visualização acelerada", "hardware-accelerated visuals") },
      { name: same("Monaco Editor") },
    ],
  },
  {
    title: l("Desenvolvimento & Automação", "Development & Automation"),
    tracks: ["devops", "fullstack"],
    items: [
      { name: same("Python"), detail: l("FastAPI, scripts CLI, web scraping", "FastAPI, CLI scripts, web scraping") },
      { name: same("Node.js"), detail: l("APIs REST, WebSockets, BullMQ", "REST APIs, WebSockets, BullMQ") },
      { name: same("Rust"), detail: same("Tokio, Axum, Hyper") },
      { name: l("Automações n8n", "n8n Automation Workflows") },
      { name: same("Shell/Bash Scripting") },
      { name: same("Lua"), detail: l("configuração do Neovim", "Neovim configuration") },
    ],
  },
  {
    title: same("Edge & Serverless"),
    tracks: ["devops"],
    items: [
      { name: same("Cloudflare Workers") },
      { name: same("Durable Objects") },
      { name: same("KV Store") },
      { name: same("D1 Database") },
      { name: same("DNS-over-HTTPS") },
      { name: l("Heurísticas de segurança na edge", "Edge security heuristics") },
    ],
  },
  {
    title: l("Bancos de Dados & Filas", "Databases & Queues"),
    tracks: ["devops", "fullstack"],
    items: [
      { name: same("PostgreSQL") },
      { name: same("SQL Server") },
      { name: same("Redis Pub/Sub") },
      { name: same("SQLite") },
      { name: same("LUKS Full Disk Encryption") },
      { name: l("Autenticação mTLS", "mTLS Authentication") },
    ],
  },
]

// Real configuration snippets demonstrating practical depth
const configSnippets: ConfigSnippet<L>[] = [
  {
    id: "caddy",
    label: "Caddy",
    filename: "Caddyfile",
    language: "caddyfile",
    code: l(
      `api.monteirotf.com {
  encode zstd gzip
  tls samuel@monteirotf.com        # ACME: TLS automático, sem cron de renovação

  # hardening: headers de segurança em toda resposta
  header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Content-Security-Policy   "default-src 'none'; frame-ancestors 'none'"
    X-Frame-Options           "DENY"
    X-Content-Type-Options    "nosniff"
    Referrer-Policy           "strict-origin-when-cross-origin"
    Permissions-Policy        "geolocation=(), camera=(), microphone=()"
    -Server
  }

  # proxy reverso para o container, com health-check ativo
  reverse_proxy api:8080 {
    health_uri      /healthz
    health_interval 10s
    health_timeout  3s
    lb_policy       round_robin
  }
}`,
      `api.monteirotf.com {
  encode zstd gzip
  tls samuel@monteirotf.com        # ACME: automated TLS, no renewal cron

  # hardening: security headers on every response
  header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Content-Security-Policy   "default-src 'none'; frame-ancestors 'none'"
    X-Frame-Options           "DENY"
    X-Content-Type-Options    "nosniff"
    Referrer-Policy           "strict-origin-when-cross-origin"
    Permissions-Policy        "geolocation=(), camera=(), microphone=()"
    -Server
  }

  # reverse proxy to the container, with active health check
  reverse_proxy api:8080 {
    health_uri      /healthz
    health_interval 10s
    health_timeout  3s
    lb_policy       round_robin
  }
}`,
    ),
  },
  {
    id: "docker",
    label: "Docker",
    filename: "docker-compose.yml",
    language: "yaml",
    code: l(
      `services:
  api:
    image: ghcr.io/samuelmonteirotf/api:\${TAG:-latest}
    restart: unless-stopped
    read_only: true                       # rootfs imutável
    tmpfs: ["/tmp", "/run"]               # únicos caminhos graváveis no read_only
    user: "10001:10001"                   # processo sem root dentro do container
    security_opt: ["no-new-privileges:true"]
    cap_drop: ["ALL"]
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:8080/healthz"]
      interval: 10s
      timeout: 3s
      retries: 3
    deploy:
      resources:
        limits: { cpus: "0.50", memory: 256M }
    networks: [edge]

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
    networks: [edge]

networks: { edge: {} }
volumes:  { caddy_data: {} }`,
      `services:
  api:
    image: ghcr.io/samuelmonteirotf/api:\${TAG:-latest}
    restart: unless-stopped
    read_only: true                       # immutable rootfs
    tmpfs: ["/tmp", "/run"]               # only writable paths under read_only
    user: "10001:10001"                   # non-root process inside the container
    security_opt: ["no-new-privileges:true"]
    cap_drop: ["ALL"]
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:8080/healthz"]
      interval: 10s
      timeout: 3s
      retries: 3
    deploy:
      resources:
        limits: { cpus: "0.50", memory: 256M }
    networks: [edge]

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
    networks: [edge]

networks: { edge: {} }
volumes:  { caddy_data: {} }`,
    ),
  },
  {
    id: "worker",
    label: "Cloudflare Worker",
    filename: "src/index.js",
    language: "javascript",
    code: l(
      `// Sentinel, firewall de bots na edge: pontua cada requisição pela
// assinatura de TLS, HTTP e headers ANTES de tocar a origem.
export default {
  async fetch(req, env, ctx) {
    const score = threatScore(req)

    if (score >= 60) return new Response("Forbidden", { status: 403 }) // bloqueia
    if (score >= 30) return managedChallenge(req)                      // desafia

    const url = new URL(req.url)
    url.hostname = "origin.monteirotf.com"    // origem explícita (evita loop de subrequests)
    const res = await fetch(url, req)         // libera para a origem
    ctx.waitUntil(audit(env, req, score))     // log fora do caminho crítico, sem custo de latência
    return res
  },
}

function threatScore(req) {
  const cf = req.cf ?? {}
  const ua = req.headers.get("user-agent") ?? ""
  let s = 0
  if (/python-requests|curl|go-http-client|scrapy/i.test(ua)) s += 45
  if (!req.headers.get("accept-language")) s += 20
  if (cf.httpProtocol === "HTTP/1.1") s += 15   // navegador de verdade fala h2/h3
  if (cf.tlsVersion === "TLSv1" || cf.tlsVersion === "TLSv1.1") s += 20  // TLS antigo, não é navegador
  if (/hosting|cloud|datacenter/i.test(cf.asOrganization ?? "")) s += 25
  return Math.min(s, 100)
}`,
      `// Sentinel, edge bot firewall: scores each request by its
// TLS, HTTP, and header signature BEFORE touching the origin.
export default {
  async fetch(req, env, ctx) {
    const score = threatScore(req)

    if (score >= 60) return new Response("Forbidden", { status: 403 }) // block
    if (score >= 30) return managedChallenge(req)                      // challenge

    const url = new URL(req.url)
    url.hostname = "origin.monteirotf.com"    // explicit origin (prevents subrequest loops)
    const res = await fetch(url, req)         // forward to the origin
    ctx.waitUntil(audit(env, req, score))     // log outside the critical path, no latency cost
    return res
  },
}

function threatScore(req) {
  const cf = req.cf ?? {}
  const ua = req.headers.get("user-agent") ?? ""
  let s = 0
  if (/python-requests|curl|go-http-client|scrapy/i.test(ua)) s += 45
  if (!req.headers.get("accept-language")) s += 20
  if (cf.httpProtocol === "HTTP/1.1") s += 15   // real browsers speak h2/h3
  if (cf.tlsVersion === "TLSv1" || cf.tlsVersion === "TLSv1.1") s += 20  // old TLS, not a browser
  if (/hosting|cloud|datacenter/i.test(cf.asOrganization ?? "")) s += 25
  return Math.min(s, 100)
}`,
    ),
  },
  {
    id: "actions",
    label: "GitHub Actions",
    filename: ".github/workflows/deploy.yml",
    language: "yaml",
    code: l(
      `name: deploy
on:
  push:
    branches: [main]

permissions:
  contents: read
  packages: write

jobs:
  ship:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Scan de vulnerabilidades (falha em HIGH/CRITICAL)
        uses: aquasecurity/trivy-action@0.28.0
        with:
          scan-type: fs
          severity: HIGH,CRITICAL
          exit-code: "1"

      - name: Login no ghcr (autentica o daemon antes do push)
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Build e push (ghcr)
        run: |
          docker build -t ghcr.io/samuelmonteirotf/api:\${{ github.sha }} .
          docker push  ghcr.io/samuelmonteirotf/api:\${{ github.sha }}

      - name: Conecta na tailnet (CLI + OAuth)
        uses: tailscale/github-action@v3
        with:
          oauth-client-id: \${{ secrets.TS_OAUTH_CLIENT_ID }}
          oauth-secret: \${{ secrets.TS_OAUTH_SECRET }}
          tags: tag:ci

      - name: Deploy na VPS (Tailscale SSH + docker compose)
        run: |
          tailscale ssh deploy@edge-1 "
            export TAG=\${{ github.sha }}
            docker compose pull && docker compose up -d --no-deps api
          "`,
      `name: deploy
on:
  push:
    branches: [main]

permissions:
  contents: read
  packages: write

jobs:
  ship:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Vulnerability scan (fails on HIGH/CRITICAL)
        uses: aquasecurity/trivy-action@0.28.0
        with:
          scan-type: fs
          severity: HIGH,CRITICAL
          exit-code: "1"

      - name: Login to ghcr (authenticates daemon before push)
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Build and push (ghcr)
        run: |
          docker build -t ghcr.io/samuelmonteirotf/api:\${{ github.sha }} .
          docker push  ghcr.io/samuelmonteirotf/api:\${{ github.sha }}

      - name: Connect to the tailnet (CLI + OAuth)
        uses: tailscale/github-action@v3
        with:
          oauth-client-id: \${{ secrets.TS_OAUTH_CLIENT_ID }}
          oauth-secret: \${{ secrets.TS_OAUTH_SECRET }}
          tags: tag:ci

      - name: Deploy to the VPS (Tailscale SSH + docker compose)
        run: |
          tailscale ssh deploy@edge-1 "
            export TAG=\${{ github.sha }}
            docker compose pull && docker compose up -d --no-deps api
          "`,
    ),
  },
]

const projects: Project<L>[] = [
  {
    title: l("TessTrade (Trading Algorítmico)", "TessTrade (Algorithmic Trading)"),
    context: l("TessTrade-Corp · No ar", "TessTrade-Corp · Live"),
    problem: l(
      "Traders quantitativos não tinham um único lugar para escrever, testar e compartilhar estratégias: backtesting exige processar séries históricas pesadas em paralelo, e a interface precisa continuar fluida recebendo ticks em alta frequência.",
      "Quantitative traders had no single place to write, test, and share strategies: backtesting requires processing heavy historical series in parallel, and the interface must stay fluid while receiving high-frequency ticks.",
    ),
    solution: l(
      "Arquitetei a plataforma completa: engine de simulação multithread em Rust para Monte Carlo e processamento de ticks, indicadores em Python executados em sandbox e ligados à engine via FFI/RPC, e um workspace modular em React com Monaco Editor para desenvolver estratégias no próprio navegador. Séries temporais em TimescaleDB, identidade com Clerk, estado com Zustand e TanStack Query. Código fechado por política corporativa.",
      "I architected the whole platform: a multithreaded Rust simulation engine for Monte Carlo and tick processing, Python indicators running in a sandbox and connected to the engine via FFI/RPC, and a modular React workspace with Monaco Editor for developing strategies right in the browser. Time series in TimescaleDB, identity with Clerk, state with Zustand and TanStack Query. Source code withheld under corporate policy.",
    ),
    impact: [
      { label: l("Engine de simulação", "Simulation engine"), value: l("Rust multithread", "Multithreaded Rust") },
      { label: l("Estratégias no navegador", "Strategies in the browser"), value: same("Monaco + sandbox Python") },
      { label: l("Séries temporais", "Time series"), value: same("TimescaleDB") },
    ],
    stack: ["Rust · Axum", "React", "TypeScript", "Python", "TimescaleDB", "Three.js", "Docker"],
    repo: "https://github.com/samuelmonteirotf/TessTrade",
    repoLabel: l("Case técnico", "Tech case"),
    live: "https://tesstrade.com",
    image: {
      src: "/projects/tesstrade-backtest.jpg",
      alt: l(
        "Workspace de backtest da TessTrade: lista de estratégias, curva de patrimônio e histórico de trades",
        "TessTrade backtest workspace: strategy list, equity curve and trade history",
      ),
    },
    demo: "backtest",
    tracks: ["fullstack"],
  },
  {
    title: l("6ID (Ecossistema Distribuído)", "6ID (Distributed Ecosystem)"),
    context: l("6ID Trading Solutions · Corporativo", "6ID Trading Solutions · Corporate"),
    problem: l(
      "Plataformas de trading precisavam gerenciar licenças, autenticar usuários e administrar operações em três frentes ao mesmo tempo: uma API central, um console web e um cliente desktop rodando na máquina de cada usuário.",
      "Trading platforms needed to manage licenses, authenticate users, and run administration across three fronts at once: a central API, a web console, and a desktop client running on each user's machine.",
    ),
    solution: l(
      "Projetei o ecossistema inteiro: backend assíncrono em FastAPI com SQLAlchemy e Asyncpg para validação concorrente de licenças, console de administração em Next.js com validação espelhada entre Pydantic e Zod, e o cliente Windows em WPF no .NET 8, compilado com ReadyToRun num binário único e enxuto. Código fechado por política de segurança corporativa.",
      "I designed the entire ecosystem: an asynchronous FastAPI backend with SQLAlchemy and Asyncpg for concurrent license validation, a Next.js administration console with validation mirrored between Pydantic and Zod, and a Windows WPF client on .NET 8, compiled with ReadyToRun into a single lean binary. Source code withheld under corporate security policy.",
    ),
    impact: [
      { label: l("Arquitetura", "Architecture"), value: l("API + console web + desktop", "API + web console + desktop") },
      { label: l("Cliente Windows", "Windows client"), value: l(".NET 8 ReadyToRun, binário único", ".NET 8 ReadyToRun, single binary") },
      { label: l("Validação", "Validation"), value: l("Pydantic e Zod espelhados", "Mirrored Pydantic and Zod") },
    ],
    stack: ["FastAPI", "Next.js", "TypeScript", "C# · WPF", "PostgreSQL", "Docker"],
    repo: "https://github.com/samuelmonteirotf/6ID",
    repoLabel: l("Case técnico", "Tech case"),
    tracks: ["fullstack"],
  },
  {
    title: l("Sentinel (Firewall de Bots na Edge)", "Sentinel (Edge Bot Firewall)"),
    context: l("Firewall e Segurança de Edge", "Firewall & Edge Security"),
    problem: l(
      "Ataques de bots e scrapers consumiam banda e requisições em excesso, inflando o custo da infraestrutura sem uma ferramenta de mitigação viável no free tier.",
      "Bot attacks and data scrapers consumed excessive bandwidth and requests, inflating infrastructure costs without a viable mitigation tool on the free tier.",
    ),
    solution: l(
      "Desenvolvi o Sentinel, um firewall de bots executado na edge com Cloudflare Workers e Durable Objects. Cada requisição recebe uma pontuação por assinaturas de TLS, versão de HTTP, headers do navegador e rede de origem, passa por um rate limit adaptativo por cliente e sai com um veredito na própria edge: libera, desafia ou bloqueia. O registro acontece em ctx.waitUntil, fora do caminho da resposta.",
      "I built Sentinel, a bot firewall running at the edge on Cloudflare Workers and Durable Objects. Each request is scored by its TLS, HTTP version, browser header, and source network signatures, goes through a per-client adaptive rate limit, and gets a verdict right at the edge: allow, challenge, or block. Logging runs in ctx.waitUntil, off the response path.",
    ),
    impact: [
      { label: l("Tráfego malicioso", "Malicious traffic"), value: l("Bloqueado na edge", "Blocked at the edge") },
      { label: l("Registro de eventos", "Event logging"), value: l("Fora do caminho (waitUntil)", "Off the path (waitUntil)") },
      { label: l("Custo de API de segurança", "Security API cost"), value: same("$0 (free tier)") },
    ],
    stack: ["Cloudflare Workers", "Durable Objects", "JavaScript", "Vitest"],
    repo: "https://github.com/samuelmonteirotf/sentinel",
    demo: "sentinel",
    tracks: ["devops"],
  },
  {
    title: l("Aegis (Proxy Reverso e Rate Limiter)", "Aegis (Reverse Proxy and Rate Limiter)"),
    context: l("Controle de Tráfego na Origem · Rust", "Origin Traffic Control · Rust"),
    problem: l(
      "Um backend HTTP exposto fica à mercê de clientes abusivos: rajadas de requisições por IP, conexões lentas que seguram sockets (slowloris) e corpos gigantes. Faltava uma camada de proteção rodando na própria origem, sem depender de serviço externo.",
      "An exposed HTTP backend is at the mercy of abusive clients: per-IP request bursts, slow connections holding sockets (slowloris), and oversized bodies. It needed a protection layer running at the origin itself, with no external service dependency.",
    ),
    solution: l(
      "Escrevi o Aegis em Rust, sobre tokio, axum e hyper: proxy reverso transparente com rate limit por IP em token bucket (DashMap particionado, lock por shard no caminho quente), limites por rota, agrupamento de IPv6 por prefixo, timeouts em todas as etapas, proxying de WebSocket, TLS opcional e recarga de configuração por SIGHUP sem derrubar conexões. Health check e métricas Prometheus vivem num plano administrativo separado, que nunca é limitado.",
      "I wrote Aegis in Rust, on top of tokio, axum, and hyper: a transparent reverse proxy with per-IP token bucket rate limiting (sharded DashMap, per-shard lock on the hot path), per-route limits, IPv6 prefix grouping, timeouts at every stage, WebSocket proxying, optional TLS, and SIGHUP configuration reload without dropping connections. Health checks and Prometheus metrics live on a separate admin plane that is never rate limited.",
    ),
    impact: [
      { label: l("Imagem Docker", "Docker image"), value: same("FROM scratch, non-root") },
      { label: l("Recarga de config", "Config reload"), value: l("SIGHUP, sem derrubar conexões", "SIGHUP, no dropped connections") },
      { label: l("Memória", "Memory"), value: l("Cap de buckets + sweeper", "Bucket cap + sweeper") },
    ],
    stack: ["Rust", "Tokio", "Axum", "Hyper", "Prometheus", "Docker"],
    repo: "https://github.com/samuelmonteirotf/aegis-proxy",
    demo: "aegis",
    tracks: ["devops"],
  },
  {
    title: l("RealScan (Auditor Externo de Segurança)", "RealScan (External Security Auditor)"),
    context: l("Postura de Segurança Automatizada", "Automated Security Posture"),
    problem: l(
      "Erros de configuração em headers HTTP, registros DNS (SPF/DMARC) e vazamentos de credenciais no lado do cliente eram difíceis de auditar continuamente de fora para dentro.",
      "HTTP security header misconfigurations, DNS record (SPF/DMARC) flaws, and client-side credential leaks were difficult to continuously audit from the outside.",
    ),
    solution: l(
      "Criei o RealScan, um scanner serverless em Cloudflare Workers que audita domínios de fora para dentro, checando headers, registros de e-mail e segredos expostos no cliente. A guarda anti-SSRF nega faixas privadas, loopback, link-local (incluindo o endpoint de metadados de nuvem), CGNAT e IPv4 escondido em IPv6.",
      "I created RealScan, a serverless scanner on Cloudflare Workers that audits domains from the outside in, checking headers, email records, and client-side exposed secrets. The anti-SSRF guard denies private ranges, loopback, link-local (including the cloud metadata endpoint), CGNAT, and IPv4 hidden inside IPv6.",
    ),
    impact: [
      { label: l("Execução", "Runtime"), value: l("Serverless na edge", "Serverless at the edge") },
      { label: l("Segredos no cliente", "Client-side secrets"), value: l("Detectados e ocultados", "Detected and redacted") },
      { label: l("Guarda anti-SSRF", "SSRF guard"), value: l("Privadas, loopback e metadados", "Private, loopback, metadata") },
    ],
    stack: ["Cloudflare Workers", "JavaScript", "DNS-over-HTTPS"],
    repo: "https://github.com/samuelmonteirotf/realscan",
    tracks: ["devops"],
  },
]

const experiences: Experience<L>[] = [
  {
    role: l("Engenheiro de Automação & Desenvolvedor Full Stack", "Automation Engineer & Full Stack Developer"),
    company: "Freelancer",
    period: l("2022 até o presente", "2022 to Present"),
    description: l(
      "Arquitetei e implantei ecossistemas de microsserviços usando FastAPI e Node.js em containers Docker, reduzindo o tempo de processamento de requisições em 40%. Projetei redes mesh privadas (Tailscale VPN) com autenticação mTLS para VPS Debian e estruturei pipelines de deploy automatizado com Docker e Caddy, cortando o tempo de deploy em 70%.",
      "Architected and deployed microservices ecosystems using FastAPI and Node.js in Docker containers, reducing request processing time by 40%. Designed private mesh networks (Tailscale VPN) with mTLS authentication for Debian VPS instances, and structured automated deployment pipelines using Docker and Caddy, cutting deployment time by 70%.",
    ),
  },
  {
    role: l("Analista de Suporte / Administrador de Dados", "Support Analyst / Data Administrator"),
    company: "CNI Tecnologia e Software",
    period: l("jun a dez de 2024", "Jun to Dec 2024"),
    description: l(
      "Administrei servidores e políticas de segurança de redes Linux/Windows, reduzindo incidentes em 25% com hardening de conexões. Desenvolvi scripts Bash e Python para automação de backups e telemetria de hardware, poupando 15 horas semanais de esforço manual, e otimizei queries em SQL Server e PostgreSQL, acelerando relatórios em 50%.",
      "Managed servers and network security policies for Linux/Windows environments, reducing incidents by 25% through connection hardening. Developed Bash and Python scripts for backup automation and hardware telemetry, saving 15 hours of weekly manual effort, while optimizing SQL Server and PostgreSQL queries, speeding up reports by 50%.",
    ),
  },
  {
    role: l("Analista de Suporte & Desenvolvedor Web", "Support Analyst & Web Developer"),
    company: "Vip Informática",
    period: l("2017 a 2021", "2017 to 2021"),
    description: l(
      "Administrei bancos de dados operacionais PostgreSQL e SQL Server, reduzindo downtime com rotinas automáticas de backup. Desenvolvi e mantive ferramentas internas em Node.js e PHP, acelerando o tempo de resposta das APIs em 35% e mitigando 30% dos chamados repetitivos de suporte.",
      "Administered operational PostgreSQL and SQL Server databases, reducing downtime with automated backup routines. Developed and maintained internal tools in Node.js and PHP, decreasing API response times by 35% and mitigating 30% of repetitive support tickets.",
    ),
  },
]

const certifications: Certification<L>[] = [
  {
    name: l("CS50: Introdução à Ciência da Computação", "CS50: Introduction to Computer Science"),
    issuer: same("Harvard University"),
  },
  {
    name: l("Tecnólogo em Análise e Desenvolvimento de Sistemas", "Associate's Degree in Systems Analysis and Development"),
    issuer: l("PUCPR | Em andamento", "PUCPR | Ongoing"),
  },
  {
    name: l("Bacharelado em Direito", "Bachelor of Laws (LL.B.)"),
    issuer: l("UNISEPE (2017 a 2021)", "UNISEPE (2017 to 2021)"),
  },
]

const ui: UiStrings<L> = {
  header: {
    localeLine: same("Curitiba, BR · UTC−3"),
    captionFullstack: l("o produto que você vê", "the product you see"),
    captionDevops: l("a máquina por trás", "the machine underneath"),
    navAria: l("Links profissionais", "Professional links"),
    email: l("E-mail", "Email"),
    scrollCue: l("resultados abaixo", "proof below"),
  },
  langToggle: { aria: l("Idioma do site", "Site language") },
  modeToggle: {
    label: l("escolha um lado", "choose a side"),
    groupAria: l("Escolher o lado do portfólio", "Choose which side of the portfolio to read"),
    optionAll: l("Os dois", "Both"),
    optionAllTitle: l("Azul e vermelho fazem roxo.", "Blue and red make purple."),
    hint: l(
      "O azul constrói o produto. O vermelho protege a infraestrutura. A escolha muda a página inteira.",
      "Blue builds the product. Red protects the infrastructure. Your choice changes the whole page.",
    ),
  },
  resume: {
    buttonAria: l("CV, baixar currículo", "CV, download resume"),
    enAria: l("Baixar currículo em inglês (PDF)", "Download resume in English (PDF)"),
    ptAria: l("Baixar currículo em português (PDF)", "Download resume in Portuguese (PDF)"),
  },
  summary: {
    srHeading: l("Resumo profissional", "Professional summary"),
    experienceLabel: l("Experiência", "Experience"),
    experienceValue: l("4+ anos", "4+ years"),
    focusLabel: l("Foco", "Focus"),
    locationLabel: l("Localização", "Location"),
    available: l("Disponível para projetos", "Available for projects"),
  },
  sections: {
    infra: {
      title: l("Infraestrutura como código", "Infrastructure as Code"),
      description: l(
        "Configuração real da minha stack: proxy reverso com TLS automático, containers com hardening, firewall de bots na edge e CI/CD com auditoria de supply chain.",
        "Real configuration of my stack: reverse proxy with automated TLS, hardened containers, an edge bot firewall, and CI/CD with supply chain scanning.",
      ),
    },
    competencies: {
      title: l("Competências principais", "Core Competencies"),
      description: l(
        "Stack de plataforma de ponta a ponta: do provisionamento à operação e à confiabilidade.",
        "End-to-end platform stack: from provisioning to operation and reliability.",
      ),
    },
    projects: { title: l("Projetos em produção", "Production Projects") },
    controlRoom: {
      title: l("Sala de Controle", "Control Room"),
      description: l(
        "Ao lado, o tráfego real que passou pelo Sentinel, dividido por veredito na proporção exata do painel abaixo. Escolha uma peça da stack para ver o que ela faz e como é protegida.",
        "Alongside, the real traffic that went through Sentinel, split by verdict in the exact proportion of the panel below. Pick a piece of the stack to see what it does and how it is hardened.",
      ),
    },
    experience: {
      title: l("Trajetória e Certificações", "Trajectory & Certifications"),
      description: l(
        "Das operações de infraestrutura à engenharia de plataforma e confiabilidade.",
        "From infrastructure operations to platform and reliability engineering.",
      ),
    },
    contact: {
      title: l("Contato", "Contact"),
      description: l(
        "Disponível para conversar sobre produto, infraestrutura e confiabilidade. Resposta direta pelos canais abaixo.",
        "Available to talk about product, infrastructure, and reliability. Direct response through the channels below.",
      ),
    },
  },
  projectCard: {
    problem: l("Problema", "Problem"),
    approach: l("Abordagem", "Approach"),
    repo: l("Repositório", "Repository"),
    caseStudy: l("Case completo", "Full case study"),
  },
  controlRoom: {
    status: l("Sistema saudável", "System healthy"),
    noTelemetry: l("Sem telemetria", "No telemetry"),
    live: l("telemetria ao vivo", "live telemetry"),
    uptime: l("sentinel ativo na edge", "sentinel active at the edge"),
    legendAria: l("Nós da topologia", "Topology nodes"),
    nodes: {
      internet: {
        sub: l("tráfego de entrada", "inbound traffic"),
        desc: l(
          "Usuários reais e bots chegam aqui. A maior parte do tráfego é maliciosa (scrapers, requisições de datacenter) e é barrada ou desafiada na edge.",
          "Real users and bots arrive here. Most of the traffic is malicious (scrapers, datacenter requests) and is blocked or challenged at the edge.",
        ),
        tags: [l("bots e scrapers", "bots and scrapers"), l("filtrado na edge", "filtered at edge")],
      },
      sentinel: {
        sub: same("Cloudflare Worker · edge"),
        desc: l(
          "Firewall de bots na edge. Pontua cada requisição (User-Agent · Accept-Language · versão de HTTP · TLS · ASN) e decide na edge: bloqueia (≥60), desafia (≥30) ou libera. Durable Objects: RateLimiter adaptativo por cliente + Stats. O registro vai para ctx.waitUntil; o rate limit fica no caminho.",
          "Edge bot firewall. Scores each request (User-Agent · Accept-Language · HTTP version · TLS · ASN) and decides at the edge: blocks (≥60), challenges (≥30), or allows. Durable Objects: per-client adaptive RateLimiter + Stats. Recording goes to ctx.waitUntil; the rate limit stays on the path.",
        ),
        tags: [l("bloqueio por pontuação", "score-based blocking"), l("log fora do caminho", "off-path logging"), same("$0 free tier"), same("Durable Objects")],
      },
      realscan: {
        sub: same("Cloudflare Worker · edge"),
        desc: l(
          "Worker irmão do Sentinel: scanner externo de postura de segurança (headers, SPF/DMARC/DNSSEC, segredos expostos no cliente) com guarda anti-SSRF que bloqueia faixas privadas, loopback, link-local e o endpoint de metadados de nuvem.",
          "Sentinel's sibling worker: an external security posture scanner (headers, SPF/DMARC/DNSSEC, exposed client-side secrets) with an anti-SSRF guard that blocks private, loopback, and link-local ranges, including the cloud metadata endpoint.",
        ),
        tags: [same("DoH 1.1.1.1"), l("guarda anti-SSRF", "SSRF guard"), l("auditoria de headers", "headers audit")],
      },
      caddy: {
        sub: l("edge-1 · proxy reverso", "edge-1 · reverse proxy"),
        desc: l(
          "Proxy reverso na VPS edge-1 com TLS automático (ACME, sem cron de renovação). Aplica headers de segurança em toda resposta e faz health checks ativos do upstream.",
          "Reverse proxy on the edge-1 VPS with automated TLS (ACME, no renewal cron). Enforces security headers on every response and performs active upstream health checks.",
        ),
        tags: [same("auto-TLS"), same("HSTS · CSP · XFO"), same("/healthz 10s"), same("round_robin")],
      },
      api: {
        sub: same("edge-1 · docker :8080"),
        desc: l(
          "Container Docker com hardening: rootfs somente leitura, usuário sem root (uid 10001), todas as capabilities removidas (cap_drop ALL), no-new-privileges e tmpfs. Imagem versionada por SHA no ghcr.",
          "Hardened Docker container: read-only rootfs, non-root user (uid 10001), all capabilities dropped (cap_drop ALL), no-new-privileges, and tmpfs. SHA-versioned image on ghcr.",
        ),
        tags: [same("uid 10001"), same("ro-rootfs"), same("cap_drop ALL"), same("0.5cpu / 256M")],
      },
      postgres: {
        sub: l("auto-hospedado · docker", "self-hosted · docker"),
        desc: l(
          "Banco relacional primário, auto-hospedado em Docker com volume persistente, WAL e autovacuum.",
          "Primary relational database, self-hosted in Docker with a persistent volume, WAL, and autovacuum.",
        ),
        tags: [same("volume pg_data"), same("WAL"), same("autovacuum")],
      },
      redis: {
        sub: l("auto-hospedado · docker", "self-hosted · docker"),
        desc: l(
          "Cache e pub/sub, auto-hospedado em Docker com volume persistente e limite de memória.",
          "Cache and pub/sub, self-hosted in Docker with a persistent volume and a memory limit.",
        ),
        tags: [same("volume redis_data"), same("pub/sub"), same("maxmemory 256mb")],
      },
      tailscale: {
        sub: same("mesh mTLS · WireGuard"),
        desc: l(
          "Malha WireGuard privada com mTLS conectando as máquinas (arch-ws · macOS · edge-1). O SSH de deploy só viaja pela tailnet: a porta 22 nunca fica exposta à internet pública.",
          "Private WireGuard mesh with mTLS connecting the machines (arch-ws · macOS · edge-1). Deployment SSH only travels through the tailnet: port 22 is never exposed to the public internet.",
        ),
        tags: [same("WireGuard mTLS"), same("3 peers"), l("só ssh", "ssh-only"), l("sem :22 público", "no public :22")],
      },
    },
  },
  experienceSection: { certifications: l("Certificações", "Certifications") },
  contactSection: {
    lead: l("Vamos construir algo.", "Let's build something."),
    copy: l("Copiar e-mail", "Copy email"),
    copied: l("Copiado", "Copied"),
  },
  configShowcase: { tablistAria: l("Exemplos de configuração", "Configuration examples") },
  footer: { rights: l("Todos os direitos reservados.", "All rights reserved.") },
}

/* --------------------------- localização --------------------------- */

const isL = (v: unknown): v is L =>
  typeof v === "object" &&
  v !== null &&
  Object.keys(v).length === 2 &&
  typeof (v as L).pt === "string" &&
  typeof (v as L).en === "string"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function localize(node: any, lang: Lang): any {
  if (isL(node)) return node[lang]
  if (Array.isArray(node)) return node.map((n) => localize(n, lang))
  if (node && typeof node === "object") {
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, localize(v, lang)]))
  }
  return node
}

const SOURCE = { profile, modes, competencies, configSnippets, projects, experiences, certifications, ui }
const cache: Partial<Record<Lang, SiteContent>> = {}

export function getContent(lang: Lang): SiteContent {
  return (cache[lang] ??= localize(SOURCE, lang) as SiteContent)
}
