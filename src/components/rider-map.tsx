/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { useEffect, useState } from 'react'

const riderIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854894.png',
  iconSize: [36, 36],
})

export function RiderMap() {
  const start = [4.8156, 7.0498] // depot
  const end = [4.8232, 7.0336] // delivery location

  const [position, setPosition] = useState(start)

  useEffect(() => {
    let progress = 0

    const interval = setInterval(() => {
      progress += 0.01
      if (progress >= 1) clearInterval(interval)

      const lat = start[0] + (end[0] - start[0]) * progress
      const lng = start[1] + (end[1] - start[1]) * progress

      setPosition([lat, lng])
    }, 1200)

    return () => clearInterval(interval)
  }, [])

  return (
    <MapContainer
      center={position as any}
      zoom={14}
      scrollWheelZoom={false}
      className='h-64 w-full rounded-2xl'
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />

      <Polyline positions={[start as any, position as any]} />
      <Marker position={position as any} icon={riderIcon} />
    </MapContainer>
  )
}
