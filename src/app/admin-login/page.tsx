'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CustomLoader } from '@/components/custom-loader'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function login() {
    setError(null)
    if (!password) return setError('Enter password')

    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed')

      router.push('/admin')
      // after router.push("/admin") OR before navigating:
window.dispatchEvent(new Event("pp_admin_changed"));
window.location.href = "/admin"; // hard nav ensures cookie is available everywhere
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='mx-auto max-w-md px-4 py-20'>
      <Card className='glass glow-ring rounded-2xl'>
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
        </CardHeader>

        <CardContent className='space-y-4'>
          <Input
            type='password'
            placeholder='Enter admin password'
            className='bg-white/5 border-white/10'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
          />

          <Button
            onClick={login}
            disabled={loading}
            className='w-full rounded-xl bg-white text-black hover:bg-zinc-200'
          >
            {loading ? 'Checking...' : 'Unlock'}
          </Button>

          {loading && (
            <div className='glass rounded-2xl p-4'>
              <CustomLoader label='Authenticating' />
            </div>
          )}

          {error && (
            <div className='rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200'>
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
