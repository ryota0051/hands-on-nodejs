"use strict";

const express = require("express");

let todos = [
  { id: 1, title: "ネーム", completed: false },
  { id: 2, title: "下書き", completed: true },
];

const app = express();

app.use(express.json());

// ToDo一覧の取得
app.get("/api/todos", (req, res, next) => {
  const completedQuety = req.query.completed;
  if (!req.query.completed) {
    return res.json(todos);
  }
  let completed = true;
  if (completedQuety === "true") {
    completed = true;
  } else if (completedQuety === "false") {
    completed = false;
  } else {
    const err = new Error("completed should be true or false");
    err.statusCode = 400;
    return next(err);
  }
  res.json(todos.filter((todo) => todo.completed === completed));
});

// SSEの設定
let sseSenders = [];
let sseId = 1;

app.get("/api/todos/events", (req, res) => {
  req.socket.setTimeout(0);
  res.set({
    "Content-Type": "text/event-stream",
  });
  const send = (id, data) => res.write(`id: ${id}\ndata: ${data}\n\n`);
  sseSenders.push(send);
  send(sseId, JSON.stringify(todos));
  req.on("close", () => {
    res.end();
    sseSenders = sseSenders.filter((_send) => _send !== send);
  });
});

function onUpdateTodos() {
  sseId += 1;
  const data = JSON.stringify(todos);
  sseSenders.forEach((send) => send(sseId, data));
}

app.use("/api/todos/:id(\\d+)", (req, res, next) => {
  const targetID = Number(req.params.id);
  const todo = todos.find((todo) => todo.id === targetID);
  if (!todo) {
    const err = new Error("id not found");
    err.statusCode = 404;
    return next(err);
  }
  req.todo = todo;
  next();
});

app
  .route("/api/todos/:id(\\d+)/completed")
  .put((req, res) => {
    req.todo.completed = true;
    res.status(200).json(req.todo);
    onUpdateTodos();
  })
  .delete((req, res) => {
    req.todo.completed = false;
    res.status(200).json(req.todo);
    onUpdateTodos();
  });

app.delete("/api/todos/:id(\\d+)", (req, res) => {
  todos = todos.filter((todo) => todo.id !== req.todo.id);
  res.status(204).end();
  onUpdateTodos();
});

let id = 2;
app.post("/api/todos", (req, res, next) => {
  const { title } = req.body;
  if (typeof title !== "string" || !title) {
    const err = new Error("title is required");
    err.statusCode = 400;
    return next(err);
  }
  const todo = { id: (id += 1), title, completed: false };
  todos.push(todo);
  res.status(201).json(todo);
  onUpdateTodos();
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ error: err.message });
});

app.listen(3000);

const next = require("next");
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });

nextApp.prepare().then(
  () => app.get("*", nextApp.getRequestHandler()),
  (err) => {
    console.log(err);
    process.exit(1);
  }
);
