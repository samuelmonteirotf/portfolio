"use client"

import { useState } from "react"

export default function ElmPackagesDemo() {
  const [activeTab, setActiveTab] = useState<"structure" | "documentation" | "versioning">("structure")

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Gerenciador de Pacotes do Elm</h1>

      {/* Afirmações Overview */}
      <div className="grid gap-4 mb-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">❌ INCORRETO</h3>
          <p className="text-sm text-red-700">Pacotes NÃO podem ser baixados via npm/yarn - apenas via elm</p>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">❌ INCORRETO</h3>
          <p className="text-sm text-red-700">Usa elm.json, NÃO package.json</p>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">❌ INCORRETO</h3>
          <p className="text-sm text-red-700">Pacotes NÃO podem conter JavaScript - apenas Elm puro</p>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">❌ INCORRETO</h3>
          <p className="text-sm text-red-700">
            Versioning é AUTOMÁTICO - Elm força semantic versioning baseado em mudanças da API
          </p>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">✅ CORRETO</h3>
          <p className="text-sm text-green-700">Documentação automática via comentários Markdown disponível online</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: "structure", label: "Estrutura de Projeto" },
          { id: "documentation", label: "Documentação" },
          { id: "versioning", label: "Versionamento" },
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
      {activeTab === "structure" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Estrutura de Projeto Elm</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-red-600 mb-3">❌ NÃO é assim (npm/Node.js)</h3>
                <div className="bg-red-50 p-4 rounded border">
                  <div className="font-mono text-sm space-y-1">
                    <div>📄 package.json</div>
                    <div>📁 node_modules/</div>
                    <div>📄 package-lock.json</div>
                    <div>📁 src/</div>
                  </div>
                  <div className="mt-3 text-sm text-red-700">
                    <div className="font-mono bg-red-100 p-2 rounded">
                      npm install elm/core ❌
                      <br />
                      yarn add elm/http ❌
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-green-600 mb-3">✅ Estrutura Elm</h3>
                <div className="bg-green-50 p-4 rounded border">
                  <div className="font-mono text-sm space-y-1">
                    <div>📄 elm.json</div>
                    <div>📁 elm-stuff/</div>
                    <div>📁 src/</div>
                    <div>📁 tests/</div>
                  </div>
                  <div className="mt-3 text-sm text-green-700">
                    <div className="font-mono bg-green-100 p-2 rounded">
                      elm install elm/core ✅
                      <br />
                      elm install elm/http ✅
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-3">elm.json vs package.json</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-green-600 mb-2">elm.json</h4>
                  <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs">
                    <div>{"{"}</div>
                    <div>&nbsp;&nbsp;"type": "application",</div>
                    <div>&nbsp;&nbsp;"source-directories": ["src"],</div>
                    <div>&nbsp;&nbsp;"elm-version": "0.19.1",</div>
                    <div>&nbsp;&nbsp;"dependencies": {"{"}</div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;"direct": {"{"}</div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"elm/browser": "1.0.2",</div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"elm/core": "1.0.5"</div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;{"}"},</div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;"indirect": {"{"}</div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"elm/json": "1.1.3"</div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;{"}"}</div>
                    <div>&nbsp;&nbsp;{"}"}</div>
                    <div>{"}"}</div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">package.json (não usado)</h4>
                  <div className="bg-gray-200 p-3 rounded font-mono text-xs text-gray-500">
                    <div>{"{"}</div>
                    <div>&nbsp;&nbsp;"name": "my-app",</div>
                    <div>&nbsp;&nbsp;"version": "1.0.0",</div>
                    <div>&nbsp;&nbsp;"dependencies": {"{"}</div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;"react": "^18.0.0"</div>
                    <div>&nbsp;&nbsp;{"}"}</div>
                    <div>{"}"}</div>
                    <div className="mt-2 text-center">❌ Não usado em Elm</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "documentation" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Documentação Automática</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-green-600 mb-3">✅ Comentários de Documentação</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                  <div className="text-gray-400">{"{-| Esta função adiciona dois números."}</div>
                  <div className="text-gray-400"></div>
                  <div className="text-gray-400">&nbsp;&nbsp;&nbsp;&nbsp;add 2 3 == 5</div>
                  <div className="text-gray-400">&nbsp;&nbsp;&nbsp;&nbsp;add 0 5 == 5</div>
                  <div className="text-gray-400"></div>
                  <div className="text-gray-400">Suporta **Markdown** e `código`!</div>
                  <div className="text-gray-400">-{"}"}</div>
                  <div className="mt-2">
                    <span className="text-blue-400">add</span> : Int -&gt; Int -&gt; Int
                  </div>
                  <div>
                    <span className="text-blue-400">add</span> x y = x + y
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-blue-600 mb-3">📚 Documentação Gerada</h3>
                <div className="bg-blue-50 p-4 rounded border">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-semibold text-blue-800">add : Int → Int → Int</h4>
                      <p className="text-sm text-gray-700 mt-1">Esta função adiciona dois números.</p>
                      <div className="mt-2 bg-gray-100 p-2 rounded font-mono text-xs">
                        add 2 3 == 5
                        <br />
                        add 0 5 == 5
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        Suporta <strong>Markdown</strong> e <code>código</code>!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-purple-600 mb-3">🌐 Disponível Online</h3>
                <div className="bg-purple-50 p-4 rounded border">
                  <p className="text-sm text-purple-700 mb-2">A documentação fica automaticamente disponível em:</p>
                  <div className="font-mono text-sm bg-purple-100 p-2 rounded">
                    https://package.elm-lang.org/packages/author/package/version/
                  </div>
                  <p className="text-xs text-purple-600 mt-2">
                    Exemplo: https://package.elm-lang.org/packages/elm/core/1.0.5/
                  </p>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Recursos da Documentação Elm:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Geração automática a partir de comentários</li>
                  <li>• Suporte completo a Markdown</li>
                  <li>• Exemplos de código executáveis</li>
                  <li>• Busca integrada</li>
                  <li>• Links entre módulos</li>
                  <li>• Hospedagem automática online</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "versioning" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Versionamento Automático</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-red-600 mb-3">❌ NÃO é assim (manual)</h3>
                <div className="bg-red-50 p-4 rounded border">
                  <div className="font-mono text-sm bg-red-100 p-2 rounded">
                    npm version patch # Desenvolvedor escolhe
                    <br />
                    npm version minor # Desenvolvedor escolhe
                    <br />
                    npm version major # Desenvolvedor escolhe
                  </div>
                  <p className="text-sm text-red-700 mt-2">❌ Em outras linguagens, o desenvolvedor decide a versão</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-green-600 mb-3">✅ Elm - Automático</h3>
                <div className="bg-green-50 p-4 rounded border">
                  <div className="font-mono text-sm bg-green-100 p-2 rounded">elm publish</div>
                  <p className="text-sm text-green-700 mt-2">
                    ✅ Elm analisa as mudanças e determina automaticamente se é MAJOR, MINOR ou PATCH
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-blue-600 mb-3">🤖 Como Elm Determina a Versão</h3>
                <div className="space-y-3">
                  <div className="bg-red-100 p-3 rounded border-l-4 border-red-500">
                    <h4 className="font-semibold text-red-800">MAJOR (1.0.0 → 2.0.0)</h4>
                    <ul className="text-sm text-red-700 mt-1 space-y-1">
                      <li>• Remoção de funções públicas</li>
                      <li>• Mudança de tipos de função</li>
                      <li>• Remoção de campos de records</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-100 p-3 rounded border-l-4 border-yellow-500">
                    <h4 className="font-semibold text-yellow-800">MINOR (1.0.0 → 1.1.0)</h4>
                    <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                      <li>• Adição de novas funções</li>
                      <li>• Adição de novos tipos</li>
                      <li>• Adição de campos opcionais</li>
                    </ul>
                  </div>

                  <div className="bg-green-100 p-3 rounded border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-800">PATCH (1.0.0 → 1.0.1)</h4>
                    <ul className="text-sm text-green-700 mt-1 space-y-1">
                      <li>• Correções de bugs</li>
                      <li>• Melhorias de performance</li>
                      <li>• Mudanças na documentação</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Exemplo de Publicação:</h4>
                <div className="bg-blue-900 text-blue-100 p-3 rounded font-mono text-sm">
                  <div>$ elm publish</div>
                  <div className="text-blue-300">Analyzing API changes...</div>
                  <div className="text-green-300">✓ Found new function: calculateTotal</div>
                  <div className="text-green-300">✓ No breaking changes detected</div>
                  <div className="text-yellow-300">→ Bumping version to 1.2.0 (MINOR)</div>
                  <div className="text-blue-300">Publishing...</div>
                  <div className="text-green-300">✓ Published successfully!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Características Únicas */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Características Únicas do Elm Package Manager</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-green-600 mb-3">✅ O que Elm FAZ</h3>
            <ul className="text-sm space-y-1">
              <li>• Versionamento semântico FORÇADO</li>
              <li>• Documentação automática</li>
              <li>• Apenas código Elm puro</li>
              <li>• Resolução de dependências garantida</li>
              <li>• Hospedagem centralizada</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-red-600 mb-3">❌ O que Elm NÃO FAZ</h3>
            <ul className="text-sm space-y-1">
              <li>• Não usa npm/yarn</li>
              <li>• Não permite JavaScript em pacotes</li>
              <li>• Não usa package.json</li>
              <li>• Desenvolvedor não escolhe versão</li>
              <li>• Não permite dependências circulares</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
