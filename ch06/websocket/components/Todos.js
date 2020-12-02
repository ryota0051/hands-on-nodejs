import { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import io from "socket.io-client";

const pages = {
  index: { title: "全てのToDo" },
  active: { title: "未完了のToDo", completed: false },
  completed: { title: "完了したToDo", completed: true },
};

const pageLinks = Object.keys(pages).map((page, index) => (
  <Link href={`/${page === "index" ? "" : page}`} key={index}>
    <a style={{ marginRight: 10 }}>{pages[page].title}</a>
  </Link>
));

const Todos = (props) => {
  const { title, completed } = pages[props.page];
  const [todos, setTodos] = useState([]);
  const [socket, setSocket] = useState();
  useEffect(() => {
    const socket = io("/todos");
    socket.on("todos", (todos) => {
      console.log(todos);
      setTodos(
        typeof completed === "undefined"
          ? todos
          : todos.filter((todo) => todo.completed === completed)
      );
    });
    setSocket(socket);
    return () => socket.close();
  }, [pages.page]);
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <h1>{title}</h1>
      <label>
        <input
          onKeyPress={(e) => {
            const title = e.target.value;
            if (e.key !== "Enter" || !title) {
              return;
            }
            e.target.value = "";
            socket.emit("createTodo", title);
          }}
        />
      </label>
      <ul>
        {todos.map(({ id, title, completed }) => (
          <li key={id}>
            <label style={completed ? { textDecoration: "line-through" } : {}}>
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) =>
                  socket.emit("updateCompleted", id, e.target.checked)
                }
              />
              {title}
            </label>
            <button onClick={() => socket.emit("deleteTodo", id)}>削除</button>
          </li>
        ))}
      </ul>
      <div>{pageLinks}</div>
    </>
  );
};

export default Todos;
