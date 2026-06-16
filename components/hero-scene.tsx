"use client"

import { Canvas, useFrame, useThree, extend, type ThreeEvent, type ThreeElement } from "@react-three/fiber"
import { Text, Billboard, Sparkles, shaderMaterial, useTexture } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import { useRef, useEffect, useMemo, useState, Suspense } from "react"
import * as THREE from "three"

/* ------------------------------------------------------------------ *
 * Hero 3D — a stack do Samuel como anel orbital em torno do servidor de
 * origem (monteirotf.com). Pulsos de dados fluindo pra origem, hover com
 * nome, entrada cinematográfica escalonada, profundidade 3D, responsivo.
 * ------------------------------------------------------------------ */

const CYAN = "#00f5ff"
const R = 1.95
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const easeOutBack = (x: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

/* Filamento fibra-óptica: uma banda gaussiana de luz varre o tubo nó→origem,
 * esfriando de brand→cyan. Additive + toneMapped:false → o núcleo passa de 1.0
 * e o Bloom faz brilhar; o fio em repouso (alpha ~0.1) fica abaixo do threshold. */
const FiberMaterial = shaderMaterial(
  {
    uHead: 1,
    uWidth: 0.1,
    uAppear: 0,
    uBaseAlpha: 0.1,
    uCore: 2.2,
    uBrand: new THREE.Color("#ffffff"),
    uCyan: new THREE.Color(CYAN),
  },
  /* glsl vert */ `
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  /* glsl frag */ `
    uniform float uHead; uniform float uWidth; uniform float uAppear;
    uniform float uBaseAlpha; uniform float uCore; uniform vec3 uBrand; uniform vec3 uCyan;
    varying vec2 vUv;
    void main(){
      float s = vUv.x;                       // 0 na origem, 1 no nó
      vec3 baseCol = mix(uCyan, uBrand, s);  // esfria p/ cyan perto da origem
      float originFade = smoothstep(0.0, 0.06, s); // dissolve curto na borda do servidor
      float w = mix(0.22, uWidth, uAppear);  // foca na entrada
      float d = (s - uHead) / w;
      float band = exp(-d * d);              // banda gaussiana móvel
      vec3 col = baseCol * uBaseAlpha;       // fio recessivo
      col += baseCol * band;                 // a banda acende o fio
      col *= 1.0 + band * uCore;             // núcleo > 1.0 → bloom
      float alpha = (uBaseAlpha + band) * originFade * uAppear;
      gl_FragColor = vec4(col, alpha);
    }
  `,
)
extend({ FiberMaterial })
declare module "@react-three/fiber" {
  interface ThreeElements {
    fiberMaterial: ThreeElement<typeof FiberMaterial>
  }
}

type NodeDef = { label: string; color: string; icon: string }
const NODES: NodeDef[] = [
  { label: "Cloudflare · Sentinel", color: "#f6821f", icon: "/icons/cloudflare.svg" },
  { label: "Docker", color: "#3aa0ff", icon: "/icons/docker.svg" },
  { label: "Redis", color: "#ff5b50", icon: "/icons/redis.svg" },
  { label: "Postgres", color: "#5aa6f0", icon: "/icons/postgres.svg" },
  { label: "Tailscale", color: "#c9c9ff", icon: "/icons/tailscale.svg" },
  { label: "FastAPI", color: "#16c7a8", icon: "/icons/fastapi.svg" },
  { label: "Linux", color: "#f5c518", icon: "/icons/linux.svg" },
  { label: "Caddy", color: "#2bd47a", icon: "/icons/caddy.svg" },
]

function StackNode({ pos, def, index, onGrab, onHover }: { pos: [number, number, number]; def: NodeDef; index: number; onGrab: (e: ThreeEvent<PointerEvent>) => void; onHover: (hovering: boolean) => void }) {
  const tex = useTexture(def.icon)
  const mesh = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const t0 = useRef<number | null>(null)
  const hs = useRef(1)
  useFrame((s) => {
    if (t0.current === null) t0.current = s.clock.elapsedTime
    const e = s.clock.elapsedTime - t0.current
    const p = clamp((e - (0.3 + index * 0.07)) / 0.55, 0, 1) // entrada escalonada
    const enter = p <= 0 ? 0.001 : easeOutBack(p)
    hs.current = THREE.MathUtils.lerp(hs.current, hovered ? 1.4 : 1, 0.18)
    if (mesh.current) mesh.current.scale.setScalar(Math.max(0.001, enter * hs.current))
  })
  return (
    <Billboard position={pos}>
      <mesh
        ref={mesh}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(true) }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); onHover(false) }}
        onPointerDown={(e) => { e.stopPropagation(); onGrab(e) }}
      >
        <planeGeometry args={[0.66, 0.66]} />
        <meshBasicMaterial map={tex} color={def.color} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      {hovered && (
        <Text position={[0, 0.52, 0]} fontSize={0.13} color={def.color} anchorX="center" anchorY="bottom" letterSpacing={0.06}>
          {def.label.toUpperCase()}
        </Text>
      )}
    </Billboard>
  )
}

function FlowLine({ pos, color, index }: { pos: [number, number, number]; color: string; index: number }) {
  const matRef = useRef<any>(null)
  const t0 = useRef<number | null>(null)
  const mid: [number, number, number] = [pos[0] * 0.5, pos[1] * 0.5, pos[2] * 0.5 + 0.22]

  const geo = useMemo(() => {
    const end = new THREE.Vector3(...pos)
    // começa na BORDA do servidor (não no centro), pra o feixe não passar atrás dele
    const start = end.clone().normalize().multiplyScalar(0.34)
    const curve = new THREE.QuadraticBezierCurve3(
      start,
      new THREE.Vector3(...mid),
      end,
    )
    return new THREE.TubeGeometry(curve, 40, 0.006, 6, false)
  }, [pos[0], pos[1], pos[2]]) // eslint-disable-line react-hooks/exhaustive-deps

  const brand = useMemo(() => new THREE.Color(color), [color])
  const phase = index / NODES.length

  useFrame((s) => {
    if (t0.current === null) t0.current = s.clock.elapsedTime
    const e = s.clock.elapsedTime - t0.current
    const appear = clamp((e - (0.45 + index * 0.05)) / 0.5, 0, 1)
    const m = matRef.current
    if (m) {
      m.uHead = 1 - ((s.clock.elapsedTime * 0.32 + phase) % 1) // nó → origem
      m.uAppear = appear
    }
  })

  useEffect(() => () => geo.dispose(), [geo])

  return (
    <mesh geometry={geo}>
      <fiberMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        uBrand={brand}
        uBaseAlpha={0.1}
        uCore={2.2}
        uWidth={0.1}
      />
    </mesh>
  )
}

// Núcleo = o servidor de origem (monteirotf.com)
function Core() {
  const tex = useTexture("/icons/tb-server-cog.svg")
  const grp = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  const t0 = useRef<number | null>(null)
  useFrame((s) => {
    if (t0.current === null) t0.current = s.clock.elapsedTime
    const e = s.clock.elapsedTime - t0.current
    const p = clamp(e / 0.5, 0, 1)
    // pico no instante em que um fluxo "chega" na origem (mesma cadência dos FlowLines)
    const absorb = Math.pow(1 - ((s.clock.elapsedTime * 0.32 * NODES.length) % 1), 3)
    const breathe = 1 + Math.sin(s.clock.elapsedTime * 1.6) * 0.025 + absorb * 0.04
    if (grp.current) grp.current.scale.setScalar(Math.max(0.001, easeOutBack(p) * breathe))
    if (ring.current) {
      ring.current.scale.setScalar(1 + absorb * 0.5)
      ;(ring.current.material as THREE.MeshBasicMaterial).opacity = absorb * 0.4 * p
    }
  })
  return (
    <group ref={grp}>
      {/* halo que pulsa ao "beber" cada stream */}
      <Billboard>
        <mesh ref={ring}>
          <ringGeometry args={[0.26, 0.31, 48]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </Billboard>
      <Billboard>
        <mesh>
          <planeGeometry args={[0.5, 0.5]} />
          <meshBasicMaterial map={tex} color={CYAN} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      </Billboard>
      <Billboard position={[0, -0.42, 0]}>
        <Text fontSize={0.07} color="#7c8aa0" anchorX="center" anchorY="top" letterSpacing={0.22}>
          ORIGIN
        </Text>
        <Text position={[0, -0.11, 0]} fontSize={0.1} color={CYAN} anchorX="center" anchorY="top" letterSpacing={0.04}>
          monteirotf.com
        </Text>
      </Billboard>
    </group>
  )
}

function Cluster() {
  const outer = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  const { gl, size } = useThree()
  const drag = useRef({ active: false, lx: 0, ly: 0, vx: 0, vy: 0 })
  const rot = useRef({ x: -0.3, y: 0 })
  const hoverCount = useRef(0)

  // cursor de "arrastar" (grab) só aparece EM CIMA dos ícones de stack —
  // não na página inteira. vira "grabbing" só enquanto arrasta.
  const onHover = (hovering: boolean) => {
    hoverCount.current = Math.max(0, hoverCount.current + (hovering ? 1 : -1))
    if (!drag.current.active) gl.domElement.style.cursor = hoverCount.current > 0 ? "grab" : "default"
  }

  // arraste inicia só ao pressionar um ícone (onPointerDown do mesh)
  const startDrag = (e: ThreeEvent<PointerEvent>) => {
    if (e.nativeEvent.pointerType !== "mouse") return // no touch a página rola normalmente
    drag.current = { active: true, lx: e.nativeEvent.clientX, ly: e.nativeEvent.clientY, vx: 0, vy: 0 }
    gl.domElement.style.cursor = "grabbing"
  }

  useEffect(() => {
    const el = gl.domElement
    el.style.cursor = "default"
    const SENS = 0.006
    const onMove = (e: PointerEvent) => {
      if (!drag.current.active) return
      const dx = e.clientX - drag.current.lx
      const dy = e.clientY - drag.current.ly
      drag.current.lx = e.clientX
      drag.current.ly = e.clientY
      drag.current.vx = dx
      drag.current.vy = dy
      rot.current.y += dx * SENS
      rot.current.x = clamp(rot.current.x + dy * SENS, -1.1, 0.5)
    }
    const onUp = () => {
      if (!drag.current.active) return
      drag.current.active = false
      el.style.cursor = hoverCount.current > 0 ? "grab" : "default"
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
  }, [gl])

  useFrame((_, dt) => {
    const d = drag.current
    if (!d.active) {
      rot.current.y += d.vx * 0.006
      rot.current.x = clamp(rot.current.x + d.vy * 0.006, -1.1, 0.5)
      d.vx *= 0.9
      d.vy *= 0.9
      rot.current.y += dt * 0.05
      if (spin.current) spin.current.rotation.z += dt * 0.04
    }
    if (outer.current) {
      outer.current.rotation.y = THREE.MathUtils.lerp(outer.current.rotation.y, rot.current.y, 0.14)
      outer.current.rotation.x = THREE.MathUtils.lerp(outer.current.rotation.x, rot.current.x, 0.14)
    }
  })

  // responsivo: no mobile centraliza e encolhe
  const mobile = size.width < 1024
  const px = mobile ? 0 : 3.4
  const sc = mobile ? 0.62 : 0.9

  return (
    <group position={[px, 0.1, 0]} scale={sc}>
      <group ref={outer} rotation={[-0.3, 0, 0]}>
        <Core />
        <group ref={spin}>
          {NODES.map((n, i) => {
            const a = (i / NODES.length) * Math.PI * 2 + Math.PI / 2
            const pos: [number, number, number] = [Math.cos(a) * R, Math.sin(a) * R, Math.sin(a * 2) * 0.55]
            return (
              <group key={n.label}>
                <FlowLine pos={pos} color={n.color} index={i} />
                <StackNode pos={pos} def={n} index={i} onGrab={startDrag} onHover={onHover} />
              </group>
            )
          })}
        </group>
      </group>
    </group>
  )
}

export default function HeroScene() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[#030303]">
      <div className="absolute inset-0 h-full w-full">
        <Canvas camera={{ position: [0, 0.3, 9], fov: 46 }} dpr={[1, 2]} gl={{ antialias: true }}>
          <color attach="background" args={["#030303"]} />
          <fog attach="fog" args={["#030303", 9, 26]} />
          <ambientLight intensity={0.2} />
          <Suspense fallback={null}>
            <Cluster />
            <Sparkles count={220} scale={[28, 15, 12]} position={[0, 0, -4]} size={2.5} speed={0.3} color={CYAN} opacity={0.6} noise={1} />
            <EffectComposer>
              <Bloom luminanceThreshold={0.2} mipmapBlur intensity={0.8} radius={0.6} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>

      {/* máscara desktop: leve viés à esquerda p/ contraste do texto — deixa as estrelas aparecerem em todo o hero */}
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{ background: "linear-gradient(to right, rgba(3,3,3,0.5) 0%, rgba(3,3,3,0.22) 40%, transparent 70%)" }}
      />
      {/* máscara mobile: vinheta bem sutil (nome legível no centro, estrelas nas bordas) */}
      <div
        className="pointer-events-none absolute inset-0 lg:hidden"
        style={{ background: "radial-gradient(78% 62% at 50% 46%, transparent 40%, rgba(3,3,3,0.42) 100%)" }}
      />
    </div>
  )
}
