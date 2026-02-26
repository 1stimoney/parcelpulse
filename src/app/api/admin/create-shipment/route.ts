import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

function makeTrackingId() {
  // PP- + 6 hex chars
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

  const {
    sender_name,
    sender_phone,
    pickup_address,
    receiver_name,
    receiver_phone,
    dropoff_address,
    eta,
  } = body

  if (!pickup_address || !dropoff_address) {
    return NextResponse.json(
      { error: 'pickup_address and dropoff_address are required' },
      { status: 400 }
    )
  }

  const supabase = supabaseServer()

  // try a few times in case of rare tracking_id collision
  for (let attempt = 0; attempt < 5; attempt++) {
    const tracking_id = makeTrackingId()

    const { data: shipment, error: shipErr } = await supabase
      .from('shipments')
      .insert({
        tracking_id,
        sender_name: sender_name || null,
        sender_phone: sender_phone || null,
        pickup_address,
        receiver_name: receiver_name || null,
        receiver_phone: receiver_phone || null,
        dropoff_address,
        eta: eta || null,
        current_status: 'Label created',
      })
      .select()
      .single()

    if (shipErr) {
      // collision? retry; otherwise fail
      if (shipErr.message?.toLowerCase().includes('duplicate')) continue
      return NextResponse.json({ error: shipErr.message }, { status: 500 })
    }

    // initial event
    const { error: evErr } = await supabase.from('shipment_events').insert({
      shipment_id: shipment.id,
      status: 'Label created',
      note: 'Shipment created',
    })

    if (evErr)
      return NextResponse.json({ error: evErr.message }, { status: 500 })

    return NextResponse.json({ ok: true, shipment })
  }

  return NextResponse.json(
    { error: 'Failed to generate unique tracking ID' },
    { status: 500 }
  )
}
