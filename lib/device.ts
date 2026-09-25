/* Heurística de hardware modesto, compartilhada pelos WebGL da página (esfera
 * do hero e Sala de Controle): ≤4 núcleos lógicos ou ≤4GB de memória
 * (deviceMemory só existe no Chromium; nos outros vale só os núcleos).
 * Só roda no cliente. */
export function isModestHardware(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number }
  return (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4
}
