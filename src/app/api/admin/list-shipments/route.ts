import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const limit = Math.min(Number(searchParams.get("limit") || 20), 50);

  const supabase = supabaseServer();

  let query = supabase
    .from("shipments")
    .select("tracking_id,current_status,eta,created_at,pickup_address,dropoff_address")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (q) {
    // search by tracking id
    query = query.ilike("tracking_id", `%${q}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, items: data || [] });
}