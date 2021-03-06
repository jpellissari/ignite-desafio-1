const express = require('express');
const cors = require('cors');
const { v4: uuidv4, v4 } = require('uuid');


const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.find(user => user.username === username);

  if(!userExists) return response.status(404).json({error: 'Not Found!'});

  request.user = userExists;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find(user => user.username === username);
  if (userExists) return response.status(400).json({ error: 'User already exists!' });

  const newUser = {
    id: v4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: v4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo)

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const checkTodo = user.todos.find(todo => todo.id === id);
  if (!checkTodo) return response.status(404).json({ error: 'Not Found.'});

  Object.assign(checkTodo, {
    title,
    deadline: new Date(deadline),
  });

  return response.json(checkTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const checkTodo = user.todos.find(todo => todo.id === id);
  if (!checkTodo) return response.status(404).json({ error: 'Not Found.'});

  checkTodo.done = true;

  return response.json(checkTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const checkTodo = user.todos.find(todo => todo.id === id);
  if (!checkTodo) return response.status(404).json({ error: 'Not Found.'});

  user.todos = user.todos.filter(todo => todo.id !== id);

  return response.status(204).send();
});

module.exports = app;