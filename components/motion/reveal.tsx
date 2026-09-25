"use client"

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  type Variants,
} from "motion/react"
import { useEffect, useRef, useState, type ReactNode } from "react"

/* ------------------------------------------------------------------ *
 * Scroll-motion simples e seguro: subida em spring pesado (mass 1.2,
 * stiffness 45, damping 18) + fade. Coleções entram em stagger, uma vez só.
 *
 * A detecção de viewport é própria (não o whileInView do motion) por dois
 * motivos observados em produção: (1) saltos programáticos de scroll
 * (restauração de posição no reload, âncoras) não disparavam o observer
 * até o próximo evento real de scroll; (2) era preciso poder re-armar a
 * revelação quando o conteúdo troca (ver key={mode} nos consumidores).
 * Por isso: checagem geométrica na montagem + IntersectionObserver +
 * scroll/resize como retaguarda. Respeita reduced-motion.
 * ------------------------------------------------------------------ */

const SPRING_ENTRY = { type: "spring", mass: 1.2, stiffness: 45, damping: 18 } as const

/* margem de -10% do viewport: o mesmo critério do design original */
function intersects(el: Element) {
  const r = el.getBoundingClientRect()
  const vh = window.innerHeight
  return r.top < vh * 0.9 && r.bottom > vh * 0.1
}

function useInViewOnce() {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (intersects(el)) {
      setShown(true)
      return
    }
    let done = false
    const reveal = () => {
      if (done) return
      done = true
      cleanup()
      // setState direto de um listener de scroll vira update de prioridade
      // contínua e pode ficar agendado sem flush até o próximo frame; o
      // setTimeout(0) move para prioridade normal e descarrega sempre
      window.setTimeout(() => setShown(true), 0)
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[entries.length - 1].isIntersecting) reveal()
      },
      { rootMargin: "-10% 0px -10% 0px" },
    )
    const onScroll = () => {
      if (intersects(el)) reveal()
    }
    const cleanup = () => {
      io.disconnect()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
    io.observe(el)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return cleanup
  }, [])

  return { ref, shown }
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { y: SPRING_ENTRY, opacity: { duration: 0.5 } },
  },
}

export function RevealSection({
  children,
  className,
}: {
  children: ReactNode
  className?: string
  rule?: boolean
}) {
  const reduce = useReducedMotion()
  const { ref, shown } = useInViewOnce()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      variants={sectionVariants}
      initial="hidden"
      animate={shown ? "shown" : "hidden"}
    >
      {children}
    </motion.div>
  )
}

export function RevealGroup({
  children,
  className,
  delayChildren = 0.12,
  stagger = 0.08,
  as = "div",
}: {
  children: ReactNode
  className?: string
  delayChildren?: number
  stagger?: number
  as?: "div" | "ul" | "ol"
}) {
  const reduce = useReducedMotion()
  const { ref, shown } = useInViewOnce()
  if (reduce) {
    const Plain = as
    return <Plain className={className}>{children}</Plain>
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = motion[as] as any
  return (
    <Tag
      ref={ref}
      className={className}
      initial="hidden"
      animate={shown ? "shown" : "hidden"}
      variants={{
        hidden: {},
        shown: { transition: { delayChildren, staggerChildren: stagger } },
      }}
    >
      {children}
    </Tag>
  )
}

type RevealItemProps = {
  children: ReactNode
  className?: string
  as?: "div" | "li" | "article" | "a"
  dir?: "up" | "down" | "left"
  y?: number
} & Record<string, unknown>

export function RevealItem({
  children,
  className,
  as = "div",
  dir: _dir,
  y = 14,
  ...rest
}: RevealItemProps) {
  const reduce = useReducedMotion()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = motion[as] as any

  if (reduce) {
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    )
  }

  const variants: Variants = {
    hidden: { opacity: 0, y },
    shown: {
      opacity: 1,
      y: 0,
      transition: { y: SPRING_ENTRY, opacity: { duration: 0.4 } },
    },
  }
  return (
    <Tag className={className} variants={variants} {...rest}>
      {children}
    </Tag>
  )
}

/* Linha de progresso de leitura (1px) na borda esquerda. Transform-only.
 * Sempre renderiza (SSR e cliente iguais → sem erro de hidratação) e some
 * via CSS sob prefers-reduced-motion. */
export function ScrollSpine() {
  const { scrollYProgress } = useScroll()
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.5 })
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed right-0 top-0 z-50 h-screen w-px origin-top motion-reduce:hidden"
      style={{
        scaleY,
        background: "linear-gradient(to bottom, #1f2228, #1f2228 80%, var(--mode))",
      }}
    />
  )
}
