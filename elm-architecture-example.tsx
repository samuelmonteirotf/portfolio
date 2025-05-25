"use client"

import { useReducer } from "react"

// Simulando The Elm Architecture em React para demonstração

// Model (Estado)
interface Model {
  count: number
  todos: Todo[]
  inputValue: string
  filter: FilterType
}

interface Todo {
  id: number
  text: string
  completed: boolean
}

type FilterType = "All" | "Active" | "Completed"

// Msg (Ações)
type Msg =
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "RESET" }
  | { type: "ADD_TODO" }
  | { type: "TOGGLE_TODO"; id: number }
  | { type: "UPDATE_INPUT"; value: string }
  | { type: "SET_FILTER"; filter: FilterType }
  | { type: "CLEAR_COMPLETED" }

// Update (Reducer)
const update = (model: Model, msg: Msg): Model => {
  switch (msg.type) {
    case "INCREMENT":
      return { ...model, count: model.count + 1 }

    case "DECREMENT":
      return { ...model, count: model.count - 1 }

    case "RESET":
      return { ...model, count: 0 }

    case "ADD_TODO":
      if (model.inputValue.trim() === "") return model
      const newTodo: Todo = {
        id: Date.now(),
        text: model.inputValue,
        completed: false,
      }
      return {
        ...model,
        todos: [...model.todos, newTodo],
        inputValue: "",
      }

    case "TOGGLE_TODO":
      return {
        ...model,
        todos: model.todos.map((todo) => (todo.id === msg.id ? { ...todo, completed: !todo.completed } : todo)),
      }

    case "UPDATE_INPUT":
      return { ...model, inputValue: msg.value }

    case "SET_FILTER":
      return { ...model, filter: msg.filter }

    case "CLEAR_COMPLETED":
      return {
        ...model,
        todos: model.todos.filter((todo) => !todo.completed),
      }

    default:
      return model
  }
}

// Estado inicial
const initialModel: Model = {
  count: 0,
  todos: [],
  inputValue: "",
  filter: "All",
}

export default function ElmArchitectureExample() {
  const [model, dispatch] = useReducer(update, initialModel)

  // View Helper Functions
  const filteredTodos = model.todos.filter((todo) => {
    switch (model.filter) {
      case "Active":
        return !todo.completed
      case "Completed":
        return todo.completed
      default:
        return true
    }
  })

  const activeTodosCount = model.todos.filter((todo) => !todo.completed).length
  const completedTodosCount = model.todos.filter((todo) => todo.completed).length

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">The Elm Architecture (TEA)</h1>

      {/* Architecture Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">📊 Model</h3>
          <p className="text-sm text-blue-700 mb-3">Estado imutável da aplicação</p>
          <div className="bg-white p-2 rounded text-xs font-mono">
            <div>count: {model.count}</div>
            <div>todos: {model.todos.length} items</div>
            <div>filter: {model.filter}</div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">👁️ View</h3>
          <p className="text-sm text-green-700 mb-3">Função pura: Model → HTML</p>
          <div className="bg-white p-2 rounded text-xs">
            <div>• Renderiza baseado no Model</div>
            <div>• Emite mensagens (Msg)</div>
            <div>• Sem efeitos colaterais</div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">🔄 Update</h3>
          <p className="text-sm text-purple-700 mb-3">Função pura: Msg → Model → Model</p>
          <div className="bg-white p-2 rounded text-xs">
            <div>• Processa mensagens</div>
            <div>• Retorna novo estado</div>
            <div>• Lógica de negócio</div>
          </div>
        </div>
      </div>

      {/* Counter Example */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Exemplo 1: Contador</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch({ type: "DECREMENT" })}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            -
          </button>
          <span className="text-2xl font-bold w-16 text-center">{model.count}</span>
          <button
            onClick={() => dispatch({ type: "INCREMENT" })}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            +
          </button>
          <button
            onClick={() => dispatch({ type: "RESET" })}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Todo App Example */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Exemplo 2: Todo App</h2>

        {/* Add Todo */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={model.inputValue}
            onChange={(e) => dispatch({ type: "UPDATE_INPUT", value: e.target.value })}
            onKeyPress={(e) => e.key === "Enter" && dispatch({ type: "ADD_TODO" })}
            placeholder="Adicionar nova tarefa..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => dispatch({ type: "ADD_TODO" })}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Adicionar
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {(["All", "Active", "Completed"] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => dispatch({ type: "SET_FILTER", filter })}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                model.filter === filter ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-2 mb-4">
          {filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center gap-3 p-3 border rounded-lg transition-all ${
                todo.completed ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200"
              }`}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => dispatch({ type: "TOGGLE_TODO", id: todo.id })}
                className="w-4 h-4 text-blue-600"
              />
              <span className={`flex-1 ${todo.completed ? "line-through text-gray-500" : ""}`}>{todo.text}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            {activeTodosCount} ativa{activeTodosCount !== 1 ? "s" : ""}, {completedTodosCount} completa
            {completedTodosCount !== 1 ? "s" : ""}
          </span>
          {completedTodosCount > 0 && (
            <button
              onClick={() => dispatch({ type: "CLEAR_COMPLETED" })}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              Limpar completas
            </button>
          )}
        </div>
      </div>

      {/* Elm Code Example */}
      <div className="mt-8 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
        <div className="mb-2 text-gray-400">-- The Elm Architecture em Elm</div>
        <div className="text-yellow-400">type</div> <div className="inline">Msg = Increment | Decrement | Reset</div>
        <div className="mt-1">
          <span className="text-yellow-400">type alias</span> Model = Int
        </div>
        <div className="mt-2">
          <span className="text-blue-400">update</span> : Msg -&gt; Model -&gt; Model
        </div>
        <div>
          <span className="text-blue-400">update</span> msg model =
        </div>
        <div>&nbsp;&nbsp;case msg of</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;Increment -&gt; model + 1</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;Decrement -&gt; model - 1</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;Reset -&gt; 0</div>
        <div className="mt-2">
          <span className="text-blue-400">view</span> : Model -&gt; Html Msg
        </div>
        <div>
          <span className="text-blue-400">view</span> model = ...
        </div>
      </div>

      {/* Comparison with other architectures */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Comparação com outras arquiteturas:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>
            • <strong>MVC:</strong> Model-View-Controller (separação de responsabilidades)
          </li>
          <li>
            • <strong>MVP:</strong> Model-View-Presenter (presenter controla a view)
          </li>
          <li>
            • <strong>MVVM:</strong> Model-View-ViewModel (binding bidirecional)
          </li>
          <li>
            • <strong>TEA:</strong> Model-View-Update (fluxo unidirecional, funções puras)
          </li>
        </ul>
      </div>
    </div>
  )
}
