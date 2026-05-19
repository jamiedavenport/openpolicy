import { cookies } from "next/headers";

const COOKIE_NAME = "documenso.locale";

export async function setLocaleCookie(locale: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, locale, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getLocaleCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value;
}
