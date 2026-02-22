"use client"

import { motion, useInView, animate } from "framer-motion"
import { ArrowDown, Github, Linkedin, MessageCircle, ExternalLink, Download, Mail, Instagram, Moon, Sun } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

function AnimatedCounter({ from, to, suffix = "" }: { from: number; to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (inView && ref.current) {
      animate(from, to, {
        duration: 2,
        onUpdate: (latest) => {
          if (ref.current) {
            ref.current.textContent = Math.round(latest).toString() + suffix
          }
        },
      })
    }
  }, [inView, from, to, suffix])

  return <span ref={ref}>{from}{suffix}</span>
}

export default function Portfolio() {
  const [mounted, setMounted] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)

    const handleNavClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      const href = target.getAttribute("href") || target.closest('a')?.getAttribute("href")

      if (href && href.startsWith("#")) {
        e.preventDefault()
        const id = href.substring(1)
        const element = document.getElementById(id)
        if (element) {
          const navHeight = 80
          const elementPosition = element.offsetTop - navHeight
          window.scrollTo({
            top: elementPosition,
            behavior: "smooth",
          })
        }
      }
    }

    document.addEventListener("click", handleNavClick)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("click", handleNavClick)
    }
  }, [])

  return (
    <div className="bg-background text-foreground transition-colors duration-300 min-h-screen">
      {/* Navigation */}
      <motion.nav
        className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400" whileHover={{ scale: 1.05 }}>
              Samuel Monteiro
            </motion.div>
            <div className="hidden md:flex items-center space-x-8">
              {[
                { name: "Sobre", id: "sobre" },
                { name: "Projetos", id: "projetos" },
                { name: "Skills", id: "skills" },
                { name: "Contato", id: "contato" },
              ].map((item) => (
                <a
                  key={item.name}
                  href={`#${item.id}`}
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 cursor-pointer text-sm font-medium"
                >
                  <motion.span whileHover={{ y: -2 }}>{item.name}</motion.span>
                </a>
              ))}

              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  aria-label="Toggle Dark Mode"
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="min-h-screen pt-20 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-background to-secondary/20">
        {/* Tech Lines Background */}
        <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-50">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <motion.path d="M 100 200 L 300 200 L 350 250 L 500 250 L 550 200 L 800 200" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" filter="url(#glow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }} />
            <circle cx="300" cy="200" r="3" fill="hsl(var(--primary))" filter="url(#glow)">
              <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />
            </circle>
            <motion.path d="M 1200 100 L 1200 300 L 1150 350 L 1150 500" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" filter="url(#glow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, repeatType: "loop", delay: 1 }} />
            <circle cx="1200" cy="300" r="3" fill="hsl(var(--primary))" filter="url(#glow)">
              <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" begin="1s" />
            </circle>
            <motion.path d="M 200 600 L 400 600 L 450 550 L 600 550 L 650 600 L 850 600" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" filter="url(#glow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, repeatType: "loop", delay: 2 }} />
            <circle cx="450" cy="550" r="3" fill="hsl(var(--primary))" filter="url(#glow)" />
            <circle cx="650" cy="600" r="3" fill="hsl(var(--primary))" filter="url(#glow)" />
          </svg>
        </div>

        <motion.div className="text-center px-6 relative z-10 w-full max-w-4xl mx-auto" style={{ y: scrollY * 0.4 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-block px-4 py-1.5 mb-8 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold tracking-wide uppercase"
          >
            SaaS & LegalTech Developer
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Direito.<span className="text-primary">Code</span>()
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 font-light leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Construindo pontes entre o tradicional e a inovação com sistemas e aplicações web de alto nível.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <a href="/cv.pdf" download="Samuel_Monteiro_Junior_CV.pdf" className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/50 hover:-translate-y-1">
              <Download size={20} />
              <span>Baixar CV (PDF)</span>
            </a>
            <div className="flex space-x-4">
              {[
                { icon: Github, href: "https://github.com/samuelmonteirotf", color: "hover:text-foreground hover:border-foreground" },
                { icon: Linkedin, href: "https://www.linkedin.com/in/samuel-monteiro-junior-2534802a0/", color: "hover:text-blue-500 hover:border-blue-500" },
                { icon: MessageCircle, href: "https://wa.me/5513997575300", color: "hover:text-green-500 hover:border-green-500" },
              ].map(({ icon: Icon, href, color }, index) => (
                <a key={index} href={href} target="_blank" rel="noopener noreferrer" className={`p-4 bg-card border border-border rounded-full shadow-sm transition-all text-muted-foreground ${color} hover:-translate-y-1`}>
                  <Icon size={24} />
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex items-center justify-center gap-12 text-muted-foreground"
          >
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-foreground mb-1">
                <AnimatedCounter from={0} to={8} suffix="+" />
              </span>
              <span className="text-sm font-medium uppercase tracking-wider">Projetos Entregues</span>
            </div>
            <div className="w-px h-16 bg-border"></div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-foreground mb-1">
                <AnimatedCounter from={0} to={15} suffix="+" />
              </span>
              <span className="text-sm font-medium uppercase tracking-wider">Tecnologias</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <a href="#sobre" className="text-muted-foreground hover:text-primary transition-colors block p-2">
            <ArrowDown size={32} />
          </a>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-32 px-6 relative overflow-hidden bg-card border-y border-border">
        {/* Decorative elements */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fadeInUp} className="relative group mx-auto w-full max-w-md lg:max-w-full">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl transform translate-x-4 translate-y-4 -z-10 transition-transform group-hover:translate-x-6 group-hover:translate-y-6"></div>
              <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-border shadow-2xl relative">
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent z-10 flex items-end p-6">
                  <div className="text-white">
                    <p className="font-bold text-2xl">Samuel Monteiro Jr.</p>
                    <p className="text-sm text-gray-300">Desenvolvedor & Analista Legal</p>
                  </div>
                </div>
                <img
                  src="/images/perfil.jpg"
                  alt="Samuel Monteiro"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?q=80&w=800&auto=format&fit=crop"
                  }}
                />
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-1 bg-primary rounded-full"></div>
                <span className="text-primary font-bold tracking-widest text-sm">MINHA JORNADA</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-8 text-foreground leading-tight">
                A intersecção perfeita entre <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Direito</span> e <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary">Tecnologia</span>
              </h2>
              <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                <p>
                  Como um profissional que vivencia tanto o mundo jurídico quanto o de desenvolvimento de software, eu compreendo profundamente a necessidade de sistemas que não apenas funcionem, mas que reflitam <strong className="text-foreground">segurança, compliance e confiança</strong>.
                </p>
                <p>
                  O mercado de <strong className="text-foreground">SaaS e LegalTech 2026</strong> exige experiências fluidas, arquiteturas escaláveis e design premium end-to-end. Sou especializado em <span className="text-foreground font-semibold">React, Next.js, TypeScript e TailwindCSS</span>, focado em entregar aplicações robustas que convertem visitantes e otimizam processos de negócios complexos.
                </p>

                <div className="grid sm:grid-cols-2 gap-6 pt-8 mt-8 border-t border-border/50">
                  <div className="bg-background p-6 rounded-xl border border-border shadow-sm">
                    <h4 className="font-bold text-foreground text-xl mb-2 flex items-center gap-2">
                      ⚖️ Visão Jurídica
                    </h4>
                    <p className="text-sm">Pensamento analítico, viabilidade de negócios e compreensão regulatória profunda.</p>
                  </div>
                  <div className="bg-background p-6 rounded-xl border border-border shadow-sm">
                    <h4 className="font-bold text-foreground text-xl mb-2 flex items-center gap-2">
                      💻 FullStack Dev
                    </h4>
                    <p className="text-sm">Desenvolvimento ponta a ponta com foco em performance corporativa e UI/UX premium.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projetos" className="py-32 px-6 bg-background relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <span className="text-primary font-bold tracking-widest text-sm uppercase mb-4 block">Portfólio 2026</span>
            <h2 className="text-4xl md:text-6xl font-black text-foreground mb-6">Projetos em Destaque</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Sistemas SaaS reais, polidos com padrão premium para o mercado B2B.</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[{
              title: "Prazo Legal",
              description: "Plataforma SaaS inteligente para o mercado jurídico estimar o tempo de tramitação de processos judiciais utilizando dados reais.",
              tech: ["Vue.js", "Node.js", "Docker", "SaaS Premium"],
              image: "/images/projeto3.jpg",
              projectUrl: "https://prazo-legal-production.up.railway.app/",
              githubUrl: "https://github.com/samuelmonteirotf/Prazo-Legal",
            },
            {
              title: "JuriFlow",
              description: "Dashboard corporativo moderno focado em gestão de produtividade e acompanhamento de fluxos para o dia a dia da advocacia.",
              tech: ["Next.js", "TypeScript", "TailwindCSS", "shadcn/ui"],
              image: "/images/projeto1.jpg",
              projectUrl: "https://juriflow.vercel.app",
              githubUrl: "https://github.com/samuelmonteirotf/juriflow",
            },
            {
              title: "Chatbot JurID",
              description: "Sistema fullstack de automação atuando como consultor digital para responder dúvidas complexas sobre certificados.",
              tech: ["Vue.js", "Node.js", "Express", "PostgreSQL"],
              image: "/images/projeto2.jpg",
              projectUrl: "https://chatbot-jurid-production.up.railway.app/",
              githubUrl: "https://github.com/samuelmonteirotf/Chatbot---JurID",
            }].map((project, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative h-full flex flex-col"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity blur-xl z-0"></div>
                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/50 transition-all duration-300 h-full flex flex-col relative z-10">
                  <div className="h-60 overflow-hidden flex-shrink-0 relative group-hover:opacity-90">
                    <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors z-10"></div>
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop" }}
                    />
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-black mb-3 text-foreground group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground mb-6 flex-grow leading-relaxed font-light text-lg">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {project.tech.map((tech) => (
                        <span key={tech} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-bold tracking-wide">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-col xl:flex-row gap-4 mt-auto">
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex justify-center items-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md hover:shadow-primary/30"
                      >
                        <ExternalLink size={18} />
                        <span>Ver Projeto</span>
                      </a>
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex justify-center items-center gap-2 py-3.5 bg-secondary text-secondary-foreground rounded-xl font-bold hover:bg-secondary/80 transition-all border border-border"
                      >
                        <Github size={18} />
                        <span>Ver no GitHub</span>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-24 px-6 bg-card border-t border-border">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-foreground">A Máquina por baixo do capô.</h2>
            <p className="text-xl text-muted-foreground w-full max-w-2xl">Não é só design bonitinho. É arquitetura pronta pra escalar, integrar painel financeiro e rodar na AWS sem chorar.</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                category: "Interface Premium",
                icon: "✨",
                translation: "Não faço 'sitezinho', faço painel B2B que parece produto gringo.",
                skills: ["Next.js (App Router)", "React 19", "TypeScript", "Tailwind CSS", "shadcn/ui", "Framer Motion", "Zustand / TanStack", "WebSockets / Realtime", "Charts (Recharts)"],
              },
              {
                category: "Backend & Dados",
                icon: "⚙️",
                translation: "Arquiteturas escaláveis, multi-tenant e prontas pra faturar.",
                skills: ["Node.js / Express", "FastAPI (Python)", "Integrações (Stripe, Asaas)", "Supabase", "PostgreSQL", "Redis / Queues", "Auth (JWT / OAuth2)", "Multi-tenant SaaS"],
              },
              {
                category: "Infra de Guerra",
                icon: "🚀",
                translation: "O cliente nem vê, mas se sente rodando de Porsche.",
                skills: ["GitOps / GitHub", "Docker / Compose", "CI/CD Pipelines", "Vercel / VPS", "Nginx / Traefik", "Tailscale / VPN", "Linux Servers", "Observability"],
              },
              {
                category: "IA e Automação",
                icon: "🤖",
                translation: "Colocando robôs pra trabalhar quando você estiver dormindo.",
                skills: ["n8n Workflows", "AI Agents / LLMs", "RAG Pipelines", "Chatbots Jurídicos", "Processamento de DOCs", "OCR & Extração", "Automação de Tarefas"],
              },
            ].map((group, index) => (
              <motion.div key={index} variants={fadeInUp} className="bg-background border border-border p-6 rounded-3xl hover:border-primary/50 transition-all group flex flex-col h-full shadow-sm hover:shadow-xl">
                <div className="text-3xl mb-4 bg-secondary w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">{group.icon}</div>
                <h3 className="text-xl font-black mb-2 text-foreground">{group.category}</h3>
                <p className="text-sm text-primary mb-6 font-medium italic border-l-2 border-primary/50 pl-3">“{group.translation}”</p>

                <div className="space-y-3 mt-auto flex-grow flex flex-col justify-end">
                  {group.skills.map((skill) => (
                    <motion.div key={skill} className="flex items-center space-x-3 text-muted-foreground" whileHover={{ x: 5, color: "var(--foreground)" }}>
                      <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                      <span className="font-semibold text-sm">{skill}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-32 px-6 bg-background relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            className="bg-card/80 backdrop-blur-2xl p-12 md:p-20 rounded-[3rem] border border-border shadow-2xl text-center"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black mb-8 text-foreground tracking-tight">
              Pronto para o próximo nível?
            </h2>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              Transforme sua necessidade jurídica ou ideia de negócio em uma solução de software imbatível. Vamos conversar!
            </p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
              variants={staggerContainer}
            >
              <motion.a
                href="https://wa.me/5513997575300?text=Olá%20Samuel,%20vim%20pelo%20seu%20portfólio!"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-xl shadow-green-600/20 font-bold text-lg"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <MessageCircle size={26} />
                <span>Iniciar pelo WhatsApp</span>
              </motion.a>

              <div className="flex gap-4 w-full sm:w-auto justify-center">
                <motion.a
                  href="mailto:contato@samuelmonteiro.dev"
                  className="flex items-center justify-center gap-2 px-8 py-5 bg-secondary text-secondary-foreground font-bold rounded-full hover:bg-secondary/80 transition-colors shadow-sm text-lg"
                  whileHover={{ scale: 1.03 }}
                  title="E-mail"
                >
                  <Mail size={24} />
                  <span className="hidden md:inline">E-mail</span>
                </motion.a>
                <motion.a
                  href="https://instagram.com/samuelmonteirotf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-8 py-5 bg-secondary text-secondary-foreground font-bold rounded-full hover:bg-secondary/80 transition-colors shadow-sm text-lg"
                  whileHover={{ scale: 1.03 }}
                  title="Instagram"
                >
                  <Instagram size={24} />
                  <span className="hidden md:inline">Insta</span>
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-card border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-black text-2xl text-foreground mb-2">S.M.</span>
            <p className="text-muted-foreground font-medium">Desenvolvido por Samuel Monteiro Junior - LegalTech</p>
          </div>

          <div className="flex space-x-6">
            {[
              { icon: Github, href: "https://github.com/samuelmonteirotf" },
              { icon: Linkedin, href: "https://www.linkedin.com/in/samuel-monteiro-junior-2534802a0/" },
              { icon: Instagram, href: "https://instagram.com/samuelmonteirotf" },
            ].map(({ icon: Icon, href }, index) => (
              <motion.a
                key={index}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-all bg-secondary hover:bg-primary/20 p-3 rounded-full"
                whileHover={{ y: -4, scale: 1.1 }}
              >
                <Icon size={20} />
              </motion.a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
