export function setSession(token: string): void {
  document.cookie = `session=${token}`;
}
