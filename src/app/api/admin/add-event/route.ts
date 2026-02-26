import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body)
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const trackingId = String(body.trackingId || '').trim()
  const status = String(body.status || '').trim()
  const note = body.note ? String(body.note).trim() : null

  if (!trackingId || !status) {
    return NextResponse.json(
      { error: 'trackingId and status are required' },
      { status: 400 }
    )
  }

  const supabase = supabaseServer()

  const { data: shipment, error: shipErr } = await supabase
    .from('shipments')
    .select('id,tracking_id')
    .eq('tracking_id', trackingId)
    .single()

  if (shipErr || !shipment) {
    return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
  }

  const { error: evErr } = await supabase.from('shipment_events').insert({
    shipment_id: shipment.id,
    status,
    note,
  })

  if (evErr) return NextResponse.json({ error: evErr.message }, { status: 500 })

  // update current_status to the latest event status
  const { error: upErr } = await supabase
    .from('shipments')
    .update({ current_status: status })
    .eq('id', shipment.id)

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
