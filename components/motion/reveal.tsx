"use client"

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  type Variants,
} from "motion/react"
import type { ReactNode } from "react"

/* ------------------------------------------------------------------ *
 * Scroll-motion simples e seguro: subida em spring pesado (DESIGN.md
 * cinematic-entry) + fade. SEM clip-path (que estava cortando conteúdo).
 * Coleções entram em stagger. Dispara uma vez e respeita reduced-motion.
 * ------------------------------------------------------------------ */

const SPRING_ENTRY = { type: "spring", mass: 1.2, stiffness: 45, damping: 18 } as const

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
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      variants={sectionVariants}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
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
  if (reduce) {
    const Plain = as
    return <Plain className={className}>{children}</Plain>
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = motion[as] as any
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
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

/* Linha de progresso de leitura (1px) na borda esquerda. Transform-only. */
export function ScrollSpine() {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.5 })
  if (reduce) return null
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed right-0 top-0 z-50 h-screen w-px origin-top"
      style={{
        scaleY,
        background: "linear-gradient(to bottom, #1f2228, #1f2228 88%, #00f5ff)",
      }}
    />
  )
}
