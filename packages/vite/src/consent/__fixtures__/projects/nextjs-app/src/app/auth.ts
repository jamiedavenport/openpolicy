import { cookies } from "next/headers";

export async function setSession(token: string) {
  const c = await cookies();
  c.set("session", token, { httpOnly: true });
}

export async function setRefresh(token: string) {
  (await cookies()).set({ name: "refresh", value: token });
}
