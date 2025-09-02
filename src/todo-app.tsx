import React, { useState, useEffect } from 'react';

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

const LOCAL_STORAGE_KEY = 'lichtara_todo_list';

function getInitialTodos(): Todo[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>(getInitialTodos());
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    if (newTodo.trim() === '') return;
    setTodos([
      ...todos,
      { id: Date.now().toString(), text: newTodo.trim(), completed: false }
    ]);
    setNewTodo('');
  }

  function toggleTodo(id: string) {
    setTodos(todos =>
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  function deleteTodo(id: string) {
    setTodos(todos => todos.filter(todo => todo.id !== id));
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Lichtara To-Do List</h2>
      <form onSubmit={handleAddTodo} style={{ marginBottom: '16px' }}>
        <input
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          style={{ width: '75%', padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 12px', marginLeft: 8 }}>Add</button>
      </form>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li key={todo.id} style={{
            marginBottom: '8px',
            textDecoration: todo.completed ? 'line-through' : 'none',
            display: 'flex',
            alignItems: 'center'
          }}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              style={{ marginRight: 8 }}
            />
            <span style={{ flexGrow: 1 }}>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)} style={{ marginLeft: 8 }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}