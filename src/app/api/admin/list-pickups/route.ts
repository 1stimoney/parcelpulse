import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = (searchParams.get("status") || "pending").trim();
  const limit = Math.min(Number(searchParams.get("limit") || 20), 50);

  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("pickup_requests")
    .select("id,full_name,phone,pickup_address,dropoff_address,package_desc,weight_kg,notes,status,created_at")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, items: data || [] });
}