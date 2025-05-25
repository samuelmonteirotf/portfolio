"use client"

import { useState } from "react"

// Simulando conceitos de tipos do Elm em TypeScript

// Union Type (similar ao Elm)
type IntOrString = { type: "int"; value: number } | { type: "string"; value: string }

// Função que aceita number (Int ou Float no Elm)
const multiplyNumbers = (x: number, y: number): number => x * y

// Função que processa IntOrString
const processValue = (value: IntOrString): string => {
  switch (value.type) {
    case "int":
      return `Number: ${value.value}`
    case "string":
      return `Text: ${value.value}`
  }
}

export default function ElmTypesDemo() {
  const [inputValue, setInputValue] = useState("")
  const [results, setResults] = useState<string[]>([])

  const addResult = (result: string) => {
    setResults((prev) => [...prev, result])
  }

  const testNumberFunction = () => {
    const intResult = multiplyNumbers(5, 3)
    const floatResult = multiplyNumbers(5.5, 3.2)
    addResult(`Int multiplication: 5 * 3 = ${intResult}`)
    addResult(`Float multiplication: 5.5 * 3.2 = ${floatResult.toFixed(2)}`)
  }

  const testUnionType = () => {
    const intValue: IntOrString = { type: "int", value: 42 }
    const stringValue: IntOrString = { type: "string", value: "Hello Elm!" }

    addResult(processValue(intValue))
    addResult(processValue(stringValue))
  }

  const clearResults = () => setResults([])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tipos em Elm - Demonstração</h1>

      {/* Afirmações */}
      <div className="grid gap-4 mb-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">❌ INCORRETO</h3>
          <p className="text-sm text-red-700">
            <code className="bg-red-100 px-1 rounded">{'<script type="application/elm">'}</code> - Elm compila para
            JavaScript
          </p>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">✅ CORRETO</h3>
          <p className="text-sm text-green-700">Tipos são definidos em tempo de compilação e são imutáveis</p>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">✅ CORRETO</h3>
          <p className="text-sm text-green-700">
            Funções podem aceitar <code className="bg-green-100 px-1 rounded">number</code> (Int ou Float)
          </p>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">✅ CORRETO</h3>
          <p className="text-sm text-green-700">Union Types permitem Int ou String com construtores apropriados</p>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">❌ INCORRETO</h3>
          <p className="text-sm text-red-700">
            <code className="bg-red-100 px-1 rounded">type IntOrString = Int | String</code> - Sintaxe inválida
          </p>
        </div>
      </div>

      {/* Demonstrações Interativas */}
      <div className="space-y-6">
        {/* Tipagem Estática */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">1. Tipagem Estática (Tempo de Compilação)</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm mb-4">
            <div className="text-gray-400">-- Em Elm, tipos são verificados na compilação</div>
            <div>
              <span className="text-blue-400">add</span> : Int -&gt; Int -&gt; Int
            </div>
            <div>
              <span className="text-blue-400">add</span> x y = x + y
            </div>
            <div className="mt-2 text-red-400">-- add "hello" 5 -- ERRO DE COMPILAÇÃO!</div>
          </div>
          <p className="text-sm text-gray-600">
            Em Elm, se você tentar passar uma string onde é esperado um Int, o código nem compila.
          </p>
        </div>

        {/* Number Type */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">2. Tipo Number (Int ou Float)</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm mb-4">
            <div>
              <span className="text-blue-400">multiply</span> : number -&gt; number -&gt; number
            </div>
            <div>
              <span className="text-blue-400">multiply</span> x y = x * y
            </div>
            <div className="mt-2 text-gray-400">-- Funciona com Int e Float</div>
            <div>result1 = multiply 5 3 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- Int</div>
            <div>result2 = multiply 5.5 3.2 &nbsp;&nbsp;-- Float</div>
          </div>
          <button
            onClick={testNumberFunction}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Testar Função Number
          </button>
        </div>

        {/* Union Types */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">3. Union Types (Int ou String)</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm mb-4">
            <div>
              <span className="text-yellow-400">type</span> IntOrString
            </div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;= IntValue Int</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;| StringValue String</div>
            <div className="mt-2">
              <span className="text-blue-400">processValue</span> : IntOrString -&gt; String
            </div>
            <div>
              <span className="text-blue-400">processValue</span> value =
            </div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;case value of</div>
            <div>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IntValue int -&gt; "Number: " ++ String.fromInt int
            </div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;StringValue str -&gt; "Text: " ++ str</div>
          </div>
          <button
            onClick={testUnionType}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Testar Union Type
          </button>
        </div>

        {/* Como Elm roda no navegador */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">4. Como Elm Roda no Navegador</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">❌ Incorreto:</h4>
              <div className="bg-red-50 p-3 rounded font-mono text-sm">
                {'<script type="application/elm">'}
                <br />
                {"  // código Elm aqui"}
                <br />
                {"</script>"}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-green-600 mb-2">✅ Correto:</h4>
              <div className="bg-green-50 p-3 rounded font-mono text-sm">
                {'<script src="elm.js"></script>'}
                <br />
                {"<script>"}
                <br />
                {"  Elm.Main.init({"}
                <br />
                {'    node: document.getElementById("app")'}
                <br />
                {"  });"}
                <br />
                {"</script>"}
              </div>
            </div>
          </div>
        </div>

        {/* Sintaxe Union Types */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">5. Sintaxe Correta para Union Types</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">❌ Incorreto:</h4>
              <div className="bg-red-50 p-3 rounded font-mono text-sm">type IntOrString = Int | String</div>
              <p className="text-xs text-red-600 mt-1">Sintaxe inválida em Elm</p>
            </div>
            <div>
              <h4 className="font-semibold text-green-600 mb-2">✅ Correto:</h4>
              <div className="bg-green-50 p-3 rounded font-mono text-sm">
                type IntOrString
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;= IntValue Int
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;| StringValue String
              </div>
              <p className="text-xs text-green-600 mt-1">Union Types precisam de construtores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Resultados dos Testes:</h3>
            <button onClick={clearResults} className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
              Limpar
            </button>
          </div>
          <div className="space-y-1">
            {results.map((result, index) => (
              <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
