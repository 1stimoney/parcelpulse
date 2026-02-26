import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body)
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const trackingId = String(body.trackingId || '').trim()
  if (!trackingId)
    return NextResponse.json({ error: 'Tracking ID required' }, { status: 400 })

  const supabase = supabaseServer()

  const { data: shipment, error: shipErr } = await supabase
    .from('shipments')
    .select('*')
    .eq('tracking_id', trackingId)
    .single()

  if (shipErr || !shipment) {
    return NextResponse.json(
      { error: 'Tracking ID not found' },
      { status: 404 }
    )
  }

  const { data: events, error: evErr } = await supabase
    .from('shipment_events')
    .select('status,note,created_at')
    .eq('shipment_id', shipment.id)
    .order('created_at', { ascending: true })

  if (evErr) return NextResponse.json({ error: evErr.message }, { status: 500 })

  return NextResponse.json({
    ok: true,
    shipment: {
      trackingId: shipment.tracking_id,
      current: shipment.current_status,
      eta: shipment.eta || 'TBD',
      timeline: (events || []).map((e) => ({
        status: e.status,
        time: new Date(e.created_at).toLocaleString(),
        note: e.note || undefined,
      })),
    },
  })
}
