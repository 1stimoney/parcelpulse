import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  PackageCheck,
  ShieldCheck,
  Truck,
  MapPin,
  Clock,
} from 'lucide-react'

export default function HomePage() {
  return (
    <main className='mx-auto max-w-6xl px-4 pb-14'>
      {/* Header */}
      <header className='flex items-center justify-between py-6'>
        <div className='flex items-center gap-3'>
          <div className='grid h-11 w-11 place-items-center rounded-2xl glass glow-ring'>
            <Truck className='h-5 w-5 text-white' />
          </div>

          <div className='leading-tight'>
            <p className='text-base font-semibold tracking-tight'>
              ParcelPulse
            </p>
            <p className='text-xs text-zinc-300/80'>
              Track it. Trust it. Delivered.
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            asChild
            className='rounded-xl bg-white text-black hover:bg-zinc-200'
          >
            <Link href='/track'>Track</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className='grid gap-6 md:grid-cols-2 md:items-center'>
        <div className='space-y-5'>
          <Badge className='glass-strong text-zinc-100 hover:bg-white/10 w-fit rounded-xl px-3 py-1'>
            Futuristic • Fast • Secure
          </Badge>

          <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl'>
            Courier delivery that feels like a tech product.
          </h1>

          <p className='text-sm leading-relaxed text-zinc-200/80 sm:text-base'>
            Real-time tracking, pickup requests, and proof of delivery — built
            mobile-first with a clean, modern UI.
          </p>

          <div className='flex flex-col gap-3 sm:flex-row'>
            <Button
              asChild
              className='rounded-xl bg-white text-black hover:bg-zinc-200'
            >
              <Link href='/pickup'>
                Request Pickup <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>

            <Button
              asChild
              variant='outline'
              className='rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10'
            >
              <Link href='/track'>Track Parcel</Link>
            </Button>
          </div>

          {/* Quick stats */}
          <div className='grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3'>
            <MiniStat
              title='Same-day'
              desc='City delivery'
              icon={<Clock className='h-4 w-4' />}
            />
            <MiniStat
              title='Secure'
              desc='Handled with care'
              icon={<ShieldCheck className='h-4 w-4' />}
            />
            <MiniStat
              title='Coverage'
              desc='Local + interstate'
              icon={<MapPin className='h-4 w-4' />}
            />
          </div>
        </div>

        {/* Right card */}
        <Card className='glass glow-ring rounded-2xl'>
          <CardHeader>
            <CardTitle className='text-lg'>Track a shipment</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-sm text-zinc-200/75'>
              Enter your tracking ID and get updates instantly.
            </p>

            <Button
              asChild
              className='w-full rounded-xl bg-indigo-500/90 hover:bg-indigo-500'
            >
              <Link href='/track'>Go to Tracking</Link>
            </Button>

            <div className='grid gap-3 sm:grid-cols-2'>
              <Feature
                title='Live updates'
                icon={<PackageCheck className='h-4 w-4' />}
              />
              <Feature
                title='Proof of delivery'
                icon={<ShieldCheck className='h-4 w-4' />}
              />
              <Feature
                title='Rider dispatch'
                icon={<Truck className='h-4 w-4' />}
              />
              <Feature
                title='Location hubs'
                icon={<MapPin className='h-4 w-4' />}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Services */}
      <section className='mt-10'>
        <div className='flex items-end justify-between gap-4'>
          <h2 className='text-xl font-semibold tracking-tight'>Services</h2>
          <p className='hidden text-sm text-zinc-200/70 sm:block'>
            Built for individuals and businesses.
          </p>
        </div>

        <div className='mt-4 grid gap-4 md:grid-cols-3'>
          <ServiceCard
            title='Door-to-door delivery'
            desc='Pickup and deliver to any address within coverage.'
          />
          <ServiceCard
            title='Business logistics'
            desc='Batch pickups, monthly billing, dedicated riders.'
          />
          <ServiceCard
            title='Interstate shipping'
            desc='Fast dispatch + tracking + proof of delivery.'
          />
        </div>
      </section>

      {/* Footer */}
      <footer className='mt-12 border-t border-white/10 pt-6 text-xs text-zinc-200/60'>
        © {new Date().getFullYear()} ParcelPulse
      </footer>
    </main>
  )
}

function MiniStat({
  title,
  desc,
  icon,
}: {
  title: string
  desc: string
  icon: React.ReactNode
}) {
  return (
    <div className='glass rounded-2xl p-3'>
      <div className='flex items-center gap-2 text-sm text-white'>
        {icon}
        <span className='font-medium'>{title}</span>
      </div>
      <p className='mt-1 text-xs text-zinc-200/70'>{desc}</p>
    </div>
  )
}

function Feature({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className='glass rounded-2xl p-3'>
      <div className='flex items-center gap-2 text-sm text-white'>
        <span className='grid h-8 w-8 place-items-center rounded-xl bg-white/10'>
          {icon}
        </span>
        <span className='font-medium'>{title}</span>
      </div>
    </div>
  )
}

function ServiceCard({ title, desc }: { title: string; desc: string }) {
  return (
    <Card className='glass rounded-2xl'>
      <CardHeader>
        <CardTitle className='text-base'>{title}</CardTitle>
      </CardHeader>
      <CardContent className='text-sm text-zinc-200/75'>{desc}</CardContent>
    </Card>
  )
}
