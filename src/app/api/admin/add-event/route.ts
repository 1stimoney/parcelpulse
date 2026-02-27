import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { appUrl, sendMail } from '@/lib/mail'

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
      { status: 400 },
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

  const { data: emails } = await supabase
    .from('shipments')
    .select('sender_email,receiver_email,eta')
    .eq('id', shipment.id)
    .single()

  const recipients = [emails?.sender_email, emails?.receiver_email].filter(
    Boolean,
  ) as string[]
  if (recipients.length) {
    const trackLink = appUrl(`/track`)
    try {
      await sendMail({
        to: recipients,
        subject: `ParcelPulse — Update: ${trackingId} is now "${status}"`,
        html: `
        <div style="font-family:ui-sans-serif,system-ui;line-height:1.6">
          <h2 style="margin:0 0 8px">Delivery update 🔔</h2>
          <p style="margin:0 0 12px">Tracking ID: <b>${trackingId}</b></p>
          <p style="margin:0 0 6px"><b>New status:</b> ${status}</p>
          ${note ? `<p style="margin:0 0 6px"><b>Note:</b> ${escapeHtml(note)}</p>` : ''}
          <p style="margin:0 0 6px"><b>ETA:</b> ${emails?.eta || 'TBD'}</p>
          <p style="margin:12px 0 0">
            Track here: <a href="${trackLink}">${trackLink}</a>
          </p>
        </div>
      `,
        text: `Update: ${trackingId} is now "${status}". Track: ${trackLink}`,
      })
    } catch {}
  }

  function escapeHtml(s: string) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;')
  }

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
