/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CustomLoader } from '@/components/custom-loader'

export default function PickupPage() {
  const [loading, setLoading] = useState(false)
  const [okMsg, setOkMsg] = useState<string | null>(null)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    pickup_address: '',
    dropoff_address: '',
    package_desc: '',
    weight_kg: '1',
    notes: '',
    sender_email: '',
    receiver_email: '',
  })

  const set = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }))

  async function submit() {
    setErrMsg(null)
    setOkMsg(null)

    if (
      !form.full_name ||
      !form.phone ||
      !form.pickup_address ||
      !form.dropoff_address ||
      !form.package_desc
    ) {
      setErrMsg('Please fill all required fields.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed')

      setOkMsg(
        `Pickup request submitted ✅ (Ref: ${json.request.id.slice(0, 8)})`,
      )
      setForm({
        full_name: '',
        phone: '',
        pickup_address: '',
        dropoff_address: '',
        package_desc: '',
        weight_kg: '1',
        notes: '',
        sender_email: '',
        receiver_email: '',
      })
    } catch (e: any) {
      setErrMsg(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='mx-auto max-w-3xl px-4 py-10'>
      <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
        Request Pickup
      </h1>
      <p className='mt-2 text-sm text-zinc-200/70'>
        Fill in the details and a rider will be assigned.
      </p>

      <Card className='mt-5 glass glow-ring rounded-2xl'>
        <CardHeader>
          <CardTitle className='text-base text-shadow-amber-100'>
            Pickup details
          </CardTitle>
        </CardHeader>

        <CardContent className='grid gap-4 sm:grid-cols-2'>
          <div className='space-y-2'>
            <Label className='text-amber-50'>Full name *</Label>
            <Input
              className='bg-white/5 border-white/10'
              value={form.full_name}
              onChange={(e) => set('full_name', e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label className='text-amber-50'>Phone *</Label>
            <Input
              className='bg-white/5 border-white/10'
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label className='text-amber-50'>Sender Email *</Label>
            <Input
              className='bg-white/5 border-white/10'
              value={form.sender_email}
              onChange={(e) => set('sender_email', e.target.value)}
              placeholder='you@example.com'
            />
          </div>

          <div className='space-y-2'>
            <Label>Receiver email *</Label>
            <Input
              className='bg-white/5 border-white/10'
              value={form.receiver_email}
              onChange={(e) => set('receiver_email', e.target.value)}
              placeholder='receiver@example.com'
            />
          </div>

          <div className='space-y-2 sm:col-span-2'>
            <Label className='text-amber-50'>Pickup address *</Label>
            <Input
              className='bg-white/5 border-white/10'
              value={form.pickup_address}
              onChange={(e) => set('pickup_address', e.target.value)}
            />
          </div>

          <div className='space-y-2 sm:col-span-2'>
            <Label className='text-amber-50'>Dropoff address *</Label>
            <Input
              className='bg-white/5 border-white/10'
              value={form.dropoff_address}
              onChange={(e) => set('dropoff_address', e.target.value)}
            />
          </div>

          <div className='space-y-2 sm:col-span-2'>
            <Label className='text-amber-50'>Package description *</Label>
            <Input
              className='bg-white/5 border-white/10'
              value={form.package_desc}
              onChange={(e) => set('package_desc', e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label className='text-amber-50'>Weight (kg)</Label>
            <Input
              className='bg-white/5 border-white/10'
              value={form.weight_kg}
              onChange={(e) => set('weight_kg', e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label className='text-amber-50'>Notes</Label>
            <Input
              className='bg-white/5 border-white/10'
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>

          <div className='sm:col-span-2'>
            <Button
              onClick={submit}
              disabled={loading}
              className='w-full rounded-xl bg-white text-black hover:bg-zinc-200'
            >
              {loading ? 'Submitting...' : 'Submit request'}
            </Button>

            {loading ? (
              <div className='mt-3 glass rounded-2xl p-4'>
                <CustomLoader label='Sending pickup request' />
              </div>
            ) : null}

            {okMsg ? (
              <div className='mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100'>
                {okMsg}
              </div>
            ) : null}

            {errMsg ? (
              <div className='mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200'>
                {errMsg}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
