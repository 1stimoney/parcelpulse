'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ScanSearch, PackagePlus } from 'lucide-react'

const items = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/track', label: 'Track', icon: ScanSearch },
  { href: '/pickup', label: 'Pickup', icon: PackagePlus },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className='fixed inset-x-0 bottom-4 z-50 px-4'>
      <nav className='mx-auto max-w-md glass glow-ring rounded-2xl'>
        <div className='relative flex items-center justify-between px-2 py-2'>
          {/* Neon edge */}
          <div className='pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10' />
          <div className='pointer-events-none absolute -inset-px rounded-2xl opacity-60 blur-md bg-[radial-gradient(500px_circle_at_50%_0%,rgba(99,102,241,0.35),transparent_55%),radial-gradient(400px_circle_at_10%_100%,rgba(34,211,238,0.25),transparent_60%)]' />

          {items.map((it) => {
            const active = pathname === it.href
            const Icon = it.icon

            return (
              <Link
                key={it.href}
                href={it.href}
                className={[
                  'relative flex w-full flex-col items-center justify-center gap-1 rounded-xl px-3 py-2',
                  'transition',
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-200/70 hover:text-white hover:bg-white/5',
                ].join(' ')}
              >
                {active ? (
                  <span className='absolute inset-x-6 -top-1 h-1 rounded-full bg-indigo-400/80 blur-[1px]' />
                ) : null}

                <Icon className={active ? 'h-5 w-5' : 'h-5 w-5 opacity-90'} />
                <span className='text-[11px] font-medium'>{it.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
