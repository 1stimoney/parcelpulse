import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, PackageCheck, ShieldCheck, Truck } from 'lucide-react'

export default function HomePage() {
  return (
    <main className='mx-auto max-w-6xl px-4 pb-14'>
      {/* Header */}
      <header className='flex items-center justify-between py-6'>
        <div className='flex items-center gap-2'>
          <div className='grid h-10 w-10 place-items-center rounded-2xl bg-zinc-800'>
            <Truck className='h-5 w-5' />
          </div>
          <div className='leading-tight'>
            <p className='text-base font-semibold'>ParcelPulse</p>
            <p className='text-xs text-zinc-400'>
              Track it. Trust it. Delivered.
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button asChild className='rounded-xl'>
            <Link href='/track'>Track</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className='grid gap-6 md:grid-cols-2 md:items-center'>
        <div className='space-y-4'>
          <Badge className='bg-zinc-800 text-zinc-100 hover:bg-zinc-800 w-fit'>
            Fast • Secure • Reliable
          </Badge>

          <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl'>
            A courier website that looks premium and works fast on mobile.
          </h1>

          <p className='text-sm leading-relaxed text-zinc-300 sm:text-base'>
            Real-time tracking, pickup requests, and clean delivery updates —
            built like a modern fintech product.
          </p>

          <div className='flex flex-col gap-3 sm:flex-row'>
            <Button asChild className='rounded-xl'>
              <Link href='/track'>
                Track a Parcel <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>

            <Button
              asChild
              variant='outline'
              className='rounded-xl border-zinc-700 text-white hover:bg-zinc-950'
            >
              <Link href='/pickup'>Request Pickup</Link>
            </Button>
          </div>
        </div>

        <Card className='border-zinc-800 bg-zinc-900/60'>
          <CardHeader>
            <CardTitle className='text-lg'>What you get</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-3 sm:grid-cols-2'>
            <Feature
              title='Live tracking'
              icon={<PackageCheck className='h-4 w-4' />}
            />
            <Feature
              title='Secure handling'
              icon={<ShieldCheck className='h-4 w-4' />}
            />
            <Feature
              title='Proof of delivery'
              icon={<ShieldCheck className='h-4 w-4' />}
            />
            <Feature
              title='Fast dispatch'
              icon={<Truck className='h-4 w-4' />}
            />
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className='mt-12 border-t border-zinc-800 pt-6 text-xs text-zinc-500'>
        © {new Date().getFullYear()} ParcelPulse
      </footer>
    </main>
  )
}

function Feature({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className='flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3'>
      <div className='grid h-8 w-8 place-items-center rounded-xl bg-zinc-800'>
        {icon}
      </div>
      <p className='text-sm text-zinc-200'>{title}</p>
    </div>
  )
}
