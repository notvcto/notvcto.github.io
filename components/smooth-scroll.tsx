"use client"

import { ReactLenis } from "lenis/react"
import type { ReactNode } from "react"

export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.05, duration: 1.5, smoothWheel: true }} className="relative z-10">
      {children}
    </ReactLenis>
  )
}
