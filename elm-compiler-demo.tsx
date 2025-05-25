"use client"

import { useState } from "react"

export default function ElmCompilerDemo() {
  const [activeTab, setActiveTab] = useState<"inference" | "verification" | "compilation">("compilation")

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Compilador Elm - Características</h1>

      {/* Afirmações Overview */}
      <div className="grid gap-4 mb-8">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">✅ CORRETO</h3>
          <p className="text-sm text-green-700">Implementado em Haskell e transforma Elm em JavaScript</p>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">✅ CORRETO</h3>
          <p className="text-sm text-green-700">Verifica tipos das funções rigorosamente</p>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">❌ INCORRETO</h3>
          <p className="text-sm text-red-700">
            NÃO aborta se tipo estiver faltando - tem <strong>inferência de tipos</strong>
          </p>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">❌ INCORRETO</h3>
          <p className="text-sm text-red-700">NÃO permite classes - é linguagem funcional pura</p>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">❌ INCORRETO</h3>
          <p className="text-sm text-red-700">NÃO permite metaprogramação - filosofia de simplicidade</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: "compilation", label: "Compilação" },
          { id: "verification", label: "Verificação de Tipos" },
          { id: "inference", label: "Inferência de Tipos" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "compilation" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Processo de Compilação</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-blue-600 mb-3">Código Elm (Input)</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                  <div className="text-gray-400">-- src/Main.elm</div>
                  <div className="mt-2">
                    <span className="text-yellow-400">module</span> Main{" "}
                    <span className="text-yellow-400">exposing</span> (main)
                  </div>
                  <div className="mt-1">
                    <span className="text-yellow-400">import</span> Html{" "}
                    <span className="text-yellow-400">exposing</span> (text)
                  </div>
                  <div className="mt-2">
                    <span className="text-blue-400">main</span> = text "Hello, Elm!"
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-green-600 mb-3">JavaScript (Output)</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                  <div className="text-gray-400">// main.js (simplificado)</div>
                  <div className="mt-2">var Elm = {"{}"}</div>
                  <div>Elm.Main = {"{"}</div>
                  <div>&nbsp;&nbsp;init: function() {"{"}</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;return {"{"}</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;node: document.createElement('div')</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;{"}"}</div>
                  <div>&nbsp;&nbsp;{"}"}</div>
                  <div>{"}"}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Comando de Compilação:</h4>
              <div className="bg-blue-900 text-blue-100 p-2 rounded font-mono text-sm">
                elm make src/Main.elm --output=main.js --optimize
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "verification" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Verificação de Tipos</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-green-600 mb-2">✅ Código Válido</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                  <div>
                    <span className="text-blue-400">add</span> : Int -&gt; Int -&gt; Int
                  </div>
                  <div>
                    <span className="text-blue-400">add</span> x y = x + y
                  </div>
                  <div className="mt-2">
                    <span className="text-blue-400">result</span> = add 5 3 <span className="text-gray-400">-- 8</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-red-600 mb-2">❌ Erro de Tipo</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                  <div>
                    <span className="text-blue-400">add</span> : Int -&gt; Int -&gt; Int
                  </div>
                  <div>
                    <span className="text-blue-400">add</span> x y = x + y
                  </div>
                  <div className="mt-2">
                    <span className="text-red-400">result = add "hello" 5</span>{" "}
                    <span className="text-gray-400">-- ERRO!</span>
                  </div>
                </div>
                <div className="mt-2 p-3 bg-red-50 rounded text-sm text-red-700">
                  <strong>Erro de Compilação:</strong> String não pode ser usado onde Int é esperado
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-blue-600 mb-2">🔍 Verificações do Compilador</h3>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Compatibilidade de tipos em funções</li>
                  <li>• Correspondência de padrões completa</li>
                  <li>• Uso de variáveis não definidas</li>
                  <li>• Tipos de retorno consistentes</li>
                  <li>• Imports e exports válidos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "inference" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Inferência de Tipos</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-green-600 mb-2">✅ Sem Anotação de Tipo (Funciona!)</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                  <div className="text-gray-400">-- Elm infere automaticamente o tipo</div>
                  <div>
                    <span className="text-blue-400">add</span> x y = x + y
                  </div>
                  <div className="text-gray-400">-- Tipo inferido: number -&gt; number -&gt; number</div>
                  <div className="mt-2">
                    <span className="text-blue-400">multiply</span> a b c = a * b * c
                  </div>
                  <div className="text-gray-400">-- Tipo inferido: number -&gt; number -&gt; number -&gt; number</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-blue-600 mb-2">🎯 Com Anotação (Recomendado)</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                  <div className="text-gray-400">-- Anotação explícita para clareza</div>
                  <div>
                    <span className="text-blue-400">add</span> : Int -&gt; Int -&gt; Int
                  </div>
                  <div>
                    <span className="text-blue-400">add</span> x y = x + y
                  </div>
                  <div className="mt-2">
                    <span className="text-blue-400">greet</span> : String -&gt; String
                  </div>
                  <div>
                    <span className="text-blue-400">greet</span> name = "Hello, " ++ name
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-purple-600 mb-2">🔮 Inferência Complexa</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                  <div className="text-gray-400">-- Elm infere tipos complexos</div>
                  <div>
                    <span className="text-blue-400">processUsers</span> users =
                  </div>
                  <div>&nbsp;&nbsp;users</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;|&gt; List.filter (.active)</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;|&gt; List.map (.name)</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;|&gt; String.join ", "</div>
                  <div className="mt-1 text-gray-400">
                    -- Tipo inferido: List {"{"}r | active : Bool, name : String{"}"} -&gt; String
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">💡 Importante:</h4>
                <p className="text-sm text-yellow-700">
                  O compilador Elm <strong>NÃO aborta</strong> se a anotação de tipo estiver faltando. Ele usa
                  inferência poderosa para determinar tipos automaticamente. Só aborta em caso de conflitos de tipo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Características que Elm NÃO tem */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">O que Elm NÃO Suporta</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-red-600 mb-3">❌ Orientação a Objetos</h3>
            <div className="bg-red-50 p-3 rounded text-sm">
              <div className="font-mono text-red-700">
                -- ❌ Não existe em Elm
                <br />
                class User {"{"}
                <br />
                &nbsp;&nbsp;constructor(name) {"{"}
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;this.name = name
                <br />
                &nbsp;&nbsp;{"}"}
                <br />
                {"}"}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-red-600 mb-3">❌ Metaprogramação</h3>
            <div className="bg-red-50 p-3 rounded text-sm">
              <div className="font-mono text-red-700">
                -- ❌ Não existe em Elm
                <br />
                macro generateGetters(fields)
                <br />
                template&lt;T&gt; function
                <br />
                @decorator
                <br />
                eval("código dinâmico")
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
