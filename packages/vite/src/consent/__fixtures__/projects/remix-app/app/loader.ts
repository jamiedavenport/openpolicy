export async function loader() {
  return new Response("ok", {
    headers: {
      "Set-Cookie": "session=abc; HttpOnly",
    },
  });
}

export async function altLoader() {
  const headers = new Headers();
  headers.append("Set-Cookie", "tracking=1");
  return new Response("ok", { headers });
}
