import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });

  // Delete cookie (Next supports delete)
  res.cookies.delete("pp_admin");

  // Also overwrite with an expired cookie (covers edge cases)
  res.cookies.set("pp_admin", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  return res;
}