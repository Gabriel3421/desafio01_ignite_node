const express = require('express');
const cors = require('cors');

const { v4: uuid } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers
  const user = users.find(
    (user) => user.username === username
  )
  if (!user) {
    return res.status(404).json({ error: "User dont exists!" })
  }
  req.user = user
  return next()
}

app.post('/users', (req, res) => {
  const { username, name } = req.body
  const userAlreadyExists = users.some(
    (user) => user.username === username
  )
  if (userAlreadyExists) {
    return res.status(400).json({ error: "User already exists!" })
  }
  const newUser = {
    username,
    name,
    id: uuid(),
    todos: []
  }
  users.push(newUser)
  return res.status(201).send(newUser)
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req
  return res.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req
  const { title, deadline } = req.body
  const newTodo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(newTodo)
  return res.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { user } = req
  const { title, deadline } = req.body
  const { id } = req.params
  let updatedTodo
  const todoExists = user.todos.find(todo => todo.id === id)
  if (!todoExists) {
    return res.status(404).json({ error: "Todo doesnt exists!" })
  }
  user.todos = user.todos.map((todo) => {
    if (todo.id === id) {
      updatedTodo = {
        done: todo.done,
        title,
        deadline: new Date(deadline)
      }
      return {
        ...todo,
        title,
        deadline: new Date(deadline)
      }
    }
    return todo
  })
  return res.json(updatedTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const { user } = req
  const { id } = req.params
  let updatedTodo
  const todoExists = user.todos.find(todo => todo.id === id)
  if (!todoExists) {
    return res.status(404).json({ error: "Todo doesnt exists!" })
  }
  user.todos = user.todos.map((todo) => {
    if (todo.id === id) {
      updatedTodo = {
        ...todo,
        done: true
      }
      return updatedTodo
    }
    return todo
  })
  return res.json(updatedTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { user } = req
  const { id } = req.params
  const todoExists = user.todos.find(todo => todo.id === id)
  if (!todoExists) {
    return res.status(404).json({ error: "Todo doesnt exists!" })
  }
  user.todos = user.todos.filter(todo => todo.id !== id)
  return res.status(204).send()
});

module.exports = app;