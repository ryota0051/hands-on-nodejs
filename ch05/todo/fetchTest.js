const fetch = require("isomorphic-fetch");

const getData = async (url) => {
  const res = await fetch(url);
  return res.json();
};

const postData = async (url, data) => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

const URL = "http://localhost:3000/api/todos";

postData(URL, { title: "ペン入れ" })
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.error(err);
  });
