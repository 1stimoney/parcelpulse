import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { BottomNav } from '@/components/bottom-nav'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ParcelPulse',
  description: 'Track it. Trust it. Delivered.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body className='min-h-screen text-zinc-50'>
        {/* Futuristic background */}
        <div className='fixed inset-0 -z-10 bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(99,102,241,0.35),transparent_55%),radial-gradient(900px_circle_at_80%_20%,rgba(34,211,238,0.25),transparent_55%),radial-gradient(900px_circle_at_50%_90%,rgba(168,85,247,0.18),transparent_60%),linear-gradient(to_bottom,rgba(10,10,16,1),rgba(6,7,12,1))]' />
        <div className='fixed inset-0 -z-10 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]' />
        <div className='fixed inset-0 -z-10 bg-black/20' />

        <div className='pb-28'>{children}</div>
        <BottomNav />
      </body>
    </html>
  )
}
