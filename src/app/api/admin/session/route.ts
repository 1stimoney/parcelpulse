import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const c = await cookies();
  const session = c.get("pp_admin")?.value === "active";
  return NextResponse.json({ ok: session });
}