export const profile = {
  name: "Samuel Monteiro",
  role: "DevOps & Edge Security Engineer",
  location: "Curitiba, Brazil",
  email: "samuel@monteirotf.com",
  github: "https://github.com/samuelmonteirotf",
  linkedin: "https://www.linkedin.com/in/samuel-monteiro-2534802a0/",
  available: true,
  tagline:
    "Edge defense and lean infrastructure: bot-firewalls on Cloudflare Workers, mTLS mesh networks (Tailscale/WireGuard), Caddy with automated TLS, and automation that eliminates manual toil.",
  proof: [
    { value: "-94%", label: "malicious traffic blocked" },
    { value: "0ms", label: "latency added" },
    { value: "$0", label: "infrastructure cost (free tier)" },
  ],
  summary: [
    "Software Engineer with over 4 years of experience specializing in infrastructure automation, Linux systems administration, and network security.",
    "Extensive track record in server provisioning (Docker/Docker Compose), configuring secure mesh networks (Tailscale VPN/WireGuard), and developing APIs in Python (FastAPI) and Node.js.",
    "Focus on Site Reliability Engineering (SRE), operational security (hardening), and elimination of repetitive manual tasks through code and telemetry.",
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
    title: "DevOps & Infrastructure",
    items: [
      { name: "Docker" },
      { name: "Docker Compose" },
      { name: "Linux/Unix SysAdmin", detail: "Debian, Arch Linux, macOS" },
      { name: "Caddy Server", detail: "Reverse Proxy, Automated SSL" },
      { name: "VPN Mesh", detail: "Tailscale, WireGuard" },
      { name: "Networks & Firewalls", detail: "IPTables" },
      { name: "SSH Hardening" },
      { name: "Git" },
    ],
  },
  {
    title: "Development & Automation",
    items: [
      { name: "Python", detail: "FastAPI, CLI Scripts, Web Scraping" },
      { name: "Node.js", detail: "REST APIs, WebSockets, BullMQ" },
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
    title: "Databases & Queues",
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

// Real configuration snippets demonstrating practical depth
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
  tls samuel@monteirotf.com        # ACME — Automated TLS, no renewal cron

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

  # reverse proxy to container, with active health-check
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
    read_only: true                       # immutable rootfs
    tmpfs: ["/tmp", "/run"]               # only writable paths under read_only
    user: "10001:10001"                   # non-root process inside container
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
    code: `// Sentinel — edge bot-firewall: scores each request by
// TLS / HTTP / headers fingerprint BEFORE touching the origin.
export default {
  async fetch(req, env, ctx) {
    const score = threatScore(req)

    if (score >= 80) return new Response("Forbidden", { status: 403 }) // block
    if (score >= 60) return managedChallenge(req)                      // challenge

    const url = new URL(req.url)
    url.hostname = "origin.monteirotf.com"    // explicit origin (prevents subrequest loops)
    const res = await fetch(url, req)         // allow to origin
    ctx.waitUntil(audit(env, req, score))     // log outside critical path → +0ms
    return res
  },
}

function threatScore(req) {
  const cf = req.cf ?? {}
  const ua = req.headers.get("user-agent") ?? ""
  let s = 0
  if (/python-requests|curl|go-http-client|scrapy/i.test(ua)) s += 45
  if (!req.headers.get("accept-language")) s += 20
  if (cf.httpProtocol === "HTTP/1.1") s += 15   // real browser speaks h2/h3
  if (cf.tlsVersion === "TLSv1" || cf.tlsVersion === "TLSv1.1") s += 20  // old TLS, non-browser
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

      - name: Build & push (ghcr)
        run: |
          docker build -t ghcr.io/samuelmonteirotf/api:\${{ github.sha }} .
          docker push  ghcr.io/samuelmonteirotf/api:\${{ github.sha }}

      - name: Connect to tailnet (CLI + OAuth auth)
        uses: tailscale/github-action@v3
        with:
          oauth-client-id: \${{ secrets.TS_OAUTH_CLIENT_ID }}
          oauth-secret: \${{ secrets.TS_OAUTH_SECRET }}
          tags: tag:ci

      - name: Deploy to VPS (Tailscale SSH + docker compose)
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
    context: "Firewall & Edge Security",
    problem:
      "Bot attacks and data scrapers consumed excessive bandwidth and requests, inflating infrastructure costs without a viable mitigation tool on the free tier.",
    solution:
      "Developed Sentinel, an edge-executed bot-firewall using Cloudflare Workers and Durable Objects. It scores each request using TLS, HTTP version, and browser header signatures, drastically reducing the connection budget for suspicious agents.",
    impact: [
      { label: "Harmful traffic mitigated", value: "-94%" },
      { label: "Added latency", value: "0ms (waitUntil)" },
      { label: "Security API cost", value: "$0 (Free tier)" },
    ],
    stack: ["Cloudflare Workers", "Durable Objects", "JavaScript", "Vitest"],
    repo: "https://github.com/samuelmonteirotf/sentinel",
  },
  {
    title: "RealScan (External Security Auditor)",
    context: "Automated Security Posture",
    problem:
      "HTTP security header misconfigurations, DNS records (SPF/DMARC) flaws, and client-side credential leaks were difficult to continuously audit from the outside.",
    solution:
      "Created RealScan, a serverless scanner on Cloudflare Workers that audits domains in seconds for compliance and exposed secrets. Implements a robust architecture against SSRF vectors by blocking private/reserved IP ranges (RFC1918).",
    impact: [
      { label: "Full scan duration", value: "Seconds" },
      { label: "Client-side secrets", value: "Detected + redacted" },
      { label: "SSRF guard", value: "RFC1918 blocked" },
    ],
    stack: ["Cloudflare Workers", "JavaScript", "DNS-over-HTTPS"],
    repo: "https://github.com/samuelmonteirotf/realscan",
  },
  {
    title: "Cortex-Vault (Knowledge Infrastructure)",
    context: "High Performance & Synchronization System",
    problem:
      "Inconsistencies in local knowledge bases caused operational friction and sluggishness during data ingestion and local search across different hosts.",
    solution:
      "Built a high-performance system for data ingestion, automatically synchronized over a private Tailscale VPN mesh network with mTLS between Arch Linux and macOS, featuring utilities developed in Shell and Python.",
    impact: [
      { label: "Secure synchronization", value: "Active mTLS" },
      { label: "Local search time", value: "< 50ms" },
      { label: "Access limit", value: "Only via tailnet" },
    ],
    stack: ["Linux", "Shell Script", "Python", "Tailscale", "WireGuard"],
  },
  {
    title: "6ID (Digital Identity Management)",
    context: "Cybersecurity & Cryptography",
    problem:
      "Issuance and management of digital identities suffered from vulnerable security and weak compliance for handling sensitive personal data.",
    solution:
      "Developed a secure end-to-end solution for digital identity issuance and control. Scalable backend in FastAPI featuring end-to-end encryption for handling sensitive data and cybersecurity compliance.",
    impact: [
      { label: "Sensitive data", value: "Encrypted" },
      { label: "Compliance", value: "LGPD/GDPR by design" },
      { label: "Core technology", value: "FastAPI / Python" },
    ],
    stack: ["FastAPI", "React", "Python", "PostgreSQL"],
  },
  {
    title: "dotfiles-bspwm (Configuration-as-Code)",
    context: "Linux Systems Administration",
    problem:
      "Maintaining Unix environments consistent, reproducible, and free from exposed sensitive data (such as API keys, credentials, and history) when publishing configurations publicly.",
    solution:
      "Developed a self-contained dotfiles repository under the Crimson aesthetic (bspwm, sxhkd, picom, polybar, dunst, and rofi) featuring an automated and idempotent Shell installer (setup.sh) that supports GNU Stow, automated timestamped backups, fault isolation, and data leak auditing.",
    impact: [
      { label: "Installation process", value: "Fully idempotent" },
      { label: "Deployment compatibility", value: "Direct Link / GNU Stow" },
      { label: "Privacy", value: "Secrets auditing" },
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
    role: "Automation Engineer & Full Stack Developer",
    company: "Freelance",
    period: "2022 - Present",
    description:
      "Architected and deployed microservices ecosystems using FastAPI and Node.js in Docker containers, reducing request processing time by 40%. Designed private mesh networks (Tailscale VPN) with mTLS authentication for Debian VPS instances, and structured automated deployment pipelines using Docker and Caddy, cutting deployment time by 70%.",
  },
  {
    role: "Support Analyst / Data Administrator",
    company: "CNI Tecnologia e Software",
    period: "2024 (Jun - Dec)",
    description:
      "Managed servers and network security policies for Linux/Windows environments, reducing incidents by 25% through connection hardening. Developed Bash and Python scripts for backup automation and hardware telemetry, saving 15 hours of weekly manual effort, while optimizing SQL Server and PostgreSQL queries, speeding up reports by 50%.",
  },
  {
    role: "Support Analyst & Web Developer",
    company: "Vip Informática",
    period: "2017 - 2021",
    description:
      "Administered operational PostgreSQL and SQL Server databases, reducing downtime with automated backup routines. Developed and maintained internal tools in Node.js and PHP, decreasing API response times by 35% and mitigating 30% of repetitive support tickets.",
  },
]

export const certifications: { name: string; issuer: string }[] = [
  { name: "CS50: Introduction to Computer Science", issuer: "Harvard University" },
  { name: "Degree in Systems Analysis and Development", issuer: "PUCPR | Ongoing" },
  { name: "Bachelor of Laws (LL.B.)", issuer: "UNISEPE (2017 - 2021)" },
]
export type ExperienceType = typeof experiences
