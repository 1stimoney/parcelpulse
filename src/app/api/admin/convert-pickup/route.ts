import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

function makeTrackingId() {
  const hex = Array.from(crypto.getRandomValues(new Uint8Array(3)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
  return `PP-${hex}`
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body)
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const pickupId = String(body.pickupId || '').trim()
  const eta = body.eta ? String(body.eta).trim() : null

  if (!pickupId) {
    return NextResponse.json({ error: 'pickupId is required' }, { status: 400 })
  }

  const supabase = supabaseServer()

  // 1) Load pickup
  const { data: pickup, error: pErr } = await supabase
    .from('pickup_requests')
    .select('*')
    .eq('id', pickupId)
    .single()

  if (pErr || !pickup) {
    return NextResponse.json({ error: 'Pickup not found' }, { status: 404 })
  }

  // 2) Check if already converted
  const { data: existing, error: exErr } = await supabase
    .from('shipments')
    .select('tracking_id')
    .eq('pickup_id', pickupId)
    .maybeSingle()

  if (exErr) return NextResponse.json({ error: exErr.message }, { status: 500 })
  if (existing?.tracking_id) {
    return NextResponse.json({
      ok: true,
      alreadyConverted: true,
      trackingId: existing.tracking_id,
    })
  }

  // 3) Create shipment (retry few times for rare tracking collision)
  for (let attempt = 0; attempt < 5; attempt++) {
    const tracking_id = makeTrackingId()

    const { data: shipment, error: sErr } = await supabase
      .from('shipments')
      .insert({
        tracking_id,
        pickup_id: pickupId,
        sender_name: pickup.full_name,
        sender_phone: pickup.phone,
        sender_email: pickup.sender_email,
        receiver_email: pickup.receiver_email,
        pickup_address: pickup.pickup_address,
        receiver_name: null,
        receiver_phone: null,
        dropoff_address: pickup.dropoff_address,
        eta: eta || null,
        current_status: 'Label created',
      })
      .select()
      .single()

    if (sErr) {
      if (sErr.message?.toLowerCase().includes('duplicate')) continue
      return NextResponse.json({ error: sErr.message }, { status: 500 })
    }

    // 4) Create first event
    const { error: evErr } = await supabase.from('shipment_events').insert({
      shipment_id: shipment.id,
      status: 'Label created',
      note: 'Converted from pickup request',
    })

    if (evErr)
      return NextResponse.json({ error: evErr.message }, { status: 500 })

    // 5) Update pickup status -> assigned
    const { error: upErr } = await supabase
      .from('pickup_requests')
      .update({ status: 'assigned' })
      .eq('id', pickupId)

    if (upErr)
      return NextResponse.json({ error: upErr.message }, { status: 500 })

    return NextResponse.json({
      ok: true,
      alreadyConverted: false,
      trackingId: tracking_id,
    })
  }

  return NextResponse.json(
    { error: 'Failed to generate tracking ID' },
    { status: 500 },
  )
}
