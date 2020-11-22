import { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import "isomorphic-fetch";

const pages = {
  index: { title: "すべてのTodo", fetchQuery: "" },
  active: { title: "未完了のTodo", fetchQuery: "?completed=false" },
  completed: { title: "完了したTodo", fetchQuery: "?completed=true" },
};

const pageLinks = Object.keys(pages).map((page, index) => (
  <Link href={`/${page === "index" ? "" : page}`} key={index}>
    <a style={{ marginRight: 10 }}>{pages[page].title}</a>
  </Link>
));

const Todos = (props) => {
  const { title, fetchQuery } = pages[props.page];
  const [todos, setTodos] = useState([]);
  useEffect(async () => {
    const res = await fetch(`/api/todos${fetchQuery}`);
    res.ok ? setTodos(await res.json()) : alert(await res.text());
  }, [props.page]);
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <h1>{title}</h1>
      {/* Todo一覧表示 */}
      <ul>
        {todos.map(({ id, title, completed }) => (
          <li key={id}>
            <span style={completed ? { textDecoration: "line-through" } : {}}>
              {title}
            </span>
          </li>
        ))}
      </ul>
      <div>{pageLinks}</div>
    </>
  );
};

export default Todos;
