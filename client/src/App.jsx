import { uimport { useState, useEffect } from 'react'
import './App.css'

const API_URL = "https://my-to-do-app-jf4j.onrender.com";

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')

  async function loadTodos() {
    try {
      const res = await fetch(`${API_URL}/api/todos`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setTodos(data)
      } else {
        console.error("Server returned non-array error:", data)
        setTodos([])
      }
    } catch (err) {
      console.error("Failed to fetch todos:", err)
      setTodos([])
    }
  }

  useEffect(() => { loadTodos() }, [])

  async function addTodo(event) {
    event.preventDefault()
    if (!title.trim()) return
    await fetch(`${API_URL}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    })
    setTitle('')
    loadTodos()
  }

  async function toggleTodo(id) {
    await fetch(`${API_URL}/api/todos/` + id, { method: 'PATCH' })
    loadTodos()
  }

  async function deleteTodo(id) {
    await fetch(`${API_URL}/api/todos/` + id, { method: 'DELETE' })
    loadTodos()
  }

  return (
    <div className="app">
      <h1>My To-Do List</h1>
      <form onSubmit={addTodo}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {Array.isArray(todos) && todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.is_done}
              onChange={() => toggleTodo(todo.id)}
            />
            <span className={todo.is_done ? 'done' : ''}>{todo.title}</span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
      {(!todos || todos.length === 0) && <p>Nothing here yet. Add your first to-do.</p>}
    </div>
  )
}

export default App