/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CustomLoader } from '@/components/custom-loader'
import { AdminTabs } from '@/components/admin-tabs'

type PickupRow = {
  id: string
  full_name: string
  phone: string
  pickup_address: string
  dropoff_address: string
  package_desc: string
  weight_kg: number | null
  notes: string | null
  status: string
  created_at: string
}

const STATUSES = [
  'pending',
  'assigned',
  'picked_up',
  'completed',
  'cancelled',
] as const

export const dynamic = 'force-dynamic'

export default function AdminPickupsPage() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('pending')
  const [items, setItems] = useState<PickupRow[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  async function load() {
    setErr(null)
    setLoading(true)
    try {
      const res = await fetch(
        `/api/admin/list-pickups?status=${encodeURIComponent(status)}&limit=25`,
        {
          cache: 'no-store',
        },
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed')
      setItems(json.items || [])
    } catch (e: any) {
      setErr(e.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, next: string) {
    await fetch('/api/admin/update-pickup-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ id, status: next }),
    })
    await load()
  }

  async function convertToShipment(pickupId: string) {
    setToast(null)

    try {
      const res = await fetch('/api/admin/convert-pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ pickupId }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed')

      if (json.alreadyConverted) {
        setToast(`Already converted ✅ Tracking ID: ${json.trackingId}`)
      } else {
        setToast(`Converted ✅ Tracking ID: ${json.trackingId}`)
      }

      // refresh list (it will move from pending -> assigned)
      await load()
    } catch (e: any) {
      setToast(`Error: ${e.message || 'Failed'}`)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return (
    <main className='mx-auto max-w-6xl px-4 py-10'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
          Admin
        </h1>
        <p className='mt-1 text-sm text-zinc-200/70'>Pickup requests inbox.</p>
        <AdminTabs />
      </div>

      <Card className='mt-5 glass glow-ring rounded-2xl'>
        <CardHeader className='space-y-3'>
          <CardTitle className='text-base'>Pickups</CardTitle>

          <div className='flex flex-wrap gap-2'>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={[
                  'rounded-xl px-3 py-2 text-sm transition',
                  status === s
                    ? 'glass-strong text-white'
                    : 'glass text-zinc-200/70 hover:text-white',
                ].join(' ')}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          {loading ? (
            <div className='glass rounded-2xl p-4'>
              <CustomLoader label='Loading pickups' />
            </div>
          ) : null}

          {err ? (
            <div className='rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200'>
              {err}
            </div>
          ) : null}

          {toast ? (
            <div className='rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-100'>
              {toast}
            </div>
          ) : null}

          <div className='grid gap-3'>
            {items.map((p) => (
              <div key={p.id} className='glass rounded-2xl p-4'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <p className='text-sm font-semibold'>
                    {p.full_name} • {p.phone}
                  </p>
                  <Badge className='glass-strong text-zinc-100 hover:bg-white/10'>
                    {p.status}
                  </Badge>
                </div>

                <p className='mt-2 text-xs text-zinc-200/70'>
                  {p.pickup_address} → {p.dropoff_address}
                </p>
                <p className='mt-2 text-xs text-zinc-200/60'>
                  {p.package_desc} • {p.weight_kg ?? 1}kg
                </p>
                {p.notes ? (
                  <p className='mt-2 text-xs text-zinc-200/60'>
                    Note: {p.notes}
                  </p>
                ) : null}

                <div className='mt-3 flex flex-wrap gap-2'>
                  <Button
                    className='rounded-xl bg-indigo-500/90 hover:bg-indigo-500'
                    onClick={() => convertToShipment(p.id)}
                  >
                    Convert → Shipment
                  </Button>

                  <Button
                    variant='outline'
                    className='rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10'
                    onClick={() => updateStatus(p.id, 'assigned')}
                  >
                    Assign
                  </Button>
                  <Button
                    variant='outline'
                    className='rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10'
                    onClick={() => updateStatus(p.id, 'picked_up')}
                  >
                    Picked up
                  </Button>
                  <Button
                    className='rounded-xl bg-white text-black hover:bg-zinc-200'
                    onClick={() => updateStatus(p.id, 'completed')}
                  >
                    Complete
                  </Button>
                  <Button
                    variant='outline'
                    className='rounded-xl border-red-500/20 bg-red-500/10 text-red-100 hover:bg-red-500/20'
                    onClick={() => updateStatus(p.id, 'cancelled')}
                  >
                    Cancel
                  </Button>
                </div>

                <p className='mt-3 text-[11px] text-zinc-200/50'>
                  {new Date(p.created_at).toLocaleString()} • Ref:{' '}
                  {p.id.slice(0, 8)}
                </p>
              </div>
            ))}

            {!loading && items.length === 0 ? (
              <div className='glass rounded-2xl p-4 text-sm text-zinc-200/70'>
                No pickup requests in this status.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
