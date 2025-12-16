"use client"

import Image from "next/image"
import { useRef, useState, useEffect } from "react"

export function AnimatedLogo() {
  const logoRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!logoRef.current) return

      const rect = logoRef.current.getBoundingClientRect()
      const logoCenterX = rect.left + rect.width / 2
      const logoCenterY = rect.top + rect.height / 2

      const deltaX = e.clientX - logoCenterX
      const deltaY = e.clientY - logoCenterY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      const repulsionRadius = 150

      if (distance < repulsionRadius) {
        const strength = (1 - distance / repulsionRadius) * 50
        const angle = Math.atan2(deltaY, deltaX)
        const pushX = -Math.cos(angle) * strength
        const pushY = -Math.sin(angle) * strength

        setTransform({ x: pushX, y: pushY })
      } else {
        setTransform({ x: 0, y: 0 })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div
      ref={logoRef}
      className="text-center z-10 transition-transform duration-200 ease-out"
      style={{
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }}
    >
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fastbreakai-h054JiS2Dz4kEsOArp2Vg2Tl82aM1U.png"
        alt="Fastbreak AI"
        width={3200}
        height={800}
        className="w-auto h-[400px] drop-shadow-2xl animate-float cursor-pointer"
      />
    </div>
  )
}
