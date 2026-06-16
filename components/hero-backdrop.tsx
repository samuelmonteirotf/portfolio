"use client"

import dynamic from "next/dynamic"

// A cena 3D (three.js / r3f) só pode rodar no cliente — carrega via dynamic
// com ssr:false pra não quebrar o prerender do Next.
const HeroScene = dynamic(() => import("@/components/hero-scene"), {
  ssr: false,
  loading: () => <div aria-hidden="true" className="absolute inset-0 bg-[#030303]" />,
})

export function HeroBackdrop() {
  return <HeroScene />
}
