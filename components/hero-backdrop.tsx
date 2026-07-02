"use client"

import { HeroParticles } from "@/components/hero-particles"

// Fundo do hero — campo de moléculas (Canvas 2D). Ao trocar de modo, as
// partículas convergem e formam a esfera de plasma na cor certa.
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-background">
      <HeroParticles />
      {/* máscara topo/base: contraste do texto (topo e base), meio livre p/ a esfera viajar */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(3,3,3,0.78) 0%, transparent 24%, transparent 62%, rgba(3,3,3,0.88) 100%)" }}
      />
      {/* vinheta lateral bem sutil */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(140% 120% at 50% 50%, transparent 62%, rgba(3,3,3,0.5) 100%)" }}
      />
    </div>
  )
}
