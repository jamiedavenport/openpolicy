import { cookies } from "next/headers";

export function setIt() {
  cookies().set({ name: "tok", value: "v", path: "/" });
}
