/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CustomLoader } from '@/components/custom-loader'
import { ProgressBar } from '@/components/progress-bar'
import dynamic from 'next/dynamic'

type Status =
  | 'Label created'
  | 'Picked up'
  | 'In transit'
  | 'Out for delivery'
  | 'Delivered'

type TrackingResult = {
  trackingId: string
  current: Status
  eta: string
  timeline: { status: Status; time: string; note?: string }[]
}

export default function TrackPage() {
  const [trackingId, setTrackingId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TrackingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const RiderMap = dynamic(
    () => import('@/components/rider-map').then((m) => m.RiderMap),
    { ssr: false },
  )

  const demo = useMemo<TrackingResult>(
    () => ({
      trackingId: 'PP-2048-KD',
      current: 'Out for delivery',
      eta: 'Today, 6:00 PM',
      timeline: [
        {
          status: 'Label created',
          time: 'Feb 26, 2026 • 09:10',
          note: 'Shipment created',
        },
        {
          status: 'Picked up',
          time: 'Feb 26, 2026 • 10:05',
          note: 'Picked up by rider',
        },
        {
          status: 'In transit',
          time: 'Feb 26, 2026 • 12:20',
          note: 'Arrived at hub',
        },
        {
          status: 'Out for delivery',
          time: 'Feb 26, 2026 • 15:40',
          note: 'Courier is on the way',
        },
      ],
    }),
    [],
  )

  async function onTrack() {
    setError(null)
    setResult(null)

    const id = trackingId.trim()
    if (!id) return setError('Enter a tracking ID.')

    setLoading(true)
    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId: id }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to track')

      setResult(json.shipment)
    } catch (e: any) {
      setError(e.message || 'Tracking failed')
    } finally {
      setLoading(false)
    }
  }
  return (
    <main className='mx-auto max-w-3xl px-4 py-10'>
      <div className='flex items-center justify-between'>
        <Link href='/' className='text-sm text-zinc-200/80 hover:text-white'>
          ← Back
        </Link>
        <p className='text-sm font-medium tracking-tight'>ParcelPulse</p>
      </div>

      <h1 className='mt-6 text-2xl font-semibold tracking-tight sm:text-3xl'>
        Track your parcel
      </h1>
      <p className='mt-2 text-sm text-zinc-200/70'>
        Enter your tracking ID to see delivery updates.
      </p>

      <Card className='mt-5 glass glow-ring rounded-2xl'>
        <CardHeader>
          <CardTitle className='text-base'>Tracking</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-3 sm:flex-row'>
          <Input
            className='bg-white/5 border-white/10 text-white placeholder:text-zinc-300/50'
            placeholder='e.g. PP-2048-KD'
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            onKeyDown={(e) => (e.key === 'Enter' ? onTrack() : null)}
          />
          <Button
            className='rounded-xl bg-white text-black hover:bg-zinc-200'
            onClick={onTrack}
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Track'}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className='mt-4 glass rounded-2xl p-4'>
          <CustomLoader label='Fetching updates' />
        </div>
      ) : null}

      {error ? (
        <div className='mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200'>
          {error}
        </div>
      ) : null}

      {result ? (
        <Card className='mt-4 glass rounded-2xl'>
          <CardHeader className='space-y-2'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <CardTitle className='text-base'>
                Shipment: {result.trackingId}
              </CardTitle>
              <Badge className='glass-strong text-zinc-100 hover:bg-white/10'>
                {result.current}
              </Badge>
            </div>

            <p className='text-sm text-zinc-200/70'>
              Estimated delivery: {result.eta}
            </p>

            <div className='mt-3 glass rounded-2xl p-3'>
              <ProgressBar status={result.current} />
              {result.current === 'Out for delivery' && (
                <div className='mt-4 glass rounded-2xl p-3'>
                  <p className='text-sm mb-2 text-zinc-200'>
                    Rider is on the way 🚚
                  </p>
                  <RiderMap />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className='space-y-3'>
            {result.timeline.map((t, i) => (
              <div key={i} className='glass rounded-2xl p-3'>
                <div className='flex items-center justify-between gap-2'>
                  <p className='text-sm font-medium text-white'>{t.status}</p>
                  <p className='text-xs text-zinc-200/60'>{t.time}</p>
                </div>
                {t.note ? (
                  <p className='mt-1 text-xs text-zinc-200/70'>{t.note}</p>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </main>
  )
}
