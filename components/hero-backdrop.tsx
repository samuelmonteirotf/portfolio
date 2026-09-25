"use client"

// Máscaras do hero. A esfera em si vive num canvas fixo atrás da página
// inteira (ver HeroOrb em app/page.tsx): ela sai do hero e acompanha a leitura.
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {/* estreito: esfera no meio, texto em cima e embaixo → máscara topo/base */}
      <div
        className="pointer-events-none absolute inset-0 lg:hidden"
        style={{ background: "linear-gradient(to bottom, rgba(3,3,3,0.78) 0%, transparent 24%, transparent 62%, rgba(3,3,3,0.88) 100%)" }}
      />
      {/* largo: esfera à direita, texto à esquerda → máscara só do lado do texto */}
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{ background: "linear-gradient(to right, rgba(3,3,3,0.55) 0%, transparent 42%)" }}
      />
      {/* vinheta lateral bem sutil */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(140% 120% at 50% 50%, transparent 62%, rgba(3,3,3,0.5) 100%)" }}
      />
    </div>
  )
}
