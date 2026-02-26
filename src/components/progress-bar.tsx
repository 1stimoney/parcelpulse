'use client'

const order = [
  'Label created',
  'Picked up',
  'In transit',
  'Out for delivery',
  'Delivered',
] as const

type Status = (typeof order)[number]

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function ProgressBar({ status }: { status: Status }) {
  const idx = order.indexOf(status)
  const pct = clamp(((idx + 1) / order.length) * 100, 0, 100)

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between text-xs text-zinc-200/70'>
        <span>Progress</span>
        <span>{Math.round(pct)}%</span>
      </div>

      <div className='relative h-3 w-full overflow-hidden rounded-full bg-white/10'>
        {/* glow */}
        <div className='absolute inset-0 opacity-60 bg-[radial-gradient(400px_circle_at_20%_50%,rgba(34,211,238,0.25),transparent_55%),radial-gradient(400px_circle_at_80%_50%,rgba(99,102,241,0.25),transparent_55%)]' />
        {/* fill */}
        <div
          className='relative h-full rounded-full bg-indigo-400/80 shadow-[0_0_18px_rgba(99,102,241,0.35)] transition-all duration-700'
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className='flex justify-between text-[10px] text-zinc-200/60'>
        <span>Created</span>
        <span>Delivered</span>
      </div>
    </div>
  )
}
