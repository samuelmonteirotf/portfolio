"use client"

import { useState } from "react"

export default function AnimatedLogo() {
  const [isOutubroRosa, setIsOutubroRosa] = useState(false)

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <h1 className="text-2xl font-bold">Logotipo com Animação Outubro Rosa</h1>

      {/* SVG Logo com animação CSS */}
      <div className={`transition-all duration-1000 ${isOutubroRosa ? "outubro-rosa" : ""}`}>
        <svg width="300" height="150" viewBox="0 0 300 150" className="border border-gray-200 rounded-lg">
          {/* Círculo do logo */}
          <circle
            cx="75"
            cy="75"
            r="40"
            className="logo-circle transition-all duration-2000 ease-in-out"
            style={{
              fill: isOutubroRosa ? "#ff69b4" : "#0066cc",
            }}
          />

          {/* Texto da empresa */}
          <text
            x="140"
            y="85"
            fontSize="24"
            fontWeight="bold"
            className="logo-text transition-all duration-2000 ease-in-out"
            style={{
              fill: isOutubroRosa ? "#ff1493" : "#003d7a",
            }}
          >
            Empresa
          </text>

          {/* Elemento decorativo */}
          <rect
            x="140"
            y="95"
            width="120"
            height="3"
            className="logo-underline transition-all duration-2000 ease-in-out"
            style={{
              fill: isOutubroRosa ? "#ff69b4" : "#0066cc",
            }}
          />
        </svg>
      </div>

      {/* Controles */}
      <div className="flex gap-4">
        <button
          onClick={() => setIsOutubroRosa(!isOutubroRosa)}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {isOutubroRosa ? "Voltar ao Azul" : "Ativar Outubro Rosa"}
        </button>
      </div>

      {/* Versão com animação automática */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Animação Automática (CSS)</h2>
        <svg width="300" height="150" viewBox="0 0 300 150" className="border border-gray-200 rounded-lg">
          <style>
            {`
              .auto-animate {
                animation: colorChange 4s infinite ease-in-out;
              }
              
              @keyframes colorChange {
                0%, 100% { fill: #0066cc; }
                50% { fill: #ff69b4; }
              }
            `}
          </style>

          <circle cx="75" cy="75" r="40" className="auto-animate" />

          <text x="140" y="85" fontSize="24" fontWeight="bold" className="auto-animate">
            Empresa
          </text>

          <rect x="140" y="95" width="120" height="3" className="auto-animate" />
        </svg>
      </div>

      {/* Comparação com outros formatos */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Por que SVG é superior:</h3>
        <ul className="text-sm space-y-1">
          <li>
            ✅ <strong>Vetorial:</strong> Escala perfeitamente em qualquer tamanho
          </li>
          <li>
            ✅ <strong>CSS Animável:</strong> Cores podem ser alteradas via CSS
          </li>
          <li>
            ✅ <strong>Sem JavaScript:</strong> Animações puras em CSS
          </li>
          <li>
            ✅ <strong>Leve:</strong> Arquivo pequeno comparado a múltiplas imagens PNG
          </li>
          <li>
            ✅ <strong>Editável:</strong> Pode ser modificado diretamente no código
          </li>
        </ul>
      </div>
    </div>
  )
}
