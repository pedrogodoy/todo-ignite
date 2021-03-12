const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(u => u.username === username);

  if(!user) {
    return response.status(404).json({ error: "User does not exist!" });
  }

  request.user = user;
  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  
  const userAlreadyExists = users.find(u => u.username === username);

  if(userAlreadyExists) {
    return response.status(400).json({ error: "User already exists" })
  }


  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };
  
  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const foundIndex = user.todos.findIndex(i => i.id === id);
  if(foundIndex === -1) {
    return response.status(404).json({ error: "Todo does not exist." })
  }
  user.todos[foundIndex] = 
    { ...user.todos[foundIndex], title, deadline: new Date(deadline) };
  
  return response.status(200).json(user.todos[foundIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const foundIndex = user.todos.findIndex(i => i.id === id);
  if(foundIndex === -1) {
    return response.status(404).json({ error: "Todo does not exist." })
  }
  user.todos[foundIndex] = 
    { ...user.todos[foundIndex], done: true };
  
  return response.status(200).json(user.todos[foundIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const foundIndex = user.todos.findIndex(i => i.id === id);
  if(foundIndex === -1) {
    return response.status(404).json({ error: "Todo does not exist." })
  }

  user.todos.splice(foundIndex, 1);
  
  return response.status(204).send(user.todos);
});

module.exports = app;