import { NextResponse } from "next/server";

export async function GET() {
  const body = JSON.stringify({ ok: true });
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": "documenso.token=abc; Path=/; HttpOnly; Secure",
    },
  });
}
