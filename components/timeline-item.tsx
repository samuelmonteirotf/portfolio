"use client"

import { useId, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ChevronDown } from "lucide-react"

const EXPO = [0.16, 1, 0.3, 1] as const

export function TimelineItem({
  role,
  period,
  company,
  description,
}: {
  role: string
  period: string
  company: string
  description: string
}) {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const id = useId()

  return (
    <div>
      <h3 className="m-0">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={id}
          className="group flex w-full items-baseline justify-between gap-3 text-left"
        >
          <span className="font-semibold text-foreground transition-colors group-hover:text-primary">
            {role}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{period}</span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:text-primary ${
                open ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.32, ease: EXPO }}
            className="overflow-hidden"
          >
            <p className="mt-1 text-sm font-medium text-foreground">{company}</p>
            <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
              {description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
