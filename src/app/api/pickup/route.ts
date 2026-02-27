import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { sendMail, appUrl } from '@/lib/mail'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body)
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const {
    full_name,
    phone,
    sender_email,
    receiver_email,
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
      { status: 400 },
    )
  }

  const supabase = supabaseServer()

  const { data, error } = await supabase
    .from('pickup_requests')
    .insert({
      full_name,
      phone,
      sender_email: sender_email || null,
      receiver_email: receiver_email || null,
      pickup_address,
      dropoff_address,
      package_desc,
      weight_kg: Number(weight_kg || 1),
      notes: notes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Email notification (best-effort: don't fail the request if email fails)
  if (sender_email) {
    try {
      await sendMail({
        to: sender_email,
        subject: 'ParcelPulse — Pickup request received',
        html: `
          <div style="font-family:ui-sans-serif,system-ui;line-height:1.6">
            <h2 style="margin:0 0 8px">Pickup request received ✅</h2>
            <p style="margin:0 0 12px">Hi ${escapeHtml(full_name)}, we’ve received your pickup request.</p>
            <p style="margin:0 0 6px"><b>Reference:</b> ${data.id}</p>
            <p style="margin:0 0 6px"><b>Pickup:</b> ${escapeHtml(pickup_address)}</p>
            <p style="margin:0 0 6px"><b>Dropoff:</b> ${escapeHtml(dropoff_address)}</p>
            <p style="margin:12px 0 0;color:#666">We’ll assign a rider shortly.</p>
          </div>
        `,
        text: `Pickup request received. Ref: ${data.id}`,
      })
    } catch {
      // ignore email failures for now
    }
  }

  return NextResponse.json({ ok: true, request: data })
}

// tiny helper (avoid broken HTML)
function escapeHtml(s: string) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
