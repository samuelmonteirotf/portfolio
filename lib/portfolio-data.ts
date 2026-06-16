export const profile = {
  name: "Samuel Monteiro",
  role: "DevOps & Edge Security Engineer",
  location: "Curitiba, Brasil",
  email: "samuel@monteirotf.com",
  github: "https://github.com/samuelmonteirotf",
  linkedin: "https://www.linkedin.com/in/samuel-monteiro-2534802a0/",
  available: true,
  tagline:
    "Defesa na borda e infraestrutura enxuta: bot-firewall na Cloudflare Workers, redes mesh mTLS (Tailscale/WireGuard), Caddy com TLS automático e automação que elimina o trabalho manual.",
  proof: [
    { value: "-94%", label: "tráfego malicioso barrado" },
    { value: "0ms", label: "latência adicionada" },
    { value: "$0", label: "custo de infra (free tier)" },
  ],
  summary: [
    "Engenheiro de Software com mais de 4 anos de experiência especializado em automação de infraestrutura, administração de sistemas Linux e segurança de redes.",
    "Amplo histórico em provisionamento de servidores (Docker/Docker Compose), configuração de redes mesh seguras (Tailscale VPN/WireGuard) e desenvolvimento de APIs em Python (FastAPI) e Node.js.",
    "Foco em engenharia de confiabilidade de sistemas (SRE), segurança operacional (hardening) e eliminação de tarefas manuais repetitivas por meio de código e telemetria.",
  ],
}

export type Competency = {
  name: string
  detail?: string
}

export type CompetencyCategory = {
  title: string
  items: Competency[]
}

export const competencies: CompetencyCategory[] = [
  {
    title: "DevOps & Infraestrutura",
    items: [
      { name: "Docker" },
      { name: "Docker Compose" },
      { name: "Linux/Unix SysAdmin", detail: "Debian, Arch Linux, macOS" },
      { name: "Caddy Server", detail: "Proxy Reverso, SSL Automático" },
      { name: "VPN Mesh", detail: "Tailscale, WireGuard" },
      { name: "Redes & Firewalls", detail: "IPTables" },
      { name: "SSH Hardening" },
      { name: "Git" },
    ],
  },
  {
    title: "Desenvolvimento & Automação",
    items: [
      { name: "Python", detail: "FastAPI, CLI Scripts, Web Scraping" },
      { name: "Node.js", detail: "APIs REST, WebSockets, BullMQ" },
      { name: "n8n Automation Workflows" },
      { name: "Shell/Bash Scripting" },
      { name: "Lua", detail: "Neovim configuration" },
    ],
  },
  {
    title: "Edge & Serverless",
    items: [
      { name: "Cloudflare Workers" },
      { name: "Durable Objects" },
      { name: "KV Store" },
      { name: "D1 Database" },
      { name: "DNS-over-HTTPS" },
      { name: "Edge Security Heuristics" },
    ],
  },
  {
    title: "Bancos de Dados & Filas",
    items: [
      { name: "PostgreSQL" },
      { name: "SQL Server" },
      { name: "Redis Pub/Sub" },
      { name: "SQLite" },
      { name: "LUKS Full Disk Encryption" },
      { name: "mTLS Authentication" },
    ],
  },
]

// Snippets de configuração reais para demonstrar profundidade prática
export type ConfigSnippet = {
  id: string
  label: string
  filename: string
  language: string
  code: string
}

export const configSnippets: ConfigSnippet[] = [
  {
    id: "caddy",
    label: "Caddy",
    filename: "Caddyfile",
    language: "caddyfile",
    code: `api.monteirotf.com {
  encode zstd gzip
  tls samuel@monteirotf.com        # ACME — TLS automático, sem cron de renovação

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

  # reverse proxy pro container, com health-check ativo
  reverse_proxy api:8080 {
    health_uri      /healthz
    health_interval 10s
    health_timeout  3s
    lb_policy       round_robin
  }
}`,
  },
  {
    id: "docker",
    label: "Docker",
    filename: "docker-compose.yml",
    language: "yaml",
    code: `services:
  api:
    image: ghcr.io/samuelmonteirotf/api:\${TAG:-latest}
    restart: unless-stopped
    read_only: true                       # rootfs imutável
    tmpfs: ["/tmp", "/run"]               # únicos paths escritáveis sob read_only
    user: "10001:10001"                   # processo non-root dentro do container
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
  },
  {
    id: "worker",
    label: "Cloudflare Worker",
    filename: "src/index.js",
    language: "javascript",
    code: `// Sentinel — bot-firewall na borda: pontua cada request por
// fingerprint de TLS / HTTP / headers ANTES de tocar a origem.
export default {
  async fetch(req, env, ctx) {
    const score = threatScore(req)

    if (score >= 80) return new Response("Forbidden", { status: 403 }) // bloqueia
    if (score >= 60) return managedChallenge(req)                      // desafia

    const url = new URL(req.url)
    url.hostname = "origin.monteirotf.com"    // origin explícita (evita loop de subrequest)
    const res = await fetch(url, req)         // libera pra origem
    ctx.waitUntil(audit(env, req, score))     // log fora do caminho crítico → +0ms
    return res
  },
}

function threatScore(req) {
  const cf = req.cf ?? {}
  const ua = req.headers.get("user-agent") ?? ""
  let s = 0
  if (/python-requests|curl|go-http-client|scrapy/i.test(ua)) s += 45
  if (!req.headers.get("accept-language")) s += 20
  if (cf.httpProtocol === "HTTP/1.1") s += 15   // browser real fala h2/h3
  if (cf.tlsVersion === "TLSv1" || cf.tlsVersion === "TLSv1.1") s += 20  // TLS antigo, não-browser
  if (/hosting|cloud|datacenter/i.test(cf.asOrganization ?? "")) s += 25
  return Math.min(s, 100)
}`,
  },
  {
    id: "actions",
    label: "GitHub Actions",
    filename: ".github/workflows/deploy.yml",
    language: "yaml",
    code: `name: deploy
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

      - name: Build & push (ghcr)
        run: |
          docker build -t ghcr.io/samuelmonteirotf/api:\${{ github.sha }} .
          docker push  ghcr.io/samuelmonteirotf/api:\${{ github.sha }}

      - name: Conecta no tailnet (CLI + auth via OAuth)
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
  },
]

export type Project = {
  title: string
  context: string
  problem: string
  solution: string
  impact: { label: string; value: string }[]
  stack: string[]
  repo?: string
}

export const projects: Project[] = [
  {
    title: "Sentinel (Edge Bot-Firewall)",
    context: "Firewall e Segurança na Borda",
    problem:
      "Ataques de bots e raspadores de dados consumiam excesso de banda e requisições, inflando os custos da infraestrutura sem uma ferramenta de mitigação viável no plano gratuito.",
    solution:
      "Desenvolvi o Sentinel, um bot-firewall executado na borda usando Cloudflare Workers e Durable Objects. Ele pontua cada requisição usando TLS, versão HTTP e assinaturas de cabeçalho do navegador, reduzindo drasticamente o budget de conexões para agentes suspeitos.",
    impact: [
      { label: "Tráfego nocivo mitigado", value: "-94%" },
      { label: "Latência adicionada", value: "0ms (waitUntil)" },
      { label: "Custo com API de segurança", value: "$0 (Free tier)" },
    ],
    stack: ["Cloudflare Workers", "Durable Objects", "JavaScript", "Vitest"],
    repo: "https://github.com/samuelmonteirotf/sentinel",
  },
  {
    title: "RealScan (External Security Auditor)",
    context: "Segurança de Postura Automatizada",
    problem:
      "Falhas em cabeçalhos de segurança HTTP, registros DNS (SPF/DMARC) e vazamento de credenciais em código client-side eram difíceis de auditar continuamente de fora.",
    solution:
      "Criei o RealScan, um scanner serverless no Cloudflare Workers que audita domínios em segundos contra conformidade e segredos expostos. Implementa uma arquitetura robusta contra vetores SSRF bloqueando faixas IP privadas/reservadas (RFC1918).",
    impact: [
      { label: "Varredura completa", value: "Segundos" },
      { label: "Segredos no client-side", value: "Detectados + redigidos" },
      { label: "Guarda SSRF", value: "RFC1918 bloqueado" },
    ],
    stack: ["Cloudflare Workers", "JavaScript", "DNS-over-HTTPS"],
    repo: "https://github.com/samuelmonteirotf/realscan",
  },
  {
    title: "Cortex-Vault (Infraestrutura de Conhecimento)",
    context: "Sistema de Alta Performance e Sincronização",
    problem:
      "Inconsistências em bases de conhecimento locais causavam atritos operacionais e lentidão durante a ingestão e pesquisa local de dados entre diferentes hosts.",
    solution:
      "Construí um sistema de alto desempenho para ingestão de dados, sincronizado de forma automática via rede privada mesh Tailscale VPN com mTLS entre Arch Linux e macOS, com utilitários desenvolvidos em Shell e Python.",
    impact: [
      { label: "Sincronização segura", value: "mTLS ativa" },
      { label: "Tempo de busca local", value: "< 50ms" },
      { label: "Acesso", value: "Só via tailnet" },
    ],
    stack: ["Linux", "Shell Script", "Python", "Tailscale", "WireGuard"],
  },
  {
    title: "6ID (Gestão de Identidade Digital)",
    context: "Segurança Cibernética e Criptografia",
    problem:
      "Emissão e gestão de identidades digitais com segurança vulnerável e conformidade fraca para o tratamento de dados pessoais sensíveis.",
    solution:
      "Desenvolvi uma solução ponta a ponta segura para a emissão e controle de identidades digitais. Backend escalável em FastAPI com criptografia de ponta para tratamento de dados sensíveis e segurança cibernética.",
    impact: [
      { label: "Dados sensíveis", value: "Criptografados" },
      { label: "Conformidade", value: "LGPD by design" },
      { label: "Tecnologia principal", value: "FastAPI / Python" },
    ],
    stack: ["FastAPI", "React", "Python", "PostgreSQL"],
  },
  {
    title: "dotfiles-bspwm (Configuration-as-Code)",
    context: "Administração de Sistemas Linux",
    problem:
      "Manter ambientes Unix consistentes, reprodutíveis e livres de dados sensíveis expostos (como chaves de API, credenciais e histórico) ao publicar as configurações publicamente.",
    solution:
      "Desenvolvi um repositório de dotfiles auto-contido sob a estética Crimson (bspwm, sxhkd, picom, polybar, dunst e rofi) com um instalador automatizado e idempotente em Shell (setup.sh) que suporta GNU Stow, backups automáticos com timestamp, isolamento de falhas e auditoria de vazamento de dados.",
    impact: [
      { label: "Processo de instalação", value: "Totalmente idempotente" },
      { label: "Compatibilidade de deploy", value: "Link Direto / GNU Stow" },
      { label: "Privacidade", value: "Auditoria de segredos" },
    ],
    stack: ["Linux", "Shell Script", "BSPWM", "sxhkd", "GNU Stow", "Polybar"],
    repo: "https://github.com/samuelmonteirotf/dotfiles-bspwm",
  },
]

export type Experience = {
  role: string
  company: string
  period: string
  description: string
}

export const experiences: Experience[] = [
  {
    role: "Engenheiro de Automação & Desenvolvedor Full Stack",
    company: "Freelancer",
    period: "Desde 2022",
    description:
      "Arquitetei e implantei ecossistemas de microsserviços usando FastAPI e Node.js em contêineres Docker, reduzindo o tempo de processamento de requisições em 40%. Projetei redes mesh privadas (Tailscale VPN) com autenticação mTLS para VPS Debian, e estruturei pipelines de deploy automatizados usando Docker e Caddy, reduzindo o tempo de deploy em 70%.",
  },
  {
    role: "Analista de Suporte / Administrador de Dados",
    company: "CNI Tecnologia e Software",
    period: "2024 (Jun a Dez)",
    description:
      "Administrei servidores e políticas de segurança de redes Linux/Windows, reduzindo incidentes em 25% através de hardening de conexões. Desenvolvi scripts Bash e Python para automação de backups e telemetria de hardware, economizando 15h semanais de esforço manual, além de otimizar consultas SQL Server e PostgreSQL, acelerando relatórios em 50%.",
  },
  {
    role: "Analista de Suporte & Desenvolvedor Web",
    company: "Vip Informática",
    period: "2017 a 2021",
    description:
      "Administrei bancos de dados operacionais PostgreSQL e SQL Server, reduzindo downtime com rotinas de backup. Desenvolvi e mantive ferramentas internas em Node.js e PHP, reduzindo tempo de resposta de APIs em 35% e mitigando 30% do volume de chamados repetitivos.",
  },
]

export const certifications: { name: string; issuer: string }[] = [
  { name: "CC50: Introdução à Ciência da Computação", issuer: "Harvard University" },
  { name: "Tecnólogo em Análise e Desenvolvimento de Sistemas", issuer: "PUCPR | Em andamento" },
  { name: "Bacharelado em Direito", issuer: "UNISEPE (2017 a 2021)" },
]
export type ExperienceType = typeof experiences
