/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CustomLoader } from '@/components/custom-loader'
import { ProgressBar } from '@/components/progress-bar'
import { AdminTabs } from '@/components/admin-tabs'

const STATUS_PRESETS = [
  'Label created',
  'Picked up',
  'In transit',
  'Out for delivery',
  'Delivered',
] as const

type Shipment = {
  trackingId: string
  current: (typeof STATUS_PRESETS)[number] | string
  eta: string
  sender_name?: string | null
  sender_phone?: string | null
  pickup_address?: string | null
  receiver_name?: string | null
  receiver_phone?: string | null
  dropoff_address?: string | null
  timeline: { status: string; time: string; note?: string }[]
}

export default function AdminPage() {
  // create shipment form
  const [createForm, setCreateForm] = useState({
    sender_name: '',
    sender_phone: '',
    sender_email: '',
    receiver_email: '',
    pickup_address: '',
    receiver_name: '',
    receiver_phone: '',
    dropoff_address: '',
    eta: '',
  })

  const [creating, setCreating] = useState(false)
  const [createMsg, setCreateMsg] = useState<string | null>(null)
  const [createErr, setCreateErr] = useState<string | null>(null)

  // manage shipment
  const [searchId, setSearchId] = useState('')
  const [loadingShipment, setLoadingShipment] = useState(false)
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [shipErr, setShipErr] = useState<string | null>(null)

  const [eventStatus, setEventStatus] =
    useState<(typeof STATUS_PRESETS)[number]>('Picked up')
  const [eventNote, setEventNote] = useState('')
  const [addingEvent, setAddingEvent] = useState(false)
  const [eventMsg, setEventMsg] = useState<string | null>(null)

  const setC = (k: keyof typeof createForm, v: string) =>
    setCreateForm((p) => ({ ...p, [k]: v }))

  async function createShipment() {
    setCreateErr(null)
    setCreateMsg(null)

    if (
      !createForm.pickup_address.trim() ||
      !createForm.dropoff_address.trim()
    ) {
      setCreateErr('Pickup address and Dropoff address are required.')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/admin/create-shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to create shipment')

      const tid = json.shipment.tracking_id as string
      setCreateMsg(`Shipment created ✅ Tracking ID: ${tid}`)
      setSearchId(tid)
      await fetchShipment(tid)

      setCreateForm({
        sender_name: '',
        sender_phone: '',
        sender_email: '',
        receiver_email: '',
        pickup_address: '',
        receiver_name: '',
        receiver_phone: '',
        dropoff_address: '',
        eta: '',
      })
    } catch (e: any) {
      setCreateErr(e.message || 'Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  async function fetchShipment(id?: string) {
    const trackingId = (id ?? searchId).trim()
    if (!trackingId) return

    setShipErr(null)
    setEventMsg(null)
    setShipment(null)

    setLoadingShipment(true)
    try {
      const res = await fetch('/api/admin/get-shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to fetch shipment')

      setShipment(json.shipment)
    } catch (e: any) {
      setShipErr(e.message || 'Failed')
    } finally {
      setLoadingShipment(false)
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST', cache: 'no-store' })
    window.dispatchEvent(new Event('pp_admin_changed'))
    window.location.replace('/admin-login')
  }

  async function addEvent() {
    setEventMsg(null)
    if (!shipment?.trackingId) return

    setAddingEvent(true)
    try {
      const res = await fetch('/api/admin/add-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingId: shipment.trackingId,
          status: eventStatus,
          note: eventNote || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to add event')

      setEventMsg('Event added ✅')
      setEventNote('')
      await fetchShipment(shipment.trackingId)
    } catch (e: any) {
      setEventMsg(`Error: ${e.message || 'Failed'}`)
    } finally {
      setAddingEvent(false)
    }
  }

  const statusBadge = useMemo(() => shipment?.current ?? null, [shipment])

  return (
    <main className='mx-auto max-w-6xl px-4 py-10'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
            Admin
          </h1>
          <p className='mt-1 text-sm text-zinc-200/70'>
            Create shipments, update status timeline, and test tracking.
          </p>
          <AdminTabs />
        </div>
        <Badge className='glass-strong text-zinc-100 hover:bg-white/10 rounded-xl'>
          ParcelPulse Ops
        </Badge>

        <Button
          onClick={logout}
          variant='outline'
          className='rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10'
        >
          Logout
        </Button>
      </div>

      <div className='mt-6 grid gap-4 lg:grid-cols-2'>
        {/* Create shipment */}
        <Card className='glass glow-ring rounded-2xl'>
          <CardHeader>
            <CardTitle className='text-base'>Create shipment</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4 sm:grid-cols-2'>
            <Field
              label='Sender name'
              value={createForm.sender_name}
              onChange={(v) => setC('sender_name', v)}
            />
            <Field
              label='Sender phone'
              value={createForm.sender_phone}
              onChange={(v) => setC('sender_phone', v)}
            />
            <Field
              label='Sender email'
              value={createForm.sender_email}
              onChange={(v) => setC('sender_email', v)}
            />
            <Field
              label='Receiver email'
              value={createForm.receiver_email}
              onChange={(v) => setC('receiver_email', v)}
            />
            <Field
              label='Receiver name'
              value={createForm.receiver_name}
              onChange={(v) => setC('receiver_name', v)}
            />
            <Field
              label='Receiver phone'
              value={createForm.receiver_phone}
              onChange={(v) => setC('receiver_phone', v)}
            />

            <div className='space-y-2 sm:col-span-2'>
              <Label className='text-amber-100'>Pickup address *</Label>
              <Input
                className='bg-white/5 border-white/10'
                value={createForm.pickup_address}
                onChange={(e) => setC('pickup_address', e.target.value)}
              />
            </div>

            <div className='space-y-2 sm:col-span-2'>
              <Label className='text-amber-100'>Dropoff address *</Label>
              <Input
                className='bg-white/5 border-white/10'
                value={createForm.dropoff_address}
                onChange={(e) => setC('dropoff_address', e.target.value)}
              />
            </div>

            <div className='space-y-2 sm:col-span-2'>
              <Label className='text-amber-100'>ETA (optional)</Label>
              <Input
                className='bg-white/5 border-white/10'
                placeholder='e.g. Today, 6:00 PM'
                value={createForm.eta}
                onChange={(e) => setC('eta', e.target.value)}
              />
            </div>

            <div className='sm:col-span-2'>
              <Button
                onClick={createShipment}
                disabled={creating}
                className='w-full rounded-xl bg-white text-black hover:bg-zinc-200'
              >
                {creating ? 'Creating...' : 'Create shipment'}
              </Button>

              {creating ? (
                <div className='mt-3 glass rounded-2xl p-4'>
                  <CustomLoader label='Generating tracking ID' />
                </div>
              ) : null}

              {createMsg ? (
                <div className='mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100'>
                  {createMsg}
                </div>
              ) : null}

              {createErr ? (
                <div className='mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200'>
                  {createErr}
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Manage shipment */}
        <Card className='glass glow-ring rounded-2xl'>
          <CardHeader>
            <CardTitle className='text-base'>Manage shipment</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex flex-col gap-3 sm:flex-row'>
              <Input
                className='bg-white/5 border-white/10'
                placeholder='Enter tracking ID (e.g. PP-ABC123)'
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => (e.key === 'Enter' ? fetchShipment() : null)}
              />
              <Button
                className='rounded-xl bg-indigo-500/90 hover:bg-indigo-500'
                onClick={() => fetchShipment()}
                disabled={loadingShipment}
              >
                {loadingShipment ? 'Loading...' : 'Load'}
              </Button>
            </div>

            {loadingShipment ? (
              <div className='glass rounded-2xl p-4'>
                <CustomLoader label='Loading shipment' />
              </div>
            ) : null}

            {shipErr ? (
              <div className='rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200'>
                {shipErr}
              </div>
            ) : null}

            {shipment ? (
              <div className='space-y-4'>
                <div className='glass rounded-2xl p-4'>
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <p className='text-sm font-medium text-white'>
                      Tracking:{' '}
                      <span className='font-semibold'>
                        {shipment.trackingId}
                      </span>
                    </p>
                    {statusBadge ? (
                      <Badge className='glass-strong text-zinc-100 hover:bg-white/10'>
                        {statusBadge}
                      </Badge>
                    ) : null}
                  </div>

                  <p className='mt-2 text-sm text-zinc-200/70'>
                    ETA: {shipment.eta}
                  </p>

                  {/* progress bar */}
                  <div className='mt-3 glass rounded-2xl p-3'>
                    {/* only show mapped statuses smoothly */}
                    <ProgressBar
                      status={(shipment.current as any) ?? 'Label created'}
                    />
                  </div>

                  <div className='mt-3 grid gap-2 text-xs text-zinc-200/70 sm:grid-cols-2'>
                    <p>
                      <span className='text-zinc-200/50'>Pickup:</span>{' '}
                      {shipment.pickup_address}
                    </p>
                    <p>
                      <span className='text-zinc-200/50'>Dropoff:</span>{' '}
                      {shipment.dropoff_address}
                    </p>
                  </div>
                </div>

                {/* Add event */}
                <div className='glass rounded-2xl p-4 space-y-3'>
                  <p className='text-sm font-medium'>Add status update</p>

                  <div className='grid gap-3 sm:grid-cols-2'>
                    <div className='space-y-2'>
                      <Label className='text-amber-100'>Status</Label>
                      <select
                        value={eventStatus}
                        onChange={(e) => setEventStatus(e.target.value as any)}
                        className='w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-amber-50 outline-none focus:ring-2 focus:ring-indigo-500/40'
                      >
                        {STATUS_PRESETS.map((s) => (
                          <option key={s} value={s} className='bg-zinc-950'>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className='space-y-2'>
                      <Label className='text-amber-100'>Note (optional)</Label>
                      <Input
                        className='bg-white/5 border-white/10'
                        placeholder='e.g. Arrived at hub'
                        value={eventNote}
                        onChange={(e) => setEventNote(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={addEvent}
                    disabled={addingEvent}
                    className='w-full rounded-xl bg-white text-black hover:bg-zinc-200'
                  >
                    {addingEvent ? 'Adding...' : 'Add update'}
                  </Button>

                  {eventMsg ? (
                    <div className='rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-100'>
                      {eventMsg}
                    </div>
                  ) : null}
                </div>

                {/* Timeline */}
                <div className='space-y-3'>
                  <p className='text-sm font-medium'>Timeline</p>
                  <div className='space-y-3'>
                    {shipment.timeline.map((t, i) => (
                      <div key={i} className='glass rounded-2xl p-3'>
                        <div className='flex items-center justify-between gap-2'>
                          <p className='text-sm font-medium text-white'>
                            {t.status}
                          </p>
                          <p className='text-xs text-zinc-200/60'>{t.time}</p>
                        </div>
                        {t.note ? (
                          <p className='mt-1 text-xs text-zinc-200/70'>
                            {t.note}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className='space-y-2'>
      <Label className='text-amber-100'>{label}</Label>
      <Input
        className='bg-white/5 border-white/10'
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
