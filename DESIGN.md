---
version: beta
name: DevOps-Cinematic-Stealth-Design
description: "A high-fidelity, cyber-stealth design system tailored for a premium DevOps portfolio. Anchored on an obsidian pitch-black canvas (#030303), using carbon-steel panels (#0a0b0d), hairline borders (#1f2228), and high-voltage cyber-cyan (#00f5ff) and terminal-green (#10b981) as interactive cues. The typography balances ultra-clean technical Sans (Space Grotesk / Inter) with high-density monospaced elements (JetBrains Mono / Fira Code) representing logs, shell outputs, and system metrics. Motion is cinematic, using heavy spring dynamics, stagged reveals, and glowing node telemetry to feel like a high-end command center."

colors:
  primary: "#00f5ff" # Cyber Cyan / Neon electricity
  primary-hover: "#80faff"
  accent-green: "#10b981" # Healthy node / Terraform success
  accent-amber: "#f59e0b" # Latency warning / K8s restart
  accent-red: "#ef4444" # Pipeline failure / Alertmanager active
  ink: "#f1f5f9" # Bright slate
  body: "#94a3b8" # Slate gray
  muted: "#64748b" # Dark slate gray
  canvas: "#030303" # Pure obsidian space
  surface-1: "#0a0b0d" # Charcoal panel
  surface-2: "#121316" # Steel border panel
  surface-3: "#181a1f" # High-contrast container
  hairline: "#1f2228" # Hairline divider
  hairline-glow: "rgba(0, 245, 255, 0.15)" # Faint cyan glow

typography:
  display-xl:
    fontFamily: "Space Grotesk, Inter, sans-serif"
    fontSize: "72px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-2.5px"
  display-lg:
    fontFamily: "Space Grotesk, Inter, sans-serif"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-1.5px"
  display-md:
    fontFamily: "Space Grotesk, Inter, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-1.0px"
  title-lg:
    fontFamily: "Space Grotesk, Inter, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.5px"
  title-md:
    fontFamily: "Inter, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0px"
  body-md:
    fontFamily: "Inter, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0px"
  body-sm:
    fontFamily: "Inter, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0px"
  code:
    fontFamily: "JetBrains Mono, Fira Code, Courier New, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0px"
  code-lg:
    fontFamily: "JetBrains Mono, Fira Code, monospace"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.6

rounded:
  none: "0px"
  xs: "2px"
  sm: "4px"
  md: "6px"
  lg: "8px" # Strict flat corners, no bubbly circles

borders:
  hairline: "1px solid #1f2228"
  active: "1px solid #00f5ff"
  alert: "1px solid #ef4444"

shadows:
  glow-cyan: "0 0 20px rgba(0, 245, 255, 0.15)"
  glow-green: "0 0 20px rgba(16, 185, 129, 0.15)"
  glow-red: "0 0 20px rgba(239, 68, 68, 0.15)"

motion:
  cinematic-entry:
    transition:
      type: "spring"
      mass: 1.2
      stiffness: 45
      damping: 18
  high-precision:
    transition:
      type: "spring"
      stiffness: 170
      damping: 22
  stagger:
    delayChildren: 0.15
    staggerChildren: 0.08

components:
  terminal:
    background: "#050608"
    border: "1px solid #1f2228"
    header-buttons: ["#ef4444", "#f59e0b", "#10b981"]
    active-glow: "0 0 15px rgba(0, 245, 255, 0.08)"
  topology-map:
    node-bg: "#0a0b0d"
    node-border: "#1f2228"
    active-node-border: "#00f5ff"
    connection-line: "rgba(148, 163, 184, 0.15)"
    active-connection-line: "#00f5ff"
    packet-glow: "#00f5ff"

anti-ai-rules:
  - "Never center text inside grid cards."
  - "Avoid placing generic Lucide icons inside background circles."
  - "No Tailwind default blue/purple gradients (#3b82f6 to #8b5cf6). Use neon line paths and glow offsets."
  - "Always show real, raw, complex code block scripts instead of placeholder descriptions."
