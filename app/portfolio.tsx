"use client"

import { motion } from "framer-motion"
import { ArrowDown, Github, Linkedin, MessageCircle, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"

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

export default function Portfolio() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)

    // Função para scroll suave para seções
    const handleNavClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      if (target.tagName === "A" && target.getAttribute("href")?.startsWith("#")) {
        e.preventDefault()
        const id = target.getAttribute("href")?.substring(1)
        const element = document.getElementById(id || "")
        if (element) {
          const navHeight = 80 // altura da navbar
          const elementPosition = element.offsetTop - navHeight
          window.scrollTo({
            top: elementPosition,
            behavior: "smooth",
          })
        }
      }
    }

    // Adicionar event listener para cliques na navegação
    document.addEventListener("click", handleNavClick)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("click", handleNavClick)
    }
  }, [])

  return (
    <div className="bg-black text-white overflow-hidden">
      {/* Navigation */}
      <motion.nav
        className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div className="text-xl font-light" whileHover={{ scale: 1.05 }}>
              Samuel Monteiro
            </motion.div>
            <div className="hidden md:flex space-x-8">
              {[
                { name: "Sobre", id: "sobre" },
                { name: "Projetos", id: "projetos" },
                { name: "Skills", id: "skills" },
                { name: "Contato", id: "contato" },
              ].map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => {
                    const element = document.getElementById(item.id)
                    if (element) {
                      const navHeight = 80
                      const elementPosition = element.offsetTop - navHeight
                      window.scrollTo({
                        top: elementPosition,
                        behavior: "smooth",
                      })
                    }
                  }}
                  className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer"
                  whileHover={{ y: -2 }}
                >
                  {item.name}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative">
        {/* Tech Lines Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1920 1080"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <motion.path
              d="M 100 200 L 300 200 L 350 250 L 500 250 L 550 200 L 800 200"
              stroke="#1e3a8a"
              strokeWidth="2"
              fill="none"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
              }}
            />
            <circle cx="300" cy="200" r="3" fill="#1e3a8a" filter="url(#glow)">
              <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
            </circle>

            <motion.path
              d="M 1200 100 L 1200 300 L 1150 350 L 1150 500"
              stroke="#1e3a8a"
              strokeWidth="2"
              fill="none"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                delay: 1,
              }}
            />
            <circle cx="1200" cy="300" r="3" fill="#1e3a8a" filter="url(#glow)">
              <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" begin="1s" />
            </circle>

            <motion.path
              d="M 200 600 L 400 600 L 450 550 L 600 550 L 650 600 L 850 600"
              stroke="#1e3a8a"
              strokeWidth="2"
              fill="none"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 6,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                delay: 2,
              }}
            />
            <circle cx="450" cy="550" r="3" fill="#1e3a8a" filter="url(#glow)" />
            <circle cx="650" cy="600" r="3" fill="#1e3a8a" filter="url(#glow)" />
          </svg>

          <motion.div
            className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-800 to-transparent opacity-40"
            animate={{ y: [0, 1080] }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        </div>

        <motion.div className="text-center px-6 relative z-10" style={{ y: scrollY * 0.5 }}>
          <motion.h1
            className="text-6xl md:text-8xl font-thin mb-6 leading-tight"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            Desenvolvedor
            <br />
            <span className="text-gray-400">Front-end</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Transformo ideias em experiências digitais com design inteligente e código eficiente
          </motion.p>

          <motion.div
            className="flex justify-center space-x-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            {[
              {
                icon: Github,
                href: "https://github.com/samuelmonteirotf",
                label: "GitHub",
              },
              {
                icon: Linkedin,
                href: "https://www.linkedin.com/in/samuel-monteiro-junior-2534802a0/",
                label: "LinkedIn",
              },
              {
                icon: MessageCircle,
                href: "https://wa.me/5513997575300?text=Sim%2C%20quero%20construir%20algo%20com%20impacto%21",
                label: "WhatsApp",
              },
            ].map(({ icon: Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border border-gray-700 rounded-full hover:border-white transition-colors duration-300"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={24} />
              </motion.a>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <ArrowDown className="text-gray-400" size={24} />
        </motion.div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-5xl font-thin mb-8">Sobre mim</h2>
              <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                <p>
                  Sou um desenvolvedor front-end com foco em criar soluções digitais eficientes, seguras e voltadas a
                  resultados concretos. Acredito que uma boa interface vai além do visual: Conecta tecnologia,
                  usabilidade e propósito.
                </p>
                <p>
                  Especializado em React, Next.js e TypeScript, aplico as melhores práticas de desenvolvimento para
                  construir produtos rápidos, escaláveis e de fácil manutenção. Trabalho com atenção à performance,
                  acessibilidade e experiência do usuário, sempre buscando entregar valor real para o negócio.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="relative">
              <div className="w-full h-96 rounded-2xl overflow-hidden">
                <img
                  src="/images/perfil.jpg"
                  alt="Samuel Monteiro - Desenvolvedor Front-end"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projetos" className="py-32 px-6 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-5xl font-thin mb-16 text-center"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            Projetos em destaque
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                title: "JuriFlow",
                description:
                  "Projeto focado em produtividade, design limpo e aplicação prática para o dia a dia da advocacia.",
                tech: ["Elm", "Next.js", "TypeScript", "Tailwind"],
                image: "/images/projeto1.jpg",
                projectUrl: "https://juriflow.vercel.app",
                githubUrl: "https://github.com/samuelmonteirotf/juriflow",
              },
              {
                title: "Chatbot JurID - Full Stack",
                description:
                  "Sistema leve, direto ao ponto e funcional, criado para responder dúvidas frequentes sobre certificados digitais.",
                tech: ["Vue.js", "Node.js"],
                image: "/images/projeto2.jpg",
                projectUrl: "https://chatbot-jurid-production.up.railway.app/",
                githubUrl: "https://github.com/samuelmonteirotf/Chatbot---JurID",
              },
              {
                title: "Prazo Legal",
                description:
                  "Uma plataforma inteligente para estimar o tempo de tramitação de processos judiciais, autoridade e dados reais.",
                tech: ["React", "Node.js + Express", "Tailwind CSS", "Docker"],
                image: "/images/projeto3.jpg",
                projectUrl: "https://prazo-legal-production.up.railway.app/",
                githubUrl: "https://github.com/samuelmonteirotf/Prazo-Legal",
              },
              {
                title: "Habitus",
                description:
                  "Hábitus transforma sua rotina em uma máquina de produtividade com integração total ao Google Calendar e controle absoluto dos seus hábitos.",
                tech: [
                  "Google Calendar API (v3)",
                  "OAuth2 com Google (authlib)",
                  "FastAPI",
                  "React + Vite + TailwindCSS",
                ],
                image: "/images/projeto4.jpg",
                projectUrl: "https://habitus-app.vercel.app/",
                githubUrl: "https://github.com/samuelmonteirotf/habitus-app",
              },
              {
                title: "Institucional-Look&Shop",
                description:
                  "Look Shop é um site institucional vibrante e responsivo que une design moderno, integração com WhatsApp e localização interativa para oferecer uma experiência digital marcante e acolhedora.",
                tech: ["Next.js 14", "TypeScript", "Tailwind CSS", "shadcn/ui + Lucide Icons"],
                image: "/images/projeto5.jpg",
                projectUrl: "https://www.lookeshop.com.br/",
                githubUrl: "https://github.com/samuelmonteirotf/institucional-lookeshop",
              },
              {
                title: "BoxOptimizer",
                description:
                  "BoxOptimizer é uma API de otimização de embalagem que utiliza o algoritmo FFD para agilizar o empacotamento de pedidos, escolhendo as caixas ideais e melhorando a eficiência logística.",
                tech: [
                  ".NET 8.0 + ASP.NET Core Web API",
                  "Docker + Docker Compose",
                  "Entity Framework Core + SQL Server",
                  "JWT Authentication + Testes Automatizados (xUnit)",
                ],
                image: "/images/projeto6.jpg",
                projectUrl: "https://github.com/samuelmonteirotf/BoxOptimizer",
                githubUrl: "https://github.com/samuelmonteirotf/BoxOptimizer",
              },
            ].map((project, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group cursor-pointer"
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-colors duration-300 h-full flex flex-col">
                  <div className="h-48 overflow-hidden flex-shrink-0">
                    <img
                      src={project.image || "/placeholder.svg?height=200&width=400&query=projeto"}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-medium mb-3 group-hover:text-gray-300 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-400 mb-4 flex-grow leading-relaxed">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tech.map((tech) => (
                        <span key={tech} className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-4 mt-auto">
                      <motion.a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <ExternalLink size={16} />
                        <span>Ver projeto</span>
                      </motion.a>
                      <motion.a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <Github size={16} />
                        <span>Código</span>
                      </motion.a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-5xl font-thin mb-16 text-center"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            Tecnologias
          </motion.h2>

          <motion.div
            className="grid md:grid-cols-3 gap-12"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                category: "Frontend",
                skills: [
                  "JavaScript",
                  "TypeScript",
                  "React",
                  "Next.js",
                  "Vue.js",
                  "Elm",
                  "Tailwind CSS",
                  "Framer Motion",
                ],
              },
              {
                category: "Backend & APIs",
                skills: ["Python", "FastAPI", "Node.js", "Express", "PostgreSQL", "Google APIs"],
              },
              {
                category: "Ferramentas",
                skills: ["Git", "Docker", "Vercel", "OAuth2", "Figma"],
              },
            ].map((group, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <h3 className="text-2xl font-light mb-6 text-gray-300">{group.category}</h3>
                <div className="space-y-3">
                  {group.skills.map((skill) => (
                    <motion.div key={skill} className="flex items-center space-x-3" whileHover={{ x: 10 }}>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span className="text-gray-400">{skill}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-32 px-6 bg-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-5xl font-thin mb-8"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            Vamos transformar sua ideia em uma solução de alto impacto.
          </motion.h2>

          <motion.p
            className="text-xl text-gray-300 mb-12"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            Pronto para criar algo que gere resultado real?
          </motion.p>

          <motion.a
            href="https://wa.me/5513997575300?text=Sim%2C%20quero%20construir%20algo%20com%20impacto%21"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-3 px-8 py-4 border border-white rounded-full hover:bg-white hover:text-black transition-all duration-300 text-lg"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle size={20} />
            <span>Sim, quero construir algo com impacto!</span>
          </motion.a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <p className="text-gray-400">© 2024 Samuel Monteiro. Todos os direitos reservados.</p>
          <div className="flex space-x-6">
            {[
              { icon: Github, href: "https://github.com/samuelmonteirotf" },
              {
                icon: Linkedin,
                href: "https://www.linkedin.com/in/samuel-monteiro-junior-2534802a0/",
              },
              {
                icon: MessageCircle,
                href: "https://wa.me/5513997575300?text=Sim%2C%20quero%20construir%20algo%20com%20impacto%21",
              },
            ].map(({ icon: Icon, href }, index) => (
              <motion.a
                key={index}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ y: -2 }}
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
