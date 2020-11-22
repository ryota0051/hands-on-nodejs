const http = require("http");

const todos = [
  { id: 1, title: "ネーム", completed: false },
  { id: 2, title: "下書き", completed: true },
];

const server = http.createServer((req, res) => {
  if (req.url === "/api/todos") {
    if (req.method === "GET") {
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify(todos));
    }
    res.statusCode = 405;
  } else {
    res.statusCode = 404;
  }
  res.end();
});

server.listen(3000);
