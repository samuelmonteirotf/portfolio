/* Barramento entre a página e a esfera/campo (hero-orb.tsx). As seções não
 * importam nada do WebGL: só disparam eventos no window.
 *  · orbPulse(cor): um pulso na cor dada (veredito do Sentinel, 429 do Aegis,
 *    novo sorteio do Monte Carlo) */

export const ORB_PULSE = "orb:pulse"

export type PulseDetail = { rgb: [number, number, number]; strength: number }

// aceita "#rrggbb" e "rgb(r, g, b)" (o computed de --mode, registrada como <color>)
function toRgb(color: string): [number, number, number] {
  const m = color.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/)
  if (m) return [Number(m[1]) / 255, Number(m[2]) / 255, Number(m[3]) / 255]
  const n = parseInt(color.trim().replace("#", ""), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export function orbPulse(color: string, strength = 1) {
  window.dispatchEvent(new CustomEvent<PulseDetail>(ORB_PULSE, { detail: { rgb: toRgb(color), strength } }))
}

/* pulso na cor do modo ativo */
export function orbPulseMode(strength = 1) {
  orbPulse(getComputedStyle(document.documentElement).getPropertyValue("--mode") || "#ffffff", strength)
}
