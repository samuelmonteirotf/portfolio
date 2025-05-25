"use client"

import { useState } from "react"

export default function ElmCapabilitiesDemo() {
  const [activeDemo, setActiveDemo] = useState<"http" | "ports">("http")
  const [httpResponse, setHttpResponse] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const simulateHttpCall = async () => {
    setLoading(true)
    try {
      // Simulando uma chamada HTTP que seria nativa no Elm
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const mockResponse = {
        id: 1,
        name: "João Silva",
        email: "joao@example.com",
        timestamp: new Date().toISOString(),
      }
      setHttpResponse(JSON.stringify(mockResponse, null, 2))
    } catch (error) {
      setHttpResponse("Erro na requisição")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Funcionalidades Nativas vs Ports em Elm 0.19.1</h1>

      {/* Overview */}
      <div className="grid gap-4 mb-8">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">✅ NATIVO - Chamadas HTTP</h3>
          <p className="text-sm text-green-700">
            Elm tem suporte completo para HTTP (GET, POST, PUT, DELETE) através do módulo Http
          </p>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">❌ PRECISA PORTS - Dimensões de Elementos</h3>
          <p className="text-sm text-red-700">Elm não tem acesso direto ao DOM para medições</p>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">❌ PRECISA PORTS - WebSockets</h3>
          <p className="text-sm text-red-700">Removido do Elm 0.19+, agora requer ports</p>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">❌ PRECISA PORTS - LocalStorage</h3>
          <p className="text-sm text-red-700">Elm não tem acesso direto ao localStorage do navegador</p>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">❌ PRECISA PORTS - Upload Multipart</h3>
          <p className="text-sm text-red-700">Uploads complexos de imagem requerem JavaScript</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveDemo("http")}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeDemo === "http"
              ? "border-green-600 text-green-600 font-semibold"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
        >
          ✅ HTTP Nativo
        </button>
        <button
          onClick={() => setActiveDemo("ports")}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeDemo === "ports"
              ? "border-red-600 text-red-600 font-semibold"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
        >
          ❌ Funcionalidades com Ports
        </button>
      </div>

      {/* HTTP Demo */}
      {activeDemo === "http" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">HTTP Nativo em Elm</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-600 mb-3">Código Elm</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                  <div className="text-gray-400">-- Totalmente nativo!</div>
                  <div className="mt-2">
                    <span className="text-yellow-400">import</span> Http
                  </div>
                  <div>
                    <span className="text-yellow-400">import</span> Json.Decode{" "}
                    <span className="text-yellow-400">as</span> Decode
                  </div>
                  <div className="mt-2">
                    <span className="text-blue-400">fetchUser</span> : Cmd Msg
                  </div>
                  <div>
                    <span className="text-blue-400">fetchUser</span> =
                  </div>
                  <div>&nbsp;&nbsp;Http.get</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;{'{ url = "/api/user"'}</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;{", expect = Http.expectJson"}</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"GotUser userDecoder"}</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;{"}"}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-blue-600 mb-3">Demonstração</h3>
                <div className="space-y-4">
                  <button
                    onClick={simulateHttpCall}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? "Fazendo requisição..." : "Simular HTTP GET"}
                  </button>

                  {httpResponse && (
                    <div className="bg-gray-50 p-3 rounded border">
                      <h4 className="font-semibold text-sm mb-2">Resposta:</h4>
                      <pre className="text-xs font-mono text-gray-700 overflow-x-auto">{httpResponse}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Métodos HTTP Suportados Nativamente:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="bg-green-100 p-2 rounded text-center">GET</div>
                <div className="bg-green-100 p-2 rounded text-center">POST</div>
                <div className="bg-green-100 p-2 rounded text-center">PUT</div>
                <div className="bg-green-100 p-2 rounded text-center">DELETE</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ports Demo */}
      {activeDemo === "ports" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Funcionalidades que Precisam de Ports</h2>

            <div className="space-y-6">
              {/* DOM Dimensions */}
              <div>
                <h3 className="font-semibold text-red-600 mb-3">1. Dimensões de Elementos DOM</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Elm (Port)</h4>
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs">
                      <div>
                        <span className="text-yellow-400">port</span> getDimensions : String -&gt; Cmd msg
                      </div>
                      <div>
                        <span className="text-yellow-400">port</span> receiveDimensions : (Dimensions -&gt; msg) -&gt;
                        Sub msg
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">JavaScript</h4>
                    <div className="bg-gray-900 text-yellow-300 p-3 rounded font-mono text-xs">
                      <div>app.ports.getDimensions.subscribe(id =&gt; {"{"}</div>
                      <div>&nbsp;&nbsp;const el = document.getElementById(id)</div>
                      <div>&nbsp;&nbsp;const rect = el.getBoundingClientRect()</div>
                      <div>&nbsp;&nbsp;app.ports.receiveDimensions.send(rect)</div>
                      <div>{"})"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* WebSockets */}
              <div>
                <h3 className="font-semibold text-red-600 mb-3">2. WebSockets</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Elm (Port)</h4>
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs">
                      <div>
                        <span className="text-yellow-400">port</span> sendWebSocketMessage : String -&gt; Cmd msg
                      </div>
                      <div>
                        <span className="text-yellow-400">port</span> receiveWebSocketMessage : (String -&gt; msg) -&gt;
                        Sub msg
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">JavaScript</h4>
                    <div className="bg-gray-900 text-yellow-300 p-3 rounded font-mono text-xs">
                      <div>const ws = new WebSocket('ws://localhost:8080')</div>
                      <div>ws.onmessage = e =&gt; {"{"}</div>
                      <div>&nbsp;&nbsp;app.ports.receiveWebSocketMessage.send(e.data)</div>
                      <div>{"}"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* LocalStorage */}
              <div>
                <h3 className="font-semibold text-red-600 mb-3">3. LocalStorage</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Elm (Port)</h4>
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs">
                      <div>
                        <span className="text-yellow-400">port</span> saveToStorage : StorageData -&gt; Cmd msg
                      </div>
                      <div>
                        <span className="text-yellow-400">port</span> loadFromStorage : String -&gt; Cmd msg
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">JavaScript</h4>
                    <div className="bg-gray-900 text-yellow-300 p-3 rounded font-mono text-xs">
                      <div>app.ports.saveToStorage.subscribe(data =&gt; {"{"}</div>
                      <div>&nbsp;&nbsp;localStorage.setItem(data.key, data.value)</div>
                      <div>{"})"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <h3 className="font-semibold text-red-600 mb-3">4. Upload de Imagens (Multipart)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Elm (Port)</h4>
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs">
                      <div>
                        <span className="text-yellow-400">port</span> uploadImage : File -&gt; Cmd msg
                      </div>
                      <div>
                        <span className="text-yellow-400">port</span> uploadComplete : (Bool -&gt; msg) -&gt; Sub msg
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">JavaScript</h4>
                    <div className="bg-gray-900 text-yellow-300 p-3 rounded font-mono text-xs">
                      <div>app.ports.uploadImage.subscribe(file =&gt; {"{"}</div>
                      <div>&nbsp;&nbsp;const formData = new FormData()</div>
                      <div>&nbsp;&nbsp;formData.append('image', file)</div>
                      <div>
                        &nbsp;&nbsp;fetch('/upload', {"{"} method: 'POST', body: formData {"}"})
                      </div>
                      <div>{"})"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Por que Elm 0.19.1 removeu algumas funcionalidades?</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>
                • <strong>Simplicidade:</strong> Manter o core da linguagem pequeno e focado
              </li>
              <li>
                • <strong>Segurança:</strong> Evitar APIs que podem causar runtime errors
              </li>
              <li>
                • <strong>Manutenibilidade:</strong> Menos código para manter no compilador
              </li>
              <li>
                • <strong>Flexibilidade:</strong> Ports permitem integração customizada com JavaScript
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
