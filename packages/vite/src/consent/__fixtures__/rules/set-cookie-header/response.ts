export function loader() {
  return new Response("ok", {
    headers: {
      "Set-Cookie": "session=abc; Path=/",
    },
  });
}
