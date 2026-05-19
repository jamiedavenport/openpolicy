export function withCookie(headers: Headers) {
  headers.append("Set-Cookie", "id=42");
}
