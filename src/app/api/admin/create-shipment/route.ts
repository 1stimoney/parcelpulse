import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { appUrl, sendMail } from '@/lib/mail'

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
    sender_email,
    receiver_email,
    receiver_name,
    receiver_phone,
    dropoff_address,
    eta,
  } = body

  if (!pickup_address || !dropoff_address) {
    return NextResponse.json(
      { error: 'pickup_address and dropoff_address are required' },
      { status: 400 },
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
        sender_email,
        receiver_email: receiver_email || null,
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

    const trackLink = appUrl(`/track`)

    const recipients = [sender_email, receiver_email].filter(
      Boolean,
    ) as string[]
    if (recipients.length) {
      try {
        await sendMail({
          to: recipients,
          subject: `ParcelPulse — Shipment created (${tracking_id})`,
          html: `
        <div style="font-family:ui-sans-serif,system-ui;line-height:1.6">
          <h2 style="margin:0 0 8px">Shipment created ✅</h2>
          <p style="margin:0 0 12px">Tracking ID: <b>${tracking_id}</b></p>
          <p style="margin:0 0 6px"><b>Status:</b> Label created</p>
          <p style="margin:0 0 6px"><b>ETA:</b> ${shipment.eta || 'TBD'}</p>
          <p style="margin:12px 0 0">
            Track here: <a href="${trackLink}">${trackLink}</a>
          </p>
        </div>
      `,
          text: `Shipment created. Tracking ID: ${tracking_id}. Track: ${trackLink}`,
        })
      } catch {}
    }

    if (evErr)
      return NextResponse.json({ error: evErr.message }, { status: 500 })

    return NextResponse.json({ ok: true, shipment })
  }

  return NextResponse.json(
    { error: 'Failed to generate unique tracking ID' },
    { status: 500 },
  )
}
