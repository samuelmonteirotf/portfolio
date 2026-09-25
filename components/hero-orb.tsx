"use client"

import { useEffect, useRef, useState } from "react"
import { usePillMode } from "@/components/pill-mode"
import type { ModeKey } from "@/lib/portfolio-data"
import { isModestHardware } from "@/lib/device"
import { ORB_PULSE, type PulseDetail } from "@/lib/orb-bus"

/* As partículas contam a história. WebGL puro num canvas fixo atrás da página.
 *
 *  hero        → a esfera (azul: globo de anéis · vermelho: plasma · roxo:
 *                casca com núcleo). Trocar de modo dispersa e reconverge.
 *  capítulos   → cada projeto é um capítulo de tela cheia (project-chapters):
 *                as partículas ESCREVEM o nome do projeto e depois viram a
 *                FIGURA dele, no palco à direita do texto:
 *                  sentinel  pacotes contra o muro (suspeitos ricocheteiam)
 *                  aegis     balde de tokens enchendo/esvaziando, 429 quando seca
 *                  realscan  radar varrendo e acendendo alvos
 *                  tesstrade leque de Monte Carlo
 *                  6id       três nós trocando pacotes
 *  depois      → dissolvem; o resto da página fica limpo.
 *
 * Tudo sem estado: cada formação é uma função (partícula, tempo) → posição, e
 * a CPU só escolhe as duas formações vizinhas (A, B) e o quanto misturar, a
 * partir da rolagem. Os pontos das palavras vêm de texto rasterizado. */

type RGB = [number, number, number]
type V3 = [number, number, number]

const BLUE: RGB = [96 / 255, 156 / 255, 242 / 255]
const RED: RGB = [236 / 255, 92 / 255, 98 / 255]
const PURPLE: RGB = [150 / 255, 90 / 255, 235 / 255]
const S_BLUE: V3 = [1, 0, 0]
const S_RED: V3 = [0, 1, 0]
const S_PURPLE: V3 = [0, 0, 1]

const DISPERSE_MS = 800 // SETTLE_MS do pill-mode depende disto
// no roxo: azul e vermelho se formam lado a lado e só então se fundem
const MERGE_MS = 2900

// tipos de formação (iguais no shader)
const F_ORB = 0
const F_WORD = 1
const F_SCATTER = 8
// skills: as partículas escrevem o nome (data-word) no palco da direita
const SCENE: Record<string, number> = { dust: 9, skills: 1, traffic: 12, timeline: 13, orb: 14 }
const FIG: Record<string, number> = { sentinel: 2, aegis: 3, realscan: 4, tesstrade: 5, "6id": 6 }
const WORD: Record<string, string> = {
  sentinel: "SENTINEL",
  aegis: "AEGIS",
  realscan: "REALSCAN",
  tesstrade: "TESSTRADE",
  "6id": "6ID",
}

const VERT = /* glsl */ `
attribute vec3 aDir;
attribute vec2 aHome;
attribute vec4 aRand; // x tamanho · y atraso · z seletor · w raio
attribute float aGrp;
attribute vec2 aWA;   // pontos da palavra do slot A (quadrado [-1,1], y pra cima)
attribute vec2 aWB;   // idem slot B

uniform vec2 uRes;
uniform float uDpr;
uniform float uTime;
uniform float uAngle;
uniform vec2 uC0; uniform vec2 uC1;
uniform vec3 uCol0; uniform vec3 uCol1;
uniform vec3 uSty0; uniform vec3 uSty1;
uniform float uR;
uniform float uDisp;
uniform float uSeed;
uniform vec3 uMouse;
uniform float uGain;
uniform float uPulse;
uniform vec3 uPulseCol;
uniform int uTypeA;
uniform int uTypeB;
uniform float uMix;
uniform vec3 uStageA; // palco da formação A: centro x, centro y, meia-largura (px)
uniform vec3 uStageB; // idem B (o nome fica no centro; a figura, à direita)
uniform vec4 uPA;     // parâmetros da cena A: (p1, p2, progresso, alfa)
uniform vec4 uPB;     // idem B

varying vec3 vCol;
varying float vA;

const float PI = 3.14159265;
float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }

/* ---------------- esfera do hero ---------------- */
vec3 structure(vec3 d, vec4 r) {
  float lat = asin(clamp(d.y, -1.0, 1.0));
  float lon = atan(d.z, d.x);
  if (r.z < 0.62) {
    float bands = 11.0;
    float lq = (floor((lat / PI + 0.5) * bands) + 0.5) / bands * PI - PI * 0.5;
    return vec3(cos(lq) * cos(lon), sin(lq), cos(lq) * sin(lon)) * (1.0 + (r.w - 0.5) * 0.02);
  }
  if (r.z < 0.84) {
    float mer = 8.0;
    float oq = (floor((lon / (2.0 * PI) + 0.5) * mer) + 0.5) / mer * 2.0 * PI - PI;
    return vec3(cos(lat) * cos(oq), sin(lat), cos(lat) * sin(oq)) * (1.0 + (r.w - 0.5) * 0.02);
  }
  return d * (0.18 + 0.5 * r.w);
}
float plasmaFlow(vec4 r, float t) { return fract(r.w + t * 0.11 * (0.55 + r.x)); }
vec3 plasma(vec3 d, vec4 r, float t) {
  float ph = r.z * 6.2831;
  float flow = plasmaFlow(r, t);
  vec3 p = d * mix(0.12, 1.08, sqrt(flow));
  p += 0.13 * vec3(sin(p.y * 5.1 + t * 1.6 + ph), sin(p.z * 4.7 + t * 1.3 + ph * 1.3), sin(p.x * 4.3 + t * 1.1 + ph * 0.7));
  return p * (1.0 + 0.04 * sin(t * 2.4 + ph));
}
const float CORE = 0.34;
vec3 hollow(vec3 d, vec4 r, float t) {
  if (r.z < CORE) return plasma(d, r, t) * 0.42;
  return d * (0.965 + 0.035 * r.w) * (1.0 + 0.018 * sin(t * 1.4));
}

/* ---------------- figuras dos projetos ----------------
 * Coordenadas no quadrado [-1,1] com y para cima. Retornam
 * (x, y, brilho, destaque): destaque = "rejeitado" (bloqueado, 429,
 * vulnerável, prejuízo), pintado na cor de alerta. */

// sentinel: pacotes em faixas indo até o muro; suspeitos ricocheteiam
vec4 figSentinel(vec2 hm, vec4 r, float t) {
  if (r.z < 0.16) {
    float y = (hm.y * 2.0 - 1.0) * 0.82;
    return vec4(0.05 + (hm.x - 0.5) * 0.035 + 0.012 * sin(y * 28.0 + t * 5.0), y, 0.95, 0.0);
  }
  if (r.z < 0.27) {
    float a = hm.x * 6.2831, rr = sqrt(hm.y) * 0.13;
    return vec4(0.8 + cos(a) * rr, sin(a) * rr, 0.85, 0.0);
  }
  float lane = floor(hm.y * 9.0);
  float ly = (lane / 8.0 * 2.0 - 1.0) * 0.7 + (r.w - 0.5) * 0.03;
  float s = fract(hm.x + t * (0.11 + hash(lane) * 0.08));
  float x = -1.0 + s * 2.0;
  float y = ly;
  if (x > 0.02) {
    if (r.x > 0.66) {
      float k = x - 0.02;
      return vec4(0.02 - k * 0.55, ly + k * (r.w - 0.5) * 2.6, max(0.0, 1.0 - k * 1.3), 1.0);
    }
    float k = clamp((x - 0.08) / 0.7, 0.0, 1.0);
    y = mix(ly, 0.0, k * k);
    x = min(x, 0.78);
  }
  return vec4(x, y, 0.55, 0.0);
}

// aegis: balde de tokens; nível sobe e desce (rajadas), gotejamento de recarga,
// requisições saindo pela direita; balde seco = 429 (destaque)
vec4 figAegis(vec2 hm, vec4 r, float t) {
  float L = clamp(0.32 + 0.24 * sin(t * 0.55) + 0.1 * sin(t * 1.9), 0.02, 0.62);
  if (r.z < 0.2) {
    float u = hm.x * 3.0;
    vec2 p = u < 1.0 ? vec2(-0.5, 0.5 - u * 1.05) : (u < 2.0 ? vec2(-0.5 + (u - 1.0), -0.55) : vec2(0.5, -0.55 + (u - 2.0) * 1.05));
    return vec4(p + (hm.y - 0.5) * 0.012, 0.9, 0.0);
  }
  if (r.z < 0.7) {
    float x = -0.45 + hm.x * 0.9;
    float y = -0.52 + hm.y * L * 1.55;
    return vec4(floor(x * 30.0) / 30.0, floor(y * 30.0) / 30.0, 0.5, 0.0);
  }
  if (r.z < 0.82) {
    float s = fract(hm.x + t * 0.45);
    return vec4((hm.y - 0.5) * 0.05, mix(1.0, -0.5 + L * 1.55, s), 0.7 * (1.0 - s), 0.0);
  }
  float s = fract(hm.x + t * 0.3);
  float dry = step(L, 0.14);
  float x = 0.55 + s * 0.45;
  float y = 0.35 + (hm.y - 0.5) * 0.5 - s * 0.2;
  if (dry > 0.5) { x = 0.55 - s * 0.25; y += s * (hm.y - 0.5) * 0.8; }
  return vec4(x, y, 0.7 * (1.0 - s * 0.6), dry);
}

// realscan: anéis, varredura girando, alvos acendendo quando o feixe passa
vec4 figRealscan(vec2 hm, vec4 r, float t) {
  float ang = mod(t * 1.1, 6.2831);
  if (r.z < 0.3) {
    float k = floor(hm.y * 4.0) + 1.0;
    float a = hm.x * 6.2831;
    return vec4(cos(a) * k * 0.22, sin(a) * k * 0.22, 0.3, 0.0);
  }
  if (r.z < 0.42) {
    float rr = hm.x * 0.9;
    float a = ang - hm.y * 0.35;
    return vec4(cos(a) * rr, sin(a) * rr, 1.0 - hm.y, 0.0);
  }
  if (r.z < 0.48) {
    float v = hm.x * 1.8 - 0.9;
    return hm.y < 0.5 ? vec4(v, 0.0, 0.2, 0.0) : vec4(0.0, v, 0.2, 0.0);
  }
  float id = floor(r.w * 46.0);
  float ta = hash(id) * 6.2831;
  float tr = 0.18 + hash(id + 3.0) * 0.7;
  float since = mod(ang - ta, 6.2831);
  float lit = exp(-since * 1.2);
  float vuln = step(0.78, hash(id + 7.0));
  float a = ta + (hm.x - 0.5) * 0.06;
  float rr = tr + (hm.y - 0.5) * 0.04;
  return vec4(cos(a) * rr, sin(a) * rr, 0.12 + lit * 0.95, vuln * lit);
}

// tesstrade: leque de trajetórias de Monte Carlo saindo da origem
vec4 figTesstrade(vec2 hm, vec4 r, float t) {
  if (r.z < 0.08) return vec4(-0.9 + hm.x * 1.8, 0.0, 0.2, 0.0);
  float j = floor(hm.y * 52.0);
  float s = fract(hm.x + t * 0.05 * (0.6 + hash(j) * 0.8));
  float x = -0.9 + s * 1.8;
  float drift = r.z < 0.18 ? 0.35 * s : (hash(j + 1.0) - 0.4) * 1.1 * s;
  float walk = 0.0;
  walk += sin(s * 9.0 + hash(j + 2.0) * 6.2831) * 0.5;
  walk += sin(s * 23.0 + hash(j + 3.0) * 6.2831) * 0.25;
  walk += sin(s * 51.0 + hash(j + 4.0) * 6.2831) * 0.12;
  float y = clamp(drift + walk * 0.32 * sqrt(s), -0.95, 0.95);
  float b = r.z < 0.18 ? 1.0 : 0.42;
  return vec4(x, y, b, step(y, -0.25) * 0.8);
}

// 6id: API (topo), console web e cliente desktop, com pacotes nas arestas
vec2 node6(float i) { return i < 0.5 ? vec2(0.0, 0.62) : (i < 1.5 ? vec2(-0.66, -0.46) : vec2(0.66, -0.46)); }
vec4 fig6id(vec2 hm, vec4 r, float t) {
  if (r.z < 0.36) {
    float i = floor(r.z / 0.12);
    float a = hm.x * 6.2831, rr = sqrt(hm.y) * 0.14;
    vec2 c = node6(i);
    return vec4(c + vec2(cos(a), sin(a)) * rr, 0.8, 0.0);
  }
  float e = floor(hm.y * 3.0);
  vec2 a = node6(e), b = node6(mod(e + 1.0, 3.0));
  if (r.z < 0.66) return vec4(mix(a, b, hm.x) + (r.w - 0.5) * 0.01, 0.28, 0.0);
  float dir = r.x > 0.5 ? 1.0 : -1.0;
  float s = fract(hm.x + t * 0.22 * dir);
  return vec4(mix(a, b, s), 1.0, 0.0);
}

/* ---------------- cenas do resto da página ---------------- */

// sala de controle: o tráfego real do Sentinel. Tudo entra pela esquerda,
// passa pelo portão e sai em quatro correntes (liberadas, desafiadas,
// bloqueadas, rate limit) com espessura = proporção real. P.x, P.y, P.z =
// frações acumuladas (liberadas; +desafiadas; +bloqueadas).
vec4 figTraffic(vec2 hm, vec4 r, float t, vec4 P) {
  if (r.z < 0.1) {
    // o portão (Sentinel)
    return vec4(-0.18 + (hm.x - 0.5) * 0.025, (hm.y * 2.0 - 1.0) * 0.88, 1.0, 0.0);
  }
  vec4 cum = vec4(P.x, P.y, P.z, 1.0);
  // espessura = proporção real; mas cada corrente recebe pelo menos ~10% das
  // partículas, senão a de 5% fica invisível (densidade, não tamanho)
  vec4 sh = max(vec4(cum.x, cum.y - cum.x, cum.z - cum.y, 1.0 - cum.z), vec4(0.1));
  sh /= sh.x + sh.y + sh.z + sh.w;
  vec3 ad = vec3(sh.x, sh.x + sh.y, sh.x + sh.y + sh.z);
  float lane = r.x < ad.x ? 0.0 : (r.x < ad.y ? 1.0 : (r.x < ad.z ? 2.0 : 3.0));
  float alo = lane < 0.5 ? 0.0 : (lane < 1.5 ? ad.x : (lane < 2.5 ? ad.y : ad.z));
  float ahi = lane < 0.5 ? ad.x : (lane < 1.5 ? ad.y : (lane < 2.5 ? ad.z : 1.0));
  float lo = lane < 0.5 ? 0.0 : (lane < 1.5 ? cum.x : (lane < 2.5 ? cum.y : cum.z));
  float hi = lane < 0.5 ? cum.x : (lane < 1.5 ? cum.y : (lane < 2.5 ? cum.z : 1.0));
  // posição dentro da corrente (0..1) e a faixa vertical real da corrente
  float within = (r.x - alo) / max(ahi - alo, 1e-4);
  float gap = 0.05;
  float span = 1.7 - gap * 3.0;
  float top = 0.85 - lo * span - lane * gap;
  float bot = 0.85 - hi * span - lane * gap;
  float laneY = mix(top, bot, within);
  float s = fract(hm.x + t * 0.09 * (0.75 + r.w * 0.5));
  float x = -1.0 + s * 1.95;
  // antes do portão: um feixe só; depois, abre nas quatro correntes
  float open = smoothstep(-0.18, 0.3, x);
  float y = mix(laneY * 0.35, laneY, open) + (r.w - 0.5) * 0.01;
  float b = mix(0.55, 1.2, open);
  // a corrente carrega a cor do veredito (2 + índice); antes do portão, a do modo
  return vec4(x, y, b, open > 0.02 ? 2.0 + lane : 0.0);
}

// trajetória: a linha se desenha com a rolagem (P.z) e acende cada nó
vec4 figTimeline(vec2 hm, vec4 r, float t, vec4 P) {
  float N = max(P.y, 1.0);
  float L = clamp(P.z * 1.3, 0.0, 1.0);
  float tip = 0.95 - 1.9 * L;
  if (r.z < 0.55) {
    float y = 0.95 - hm.x * 1.9;
    if (y < tip) {
      float a = hm.y * 6.2831 + t * 3.0;
      return vec4(vec2(0.0, tip) + vec2(cos(a), sin(a)) * 0.03 * sqrt(r.w), 1.3, 0.0);
    }
    float flow = pow(0.5 + 0.5 * sin(y * 18.0 + t * 3.0), 10.0);
    return vec4(vec2((r.w - 0.5) * 0.008, y), 0.4 + flow * 0.8, 0.0);
  }
  float i = floor(hm.y * N);
  float ny = 0.95 - (i + 0.5) / N * 1.9;
  float reached = step(tip, ny);
  if (r.z < 0.85) {
    float a = hm.x * 6.2831;
    float ripple = reached * fract(t * 0.5 + i * 0.3);
    float rr = r.w < 0.5 ? 0.06 : 0.06 + ripple * 0.12;
    float b = r.w < 0.5 ? mix(0.15, 1.1, reached) : reached * (1.0 - ripple) * 0.5;
    return vec4(vec2(0.0, ny) + vec2(cos(a), sin(a)) * rr, b, 0.0);
  }
  return vec4(vec2(0.08 + hm.x * 0.55, ny), 0.35 * reached, 0.0);
}

vec4 figure(int k, vec2 hm, vec4 r, float t) {
  if (k == 2) return figSentinel(hm, r, t);
  if (k == 3) return figAegis(hm, r, t);
  if (k == 4) return figRealscan(hm, r, t);
  if (k == 5) return figTesstrade(hm, r, t);
  return fig6id(hm, r, t);
}

vec2 stage(vec2 q, vec3 st) { return st.xy + vec2(q.x, -q.y) * st.z; }

/* uma formação em px de tela: (posição, brilho, destaque) */
void formation(int k, vec2 word, vec3 st, vec4 P, vec3 pOrb, vec2 orbPx, float orbB, out vec2 pos, out float b, out float acc) {
  acc = 0.0;
  if (k == 0) { pos = orbPx; b = orbB; return; }
  if (k == 14) { pos = st.xy + vec2(pOrb.x, -pOrb.y) * st.z * 0.72; b = orbB; return; }
  if (k == 9) {
    pos = fract(aHome + vec2(uTime * 0.004 * (aRand.x - 0.5), -uTime * 0.006 * (0.3 + aRand.w))) * uRes;
    b = 0.16;
    return;
  }
  if (k == 12 || k == 13) {
    vec4 f = k == 12 ? figTraffic(aHome, aRand, uTime, P) : figTimeline(aHome, aRand, uTime, P);
    pos = stage(f.xy, st);
    b = f.z;
    acc = f.w;
    return;
  }
  if (k == 1) {
    pos = stage(word + 0.005 * vec2(sin(uTime * 1.7 + aHome.x * 40.0), cos(uTime * 1.3 + aHome.y * 40.0)), st);
    // um brilho varre as letras devagar, da esquerda pra direita
    float sweep = mod(uTime * 0.35, 1.0) * 3.4 - 1.7;
    b = 1.0 + 0.45 * exp(-pow((word.x - sweep) * 3.2, 2.0));
    return;
  }
  if (k == 8) {
    pos = aHome * uRes + vec2(0.0, -uTime * 20.0 * (0.5 + aRand.w));
    b = 0.0;
    return;
  }
  vec4 f = figure(k, aHome, aRand, uTime);
  pos = stage(f.xy, st);
  b = f.z;
  acc = f.w;
}

void main() {
  bool g1 = aGrp > 0.5;
  vec2 c = g1 ? uC1 : uC0;
  vec3 col = g1 ? uCol1 : uCol0;
  vec3 sty = g1 ? uSty1 : uSty0;

  // esfera
  vec3 p = sty.x * structure(aDir, aRand) + sty.y * plasma(aDir, aRand, uTime) + sty.z * hollow(aDir, aRand, uTime);
  float ca = cos(uAngle), sa = sin(uAngle);
  p = vec3(p.x * ca - p.z * sa, p.y, p.x * sa + p.z * ca);
  float tc = cos(0.38), ts = sin(0.38);
  p = vec3(p.x, p.y * tc - p.z * ts, p.y * ts + p.z * tc);
  vec2 orbPx = c + vec2(p.x, -p.y) * uR;
  float depth = clamp(0.5 + p.z * 0.4, 0.0, 1.0);
  float flow = plasmaFlow(aRand, uTime);
  float core = sty.z * step(aRand.z, CORE);
  float pf = mix(1.0, (1.0 - smoothstep(0.72, 1.0, flow)) * (0.6 + 0.9 * (1.0 - flow)), max(sty.y, core));
  float orbB = (0.22 + 0.78 * depth) * pf * uGain;

  // as duas formações vizinhas e a mistura
  vec2 pA, pB; float bA, bB, aA, aB;
  formation(uTypeA, aWA, uStageA, uPA, p, orbPx, orbB, pA, bA, aA);
  formation(uTypeB, aWB, uStageB, uPB, p, orbPx, orbB, pB, bB, aB);

  // atraso por partícula: palavra saindo se desfaz na ordem de leitura e a
  // palavra chegando se escreve da esquerda pra direita; o resto, aleatório
  // (atraso máx. 0.3 + janela 0.7 = 1: toda partícula chega quando a
  // mistura chega a 1; passar disso deixa partículas presas no caminho)
  float delay = aRand.y * 0.3;
  if (uTypeA == 1) delay = (aWA.x + 1.0) * 0.5 * 0.22 + aRand.y * 0.08;
  if (uTypeB == 1) delay = (aWB.x + 1.0) * 0.5 * 0.22 + aRand.y * 0.08;
  // janela longa e curva cúbica: ninguém chega de estalo
  float m0 = clamp((uMix - delay) / 0.7, 0.0, 1.0);
  float m = m0 < 0.5 ? 4.0 * m0 * m0 * m0 : 1.0 - pow(-2.0 * m0 + 2.0, 3.0) / 2.0;
  float tr = sin(m * PI); // 0 nas pontas, 1 no meio da viagem
  vec2 dAB = pB - pA;
  vec2 formed = mix(pA, pB, m);
  bool withOrb = uTypeA == 0 || uTypeB == 0;
  if (withOrb) {
    // esfera ↔ palco: um arco simples (a distância já faz o espetáculo)
    formed += vec2(-dAB.y, dAB.x) * 0.18 * tr * (aRand.w - 0.5);
  } else {
    // no palco: redemoinho em volta do centro, respiração e deriva; a nuvem
    // se expande no meio da viagem e assenta na forma nova
    vec3 stM = mix(uStageA, uStageB, m);
    vec2 rel = formed - stM.xy;
    // o giro também anda com o tempo: se a rolagem parar no meio, a nuvem
    // continua viva em vez de congelar
    float ang = tr * ((aRand.w - 0.5) * 2.4 + 0.6 + uTime * 0.35);
    float cs = cos(ang), sn = sin(ang);
    rel = vec2(rel.x * cs - rel.y * sn, rel.x * sn + rel.y * cs);
    rel *= 1.0 + tr * (0.06 + aRand.x * 0.18);
    vec2 drift = vec2(sin(aHome.y * 37.0 + uTime * 1.4), cos(aHome.x * 41.0 + uTime * 1.2)) * stM.z * 0.11 * tr;
    formed = stM.xy + rel + drift;
  }
  float bright = mix(bA, bB, m) + tr * 0.22 * (withOrb ? 0.0 : 1.0);
  // destaque >= 2: cor de veredito (tráfego); senão, âmbar de alerta
  float verdict = max(aA, aB);
  vec3 vCol2 = verdict < 2.5 ? vec3(0.06, 0.73, 0.51) : (verdict < 3.5 ? vec3(0.96, 0.62, 0.04) : (verdict < 4.5 ? vec3(0.94, 0.27, 0.27) : vec3(0.98, 0.45, 0.09)));
  float vMix = mix(aA >= 1.5 ? 1.0 : 0.0, aB >= 1.5 ? 1.0 : 0.0, m);
  float acc = mix(aA < 1.5 ? aA : 0.0, aB < 1.5 ? aB : 0.0, m);

  // dispersão da troca de modo
  vec2 home = fract(aHome + vec2(uSeed, uSeed * 1.618)) * uRes;
  // atraso por partícula maior: a esfera se monta em ondas, não de uma vez
  float d = smoothstep(aRand.y * 0.6, aRand.y * 0.6 + 0.4, uDisp);
  vec2 pos = mix(formed, home, d);

  vec2 dv = pos - uMouse.xy;
  float md = length(dv);
  if (uMouse.z > 0.5 && md < 130.0 && md > 0.5) pos += dv / md * (1.0 - md / 130.0) * 22.0 * (1.0 - d);

  // tamanho: esfera usa a profundidade; figuras e palavras, fixo e fino
  float isOrbA = (uTypeA == 0 || uTypeA == 14) ? 1.0 : 0.0;
  float isOrbB = (uTypeB == 0 || uTypeB == 14) ? 1.0 : 0.0;
  float orbness = mix(isOrbA, isOrbB, m);
  float wordness = mix(uTypeA == 1 ? 1.0 : 0.0, uTypeB == 1 ? 1.0 : 0.0, m);
  float sceneA = mix(uPA.w, uPB.w, m);
  float orbSize = (1.6 + aRand.x * 2.2) * (0.7 + depth * 0.9) * clamp(uR / 190.0, 0.75, 1.35);
  float figSize = 1.3 + aRand.x * 1.2 + tr * 0.9;
  gl_PointSize = mix(figSize, orbSize, orbness) * uDpr;
  gl_Position = vec4(pos.x / uRes.x * 2.0 - 1.0, 1.0 - pos.y / uRes.y * 2.0, 0.0, 1.0);

  vec3 hot = mix(col, vec3(1.0, 0.86, 0.8), sty.y * (1.0 - flow) * 0.55 * orbness);
  hot = mix(hot, vec3(1.0, 0.82, 0.98), core * (1.0 - flow) * 0.5 * orbness);
  // alerta em âmbar: contrasta com azul, vermelho e roxo (no modo vermelho
  // um destaque vermelho sumiria)
  hot = mix(hot, vec3(1.0, 0.7, 0.3), acc * (1.0 - orbness));
  // brilho máximo clareia (nas figuras); no nome, só a faixa que varre
  float whiten = clamp(bright - 0.85, 0.0, 1.0) * 1.5 * (1.0 - wordness) + clamp(bright - 1.1, 0.0, 1.0) * 1.4 * wordness;
  hot = mix(hot, vec3(1.0), whiten * (1.0 - orbness));
  // corrente de veredito: cor pura (depois do clareamento, senão lava)
  hot = mix(hot, vCol2, vMix * (1.0 - orbness));
  hot = mix(hot, uPulseCol, uPulse * 0.7);
  hot = mix(hot, vec3(1.0), tr * 0.16 * (1.0 - orbness)); // energia no meio da viagem
  vCol = mix(hot, vec3(1.0), d * 0.85);
  // o nome ocupa a tela toda e as mesmas partículas se espalham mais: mais
  // opacidade (sem clarear, a cor do modo fica)
  float figA = bright * 0.72 * (1.0 + wordness * 0.9);
  vA = mix(figA, bright, orbness) * (1.0 + d * 0.6) * (1.0 + uPulse * 0.6) * sceneA;
}
`

const FRAG = /* glsl */ `
precision mediump float;
varying vec3 vCol;
varying float vA;
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float a = 1.0 - smoothstep(0.0, 1.0, r);
  gl_FragColor = vec4(vCol * vA * a * a, 1.0);
}
`

// véu: triângulo de tela cheia com o fundo em alpha parcial (rastro)
const VEIL_VERT = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`
const VEIL_FRAG = /* glsl */ `
precision mediump float;
uniform float uA;
void main() { gl_FragColor = vec4(3.0 / 255.0, 3.0 / 255.0, 3.0 / 255.0, uA); }
`

// halo da esfera: quad em volta dela
const HALO_VERT = /* glsl */ `
attribute vec2 aPos;
uniform vec4 uBox;
uniform vec2 uRes;
void main() {
  vec2 px = mix(uBox.xy, uBox.zw, aPos * 0.5 + 0.5);
  gl_Position = vec4(px.x / uRes.x * 2.0 - 1.0, 1.0 - px.y / uRes.y * 2.0, 0.0, 1.0);
}
`
const HALO_FRAG = /* glsl */ `
precision highp float; // uRes é compartilhado com o vertex: precisões iguais
uniform vec2 uRes; uniform float uDpr;
uniform vec2 uC0; uniform vec2 uC1;
uniform vec3 uCol0; uniform vec3 uCol1;
uniform float uR; uniform float uForm;
void main() {
  vec2 fc = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  float d0 = length(fc - uC0) / (uR * 1.9);
  float d1 = length(fc - uC1) / (uR * 1.9);
  vec3 col = uCol0 * exp(-d0 * d0 * 2.6) + uCol1 * exp(-d1 * d1 * 2.6);
  gl_FragColor = vec4(col * 0.22 * uForm, 1.0);
}
`

function compile(gl: WebGLRenderingContext, vs: string, fs: string) {
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader")
    return s
  }
  const p = gl.createProgram()!
  gl.attachShader(p, sh(gl.VERTEX_SHADER, vs))
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs))
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link")
  return p
}

function buildParticles(count: number) {
  // 3 dir + 2 home + 4 rand + 1 grp
  const data = new Float32Array(count * 10)
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1
    const t = Math.random() * Math.PI * 2
    const sq = Math.sqrt(1 - u * u)
    const o = i * 10
    data[o] = Math.cos(t) * sq
    data[o + 1] = u
    data[o + 2] = Math.sin(t) * sq
    for (let k = 3; k < 9; k++) data[o + k] = Math.random()
    data[o + 9] = i % 2
  }
  return data
}

/* Texto → nuvem de pontos no quadrado [-1,1] (y para cima). Rasteriza a
 * palavra na fonte do site e sorteia um pixel aceso por partícula. */
const wordCache = new Map<string, Float32Array>()
function wordPoints(word: string, count: number): Float32Array {
  const key = `${word}:${count}`
  const hit = wordCache.get(key)
  if (hit) return hit
  const W = 900, H = 260
  const cv = document.createElement("canvas")
  cv.width = W
  cv.height = H
  const g = cv.getContext("2d")!
  const family = getComputedStyle(document.body).fontFamily || "sans-serif"
  let size = 200
  g.font = `700 ${size}px ${family}`
  const tw = g.measureText(word).width
  size = Math.min(200, (size * (W * 0.94)) / tw)
  g.font = `700 ${size}px ${family}`
  g.fillStyle = "#fff"
  g.textAlign = "center"
  g.textBaseline = "middle"
  g.fillText(word, W / 2, H / 2)
  const img = g.getImageData(0, 0, W, H).data
  const on: number[] = []
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (img[(y * W + x) * 4 + 3] > 140) on.push(x, y)
  const out = new Float32Array(count * 2)
  const n = on.length / 2 || 1
  for (let i = 0; i < count; i++) {
    const k = Math.floor(Math.random() * n) * 2
    out[i * 2] = ((on[k] ?? W / 2) + Math.random() * 2 - W / 2) / (W / 2)
    out[i * 2 + 1] = -((on[k + 1] ?? H / 2) + Math.random() * 2 - H / 2) / (W / 2)
  }
  wordCache.set(key, out)
  return out
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

// word: texto que as partículas escrevem; p: parâmetros da cena
type Slot = { type: number; word: string | null; p?: [number, number, number, number]; side?: boolean }
type Schedule = { A: Slot; B: Slot; mix: number }

export function HeroOrb() {
  const ref = useRef<HTMLCanvasElement>(null)
  const { mode } = usePillMode()
  const modeRef = useRef(mode)
  const burstRef = useRef(false)
  const prevMode = useRef<ModeKey | null>(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    modeRef.current = mode
    // compara com o modo anterior (não um boolean de mount): sob StrictMode o
    // efeito roda 2x com refs persistentes e um boolean dispararia burst à toa
    if (prevMode.current !== null && prevMode.current !== mode) burstRef.current = true
    prevMode.current = mode
  }, [mode])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    // preserveDrawingBuffer: durante as transições um véu parcial sobre o
    // frame anterior deixa rastro de movimento (a forma parada fica nítida)
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: true, powerPreference: "high-performance" })
    if (!gl) {
      setFallback(true)
      return
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let prog: WebGLProgram, halo: WebGLProgram, veil: WebGLProgram
    try {
      prog = compile(gl, VERT, FRAG)
      halo = compile(gl, HALO_VERT, HALO_FRAG)
      veil = compile(gl, VEIL_VERT, VEIL_FRAG)
    } catch (err) {
      console.warn("[hero-orb] shader não compilou, usando fallback:", err)
      setFallback(true)
      return
    }

    let w = 0, h = 0, dpr = 1
    const count = window.innerWidth < 768 ? 14000 : 34000

    /* Qualidade adaptativa: nível 0 tudo; 1 metade e dpr 1,5; 2 um quarto e
     * dpr 1. Máquina modesta nasce no 1; mediana de frame > 22ms desce um. */
    let tier = isModestHardware() ? 1 : 0
    const TIERS = [
      { frac: 1, dpr: 2 },
      { frac: 0.5, dpr: 1.5 },
      { frac: 0.25, dpr: 1 },
    ]
    const samples: number[] = []
    let warmup = 1500

    /* ---------- buffers ---------- */
    const pbuf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, pbuf)
    gl.bufferData(gl.ARRAY_BUFFER, buildParticles(count), gl.STATIC_DRAW)
    const wbufA = gl.createBuffer()
    const wbufB = gl.createBuffer()
    for (const b of [wbufA, wbufB]) {
      gl.bindBuffer(gl.ARRAY_BUFFER, b)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(count * 2), gl.DYNAMIC_DRAW)
    }
    const tri = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, tri)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const veilPos = gl.getAttribLocation(veil, "aPos")
    const veilA = gl.getUniformLocation(veil, "uA")
    const quad = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    const A = {
      dir: gl.getAttribLocation(prog, "aDir"),
      home: gl.getAttribLocation(prog, "aHome"),
      rand: gl.getAttribLocation(prog, "aRand"),
      grp: gl.getAttribLocation(prog, "aGrp"),
      wa: gl.getAttribLocation(prog, "aWA"),
      wb: gl.getAttribLocation(prog, "aWB"),
      pos: gl.getAttribLocation(halo, "aPos"),
    }
    const U = (p: WebGLProgram, names: string[]) =>
      Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(p, n)])) as Record<string, WebGLUniformLocation | null>
    const up = U(prog, [
      "uRes", "uDpr", "uTime", "uAngle", "uC0", "uC1", "uCol0", "uCol1", "uSty0", "uSty1", "uR",
      "uDisp", "uSeed", "uMouse", "uGain", "uPulse", "uPulseCol", "uTypeA", "uTypeB", "uMix", "uStageA", "uStageB", "uPA", "uPB",
    ])
    const uh = U(halo, ["uBox", "uRes", "uDpr", "uC0", "uC1", "uCol0", "uCol1", "uR", "uForm"])

    /* ---------- geometria do hero (coordenadas de documento) ---------- */
    type BlockRect = { top: number; bottom: number; left: number; right: number } | null
    let topRect: BlockRect = null, botRect: BlockRect = null
    const header = document.querySelector<HTMLElement>("header[data-hero]")
    const clearTop = header?.querySelector("[data-orb-clear='top']") ?? null
    const clearBottom = header?.querySelector("[data-orb-clear='bottom']") ?? null
    let geo = { side: false, cx: 0, cy: 0, R: 60, spread: 0 }
    let heroH = 800

    function computeGeo() {
      const pad = Math.max(16, h * 0.06)
      if (w >= 1024 && topRect && botRect) {
        const left = Math.max(topRect.right, botRect.right) + 24
        const right = w - 32
        const free = right - left
        const R = Math.min(heroH * 0.29, free / 2 / 1.35, 340)
        if (R >= 90) return { side: true, cx: left + free / 2, cy: heroH * 0.5, R, spread: Math.max(0, free / 2 - R * 1.2) }
      }
      let top = pad, bot = heroH - pad
      if (topRect) top = Math.max(top, topRect.bottom)
      if (botRect) bot = Math.min(bot, botRect.top)
      if (bot - top < 60) { top = pad; bot = heroH - pad }
      const R = Math.max(24, Math.min(Math.min(w, heroH) * 0.3, (bot - top) / 2 / 1.2))
      return { side: false, cx: w / 2, cy: (top + bot) / 2, R, spread: Math.max(0, w / 2 - R * 1.25 - 12) }
    }

    type Layout = { c: [number, number][]; col: RGB[]; sty: V3[]; R: number }
    function heroLayout(m: ModeKey, since: number): Layout {
      const { cx, cy, R, spread } = geo
      const off = Math.min(spread, R * 0.5)
      if (m === "fullstack") return { c: [[cx - off, cy], [cx - off, cy]], col: [BLUE, BLUE], sty: [S_BLUE, S_BLUE], R }
      if (m === "devops") return { c: [[cx + off, cy], [cx + off, cy]], col: [RED, RED], sty: [S_RED, S_RED], R }
      if (since < MERGE_MS) {
        const split = R * 0.78
        return { c: [[cx - split, cy], [cx + split, cy]], col: [BLUE, RED], sty: [S_BLUE, S_RED], R: R * 0.62 }
      }
      return { c: [[cx, cy], [cx, cy]], col: [PURPLE, PURPLE], sty: [S_PURPLE, S_PURPLE], R: R * 0.9 }
    }

    function publish() {
      if (!header) return
      const L = heroLayout(modeRef.current, 99999)
      const above = geo.cy - geo.R * 1.3 - 30
      const captionY = geo.side
        ? above >= 56 ? above : geo.cy + geo.R * 1.3 + 12
        : Math.max(topRect ? topRect.bottom + 6 : h * 0.06, geo.cy - geo.R * 1.2 - 26)
      header.style.setProperty("--orb-caption-x", `${Math.round(L.c[0][0])}px`)
      header.style.setProperty("--orb-caption-y", `${Math.round(captionY)}px`)
      header.dataset.orbLayout = geo.side ? "side" : "band"
    }

    function measure() {
      const sy = window.scrollY
      const rel = (el: Element): BlockRect => {
        const r = el.getBoundingClientRect()
        return { top: r.top + sy, bottom: r.bottom + sy, left: r.left, right: r.right }
      }
      heroH = header ? header.getBoundingClientRect().height : h
      topRect = clearTop ? rel(clearTop) : null
      botRect = clearBottom ? rel(clearBottom) : null
      geo = computeGeo()
      publish()
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, TIERS[tier].dpr)
      const rect = canvas!.getBoundingClientRect()
      w = rect.width; h = rect.height
      const cw = Math.max(1, Math.floor(w * dpr)), ch = Math.max(1, Math.floor(h * dpr))
      if (canvas!.width !== cw || canvas!.height !== ch) {
        canvas!.width = cw
        canvas!.height = ch
      }
      gl!.viewport(0, 0, canvas!.width, canvas!.height)
      measure()
    }
    resize()
    window.addEventListener("resize", resize)
    const ro = new ResizeObserver(() => measure())
    if (clearTop) ro.observe(clearTop)
    if (clearBottom) ro.observe(clearBottom)

    const mouse = { x: -1e4, y: -1e4, on: false }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.on = true
    }
    const onLeave = () => { mouse.on = false }
    window.addEventListener("pointermove", onMove, { passive: true })
    document.addEventListener("mouseleave", onLeave)

    let pulse = 0
    const pulseCol: V3 = [1, 1, 1]
    const onPulse = (e: Event) => {
      const d = (e as CustomEvent<PulseDetail>).detail
      pulse = Math.min(1, Math.max(pulse, d.strength))
      pulseCol[0] = d.rgb[0]; pulseCol[1] = d.rgb[1]; pulseCol[2] = d.rgb[2]
    }
    window.addEventListener(ORB_PULSE, onPulse)

    /* ---------- a partitura: rolagem → (A, B, mistura) ----------
     * Capítulo i ocupa uma unidade (a altura do seu bloco). Dentro dele:
     *   0 – .12  nome no centro, sozinho · .12 – .32 nome → figura (desliza à direita)
     *   .32 – .7 figura + texto do capítulo · .7 – 1 figura → próximo nome (ou dissolve)
     * Antes do primeiro: esfera → palavra 0. Depois do último: dissolvido. */
    const ORB: Slot = { type: F_ORB, word: null }
    const GONE: Slot = { type: F_SCATTER, word: null }
    const wordSlot = (slug: string): Slot => ({ type: F_WORD, word: WORD[slug] ?? slug.toUpperCase() })
    const figSlot = (slug: string): Slot => ({ type: FIG[slug] ?? 2, word: null })

    /* a partitura segue uma rolagem SUAVIZADA: rolar rápido não corta a
     * transição, ela acontece em ~0,4s; saltos grandes (âncora) encaixam */
    let sSmooth: number | null = null, sVel = 0
    function schedule(f: number): Schedule {
      const track = document.querySelector<HTMLElement>("[data-chapters]")
      const slugs = track?.dataset.chapters?.split(",").filter(Boolean) ?? []
      if (!track || !slugs.length) return { A: ORB, B: ORB, mix: 0 }
      const r = track.getBoundingClientRect()
      // o trilho tem uma tela extra no fim (o último capítulo também fica
      // inteiro preso): a unidade é o resto dividido pelos capítulos
      const unit = Math.max(1, (r.height - h) / slugs.length)
      const sReal = -r.top / unit
      if (sSmooth === null || reduce || Math.abs(sReal - sSmooth) > 2.5) {
        sSmooth = sReal
        sVel = 0
      } else {
        // mola criticamente amortecida (ω ≈ 7/s): acelera e desacelera suave,
        // sem passar do ponto; passos de 4ms para ficar estável em qualquer fps
        const dtS = (f * 16.67) / 1000
        const wN = 7
        for (let t = 0; t < dtS; t += 0.004) {
          const h4 = Math.min(0.004, dtS - t)
          sVel += (wN * wN * (sReal - sSmooth) - 2 * wN * sVel) * h4
          sSmooth += sVel * h4
        }
      }
      const s = sSmooth
      const n = slugs.length
      if (s < 0) return { A: ORB, B: wordSlot(slugs[0]), mix: smoothstep(-0.55, -0.05, s) }
      if (s >= n) return { A: GONE, B: GONE, mix: 1 }
      const i = Math.floor(s)
      const u = s - i
      if (u < 0.12) return { A: wordSlot(slugs[i]), B: wordSlot(slugs[i]), mix: 1 }
      if (u < 0.32) return { A: wordSlot(slugs[i]), B: figSlot(slugs[i]), mix: smoothstep(0.12, 0.32, u) }
      if (u < 0.7) return { A: figSlot(slugs[i]), B: figSlot(slugs[i]), mix: 1 }
      const next = i + 1 < n ? wordSlot(slugs[i + 1]) : GONE
      return { A: figSlot(slugs[i]), B: next, mix: smoothstep(0.7, 0.97, u) }
    }

    let wordA = "", wordB = ""
    function setWord(buf: WebGLBuffer | null, word: string): boolean {
      gl!.bindBuffer(gl!.ARRAY_BUFFER, buf)
      gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, wordPoints(word, count))
      return true
    }

    /* ---------- partitura do resto da página ----------
     * Seções com data-scene, em ordem. Fronteira k separa a cena k−1 da k
     * (antes da primeira: dissolvido). O centro da tela, suavizado pela
     * mesma mola, decide qual cena segura e onde a transição acontece. */
    let ySmooth: number | null = null, yVel = 0
    let heldWord: string | null = null, morphFrom: string | null = null, morphT = 1
    function sections(f: number, sy: number): Schedule | null {
      const els = document.querySelectorAll<HTMLElement>("[data-scene]")
      if (!els.length) return null
      if (ySmooth === null || reduce || Math.abs(sy - ySmooth) > h * 2.5) {
        ySmooth = sy
        yVel = 0
      } else {
        const dtS = (f * 16.67) / 1000
        const wN = 7
        for (let t = 0; t < dtS; t += 0.004) {
          const h4 = Math.min(0.004, dtS - t)
          yVel += (wN * wN * (sy - ySmooth) - 2 * wN * yVel) * h4
          ySmooth += yVel * h4
        }
      }
      const yc = ySmooth + h * 0.5
      const band = h * 0.3
      const desk = w >= 1024
      const tops: number[] = []
      const slots: Slot[] = [{ type: F_SCATTER, word: null }]
      els.forEach((el) => {
        const r = el.getBoundingClientRect()
        const top = r.top + sy, bottom = r.bottom + sy
        const kind = SCENE[el.dataset.scene ?? ""] ?? SCENE.dust
        const q = el.dataset.p3 !== undefined ? Number(el.dataset.p3) : clamp01((yc - top) / Math.max(1, bottom - top))
        const alpha = desk ? 1 : kind === SCENE.orb ? 0.5 : 0.18
        tops.push(top)
        slots.push({
          type: kind,
          word: kind === SCENE.skills ? el.dataset.word || null : null,
          side: true,
          p: [Number(el.dataset.p1 ?? -1), Number(el.dataset.p2 ?? 0), q, alpha],
        })
      })
      for (let k = 0; k < tops.length; k++) {
        if (Math.abs(yc - tops[k]) < band) return { A: slots[k], B: slots[k + 1], mix: smoothstep(tops[k] - band, tops[k] + band, yc) }
      }
      let j = 0
      while (j < tops.length && tops[j] <= yc) j++
      return { A: slots[j], B: slots[j], mix: 1 }
    }

    /* ---------- estado animado ---------- */
    const sy0 = window.scrollY
    const L0 = heroLayout(modeRef.current, 99999)
    const gc = L0.c.map(([x, y]) => [x, y - sy0]) as [number, number][]
    const gcol = L0.col.map((c) => [...c]) as RGB[]
    const gsty = L0.sty.map((s) => [...s]) as V3[]
    let gR = L0.R
    let disp = reduce ? 0 : 1
    let sinceChange = reduce ? 99999 : DISPERSE_MS - 260
    let seed = Math.random()
    let ang = 0, time = 0, last = performance.now(), raf = 0, idle = false

    const gainFor = (n: number) => Math.min(1.4, 1.05 * Math.sqrt(18000 / n) * Math.pow(Math.max(gR, 60) / 200, 0.8))

    function frame(now: number) {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(50, now - last || 16)
      last = now
      const f = dt / 16.67
      const m = modeRef.current

      if (warmup > 0) warmup -= dt
      else if (tier < TIERS.length - 1) {
        samples.push(dt)
        if (samples.length >= 60) {
          const median = [...samples].sort((a, b) => a - b)[30]
          samples.length = 0
          if (median > 22) {
            tier++
            resize()
            warmup = 500
          }
        }
      }

      if (burstRef.current) {
        burstRef.current = false
        if (reduce) sinceChange = 99999
        else {
          sinceChange = 0
          seed = Math.random()
          measure()
        }
      }
      sinceChange += dt
      // espalhar é rápido; formar é lento, para ver a esfera se montando
      // (com o atraso por partícula do shader, ela se forma em ondas, ~2s)
      const dispersing = sinceChange < DISPERSE_MS
      disp += ((dispersing ? 1 : 0) - disp) * (1 - Math.pow(1 - (dispersing ? 0.1 : 0.026), f))
      pulse *= Math.pow(0.93, f)

      const sy = window.scrollY
      const T = heroLayout(m, sinceChange)
      // centro, cor e forma deslizam devagar: a fusão no roxo fica visível
      const k = 1 - Math.pow(1 - 0.035, f)
      for (let g = 0; g < 2; g++) {
        gc[g][0] += (T.c[g][0] - gc[g][0]) * k
        gc[g][1] += (T.c[g][1] - sy - gc[g][1]) * k
        for (let q = 0; q < 3; q++) {
          gcol[g][q] += (T.col[g][q] - gcol[g][q]) * k
          gsty[g][q] += (T.sty[g][q] - gsty[g][q]) * k
        }
      }
      gR += (T.R - gR) * k

      // legenda do hero some assim que a rolagem começa
      if (header) header.style.setProperty("--orb-caption-o", clamp01(1 - sy / (heroH * 0.15)).toFixed(2))

      const C = schedule(f)
      const Z = sections(f, sy)
      // depois dos capítulos, a partitura das seções assume
      let S = Z && C.A.type === F_SCATTER && C.B.type === F_SCATTER ? Z : C
      // seção parada com palavra que muda (skills alternando): morph no tempo
      if (S.mix >= 1 && S.B.type === F_WORD && S.B.side && S.B.word) {
        if (heldWord !== S.B.word) {
          morphFrom = heldWord ?? S.B.word
          heldWord = S.B.word
          morphT = morphFrom === heldWord ? 1 : 0
        }
        if (morphT < 1) {
          morphT = Math.min(1, morphT + dt / 1100)
          S = { A: { ...S.B, word: morphFrom }, B: S.B, mix: morphT < 0.5 ? 4 * morphT ** 3 : 1 - (-2 * morphT + 2) ** 3 / 2 }
        }
      } else if (S.B.type !== F_WORD || !S.B.side) heldWord = null
      // nada na tela (tudo dissolvido): limpa uma vez e descansa
      if (S.A.type === F_SCATTER && S.B.type === F_SCATTER) {
        if (!idle) {
          gl!.clearColor(3 / 255, 3 / 255, 3 / 255, 1)
          gl!.clear(gl!.COLOR_BUFFER_BIT)
          idle = true
        }
        return
      }
      idle = false
      if (S.A.word && S.A.word !== wordA && setWord(wbufA, S.A.word)) wordA = S.A.word
      if (S.B.word && S.B.word !== wordB && setWord(wbufB, S.B.word)) wordB = S.B.word
      const typeA = S.A.type
      const typeB = S.B.type

      if (!reduce) {
        ang += dt * 0.00034 * (1 + gsty[0][2] * 1.4)
        time += dt / 1000
      }

      // palcos: o nome ocupa o centro da tela, grande e sozinho; a figura fica
      // à direita do texto (desktop) ou no alto da tela (celular)
      const desk = w >= 1024
      const wordStage = desk ? [w * 0.5, h * 0.5, Math.min(w * 0.36, h * 0.7)] : [w * 0.5, h * 0.44, w * 0.46]
      const figStage = desk ? [w * 0.73, h * 0.5, Math.min(w * 0.22, h * 0.38)] : [w * 0.5, h * 0.3, Math.min(w * 0.42, h * 0.24)]
      // cenas das seções no celular: palco central, atrás do texto (alfa baixo)
      const sceneStage = desk ? figStage : [w * 0.5, h * 0.5, Math.min(w * 0.44, h * 0.3)]
      const stageOf = (sl: Slot) => (sl.side ? sceneStage : sl.type === F_WORD ? wordStage : figStage)
      const stA = stageOf(S.A), stB = stageOf(S.B)

      const drawCount = Math.floor((count * TIERS[tier].frac) / 2) * 2
      const orbShare = (S.A.type === F_ORB ? 1 - S.mix : 0) + (S.B.type === F_ORB ? S.mix : 0)

      // em trânsito (formações diferentes, mistura no meio) ou dispersando:
      // véu parcial = rastro; parado: limpa tudo e a forma fica nítida
      const moving = (typeA !== typeB || S.A.word !== S.B.word ? Math.sin(S.mix * Math.PI) : 0) * (reduce ? 0 : 1)
      const veilPer60 = Math.min(1, 1 - 0.72 * Math.max(moving, disp * 0.6))
      if (veilPer60 > 0.98) {
        gl!.clearColor(3 / 255, 3 / 255, 3 / 255, 1)
        gl!.clear(gl!.COLOR_BUFFER_BIT)
      } else {
        gl!.enable(gl!.BLEND)
        gl!.blendFunc(gl!.SRC_ALPHA, gl!.ONE_MINUS_SRC_ALPHA)
        gl!.useProgram(veil)
        gl!.bindBuffer(gl!.ARRAY_BUFFER, tri)
        gl!.enableVertexAttribArray(veilPos)
        gl!.vertexAttribPointer(veilPos, 2, gl!.FLOAT, false, 0, 0)
        gl!.uniform1f(veilA, 1 - Math.pow(1 - veilPer60, f))
        gl!.drawArrays(gl!.TRIANGLES, 0, 3)
        gl!.disableVertexAttribArray(veilPos)
      }
      gl!.enable(gl!.BLEND)
      gl!.blendFunc(gl!.ONE, gl!.ONE)

      if (orbShare > 0.01) {
        const hr = gR * 2.6
        gl!.useProgram(halo)
        gl!.bindBuffer(gl!.ARRAY_BUFFER, quad)
        gl!.enableVertexAttribArray(A.pos)
        gl!.vertexAttribPointer(A.pos, 2, gl!.FLOAT, false, 0, 0)
        gl!.uniform4f(uh.uBox, Math.min(gc[0][0], gc[1][0]) - hr, Math.min(gc[0][1], gc[1][1]) - hr, Math.max(gc[0][0], gc[1][0]) + hr, Math.max(gc[0][1], gc[1][1]) + hr)
        gl!.uniform2f(uh.uRes, w, h)
        gl!.uniform1f(uh.uDpr, dpr)
        gl!.uniform2f(uh.uC0, gc[0][0], gc[0][1])
        gl!.uniform2f(uh.uC1, gc[1][0], gc[1][1])
        gl!.uniform3fv(uh.uCol0, gcol[0])
        gl!.uniform3fv(uh.uCol1, gcol[1])
        gl!.uniform1f(uh.uR, gR)
        gl!.uniform1f(uh.uForm, (1 - disp) * orbShare)
        gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
        gl!.disableVertexAttribArray(A.pos)
      }

      gl!.useProgram(prog)
      gl!.bindBuffer(gl!.ARRAY_BUFFER, pbuf)
      const ST = 40
      gl!.enableVertexAttribArray(A.dir); gl!.vertexAttribPointer(A.dir, 3, gl!.FLOAT, false, ST, 0)
      gl!.enableVertexAttribArray(A.home); gl!.vertexAttribPointer(A.home, 2, gl!.FLOAT, false, ST, 12)
      gl!.enableVertexAttribArray(A.rand); gl!.vertexAttribPointer(A.rand, 4, gl!.FLOAT, false, ST, 20)
      gl!.enableVertexAttribArray(A.grp); gl!.vertexAttribPointer(A.grp, 1, gl!.FLOAT, false, ST, 36)
      gl!.bindBuffer(gl!.ARRAY_BUFFER, wbufA)
      gl!.enableVertexAttribArray(A.wa); gl!.vertexAttribPointer(A.wa, 2, gl!.FLOAT, false, 0, 0)
      gl!.bindBuffer(gl!.ARRAY_BUFFER, wbufB)
      gl!.enableVertexAttribArray(A.wb); gl!.vertexAttribPointer(A.wb, 2, gl!.FLOAT, false, 0, 0)
      gl!.uniform2f(up.uRes, w, h)
      gl!.uniform1f(up.uDpr, dpr)
      gl!.uniform1f(up.uTime, time)
      gl!.uniform1f(up.uAngle, ang)
      gl!.uniform2f(up.uC0, gc[0][0], gc[0][1])
      gl!.uniform2f(up.uC1, gc[1][0], gc[1][1])
      gl!.uniform3fv(up.uCol0, gcol[0])
      gl!.uniform3fv(up.uCol1, gcol[1])
      gl!.uniform3fv(up.uSty0, gsty[0])
      gl!.uniform3fv(up.uSty1, gsty[1])
      gl!.uniform1f(up.uR, gR)
      gl!.uniform1f(up.uDisp, disp)
      gl!.uniform1f(up.uSeed, seed)
      gl!.uniform3f(up.uMouse, mouse.x, mouse.y, mouse.on ? 1 : 0)
      gl!.uniform1f(up.uGain, gainFor(drawCount))
      gl!.uniform1f(up.uPulse, reduce ? 0 : pulse)
      gl!.uniform3fv(up.uPulseCol, pulseCol)
      gl!.uniform1i(up.uTypeA, typeA)
      gl!.uniform1i(up.uTypeB, typeB)
      gl!.uniform1f(up.uMix, S.mix)
      gl!.uniform3f(up.uStageA, stA[0], stA[1], stA[2])
      gl!.uniform3f(up.uStageB, stB[0], stB[1], stB[2])
      const pA = S.A.p ?? [-1, 0, 0, 1], pB = S.B.p ?? [-1, 0, 0, 1]
      gl!.uniform4f(up.uPA, pA[0], pA[1], pA[2], pA[3])
      gl!.uniform4f(up.uPB, pB[0], pB[1], pB[2], pB[3])

      gl!.drawArrays(gl!.POINTS, 0, drawCount)
    }

    // as palavras usam a fonte do site: espera ela carregar antes de rasterizar
    const start = () => { raf = requestAnimationFrame(frame) }
    if (document.fonts?.ready) document.fonts.ready.then(start, start)
    else start()

    const onLost = (e: Event) => {
      e.preventDefault()
      cancelAnimationFrame(raf)
      setFallback(true)
    }
    canvas.addEventListener("webglcontextlost", onLost)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", onMove)
      document.removeEventListener("mouseleave", onLeave)
      window.removeEventListener(ORB_PULSE, onPulse)
      canvas.removeEventListener("webglcontextlost", onLost)
      gl.deleteBuffer(pbuf)
      gl.deleteBuffer(wbufA)
      gl.deleteBuffer(wbufB)
      gl.deleteBuffer(quad)
      gl.deleteBuffer(tri)
      gl.deleteProgram(veil)
      gl.deleteProgram(prog)
      gl.deleteProgram(halo)
    }
  }, [])

  if (fallback) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at 72% 50%, color-mix(in srgb, var(--mode) 35%, transparent) 0%, transparent 28%)" }}
      />
    )
  }
  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 block h-full w-full" />
}
