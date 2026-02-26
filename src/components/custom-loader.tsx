'use client'

export function CustomLoader({
  label = 'Loading',
  size = 'md',
}: {
  label?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const dot = size === 'sm' ? 'h-2 w-2' : size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'
  const text =
    size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'

  return (
    <div className='flex items-center gap-3'>
      <div className='flex items-center gap-2'>
        <span
          className={`${dot} animate-bounce rounded-full bg-white [animation-delay:-0.2s]`}
        />
        <span
          className={`${dot} animate-bounce rounded-full bg-white [animation-delay:-0.1s]`}
        />
        <span className={`${dot} animate-bounce rounded-full bg-white`} />
      </div>

      <span className={`${text} text-zinc-300`}>{label}…</span>
    </div>
  )
}
