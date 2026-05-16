import type { NextApiRequest, NextApiResponse } from "next";
import { setCookie } from "cookies-next";

export function setSessionCookie(req: NextApiRequest, res: NextApiResponse, token: string) {
  setCookie("session", token, {
    req,
    res,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}
