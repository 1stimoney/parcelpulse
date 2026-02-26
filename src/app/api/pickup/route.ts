import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body)
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const {
    full_name,
    phone,
    pickup_address,
    dropoff_address,
    package_desc,
    weight_kg,
    notes,
  } = body

  if (
    !full_name ||
    !phone ||
    !pickup_address ||
    !dropoff_address ||
    !package_desc
  ) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('pickup_requests')
    .insert({
      full_name,
      phone,
      pickup_address,
      dropoff_address,
      package_desc,
      weight_kg: Number(weight_kg || 1),
      notes: notes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, request: data })
}
