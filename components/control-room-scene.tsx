"use client"

import { Canvas, useFrame, useThree, extend, type ThreeEvent, type ThreeElement } from "@react-three/fiber"
import { Billboard, shaderMaterial, useTexture } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import { useRef, useEffect, useMemo, useState, Suspense } from "react"
import * as THREE from "three"

/* ------------------------------------------------------------------ *
 * Sala de Controle — topologia da infra em WebGL (irmã do hero).
 * Globo girando (Internet) → Cloudflare → edge-1 → dados; malha Tailscale.
 * Ícones brancos com glow, fluxos fibra-óptica cyan descendo, drag suave.
 * ------------------------------------------------------------------ */

const CYAN = "#00f5ff"
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const easeOutBack = (x: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}
const WHITE = new THREE.Color("#ffffff")
const IDLE = new THREE.Color("#cdd6e2")

/* fluxo fibra-óptica: banda gaussiana viajando source→target, esfria p/ cyan */
const CrFiberMaterial = shaderMaterial(
  {
    uHead: 0,
    uWidth: 0.1,
    uBaseAlpha: 0.1,
    uCore: 2.2,
    uBrand: new THREE.Color("#ffffff"),
    uCyan: new THREE.Color(CYAN),
  },
  /* glsl */ `
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  /* glsl */ `
    uniform float uHead; uniform float uWidth; uniform float uBaseAlpha; uniform float uCore;
    uniform vec3 uBrand; uniform vec3 uCyan; varying vec2 vUv;
    void main(){
      float s = vUv.x;                         // 0 = source, 1 = target
      vec3 baseCol = mix(uBrand, uCyan, s);    // source branco → target cyan
      float edge = smoothstep(0.0, 0.10, s) * smoothstep(1.0, 0.90, s); // some nas pontas
      float d = (s - uHead) / uWidth;
      float band = exp(-d * d);
      vec3 col = baseCol * uBaseAlpha;
      col += baseCol * band;
      col *= 1.0 + band * uCore;
      gl_FragColor = vec4(col, (uBaseAlpha + band) * edge);
    }
  `,
)
extend({ CrFiberMaterial })
declare module "@react-three/fiber" {
  interface ThreeElements {
    crFiberMaterial: ThreeElement<typeof CrFiberMaterial>
  }
}

type Vec3 = [number, number, number]
type NodeDef = { id: string; label: string; icon: string; pos: Vec3; tier: number }

const NODES: NodeDef[] = [
  { id: "sentinel", label: "Sentinel", icon: "/icons/cloudflare.svg", pos: [-0.95, 1.4, 0.15], tier: 1 },
  { id: "realscan", label: "RealScan", icon: "/icons/cloudflare.svg", pos: [0.95, 1.4, 0.15], tier: 1 },
  { id: "caddy", label: "Caddy 2", icon: "/icons/caddy.svg", pos: [0, 0.0, 0], tier: 2 },
  { id: "api", label: "API", icon: "/icons/docker.svg", pos: [0, -1.2, 0], tier: 3 },
  { id: "postgres", label: "Postgres", icon: "/icons/postgres.svg", pos: [-0.9, -2.5, -0.12], tier: 4 },
  { id: "redis", label: "Redis", icon: "/icons/redis.svg", pos: [0.9, -2.5, -0.12], tier: 4 },
  { id: "tailscale", label: "Tailscale", icon: "/icons/tailscale.svg", pos: [2.55, -1.2, 0.3], tier: 3 },
]
const NODE_BY_ID: Record<string, NodeDef> = Object.fromEntries(NODES.map((n) => [n.id, n]))
const GLOBE_POS: Vec3 = [0, 3.0, 0]

type EdgeDef = {
  id: string
  from: Vec3
  to: Vec3
  fromId: string
  toId: string
  phase: number
  brand?: string
  speed?: number
  radius?: number
  baseAlpha?: number
  core?: number
}
const EDGES: EdgeDef[] = [
  { id: "i-s", from: GLOBE_POS, to: NODE_BY_ID.sentinel.pos, fromId: "internet", toId: "sentinel", phase: 0.0, speed: 0.36 },
  { id: "i-r", from: GLOBE_POS, to: NODE_BY_ID.realscan.pos, fromId: "internet", toId: "realscan", phase: 0.5, speed: 0.36 },
  { id: "s-c", from: NODE_BY_ID.sentinel.pos, to: NODE_BY_ID.caddy.pos, fromId: "sentinel", toId: "caddy", phase: 0.2, brand: "#10b981" },
  { id: "r-c", from: NODE_BY_ID.realscan.pos, to: NODE_BY_ID.caddy.pos, fromId: "realscan", toId: "caddy", phase: 0.6, brand: "#10b981" },
  { id: "c-a", from: NODE_BY_ID.caddy.pos, to: NODE_BY_ID.api.pos, fromId: "caddy", toId: "api", phase: 0.1, speed: 0.3 },
  { id: "a-p", from: NODE_BY_ID.api.pos, to: NODE_BY_ID.postgres.pos, fromId: "api", toId: "postgres", phase: 0.3, speed: 0.28 },
  { id: "a-rd", from: NODE_BY_ID.api.pos, to: NODE_BY_ID.redis.pos, fromId: "api", toId: "redis", phase: 0.7, speed: 0.28 },
  { id: "t-c", from: NODE_BY_ID.tailscale.pos, to: NODE_BY_ID.caddy.pos, fromId: "tailscale", toId: "caddy", phase: 0.4, brand: "#9fb2c4", radius: 0.004, baseAlpha: 0.03, core: 1.4, speed: 0.18 },
]

/* ------------------------------- globo girando ------------------------------- */

function Globe({ reduce }: { reduce: boolean }) {
  const grp = useRef<THREE.Group>(null)
  const wf = useMemo(() => new THREE.WireframeGeometry(new THREE.SphereGeometry(0.55, 24, 16)), [])
  useEffect(() => () => wf.dispose(), [wf])
  useFrame((_, dt) => {
    if (grp.current) {
      grp.current.rotation.x = 0.35
      if (!reduce) grp.current.rotation.y += dt * 0.18
    }
  })
  return (
    <group position={GLOBE_POS}>
      <group ref={grp}>
        {/* núcleo de vidro escuro: occlui as linhas de trás → lê como corpo */}
        <mesh>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshBasicMaterial color="#061318" transparent opacity={0.55} />
        </mesh>
        {/* grade lat/long */}
        <lineSegments geometry={wf}>
          <lineBasicMaterial color={CYAN} transparent opacity={0.3} toneMapped={false} blending={THREE.AdditiveBlending} />
        </lineSegments>
        {/* atmosfera (halo bloom) */}
        <mesh>
          <sphereGeometry args={[0.62, 24, 16]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0.1} side={THREE.BackSide} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
    </group>
  )
}

/* ------------------------------- nó-ícone ------------------------------- */

function IconNode({
  node,
  selected,
  onSelect,
  onHover,
  onGrab,
}: {
  node: NodeDef
  selected: string
  onSelect: (id: string) => void
  onHover: (h: boolean) => void
  onGrab: (e: ThreeEvent<PointerEvent>) => void
}) {
  const tex = useTexture(node.icon)
  const { gl } = useThree()
  useEffect(() => {
    tex.anisotropy = gl.capabilities.getMaxAnisotropy?.() ?? 8
    tex.minFilter = THREE.LinearMipmapLinearFilter
    tex.generateMipmaps = true
    tex.colorSpace = THREE.SRGBColorSpace
    tex.needsUpdate = true
  }, [tex, gl])

  const mesh = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Mesh>(null)
  const [hov, setHov] = useState(false)
  const t0 = useRef<number | null>(null)
  const sc = useRef(0.001)
  const isSel = selected === node.id

  useFrame((s) => {
    if (t0.current === null) t0.current = s.clock.elapsedTime
    const e = s.clock.elapsedTime - t0.current
    const p = clamp((e - (0.3 + node.tier * 0.08)) / 0.55, 0, 1)
    const enter = p <= 0 ? 0.001 : easeOutBack(p)
    const target = isSel ? 1.45 : hov ? 1.32 : isSel ? 1 : 0.96
    sc.current = THREE.MathUtils.lerp(sc.current, enter * target, 0.16)
    if (mesh.current) {
      mesh.current.scale.setScalar(Math.max(0.001, sc.current))
      const m = mesh.current.material as THREE.MeshBasicMaterial
      m.color.lerp(isSel || hov ? WHITE : IDLE, 0.12)
    }
    if (ring.current) {
      const rm = ring.current.material as THREE.MeshBasicMaterial
      const breathe = isSel ? 0.45 + Math.sin(s.clock.elapsedTime * 2.2) * 0.12 : 0
      rm.opacity = THREE.MathUtils.lerp(rm.opacity, isSel ? breathe : hov ? 0.4 : 0, 0.15)
    }
  })

  return (
    <Billboard position={node.pos}>
      <mesh ref={ring}>
        <ringGeometry args={[0.33, 0.39, 48]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh
        ref={mesh}
        onPointerOver={(e) => { e.stopPropagation(); setHov(true); onHover(true) }}
        onPointerOut={(e) => { e.stopPropagation(); setHov(false); onHover(false) }}
        onPointerDown={(e) => { e.stopPropagation(); onGrab(e) }}
        onClick={(e) => { e.stopPropagation(); onSelect(node.id) }}
      >
        <planeGeometry args={[0.62, 0.62]} />
        <meshBasicMaterial map={tex} color={IDLE.clone()} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </Billboard>
  )
}

/* ------------------------------- conexão (fluxo) ------------------------------- */

function FlowLine({ edge, active, reduce }: { edge: EdgeDef; active: boolean; reduce: boolean }) {
  const matRef = useRef<any>(null)
  const speed = edge.speed ?? 0.32
  const baseAlpha = edge.baseAlpha ?? 0.05
  const core = edge.core ?? 2.4

  const geo = useMemo(() => {
    const a = new THREE.Vector3(...edge.from)
    const b = new THREE.Vector3(...edge.to)
    const mid = a.clone().lerp(b, 0.5)
    mid.z += 0.18 // leve curva pra não z-fightar com os ícones
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b)
    return new THREE.TubeGeometry(curve, 36, edge.radius ?? 0.007, 6, false)
  }, [edge])
  useEffect(() => () => geo.dispose(), [geo])

  useFrame((s) => {
    const m = matRef.current
    if (!m) return
    m.uHead = reduce ? 0.5 : (s.clock.elapsedTime * speed + edge.phase) % 1 // source → target
    m.uCore = THREE.MathUtils.lerp(m.uCore, active ? core + 1.0 : core, 0.1)
    m.uBaseAlpha = THREE.MathUtils.lerp(m.uBaseAlpha, active ? 0.18 : baseAlpha, 0.1)
  })

  return (
    <mesh geometry={geo}>
      <crFiberMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        uBrand={new THREE.Color(edge.brand ?? "#ffffff")}
        uBaseAlpha={baseAlpha}
        uCore={core}
        uWidth={0.1}
      />
    </mesh>
  )
}

/* ------------------------------- mapa (drag + render) ------------------------------- */

function Map({
  selected,
  onSelect,
  reduce,
}: {
  selected: string
  onSelect: (id: string) => void
  reduce: boolean
}) {
  const outer = useRef<THREE.Group>(null)
  const { gl, size } = useThree()
  const drag = useRef({ active: false, lx: 0, ly: 0, vx: 0, vy: 0, moved: false, dx0: 0, dy0: 0 })
  const rot = useRef({ x: -0.12, y: 0 })
  const hoverCount = useRef(0)
  const mobile = size.width < 768

  const onHover = (h: boolean) => {
    hoverCount.current = Math.max(0, hoverCount.current + (h ? 1 : -1))
    if (!drag.current.active) gl.domElement.style.cursor = hoverCount.current > 0 ? "grab" : "default"
  }
  const startDrag = (e: ThreeEvent<PointerEvent>) => {
    if (e.nativeEvent.pointerType !== "mouse") return
    drag.current = {
      active: true, lx: e.nativeEvent.clientX, ly: e.nativeEvent.clientY,
      vx: 0, vy: 0, moved: false, dx0: e.nativeEvent.clientX, dy0: e.nativeEvent.clientY,
    }
    gl.domElement.style.cursor = "grabbing"
  }
  const handleSelect = (id: string) => {
    if (!drag.current.moved) onSelect(id)
  }

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!drag.current.active) return
      const dx = e.clientX - drag.current.lx
      const dy = e.clientY - drag.current.ly
      drag.current.lx = e.clientX
      drag.current.ly = e.clientY
      drag.current.vx = dx
      drag.current.vy = dy
      if (Math.abs(e.clientX - drag.current.dx0) + Math.abs(e.clientY - drag.current.dy0) > 5) drag.current.moved = true
      rot.current.y = clamp(rot.current.y + dx * 0.006, -0.6, 0.6)
      rot.current.x = clamp(rot.current.x + dy * 0.006, -0.5, 0.2)
    }
    const onUp = () => {
      if (!drag.current.active) return
      drag.current.active = false
      gl.domElement.style.cursor = hoverCount.current > 0 ? "grab" : "default"
      window.setTimeout(() => { drag.current.moved = false }, 0)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
  }, [gl])

  useFrame((s, dt) => {
    const d = drag.current
    if (!d.active && !reduce) {
      rot.current.y = clamp(rot.current.y + d.vx * 0.006, -0.6, 0.6)
      rot.current.x = clamp(rot.current.x + d.vy * 0.006, -0.5, 0.2)
      d.vx *= 0.9
      d.vy *= 0.9
    }
    const sway = reduce ? 0 : Math.sin(s.clock.elapsedTime * 0.3) * 0.04
    if (outer.current) {
      outer.current.rotation.y = THREE.MathUtils.lerp(outer.current.rotation.y, rot.current.y + sway, 0.1)
      outer.current.rotation.x = THREE.MathUtils.lerp(outer.current.rotation.x, rot.current.x, 0.1)
    }
  })

  const sc = mobile ? 0.6 : 0.92

  return (
    <group position={[0, -0.3, 0]} scale={sc}>
      <group ref={outer} rotation={[-0.12, 0, 0]}>
        {EDGES.map((edge) => (
          <FlowLine key={edge.id} edge={edge} active={selected === edge.fromId || selected === edge.toId} reduce={reduce} />
        ))}
        <Globe reduce={reduce} />
        {NODES.map((node) => (
          <IconNode key={node.id} node={node} selected={selected} onSelect={handleSelect} onHover={onHover} onGrab={startDrag} />
        ))}
      </group>
    </group>
  )
}

export default function ControlRoomScene({
  selected,
  onSelect,
  reduce = false,
}: {
  selected: string
  onSelect: (id: string) => void
  reduce?: boolean
}) {
  return (
    <Canvas camera={{ position: [0, 0.2, 9.5], fov: 44 }} dpr={[1, 2]} gl={{ antialias: true }}>
      <color attach="background" args={["#030303"]} />
      <fog attach="fog" args={["#030303", 10, 28]} />
      <ambientLight intensity={0.2} />
      <Suspense fallback={null}>
        <Map selected={selected} onSelect={onSelect} reduce={reduce} />
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={0.8} radius={0.6} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
