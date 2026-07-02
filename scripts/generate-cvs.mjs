/* Gerador dos CVs em PDF — 3 perfis (devops, fullstack, completo) x 2 idiomas.
 *
 * Uso:
 *   PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i playwright --no-save --legacy-peer-deps
 *   npx playwright install chromium-headless-shell   # uma vez por máquina
 *   npm run cv
 *
 * O playwright fica fora do package.json de propósito: como devDependency, o
 * postinstall dele baixaria ~400MB de browsers em todo npm install (inclusive
 * no build do Cloudflare Pages). Instale local com --no-save quando precisar.
 *
 * Saída (em public/): o CV baixado pelo site segue o modo ativo do toggle —
 *   samuel-monteiro-cv-pt.pdf            / -en.pdf            (os dois lados)
 *   samuel-monteiro-cv-devops-pt.pdf     / -devops-en.pdf
 *   samuel-monteiro-cv-fullstack-pt.pdf  / -fullstack-en.pdf
 */
import { chromium } from "playwright"

const OUT_DIR = new URL("../public/", import.meta.url).pathname

const CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { font-family: Arial, 'Liberation Sans', 'Helvetica Neue', sans-serif; color: #1f2937; font-size: 9.6pt; line-height: 1.45; }
  .name { text-align: center; font-size: 20pt; font-weight: 700; color: #111827; }
  .role { text-align: center; font-size: 10.5pt; font-weight: 700; letter-spacing: 3px; color: #1d4ed8; margin-top: 3pt; text-transform: uppercase; }
  .contact { text-align: center; color: #4b5563; font-size: 8.8pt; margin-top: 7pt; }
  .contact .link { color: #1d4ed8; }
  h2 { background: #eef2f7; border-left: 3.5pt solid #1d4ed8; padding: 3.5pt 8pt; font-size: 10pt; letter-spacing: 1.6px; color: #111827; margin: 15pt 0 8pt; text-transform: uppercase; }
  .skill { margin-top: 5pt; }
  .skill b { color: #111827; }
  .head { display: flex; justify-content: space-between; align-items: baseline; margin-top: 10pt; }
  .head .title { font-weight: 700; font-size: 9.8pt; }
  .head .co { color: #1d4ed8; }
  .head .date { color: #6b7280; font-size: 8.8pt; white-space: nowrap; padding-left: 12pt; }
  .head .stack { font-family: 'Courier New', monospace; color: #1d4ed8; font-size: 8.3pt; white-space: nowrap; padding-left: 12pt; }
  ul { margin: 3pt 0 0 13pt; }
  li { margin-top: 2.5pt; }
  .ptext { margin-top: 2pt; }
  .org { color: #6b7280; font-size: 8.8pt; margin-top: 1pt; }
  .avoid-break { break-inside: avoid; }
`

function render(d) {
  const skills = d.skills.map((s) => `<p class="skill"><b>${s.label}:</b> ${s.text}</p>`).join("")
  const jobs = d.jobs
    .map(
      (j) => `<div class="avoid-break">
        <div class="head"><span class="title">${j.role} · <span class="co">${j.company}</span></span><span class="date">${j.date}</span></div>
        <ul>${j.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
      </div>`,
    )
    .join("")
  const projects = d.projects
    .map(
      (p) => `<div class="avoid-break">
        <div class="head"><span class="title">${p.name}</span><span class="stack">${p.stack}</span></div>
        <p class="ptext">${p.text}</p>
      </div>`,
    )
    .join("")
  const education = d.education
    .map(
      (e) => `<div class="avoid-break">
        <div class="head"><span class="title">${e.title}</span><span class="date">${e.date}</span></div>
        <p class="org">${e.org}</p>
      </div>`,
    )
    .join("")
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
    <div class="name">${d.name}</div>
    <div class="role">${d.role}</div>
    <div class="contact">${d.contact}</div>
    <div class="contact"><span class="link">${d.links.join('</span> • <span class="link">')}</span></div>
    <h2>${d.headings.profile}</h2><p>${d.profile}</p>
    <h2>${d.headings.skills}</h2>${skills}
    <h2>${d.headings.experience}</h2>${jobs}
    <h2>${d.headings.projects}</h2>${projects}
    <h2>${d.headings.education}</h2>${education}
  </body></html>`
}

/* ---------------------------------- base ---------------------------------- */

const LINKS = ["github.com/samuelmonteirotf", "linkedin.com/in/samuelmonteirotf", "monteirotf.com"]

const BASE = {
  pt: {
    name: "Samuel Monteiro Junior",
    links: LINKS,
    contact: "Curitiba, PR • (13) 99757-5300 • samuel@monteirotf.com",
    headings: {
      profile: "Perfil Profissional",
      skills: "Habilidades Técnicas",
      experience: "Experiência Profissional",
      projects: "Projetos",
      education: "Formação Acadêmica",
    },
    jobs: [
      {
        role: "Engenheiro de Automação & Desenvolvedor Full Stack",
        company: "Freelancer",
        date: "Abril de 2022 até o presente",
        bullets: [
          "Arquitetei e implantei ecossistemas de microsserviços usando FastAPI e Node.js em containers Docker, reduzindo o tempo de processamento de requisições em 40%.",
          "Projetei e implementei uma rede mesh privada (Tailscale VPN) com autenticação mTLS para conectar hosts locais a servidores VPS Debian, blindando o tráfego de dados sensíveis.",
          "Desenvolvi o Cortex-Nexus, um pipeline de automação (n8n, Python, IA) de extração e qualificação de leads, alcançando 99.7% de entregabilidade e processando mais de 3.000 leads/mês.",
          "Estruturei o Parana-Leads, com deploy automatizado em contêineres Docker usando Caddy como proxy reverso com SSL automático, reduzindo o tempo de deploy de novos ambientes em 70%.",
        ],
      },
      {
        role: "Analista de Suporte / Administrador de Dados",
        company: "CNI Tecnologia e Software",
        date: "Junho de 2024 a Dezembro de 2024",
        bullets: [
          "Administrei servidores e políticas de segurança de redes Linux/Windows, reduzindo incidentes de segurança em 25% através de hardening de conexões e controle de acesso.",
          "Desenvolvi scripts Bash e Python para automatizar backups periódicos de bancos de dados relacionais e telemetria de performance de hardware, reduzindo o esforço manual de monitoramento em 15 horas semanais.",
          "Otimizei queries e rotinas de manutenção em bancos de dados SQL Server e PostgreSQL, reduzindo o tempo de carregamento de relatórios gerenciais em 50%.",
        ],
      },
      {
        role: "Analista de Suporte & Desenvolvedor Web",
        company: "Vip Informática",
        date: "Fevereiro de 2017 a Janeiro de 2021",
        bullets: [
          "Administrei bancos de dados operacionais (PostgreSQL/SQL Server), implementando rotinas automáticas de backup e reduzindo o tempo de inatividade (downtime) para próximo de zero.",
          "Desenvolvi e mantive ferramentas internas (Node.js/PHP) com foco em otimização de consultas e tempos de carregamento, acelerando o tempo de resposta das APIs internas em 35%.",
          "Liderei a reestruturação de processos de suporte de TI e documentação técnica, resultando em uma redução de 30% no volume de chamados repetitivos.",
        ],
      },
    ],
    education: [
      { title: "Tecnólogo em Análise e Desenvolvimento de Sistemas", org: "PUCPR (EAD)", date: "2024, em andamento" },
      { title: "Bacharelado em Direito", org: "UNISEPE", date: "2016 a 2021" },
      { title: "CC50: Introdução à Ciência da Computação", org: "Harvard University / Fundação Estudar", date: "2023" },
    ],
  },
  en: {
    name: "Samuel Monteiro Junior",
    links: LINKS,
    contact: "Curitiba, PR, Brazil • +55 (13) 99757-5300 • samuel@monteirotf.com",
    headings: {
      profile: "Professional Profile",
      skills: "Technical Skills",
      experience: "Professional Experience",
      projects: "Projects",
      education: "Education",
    },
    jobs: [
      {
        role: "Automation Engineer & Full Stack Developer",
        company: "Freelancer",
        date: "April 2022 to Present",
        bullets: [
          "Architected and deployed microservices ecosystems using FastAPI and Node.js in Docker containers, reducing request processing times by 40%.",
          "Designed and implemented a private mesh network (Tailscale VPN) with mTLS authentication to connect local hosts to Debian VPS servers, securing sensitive data traffic.",
          "Developed Cortex-Nexus, an automation pipeline (n8n, Python, AI) for lead extraction and qualification, achieving 99.7% deliverability and processing 3,000+ leads per month.",
          "Structured Parana-Leads, with automated deployment in Docker containers using Caddy as a reverse proxy with automatic SSL, reducing deployment time for new environments by 70%.",
        ],
      },
      {
        role: "Support Analyst / Database Administrator",
        company: "CNI Tecnologia e Software",
        date: "June 2024 to December 2024",
        bullets: [
          "Administered Linux/Windows network security policies and servers, reducing security incidents by 25% through connection hardening and access control.",
          "Developed Bash and Python scripts to automate relational database backups and hardware performance telemetry, reducing manual monitoring effort by 15 hours per week.",
          "Optimized queries and maintenance routines in SQL Server and PostgreSQL databases, reducing management report load times by 50%.",
        ],
      },
      {
        role: "Support Analyst & Web Developer",
        company: "Vip Informática",
        date: "February 2017 to January 2021",
        bullets: [
          "Administered operational databases (PostgreSQL/SQL Server), implementing automatic backup routines and reducing downtime to near zero.",
          "Developed and maintained internal tools (Node.js/PHP) focused on query and load time optimization, accelerating internal API response times by 35%.",
          "Led the restructuring of IT support processes and technical documentation, resulting in a 30% reduction in repetitive support tickets.",
        ],
      },
    ],
    education: [
      { title: "Associate's Degree in Systems Analysis and Development", org: "PUCPR (Distance Learning)", date: "2024, ongoing" },
      { title: "Bachelor of Laws (LL.B.)", org: "UNISEPE", date: "2016 to 2021" },
      { title: "CC50: Introduction to Computer Science", org: "Harvard University / Fundação Estudar", date: "2023" },
    ],
  },
}

/* ------------------------------ pools por idioma ------------------------------ */

const SKILLS = {
  pt: {
    infra: { label: "DevOps & Infraestrutura", text: "Docker, Docker Compose, Linux/Unix SysAdmin (Debian, Arch Linux, macOS), Caddy Server (Proxy Reverso, SSL Automático), VPN Mesh (Tailscale, WireGuard), SSH Hardening, Redes e Firewall (IPTables), Git" },
    edge: { label: "Edge & Serverless", text: "Cloudflare Workers, Durable Objects, KV Store, D1, DNS-over-HTTPS, heurísticas de segurança na edge" },
    dev: { label: "Desenvolvimento & Automação", text: "Python (FastAPI, Web Scraping, Scripts CLI), Node.js (APIs REST, WebSockets, BullMQ, Redis), Rust (Tokio, Axum, Hyper), n8n Workflows, Shell/Bash Scripting para automação de tarefas operacionais" },
    front: { label: "Frontend", text: "React, Next.js, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query, Zod, Shadcn UI, Three.js" },
    data: { label: "Bancos de Dados & Criptografia", text: "PostgreSQL, TimescaleDB, SQL Server, Redis Pub/Sub, SQLite, LUKS Full Disk Encryption, mTLS" },
  },
  en: {
    infra: { label: "DevOps & Infrastructure", text: "Docker, Docker Compose, Linux/Unix SysAdmin (Debian, Arch Linux, macOS), Caddy Server (Reverse Proxy, Automatic SSL), Mesh VPN (Tailscale, WireGuard), SSH Hardening, Networking & Firewalls (IPTables), Git" },
    edge: { label: "Edge & Serverless", text: "Cloudflare Workers, Durable Objects, KV Store, D1, DNS-over-HTTPS, edge security heuristics" },
    dev: { label: "Development & Automation", text: "Python (FastAPI, Web Scraping, CLI Scripts), Node.js (REST APIs, WebSockets, BullMQ, Redis), Rust (Tokio, Axum, Hyper), n8n Workflows, Shell/Bash Scripting for operational task automation" },
    front: { label: "Frontend", text: "React, Next.js, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query, Zod, Shadcn UI, Three.js" },
    data: { label: "Databases & Cryptography", text: "PostgreSQL, TimescaleDB, SQL Server, Redis Pub/Sub, SQLite, LUKS Full Disk Encryption, mTLS" },
  },
}

const PROJECTS = {
  pt: {
    tesstrade: {
      name: "TessTrade: Plataforma de Trading Algorítmico",
      stack: "Rust / React / Python / TimescaleDB",
      text: "Plataforma no ar em tesstrade.com que une rede social, ambiente de desenvolvimento quantitativo e backtesting: engine de simulação multithread em Rust, indicadores em Python executados em sandbox e ligados à engine via FFI/RPC, e workspace em React com Monaco Editor para desenvolver estratégias no navegador.",
    },
    sixid: {
      name: "6ID: Ecossistema de Licenças para Trading",
      stack: "FastAPI / Next.js / C# WPF / PostgreSQL",
      text: "Ecossistema distribuído para gestão de licenças e autenticação em plataformas de trading: backend assíncrono em FastAPI (SQLAlchemy, Asyncpg), console de administração em Next.js com validação espelhada entre Pydantic e Zod, e cliente Windows em WPF no .NET 8, compilado com ReadyToRun num binário único.",
    },
    aegis: {
      name: "Aegis: Proxy Reverso e Rate Limiter",
      stack: "Rust / Tokio / Axum / Docker",
      text: "Proxy reverso em Rust com rate limit por IP em token bucket, timeouts em todas as etapas (incluindo proteção contra slowloris), recarga de configuração por SIGHUP sem derrubar conexões, métricas Prometheus em plano administrativo separado e imagem Docker FROM scratch rodando como usuário não-root.",
    },
    sentinel: {
      name: "Sentinel: Firewall de Bots na Edge",
      stack: "Cloudflare Workers / Durable Objects / JavaScript",
      text: "Firewall de bots executado na edge com Cloudflare Workers e Durable Objects: cada requisição recebe uma pontuação por assinaturas de TLS, versão de HTTP e headers do navegador, e agentes suspeitos são bloqueados antes de chegar à origem, sem latência adicional e dentro do free tier.",
    },
    cortex: {
      name: "Cortex-Vault: Infraestrutura de Conhecimento",
      stack: "Linux / Shell Script / Python / Tailscale",
      text: "Sistema de alto desempenho para ingestão de dados, sincronizado automaticamente via malha VPN Tailscale entre Arch Linux e macOS. Desenvolvi utilitários em Shell e Python para indexação e pesquisa local veloz.",
    },
    boxopt: {
      name: "BoxOptimizer API",
      stack: ".NET 8 / JWT / Docker",
      text: "API de alta performance para cálculo logístico tridimensional (cubagem eficiente) usando algoritmo First Fit Decreasing (FFD), empacotada em imagem Docker e pronta para escalabilidade horizontal.",
    },
  },
  en: {
    tesstrade: {
      name: "TessTrade: Algorithmic Trading Platform",
      stack: "Rust / React / Python / TimescaleDB",
      text: "Live platform at tesstrade.com combining social features, a quantitative development environment, and backtesting: multithreaded Rust simulation engine, sandboxed Python indicators connected to the engine via FFI/RPC, and a React workspace with Monaco Editor for authoring strategies in the browser.",
    },
    sixid: {
      name: "6ID: License Ecosystem for Trading Platforms",
      stack: "FastAPI / Next.js / C# WPF / PostgreSQL",
      text: "Distributed ecosystem for license management and user authentication on trading platforms: asynchronous FastAPI backend (SQLAlchemy, Asyncpg), Next.js administration console with validation mirrored between Pydantic and Zod, and a Windows WPF client on .NET 8, compiled with ReadyToRun into a single binary.",
    },
    aegis: {
      name: "Aegis: Reverse Proxy and Rate Limiter",
      stack: "Rust / Tokio / Axum / Docker",
      text: "Reverse proxy in Rust with per-IP token-bucket rate limiting, timeouts at every stage (including slowloris protection), SIGHUP configuration reload without dropping connections, Prometheus metrics on a separate admin plane, and a FROM scratch Docker image running as a non-root user.",
    },
    sentinel: {
      name: "Sentinel: Edge Bot Firewall",
      stack: "Cloudflare Workers / Durable Objects / JavaScript",
      text: "Edge bot firewall running on Cloudflare Workers and Durable Objects: each request is scored by TLS, HTTP version, and browser header signatures, and suspicious agents are blocked before reaching the origin, with no added latency and within the free tier.",
    },
    cortex: {
      name: "Cortex-Vault: Knowledge Infrastructure",
      stack: "Linux / Shell Script / Python / Tailscale",
      text: "High-performance data ingestion system, automatically synchronized via Tailscale VPN mesh between Arch Linux and macOS. Developed Shell and Python utilities for fast local search and indexing.",
    },
    boxopt: {
      name: "BoxOptimizer API",
      stack: ".NET 8 / JWT / Docker",
      text: "High-performance API for three-dimensional logistics calculation (efficient box cubing) using the First Fit Decreasing (FFD) algorithm, packaged as a Docker image and ready for horizontal scaling.",
    },
  },
}

const PROFILES = {
  pt: {
    devops:
      "Engenheiro de software com mais de 4 anos de experiência em automação de infraestrutura, administração de sistemas Linux e segurança de redes. No dia a dia, provisiono servidores com Docker e Docker Compose, configuro redes mesh seguras com Tailscale e WireGuard e desenvolvo APIs em Python com FastAPI e em Node.js. Trabalho com foco em SRE, hardening e na eliminação de tarefas manuais repetitivas usando código e telemetria.",
    fullstack:
      "Engenheiro full-stack que entrega o caminho inteiro: da interface em Next.js e React que o usuário usa até os serviços em FastAPI e Node e o schema do PostgreSQL embaixo de tudo. Transito bem por toda a stack: APIs REST tipadas, tempo real com WebSockets, jobs em segundo plano com BullMQ e a modelagem de dados que mantém tudo rápido sob carga. O que eu construo já chega em produção com a própria infraestrutura confiável, sem repasse para outro time.",
    all:
      "Engenheiro full-stack e especialista em DevOps e edge na mesma pessoa: entrego o produto e a plataforma em que ele roda. Vou do frontend ao banco de dados (Next.js, React, FastAPI, Node, PostgreSQL) e cuido da infraestrutura por baixo (Docker, Cloudflare Workers, Tailscale, WireGuard, Caddy, hardening). Uma pessoa cobrindo o caminho inteiro: da ideia à produção e à rotina de manter tudo no ar.",
  },
  en: {
    devops:
      "Software Engineer with 4+ years of experience in infrastructure automation, Linux systems administration, and network security. Day to day, I provision servers with Docker and Docker Compose, configure secure mesh networks with Tailscale and WireGuard, and build APIs in Python (FastAPI) and Node.js. Focused on Site Reliability Engineering (SRE), operational hardening, and eliminating repetitive manual work through code and telemetry.",
    fullstack:
      "Full-stack engineer who ships the entire path: from the Next.js and React interface users touch to the FastAPI and Node services and the PostgreSQL schema underneath. Comfortable across the stack: typed REST APIs, real time over WebSockets, background jobs with BullMQ, and the data modeling that keeps everything fast under load. What I build reaches production with its own reliable infrastructure, without handing it off to another team.",
    all:
      "Full-stack engineer and DevOps and edge specialist in one: I deliver the product and the platform it runs on. I go from the frontend to the database (Next.js, React, FastAPI, Node, PostgreSQL) and take care of the infrastructure underneath (Docker, Cloudflare Workers, Tailscale, WireGuard, Caddy, hardening). One person covering the whole path: from idea to production to keeping it all running.",
  },
}

/* ------------------------------- os 3 perfis ------------------------------- */

const MODES = {
  devops: {
    role: "DevOps & Platform Engineer",
    skills: ["infra", "edge", "dev", "data"],
    projects: ["aegis", "sentinel", "cortex", "boxopt"],
    suffix: "-devops",
  },
  fullstack: {
    role: "Full-Stack Engineer",
    skills: ["front", "dev", "data"],
    projects: ["tesstrade", "sixid", "boxopt"],
    suffix: "-fullstack",
  },
  all: {
    role: "Full-Stack & DevOps Engineer",
    skills: ["front", "dev", "infra", "edge", "data"],
    projects: ["tesstrade", "sixid", "aegis", "sentinel", "cortex", "boxopt"],
    suffix: "",
  },
}

/* --------------------------------- geração --------------------------------- */

const browser = await chromium.launch()
for (const lang of ["pt", "en"]) {
  for (const [modeKey, mode] of Object.entries(MODES)) {
    const data = {
      ...BASE[lang],
      role: mode.role,
      profile: PROFILES[lang][modeKey],
      skills: mode.skills.map((k) => SKILLS[lang][k]),
      projects: mode.projects.map((k) => PROJECTS[lang][k]),
    }
    const file = `samuel-monteiro-cv${mode.suffix}-${lang}.pdf`
    const page = await browser.newPage()
    await page.setContent(render(data), { waitUntil: "load" })
    await page.pdf({
      path: `${OUT_DIR}${file}`,
      format: "A4",
      printBackground: true,
      margin: { top: "13mm", bottom: "15mm", left: "13mm", right: "13mm" },
    })
    await page.close()
    console.log("gerado:", file)
  }
}
await browser.close()
