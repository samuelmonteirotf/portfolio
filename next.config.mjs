/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export estático para o Cloudflare Pages: o build gera out/ (HTML/JS/CSS
  // puros, servidos direto do CDN). Headers de segurança em public/_headers,
  // que o Pages aplica nativamente (headers() do Next não vale em export).
  output: "export",
  // dev via tailnet/LAN: sem isso o Next 16 bloqueia os assets de dev
  // (/_next/*) em origens que não sejam localhost e a página fica só no SSR
  allowedDevOrigins: ["100.79.202.66", "192.168.3.11"],
  images: {
    unoptimized: true,
  },
}

export default nextConfig
