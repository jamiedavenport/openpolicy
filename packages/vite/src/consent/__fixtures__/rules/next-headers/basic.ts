import { cookies } from "next/headers";

export async function setSession(token: string): Promise<void> {
  const c = await cookies();
  c.set("session", token);
}
